import argparse
import csv
import os
import re
from pathlib import Path

import cv2
import numpy as np


def clamp(v: int, lo: int, hi: int) -> int:
    return max(lo, min(hi, v))


def norm_model(s: str) -> str:
    return (s or "").strip().upper().replace(" ", "")


MODEL_RE = re.compile(r"\b[A-Z]{2,}\d{3,}-[A-Z0-9]{1,6}\b")

# High-priority problematic models for targeted recrop refinement.
PRIORITY_REPAIR_MODELS = {
    "AD2620-01",
    "AE0112-E5",
    "AE0134-D4",
    "AHP881-KQ",
    "AHQ1328-BR",
    "AHQ1328-G5",
    "AJ3011-09",
    "AJ4011-0",
    "AK6268-L",
    "AS1031-C05",
    "AS1034-C04",
    "AS2031-C05",
    "AS4111-1",
    "AS4111-1SKIN",
    "AT0711-24",
    "AW1762-ORB",
    "AW1775-KO",
    "AW2661-31",
    "AW3313-12",
    "SC8689-CO",
    "SC93109-N2",
    "SC93109-TU",
}


def bbox_to_xyxy(bbox):
    # bbox: [[x1,y1],[x2,y2],[x3,y3],[x4,y4]]
    xs = [p[0] for p in bbox]
    ys = [p[1] for p in bbox]
    return int(min(xs)), int(min(ys)), int(max(xs)), int(max(ys))


def _same_catalog_text_row(rect_a, rect_b) -> bool:
    """Two OCR boxes are on the same catalog row (same baseline band)."""
    ax1, ay1, ax2, ay2 = rect_a
    bx1, by1, bx2, by2 = rect_b
    ha = max(1, ay2 - ay1)
    hb = max(1, by2 - by1)
    iy1, iy2 = max(ay1, by1), min(ay2, by2)
    if iy2 > iy1:
        overlap = iy2 - iy1
        if overlap >= 0.40 * min(ha, hb):
            return True
    cay = (ay1 + ay2) / 2.0
    cby = (by1 + by2) / 2.0
    return abs(cay - cby) < max(ha, hb) * 1.12


def _row_clusters(rects: list) -> list[list[int]]:
    """Cluster rectangle indices that tie to the same horizontal row of captions."""
    n = len(rects)
    if n == 0:
        return []
    parent = list(range(n))

    def find(a: int) -> int:
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    def union(a: int, b: int) -> None:
        pa, pb = find(a), find(b)
        if pa != pb:
            parent[pb] = pa

    for i in range(n):
        for j in range(i + 1, n):
            if _same_catalog_text_row(rects[i], rects[j]):
                union(i, j)
    buckets: dict[int, list[int]] = {}
    for i in range(n):
        buckets.setdefault(find(i), []).append(i)
    return list(buckets.values())


def _column_x_bounds_for_index(rects: list, idx: int, img_w: int) -> tuple[int, int]:
    """
    Vertical strip [left, right] for rects[idx] so multi-column pages do not share
    the same photo ROI (fixes same image saved under different color suffixes).
    """
    clusters = _row_clusters(rects)
    cluster: list[int] | None = None
    for c in clusters:
        if idx in c:
            cluster = c
            break
    if cluster is None:
        return 0, img_w - 1
    if len(cluster) <= 1:
        x1, y1, x2, y2 = rects[idx]
        ah = max(1, y2 - y1)
        pad = max(int(8 * ah), int(1.2 * (x2 - x1)))
        cx = (x1 + x2) / 2.0
        left = int(cx - pad)
        right = int(cx + pad)
        return clamp(left, 0, img_w - 1), clamp(right, 0, img_w - 1)
    members = sorted(cluster, key=lambda j: (rects[j][0] + rects[j][2]) / 2.0)
    centers = [(j, (rects[j][0] + rects[j][2]) / 2.0) for j in members]
    pos = next(p for p, (j, _) in enumerate(centers) if j == idx)
    cx = centers[pos][1]
    left = int((centers[pos - 1][1] + cx) / 2) if pos > 0 else 0
    right = int((cx + centers[pos + 1][1]) / 2) if pos < len(centers) - 1 else img_w - 1
    left = clamp(left, 0, img_w - 1)
    right = clamp(right, 0, img_w - 1)
    if right <= left + 8:
        return 0, img_w - 1
    return left, right


