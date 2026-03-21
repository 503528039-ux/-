/**
 * 产品六宫格 / 复合页：页眉标题按品类统一（不区分实拍页与复合图解页）
 * @param {Record<string, unknown>} page
 * @returns {string}
 */
export function getProductPageHeaderTitle(page) {
  if (!page || typeof page !== 'object') return '工程产品'
  const st = page.subType || 'lock'

  if (st === 'smartLock') {
    return '智能门锁'
  }
  if (st === 'lock') {
    return '门锁五金'
  }
  return '工程小五金'
}
