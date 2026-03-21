/**
 * 按 1-based 页码滚动到对应图册页 DOM（需页面容器 id 为 catalog-page-{n}）
 * @param {number|string} pageNumber1Based
 * @param {number} totalPages
 * @returns {{ ok: boolean, message?: string }}
 */
export function scrollCatalogPageToIndex(pageNumber1Based, totalPages) {
  const raw = String(pageNumber1Based ?? '').trim()
  if (!raw) {
    return { ok: false, message: '请输入页码' }
  }
  const n = Math.floor(Number(raw))
  if (!Number.isFinite(n) || n < 1) {
    return { ok: false, message: '请输入 ≥1 的整数' }
  }
  if (typeof totalPages === 'number' && totalPages > 0 && n > totalPages) {
    return { ok: false, message: `当前共 ${totalPages} 页` }
  }
  const el = document.getElementById(`catalog-page-${n}`)
  if (!el) {
    return { ok: false, message: '未找到该页' }
  }
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  el.classList.add('catalog-page-jump-highlight')
  window.setTimeout(() => {
    el.classList.remove('catalog-page-jump-highlight')
  }, 2000)
  return { ok: true }
}