def _write_suspects_report(out_dir: Path, mapping_rows):
    """
    Heuristic QA for crops: detect likely clipped/incorrect crops.
    Writes `suspects.csv` under out_dir.
    """
    model_page = {}
    for r in mapping_rows or []:
        m = (r.get("model") or "").strip()
        if not m:
            continue
        try:
            model_page[m] = int(r.get("page") or 0)
        except Exception:
            model_page[m] = r.get("page") or ""

    results = []
    imgs = [p for p in out_dir.glob("*.png") if p.name not in ("mapping.csv", "suspects.csv")]
    for p in imgs:
        img = cv2.imread(str(p), cv2.IMREAD_COLOR)
        if img is None:
            continue
        h, w = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        nonwhite = (gray < 245).astype(np.uint8)
        fill = float(nonwhite.mean())

        if fill < 0.002:
            results.append(
                {
                    "model": p.stem,
                    "page": model_page.get(p.stem, ""),
                    "size": f"{w}x{h}",
                    "fill": f"{fill:.4f}",
                    "score": "999",
                    "dirs": "empty",
                    "path": str(p),
                }
            )
            continue

        b = max(2, int(min(h, w) * 0.02))
        top = float(nonwhite[:b, :].mean())
        bottom = float(nonwhite[h - b :, :].mean())
        left = float(nonwhite[:, :b].mean())
        right = float(nonwhite[:, w - b :].mean())
        top1 = float(nonwhite[0, :].mean())
        bottom1 = float(nonwhite[-1, :].mean())
        left1 = float(nonwhite[:, 0].mean())
        right1 = float(nonwhite[:, -1].mean())

        eps = 1e-6
        norm = lambda x: x / (fill + eps)
        score = max(
            norm(top),
            norm(bottom),
            norm(left),
            norm(right),
            1.3 * norm(top1),
            1.3 * norm(bottom1),
            1.3 * norm(left1),
            1.3 * norm(right1),
        )

        dirs = []
        thr = 0.12 if fill >= 0.03 else 0.06
        if top > thr:
            dirs.append("top")
        if bottom > thr:
            dirs.append("bottom")
        if left > thr:
            dirs.append("left")
        if right > thr:
            dirs.append("right")

        if score > 2.2 and dirs:
            results.append(
                {
                    "model": p.stem,
                    "page": model_page.get(p.stem, ""),
                    "size": f"{w}x{h}",
                    "fill": f"{fill:.4f}",
                    "score": f"{score:.2f}",
                    "dirs": ",".join(dirs),
                    "path": str(p),
                }
            )

    results.sort(key=lambda r: float(r.get("score") or 0), reverse=True)
    out_csv = out_dir / "suspects.csv"
    with open(out_csv, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["model", "page", "size", "fill", "score", "dirs", "path"])
        w.writeheader()
        w.writerows(results)


def _rect_stats(hsv_full, gray_full, edges_full, nonwhite_full, x, y, w, h):
    x2 = x + w
    y2 = y + h
    rect_S = hsv_full[y:y2, x:x2, 1].astype(np.float32)
    mean_s = float(rect_S.mean()) if rect_S.size else 0.0
    rect_nonwhite = nonwhite_full[y:y2, x:x2]
    fill_ratio = float((rect_nonwhite > 0).mean()) if rect_nonwhite.size else 0.0
    rect_edges = edges_full[y:y2, x:x2]
    edge_ratio = float((rect_edges > 0).mean()) if rect_edges.size else 0.0
    rect_gray = gray_full[y:y2, x:x2].astype(np.float32)
    std_gray = float(rect_gray.std()) if rect_gray.size else 0.0
    return mean_s, fill_ratio, edge_ratio, std_gray


def _is_text_or_lineart(
    mean_s: float, fill_ratio: float, edge_ratio: float, std_gray: float, strict: bool = True
) -> bool:
    """
    Heuristic reject for dimension drawings / spec tables / text blocks.
    - low saturation
    - high edge density
    - low gray variance (flat white background with black strokes)
    """
    if strict:
        if mean_s < 40 and edge_ratio > 0.07 and fill_ratio < 0.28:
            return True
        if mean_s < 32 and edge_ratio > 0.05 and std_gray < 70:
            return True
        # very sparse but very edgy is usually line art
        if fill_ratio < 0.12 and edge_ratio > 0.06:
            return True
        # wide low-fill blocks are often headers/dashed separators
        if fill_ratio < 0.20 and edge_ratio > 0.04 and mean_s < 55 and std_gray < 85:
            return True
        return False

    # relaxed mode: still reject obvious lineart/headers, but allow uncertain cases
    if mean_s < 28 and edge_ratio > 0.10 and fill_ratio < 0.18:
        return True
    if fill_ratio < 0.08 and edge_ratio > 0.10:
        return True
    if fill_ratio < 0.16 and edge_ratio > 0.07 and mean_s < 40 and std_gray < 75:
        return True
    if fill_ratio < 0.14 and edge_ratio > 0.06 and mean_s < 45 and std_gray < 80:
        return True
    return False


