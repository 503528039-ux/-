/**
 * 图册内搜索与 PDF 隐性检索层：从 page 数据收集可检索文本（排除大图 data URL）
 */
import { getProductPageHeaderTitle } from './productPageHeaderTitle.js'

const SKIP_VALUE_KEYS = new Set([
  'image',
  'lineImage',
  'heroImage',
  'logo',
  'watermarkImage',
  'src',
  'thumb',
  'thumbnail'
])

function isBlobLikeString(s) {
  if (!s || s.length < 12) return false
  return s.startsWith('data:') || s.startsWith('blob:')
}

/**
 * @param {unknown} val
 * @param {string[]} out
 * @param {number} depth
 */
function walkStrings(val, out, depth) {
  if (depth > 14) return
  if (val == null) return
  const t = typeof val
  if (t === 'string') {
    const s = val.trim()
    if (!s || isBlobLikeString(s) || s.length > 8000) return
    out.push(s)
    return
  }
  if (t === 'number' || t === 'boolean') {
    out.push(String(val))
    return
  }
  if (Array.isArray(val)) {
    val.forEach((x) => walkStrings(x, out, depth + 1))
    return
  }
  if (t === 'object') {
    for (const [k, v] of Object.entries(val)) {
      if (SKIP_VALUE_KEYS.has(k) || k.endsWith('Image') || k.endsWith('Url')) continue
      walkStrings(v, out, depth + 1)
    }
  }
}

/**
 * @param {Record<string, unknown>} page
 * @returns {string[]}
 */
export function collectPageTextParts(page) {
  if (!page || typeof page !== 'object') return []
  const out = []
  walkStrings(page, out, 0)
  const t = page.type
  if (t === 'productGrid' || t === 'compositeProduct' || t === 'product') {
    out.push(getProductPageHeaderTitle(page))
  }
  return out
}

/**
 * @param {Record<string, unknown>} page
 */
export function pageHaystack(page) {
  return collectPageTextParts(page).join('\u0001').toLowerCase()
}

/**
 * @param {Record<string, unknown>} page
 * @param {string} query
 */
export function pageMatchesQuery(page, query) {
  const q = String(query ?? '').trim().toLowerCase()
  if (!q) return true
  return pageHaystack(page).includes(q)
}

/**
 * 六宫格等产品页：原样收集每格 model（避免正则截断 GW4110F-4*3*3-P2 等）
 * @param {Record<string, unknown>} page
 * @returns {string[]}
 */
function collectExplicitProductModels(page) {
  const t = page?.type
  if (t !== 'productGrid' && t !== 'compositeProduct' && t !== 'product') return []
  const items = page.items
  if (!Array.isArray(items)) return []
  const out = []
  for (const it of items) {
    if (!it || it.deleted) continue
    const m = String(it.model ?? '').trim()
    if (m) out.push(m)
  }
  return out
}

/** 型号类 token：允许 * 与乘号 ×（U+00D7） */
const PDF_ASCII_TOKEN_RE = /[A-Za-z0-9][A-Za-z0-9._\-/*\u00D7]{1,}/g

/**
 * 型号、英文、数字等（jsPDF Helvetica 可写入隐性层；含 *、×）
 * @param {Record<string, unknown>} page
 */
export function asciiTokenLayerForPdf(page) {
  const explicit = collectExplicitProductModels(page)
  const full = collectPageTextParts(page).join(' ')
  const tokens = full.match(PDF_ASCII_TOKEN_RE) || []
  return Array.from(new Set([...explicit, ...tokens])).join(' ')
}

/**
 * 整页合并文本（PDF document keywords；含中文）
 * @param {Record<string, unknown>} page
 * @param {number} maxLen
 */
export function compactPageTextForPdfMeta(page, maxLen = 1800) {
  const s = collectPageTextParts(page).join(' ').replace(/\s+/g, ' ').trim()
  if (s.length <= maxLen) return s
  return s.slice(0, maxLen) + '…'
}

/**
 * 每页位图下叠白色隐性文字（Helvetica；型号可含 *、×）
 * @param {import('jspdf').jsPDF} pdf
 * @param {Record<string, unknown>} page
 */
export function appendPdfInvisibleSearchLayer(pdf, page) {
  const chunk = asciiTokenLayerForPdf(page).replace(/\s+/g, ' ').trim()
  if (!chunk) return

  try {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(4.5)
    pdf.setTextColor(255, 255, 255)
    const lines = pdf.splitTextToSize(chunk, 206)
    const lineH = 2.05
    const maxLines = 40
    let y = 296.8
    const start = Math.max(0, lines.length - maxLines)
    for (let li = lines.length - 1; li >= start; li--) {
      pdf.text(lines[li], 2, y, { baseline: 'bottom', maxWidth: 206 })
      y -= lineH
      if (y < 240) break
    }
  } catch (e) {
    console.warn('[catalogSearch] PDF 隐性检索层写入失败（已跳过）', e)
  }
}

/**
 * @param {Record<string, unknown>[]} pages
 * @param {number} maxTotal
 */
export function buildDocumentKeywordsForPdf(pages, maxTotal = 3500) {
  if (!Array.isArray(pages) || !pages.length) return ''
  const parts = pages.map((p) => compactPageTextForPdfMeta(p, 400))
  let s = parts.join(' | ').replace(/\s+/g, ' ').trim()
  if (s.length > maxTotal) s = s.slice(0, maxTotal) + '…'
  return s
}