def _bridge_slender(relax_mask: np.ndarray):
    """
    For slender handle-like objects, breakages in mask are common.
    We estimate orientation by minAreaRect and close along the main axis.
    """
    ys, xs = np.where(relax_mask > 0)
    if xs.size < 400:
        return relax_mask

    pts = np.stack([xs, ys], axis=1).astype(np.float32)
    rect = cv2.minAreaRect(pts)
    (rw, rh) = rect[1]
    if rw <= 1 or rh <= 1:
        return relax_mask
    major = max(rw, rh)
    minor = min(rw, rh)
    ar = major / max(1.0, minor)
    if ar < 3.0:
        return relax_mask

    angle = rect[2]
    # cv2 angle semantics: when width<height angle is rotated; normalize to major axis
    if rw < rh:
        angle = angle + 90.0

    # kernel length scales with minor thickness and overall size
    klen = int(max(15, min(65, minor * 3.2)))
    klen = klen + (klen % 2 == 0)
    kth = int(max(5, min(21, minor * 1.6)))
    kth = kth + (kth % 2 == 0)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (klen, kth))
    center = (kernel.shape[1] // 2, kernel.shape[0] // 2)
    rot_mat = cv2.getRotationMatrix2D(center, angle, 1.0)
    rot_kernel = cv2.warpAffine(kernel, rot_mat, (kernel.shape[1], kernel.shape[0]))
    rot_kernel = (rot_kernel > 0).astype(np.uint8)
    if rot_kernel.sum() < 10:
        return relax_mask

    closed = cv2.morphologyEx(relax_mask, cv2.MORPH_CLOSE, rot_kernel, iterations=1)
    return closed


def _cut_header_like_region(crop_bgr: np.ndarray):
    """
    Some pages contain a model header + dashed line far above the actual product image.
    If a large near-empty horizontal gap exists, keep only the lower cluster.
    Returns (top_trim_px, left_trim_px, right_trim_px) in crop coordinates.
    """
    if crop_bgr is None or crop_bgr.size == 0:
        return 0, 0, 0
    h, w = crop_bgr.shape[:2]
    if h < 120 or w < 180:
        return 0, 0, 0

    gray = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2GRAY)
    nonwhite = (gray < 245).astype(np.uint8)

    row = nonwhite.mean(axis=1)
    low = row < 0.002
    best_len = 0
    best = None
    i = 0
    while i < h:
        if not low[i]:
            i += 1
            continue
        j = i + 1
        while j < h and low[j]:
            j += 1
        gap_len = j - i
        if gap_len > best_len:
            best_len = gap_len
            best = (i, j)
        i = j

    top_trim = 0
    if best is not None and best_len > int(0.14 * h):
        gap_start, gap_end = best
        top_mass = float(nonwhite[:gap_start, :].mean())
        bottom_mass = float(nonwhite[gap_end:, :].mean())
        if bottom_mass > 0.01 and top_mass < 0.10:
            top_trim = max(0, gap_end - int(0.02 * h))

    col = nonwhite.mean(axis=0)
    left_trim = 0
    right_trim = 0
    cols = np.where(col > 0.01)[0]
    if cols.size:
        left = int(cols[0])
        right = int(cols[-1])
        # Tall/narrow crops often = two vertical handles with white gutter; tight
        # column trim can chop the second handle off the right.
        ar = h / max(1, w)
        pad = int(0.06 * w) if ar > 1.25 else int(0.03 * w)
        left_trim = max(0, left - pad)
        right_trim = max(0, w - 1 - (right + pad))
        if ar > 1.25 and (left_trim + right_trim) > int(0.10 * w):
            left_trim, right_trim = 0, 0

    return top_trim, left_trim, right_trim


def _refine_crop_components(crop_bgr: np.ndarray, seed_center_xy):
    """
    Refine crop by unioning component(s) near the seed (dual handles / split masks).
    Uses generous padding and avoids shrinking below a loose foreground union.
    Returns (x1, y1, x2, y2) in crop coordinates or None.
    """
    if crop_bgr is None or crop_bgr.size == 0:
        return None
    h, w = crop_bgr.shape[:2]
    gray = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2GRAY)
    bw = (gray < 245).astype(np.uint8)
    num, _labels, stats, _cent = cv2.connectedComponentsWithStats((bw * 255).astype(np.uint8), 8)
    comps = []
    min_area = max(260, int(0.002 * h * w))
    sx, sy = seed_center_xy
    for i in range(1, num):
        x, y, cw, ch, area = stats[i]
        if area < min_area:
            continue
        cx = x + cw / 2.0
        cy = y + ch / 2.0
        dist = ((cx - sx) ** 2 + (cy - sy) ** 2) ** 0.5 / max(1.0, (w * w + h * h) ** 0.5)
        score = (area / max(1.0, h * w)) - 0.45 * dist
        comps.append((score, x, y, cw, ch, area, cx, cy))
    if not comps:
        return None
    comps.sort(key=lambda t: t[0], reverse=True)
    _s, x, y, cw, ch, area, cx, cy = comps[0]
    x1, y1, x2, y2 = x, y, x + cw, y + ch

    def overlaps_x(a1, a2, b1, b2):
        o = max(0, min(a2, b2) - max(a1, b1))
        return o / max(1.0, min(a2 - a1, b2 - b1))

    def overlaps_y(a1, a2, b1, b2):
        o = max(0, min(a2, b2) - max(a1, b1))
        return o / max(1.0, min(a2 - a1, b2 - b1))

    # Merge stacked (vertical) neighbors: lower rosette / second handle below.
    for t in comps[1:10]:
        _s2, x_b, y_b, cw_b, ch_b, _area_b, _cx_b, cy_b = t
        gap_y = (y_b - y2) if y_b >= y1 else (y1 - (y_b + ch_b))
        if gap_y >= 0 and gap_y < 0.14 * h:
            if overlaps_x(x1, x2, x_b, x_b + cw_b) > 0.22:
                x1 = min(x1, x_b)
                y1 = min(y1, y_b)
                x2 = max(x2, x_b + cw_b)
                y2 = max(y2, y_b + ch_b)
        gap_y2 = (y1 - (y_b + ch_b)) if y_b + ch_b <= y1 else 1e9
        if 0 <= gap_y2 < 0.14 * h:
            if overlaps_x(x1, x2, x_b, x_b + cw_b) > 0.22:
                x1 = min(x1, x_b)
                y1 = min(y1, y_b)
                x2 = max(x2, x_b + cw_b)
                y2 = max(y2, y_b + ch_b)

    # Merge side-by-side (horizontal) neighbors: e.g. sliding door pair.
    for t in comps[1:10]:
        _s2, x_b, y_b, cw_b, ch_b, _area_b, _cx_b, _cy_b = t
        gap_x = (x_b - x2) if x_b >= x1 else (x1 - (x_b + cw_b))
        # Horizontal merge is the main risk for "串图"; keep it tight around seed.
        if gap_x >= 0 and gap_x < 0.12 * w:
            if abs(_cx_b - sx) < 0.20 * w and overlaps_y(y1, y2, y_b, y_b + ch_b) > 0.30:
                x1 = min(x1, x_b)
                y1 = min(y1, y_b)
                x2 = max(x2, x_b + cw_b)
                y2 = max(y2, y_b + ch_b)

    # Reduce expansion padding to avoid swallowing adjacent product blocks.
    pad_x = int(max(0.035 * w, 8))
    pad_y = int(max(0.045 * h, 8))
    x1 = clamp(x1 - pad_x, 0, w - 1)
    y1 = clamp(y1 - pad_y, 0, h - 1)
    x2 = clamp(x2 + pad_x, 0, w)
    y2 = clamp(y2 + pad_y, 0, h)
    if x2 - x1 < 40 or y2 - y1 < 40:
        return None
    return (x1, y1, x2, y2)


def find_color_photo_roi(
    img_bgr: np.ndarray,
    anchor_xyxy,
    model: str | None = None,
    col_x_bounds: tuple[int, int] | None = None,
):
    """
    Given an anchor bbox for the model text, search above it for the most likely
    "photo area" by detecting saturated (colorful) regions in HSV space.
    col_x_bounds: optional (x_left, x_right) vertical strip so multi-column pages
    do not all snap to the same dominant photo in the middle.
    Returns (x1, y1, x2, y2) in full-image coordinates or None.
    """
    h, w = img_bgr.shape[:2]
    ax1, ay1, ax2, ay2 = anchor_xyxy
    ah = max(1, ay2 - ay1)

    # Search window above model text, within same column with some padding.
    # Wide enough to capture long handles, but still localized to the model.
    sx1 = clamp(ax1 - int(14 * ah), 0, w - 1)
    sx2 = clamp(ax2 + int(14 * ah), 0, w - 1)
    if col_x_bounds is not None:
        c1, c2 = int(col_x_bounds[0]), int(col_x_bounds[1])
        if c2 > c1 + 10:
            ns1 = clamp(max(sx1, c1), 0, w - 1)
            ns2 = clamp(min(sx2, c2), 0, w - 1)
            if ns2 > ns1:
                sx1, sx2 = ns1, ns2
            else:
                # Fall back to the whole catalog column strip for this caption.
                sx1, sx2 = clamp(c1, 0, w - 1), clamp(c2, 0, w - 1)
                if sx1 >= sx2:
                    return None
    sy2 = clamp(ay1 - int(0.3 * ah), 0, h - 1)
    # Limit how far upwards we search to avoid capturing multiple product blocks
    # on dense pages (e.g. multiple photos/line drawings around one model).
    # Allow a taller search window so handle bodies above keyholes are included.
    # We rely on stronger text/line-art rejection + component scoring to avoid over-cropping.
    sy1 = clamp(ay1 - int(18 * ah), 0, h - 1)
    if sy1 >= sy2 or sx1 >= sx2:
        return None

    win = img_bgr[sy1:sy2, sx1:sx2]
    if win.size == 0:
        return None

    hsv = cv2.cvtColor(win, cv2.COLOR_BGR2HSV)
    _H, S, V = cv2.split(hsv)

    gray = cv2.cvtColor(win, cv2.COLOR_BGR2GRAY)

    # Colorful regions (primary, avoids line drawings).
    mask_color = ((S > 28) & (V > 35)).astype(np.uint8) * 255

    # Edge density for scoring/penalties (not for contour source by default).
    edges = cv2.Canny(gray, 50, 150)
    edges = cv2.dilate(
        edges, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)), iterations=2
    )

    # Non-white pixels: useful for grey photos, but includes line drawings.
    # We'll use it only as a fallback contour source with strict filters.
    mask_nonwhite = (gray < 246).astype(np.uint8) * 255

    mask = mask_color.copy()

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)

    def build_rects(src_mask: np.ndarray):
        contours, _ = cv2.findContours(src_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            return []
        min_area = 0.006 * win.shape[0] * win.shape[1]
        out = []
        for c in contours:
            x, y, cw, ch = cv2.boundingRect(c)
            area = cw * ch
            if area < min_area:
                continue
            # Skip extremely thin lines (dimension lines).
            if cw < 24 or ch < 24:
                continue
            if cw / max(1, ch) > 18 or ch / max(1, cw) > 18:
                continue
            out.append((area, (x, y, cw, ch)))
        return out

    rects = build_rects(mask)
    # Fallback: if no colorful regions found, try non-white, but we'll score with penalties
    # to avoid selecting line-drawing areas.
    if not rects:
        rects = build_rects(mask_nonwhite)
    if not rects:
        return None

    # Two-pass scoring: strict reject first, then relaxed fallback to avoid losing models.
    hsv_full = hsv  # already computed

    def pick_best(strict_reject: bool):
        best_score = None
        best_rect = None
        for _area, (x, y, cw, ch) in rects:
            if cw <= 0 or ch <= 0:
                continue

            mean_s, fill_ratio, edge_ratio, std_gray = _rect_stats(
                hsv_full, gray, edges, (mask_nonwhite > 0).astype(np.uint8), x, y, cw, ch
            )

            if _is_text_or_lineart(mean_s, fill_ratio, edge_ratio, std_gray, strict=strict_reject):
                continue

            penalty = 0.0
            if edge_ratio > 0.14:
                penalty += 0.8
            if fill_ratio < 0.10:
                penalty += 0.6
            if fill_ratio < 0.12 and edge_ratio > 0.10:
                penalty += 1.2
            if (cw * ch) > 0.65 * win.shape[0] * win.shape[1]:
                penalty += 1.5
            aspect = cw / max(1, ch)
            if aspect < 0.35 and ch > 0.55 * win.shape[0]:
                penalty += 1.5
            if ch > 0.75 * win.shape[0]:
                penalty += 1.0

            size_term = np.log1p(cw * ch) / 12.0
            bottom_term = (y + ch) / max(1, win.shape[0])
            slender_bonus = 0.0
            if aspect > 2.6 and cw > 260:
                slender_bonus = 0.6
            if (1 / max(1e-6, aspect)) > 2.6 and ch > 260:
                slender_bonus = 0.4

            score = (
                2.4 * (mean_s / 255.0)
                + 2.0 * fill_ratio
                + 0.35 * size_term
                + 0.55 * bottom_term
                + slender_bonus
                - 1.6 * min(edge_ratio, 0.25)
                - penalty
            )

            if best_score is None or score > best_score:
                best_score = score
                best_rect = (x, y, cw, ch)
        return best_rect

    best_rect = pick_best(strict_reject=True)
    if best_rect is None:
        best_rect = pick_best(strict_reject=False)
    if best_rect is None:
        return None

    x, y, cw, ch = best_rect
    roi_w = max(1, cw)
    roi_h = max(1, ch)

    # Expand seed to full product using connected-components on relaxed non-white mask.
    relax = mask_nonwhite.copy()
    # For bright metal highlights, the outer rim can be too close to white and may be
    # missing from `mask_nonwhite`. We补圈 by adding Canny edges that are adjacent to
    # the already-detected non-white core.
    #
    # This keeps lineart/dashed separators safer, because we AND with a dilation of
    # `mask_nonwhite` (so only edges near the photo core are added).
    edge_core = cv2.dilate(mask_nonwhite, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)), iterations=1)
    edge_keep = cv2.bitwise_and(edges, edge_core)
    relax = cv2.bitwise_or(relax, edge_keep)
    relax = cv2.morphologyEx(relax, cv2.MORPH_CLOSE, kernel, iterations=2)
    relax = cv2.morphologyEx(relax, cv2.MORPH_OPEN, kernel, iterations=1)
    relax = _bridge_slender(relax)

    num, labels, stats, _centroids = cv2.connectedComponentsWithStats(relax, connectivity=8)
    if num > 1:
        seed_x1, seed_y1, seed_x2, seed_y2 = x, y, x + cw, y + ch
        chosen = None
        chosen_area = 0
        fallback_comp = None
        fallback_comp_score = None
        for i in range(1, num):
            cx, cy, cww, chh, area = stats[i]
            if area < 500:
                continue
            # Intersect with seed rect.
            ix1 = max(seed_x1, cx)
            iy1 = max(seed_y1, cy)
            ix2 = min(seed_x2, cx + cww)
            iy2 = min(seed_y2, cy + chh)
            if ix2 <= ix1 or iy2 <= iy1:
                continue

            comp_mean_s, comp_fill, comp_edge, comp_std_gray = _rect_stats(
                hsv_full, gray, edges, (relax > 0).astype(np.uint8), cx, cy, cww, chh
            )
            is_lineart_strict = _is_text_or_lineart(
                comp_mean_s, comp_fill, comp_edge, comp_std_gray, strict=True
            )
            # Reject overly huge components (often full layout chunks).
            if (cww * chh) > 0.75 * win.shape[0] * win.shape[1]:
                continue

            # Prefer components that overlap seed more and look like solid photo objects.
            inter_area = float((ix2 - ix1) * (iy2 - iy1))
            overlap = inter_area / max(1.0, float(cw * ch))
            aspect = max(cww, chh) / max(1, min(cww, chh))
            comp_score = (
                1.5 * overlap
                + 0.9 * (comp_mean_s / 255.0)
                + 0.6 * comp_fill
                - 1.2 * min(comp_edge, 0.25)
                + 0.15 * np.log1p(area)
            )
            # small bonus for slender handle-like components
            if aspect > 3.0 and max(cww, chh) > 260:
                comp_score += 0.35
            if is_lineart_strict:
                # Keep as relaxed fallback so we don't lose entire models.
                if (fallback_comp is None) or (comp_score > fallback_comp_score):
                    fallback_comp = (cx, cy, cww, chh)
                    fallback_comp_score = comp_score
                continue

            if (chosen is None) or (comp_score > chosen_area):
                chosen = (cx, cy, cww, chh)
                chosen_area = comp_score

        if chosen is None and fallback_comp is not None:
            chosen = fallback_comp

        if chosen is not None:
            x, y, cw, ch = chosen
            roi_w = max(1, cw)
            roi_h = max(1, ch)

            # If the chosen component is too small (e.g. only keyhole), try to merge
            # a nearby component above it that aligns in X (e.g. handle body).
            if (cw * ch) < 0.18 * win.shape[0] * win.shape[1]:
                base_x1, base_y1, base_x2, base_y2 = x, y, x + cw, y + ch
                best_merge = None
                best_gain = 0.0
                for i in range(1, num):
                    cx, cy, cww, chh, area = stats[i]
                    if area < 800:
                        continue
                    if cy + chh <= base_y1:
                        # candidate above
                        pass
                    else:
                        continue
                    # Must be close vertically (avoid grabbing unrelated items far above)
                    gap = base_y1 - (cy + chh)
                    if gap > int(6 * ah):
                        continue
                    # Must overlap in X reasonably
                    ix1 = max(base_x1, cx)
                    ix2 = min(base_x2, cx + cww)
                    if ix2 <= ix1:
                        continue
                    overlap_x = (ix2 - ix1) / max(1.0, float(min(cw, cww)))
                    if overlap_x < 0.25:
                        continue

                    comp_mean_s, comp_fill, comp_edge, comp_std_gray = _rect_stats(
                        hsv_full, gray, edges, (relax > 0).astype(np.uint8), cx, cy, cww, chh
                    )
                    if _is_text_or_lineart(comp_mean_s, comp_fill, comp_edge, comp_std_gray, strict=True):
                        continue
                    # Require the merged-above component to look like a photo object
                    # (avoid model headers / dashed lines).
                    if comp_fill < 0.16 and comp_mean_s < 65:
                        continue
                    if (cww / max(1, win.shape[1])) > 0.82 and comp_fill < 0.24:
                        continue

                    # Prefer larger, more saturated components, and closer gaps.
                    gain = (
                        0.9 * (comp_mean_s / 255.0)
                        + 0.6 * comp_fill
                        - 1.0 * min(comp_edge, 0.25)
                        + 0.2 * np.log1p(area)
                        + 0.5 * overlap_x
                        - 0.04 * (gap / max(1.0, float(ah)))
                    )
                    if gain > best_gain:
                        best_gain = gain
                        best_merge = (cx, cy, cww, chh)

                if best_merge is not None:
                    mx, my, mw, mh = best_merge
                    ux1 = min(base_x1, mx)
                    uy1 = min(base_y1, my)
                    ux2 = max(base_x2, mx + mw)
                    uy2 = max(base_y2, my + mh)
                    x, y, cw, ch = ux1, uy1, (ux2 - ux1), (uy2 - uy1)
                    roi_w = max(1, cw)
                    roi_h = max(1, ch)

            # Below / left / right: second rosette or paired vertical handles (sliding door).
            max_gap_y = max(int(7 * ah), int(0.10 * win.shape[0]))
            # Keep horizontal merge window tight to avoid "连其他产品".
            max_gap_x = max(int(6 * ah), int(0.10 * win.shape[1]))
            for _ in range(4):
                base_x1, base_y1, base_x2, base_y2 = x, y, x + cw, y + ch
                changed = False
                base_cx = (base_x1 + base_x2) / 2.0
                for i in range(1, num):
                    cx, cy, cww, chh, area = stats[i]
                    if area < 600:
                        continue
                    comp_mean_s, comp_fill, comp_edge, comp_std_gray = _rect_stats(
                        hsv_full, gray, edges, (relax > 0).astype(np.uint8), cx, cy, cww, chh
                    )
                    if _is_text_or_lineart(comp_mean_s, comp_fill, comp_edge, comp_std_gray, strict=True):
                        continue

                    # Below base (dual handle downward)
                    if cy >= base_y2 - 3:
                        gap_y = cy - base_y2
                        if 0 <= gap_y <= max_gap_y:
                            ix1 = max(base_x1, cx)
                            ix2 = min(base_x2, cx + cww)
                            if ix2 > ix1:
                                ox = (ix2 - ix1) / max(1.0, float(min(cw, cww)))
                                if ox >= 0.22:
                                    x = min(base_x1, cx)
                                    y = min(base_y1, cy)
                                    cw = max(base_x2, cx + cww) - x
                                    ch = max(base_y2, cy + chh) - y
                                    roi_w = max(1, cw)
                                    roi_h = max(1, ch)
                                    changed = True
                                    break
                    # Above-already handled; left / right for side-by-side products
                    if cx >= base_x2 - 3:
                        gap_x = cx - base_x2
                        if 0 <= gap_x <= max_gap_x:
                            iy1 = max(base_y1, cy)
                            iy2 = min(base_y2, cy + chh)
                            if iy2 > iy1:
                                oy = (iy2 - iy1) / max(1.0, float(min(ch, chh)))
                                comp_cx = cx + cww / 2.0
                                if oy >= 0.30 and abs(comp_cx - base_cx) < 0.20 * win.shape[1]:
                                    x = min(base_x1, cx)
                                    y = min(base_y1, cy)
                                    cw = max(base_x2, cx + cww) - x
                                    ch = max(base_y2, cy + chh) - y
                                    roi_w = max(1, cw)
                                    roi_h = max(1, ch)
                                    changed = True
                                    break
                    if cx + cww <= base_x1 + 3:
                        gap_x = base_x1 - (cx + cww)
                        if 0 <= gap_x <= max_gap_x:
                            iy1 = max(base_y1, cy)
                            iy2 = min(base_y2, cy + chh)
                            if iy2 > iy1:
                                oy = (iy2 - iy1) / max(1.0, float(min(ch, chh)))
                                comp_cx = cx + cww / 2.0
                                if oy >= 0.30 and abs(comp_cx - base_cx) < 0.20 * win.shape[1]:
                                    x = min(base_x1, cx)
                                    y = min(base_y1, cy)
                                    cw = max(base_x2, cx + cww) - x
                                    ch = max(base_y2, cy + chh) - y
                                    roi_w = max(1, cw)
                                    roi_h = max(1, ch)
                                    changed = True
                                    break
                if not changed:
                    break

    # Asymmetric padding: smaller top to avoid grabbing neighbor items.
    ar_roi = cw / max(1, ch)
    pad_lr = max(int(1.6 * ah), int(0.12 * roi_w))
    pad_bottom = max(int(1.6 * ah), int(0.14 * roi_h))
    pad_top = max(int(0.8 * ah), int(0.05 * roi_h))
    # Directional expansion: tall ROI needs more width (paired vertical bars);
    # wide ROI needs more height (stacked escutcheons).
    if ar_roi < 0.78:
        pad_lr += max(int(0.8 * ah), int(0.07 * roi_w))
    if ar_roi > 1.38:
        pad_bottom += max(int(1.5 * ah), int(0.11 * roi_h))
        pad_top += max(int(1.1 * ah), int(0.07 * roi_h))

    rx1 = clamp(sx1 + x - pad_lr, 0, w - 1)
    ry1 = clamp(sy1 + y - pad_top, 0, h - 1)
    rx2 = clamp(sx1 + x + cw + pad_lr, 0, w - 1)
    ry2 = clamp(sy1 + y + ch + pad_bottom, 0, h - 1)

    if rx2 - rx1 < 40 or ry2 - ry1 < 40:
        return None

    # Post-cut: remove header/dashed separators if present above the product.
    tmp_crop = img_bgr[ry1:ry2, rx1:rx2]
    ttrim, ltrim, rtrim = _cut_header_like_region(tmp_crop)
    if ttrim > 0:
        ry1 = clamp(ry1 + ttrim, 0, h - 1)
    if ltrim > 0:
        rx1 = clamp(rx1 + ltrim, 0, w - 1)
    if rtrim > 0:
        rx2 = clamp(rx2 - rtrim, 0, w - 1)
        if rx2 <= rx1:
            return None

    # Union refinement near seed (dual handles / split masks). Skip if it shrinks a lot.
    pre_area = max(1, (rx2 - rx1) * (ry2 - ry1))
    seed_cx = (sx1 + x + cw / 2.0) - rx1
    seed_cy = (sy1 + y + ch / 2.0) - ry1
    refined = _refine_crop_components(img_bgr[ry1:ry2, rx1:rx2], (seed_cx, seed_cy))
    if refined is not None:
        fx1, fy1, fx2, fy2 = refined
        nrx1 = clamp(rx1 + fx1, 0, w - 1)
        nry1 = clamp(ry1 + fy1, 0, h - 1)
        nrx2 = clamp(rx1 + fx2, 0, w)
        nry2 = clamp(ry1 + fy2, 0, h)
        n_area = max(1, (nrx2 - nrx1) * (nry2 - nry1))
        if n_area >= pre_area * 0.92:
            rx1, ry1, rx2, ry2 = nrx1, nry1, nrx2, nry2

    # Final safeguard: prefer flagging in suspects.csv over dropping models.
    final_crop = img_bgr[ry1:ry2, rx1:rx2]
    if final_crop.size:
        fgray = cv2.cvtColor(final_crop, cv2.COLOR_BGR2GRAY)
        fhsv = cv2.cvtColor(final_crop, cv2.COLOR_BGR2HSV)
        fedges = cv2.Canny(fgray, 50, 150)
        fnonwhite = (fgray < 245).astype(np.uint8)
        mean_s = float(fhsv[:, :, 1].astype(np.float32).mean())
        fill_ratio = float((fnonwhite > 0).mean())
        edge_ratio = float((fedges > 0).mean())
        std_gray = float(fgray.astype(np.float32).std())
        # For priority repair models, avoid final hard rejection to preserve recall.
        if not (model and model in PRIORITY_REPAIR_MODELS) and _is_text_or_lineart(
            mean_s, fill_ratio, edge_ratio, std_gray, strict=False
        ):
            return None
    return (rx1, ry1, rx2, ry2)


def main():
    parser = argparse.ArgumentParser(
        description="Extract product photo regions from a PDF by OCR-ing model codes."
    )
    parser.add_argument(
        "--pdf",
        required=True,
        help="Path to the PDF file (scan/non-selectable text supported).",
    )
    parser.add_argument(
        "--out",
        default="extracted/out",
        help="Output folder for cropped photos named by model code.",
    )
    parser.add_argument("--dpi", type=int, default=400, help="Render DPI for PDF pages.")
    parser.add_argument("--start", type=int, default=1, help="Start page (1-based).")
    parser.add_argument("--end", type=int, default=0, help="End page (1-based, inclusive). 0=last")
    parser.add_argument("--min-score", type=float, default=0.55, help="Minimum OCR confidence.")
    parser.add_argument(
        "--scan-only",
        action="store_true",
        help="Only scan pages and report detected model codes (no cropping).",
    )
    parser.add_argument(
        "--write-csv",
        action="store_true",
        help="Write mapping CSV of extracted images.",
    )
    args = parser.parse_args()

    pdf_path = Path(args.pdf).expanduser().resolve()
    out_dir = Path(args.out).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    # Lazy imports so users can see import errors clearly.
    import fitz  # PyMuPDF
    from paddleocr import PaddleOCR

    # OCR: model codes are alnum + hyphen; english model is enough.
    ocr = PaddleOCR(use_angle_cls=False, lang="en")

    doc = fitz.open(str(pdf_path))
    total_pages = doc.page_count
    start = max(1, args.start)
    end = args.end if args.end and args.end > 0 else total_pages
    end = min(end, total_pages)
    if start > end:
        raise SystemExit(f"Invalid range: start={start} end={end} total={total_pages}")

    zoom = args.dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)

    rows = []
    seen_paths = set()

    for page_index in range(start - 1, end):
        page = doc.load_page(page_index)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
        if pix.n == 4:
            img = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)
        else:
            img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

        ocr_result = ocr.ocr(img, cls=False)
        if not ocr_result:
            continue

        lines = ocr_result[0] if isinstance(ocr_result[0], list) else ocr_result

        best = {}
        for item in lines:
            bbox, (text, score) = item
            if score is None or score < args.min_score:
                continue
            text_u = norm_model(text)
            m = MODEL_RE.search(text_u)
            if not m:
                continue
            model = m.group(0)
            # Skip short codes like XCA etc by regex design.
            if (model not in best) or (score > best[model][0]):
                best[model] = (score, bbox)

        if args.scan_only:
            models = sorted(best.keys())
            if models:
                print(f"[page {page_index+1}/{end}] models={len(models)} sample={models[:6]}")
            else:
                print(f"[page {page_index+1}/{end}] models=0")
            for model, (score, _bbox) in best.items():
                rows.append(
                    {
                        "page": page_index + 1,
                        "model": model,
                        "score": f"{score:.3f}",
                        "image": "",
                    }
                )
            continue

        extracted_this_page = 0
        page_models = []
        for model, (score, bbox) in best.items():
            page_models.append((model, score, bbox_to_xyxy(bbox)))
        rects = [t[2] for t in page_models]
        for i, (model, score, xyxy) in enumerate(page_models):
            cw1, cw2 = _column_x_bounds_for_index(rects, i, img.shape[1])
            roi = find_color_photo_roi(
                img, xyxy, model=model, col_x_bounds=(cw1, cw2)
            )
            if roi is None:
                continue
            x1, y1, x2, y2 = roi
            crop = img[y1:y2, x1:x2]
            if crop.size == 0:
                continue

            # Avoid overwriting: add suffix if exists.
            base = model
            out_path = out_dir / f"{base}.png"
            if out_path.exists() or str(out_path) in seen_paths:
                i = 2
                while True:
                    cand = out_dir / f"{base}__{i}.png"
                    if (not cand.exists()) and (str(cand) not in seen_paths):
                        out_path = cand
                        break
                    i += 1

            cv2.imwrite(str(out_path), crop)
            seen_paths.add(str(out_path))
            rows.append(
                {
                    "page": page_index + 1,
                    "model": model,
                    "score": f"{score:.3f}",
                    "image": str(out_path),
                }
            )
            extracted_this_page += 1

        print(
            f"[page {page_index+1}/{end}] models={len(best)} extracted={extracted_this_page} total={len(rows)}"
        )

    if args.write_csv:
        csv_path = out_dir / "mapping.csv"
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=["page", "model", "score", "image"])
            w.writeheader()
            w.writerows(rows)
        print("wrote:", csv_path)

        # Also write an automatic QA report for likely clipped/incorrect crops.
        # (This is best-effort and won't fail the extraction.)
        try:
            _write_suspects_report(out_dir, rows)
            print("wrote:", out_dir / "suspects.csv")
        except Exception as e:
            print("warn: failed to write suspects.csv:", repr(e))

    print("done. extracted:", len(rows), "images to", out_dir)


if __name__ == "__main__":
    main()

