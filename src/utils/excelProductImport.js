/**
 * Excel 产品清单 → productGrid 页：品类识别、行解析、表头行探测
 */
import { nanoid } from 'nanoid'
import * as XLSX from 'xlsx'
import { createDefaultProductItem } from './productGridItems'

function trimStr(v) {
  if (v == null) return ''
  return String(v).trim()
}

/**
 * 首行大标题、第二行表头的 xlsx：自动找到「产品名称」所在行作为表头
 * @returns {Record<string, unknown>[]}
 */
export function parseSheetToProductRows(wb) {
  const sheet = wb.Sheets[wb.SheetNames[0]]
  if (!sheet) return []

  const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  if (!aoa.length) return []

  let headerIdx = aoa.findIndex(
    (row) =>
      Array.isArray(row) &&
      row.some((c) => {
        const s = trimStr(c)
        return s === '产品名称' || s === '名称'
      })
  )

  if (headerIdx === -1) {
    return XLSX.utils.sheet_to_json(sheet, { defval: '' })
  }

  const headers = aoa[headerIdx].map((h) => trimStr(h))
  const data = []
  for (let i = headerIdx + 1; i < aoa.length; i++) {
    const row = aoa[i]
    if (!row || !Array.isArray(row)) continue
    if (row.every((c) => !trimStr(c))) continue
    const obj = {}
    headers.forEach((h, j) => {
      if (h) obj[h] = row[j] != null ? row[j] : ''
    })
    data.push(obj)
  }
  return data
}

/**
 * @param {Record<string, unknown>} row
 * @returns {'smartLock'|'lock'|'hardware'}
 */
export function parseCategoryFromExcelRow(row) {
  if (!row || typeof row !== 'object') return 'lock'

  const raw =
    trimStr(row['品类']) ||
    trimStr(row['分类']) ||
    trimStr(row['类别']) ||
    trimStr(row['category']) ||
    trimStr(row['Category']) ||
    trimStr(row['子类型']) ||
    trimStr(row['subType']) ||
    trimStr(row['SubType'])

  if (raw) {
    const u = raw.toLowerCase()
    if (
      u === 'smartlock' ||
      u === 'smart_lock' ||
      raw === '智能门锁' ||
      (u.includes('智能') && u.includes('锁'))
    ) {
      return 'smartLock'
    }
    if (
      u === 'hardware' ||
      raw === '工程小五金' ||
      raw === '小五金' ||
      raw === '其他五金'
    ) {
      return 'hardware'
    }
    if (u === 'lock' || raw === '门锁' || raw === '门锁五金' || raw === '门锁产品') {
      return 'lock'
    }
  }

  return 'lock'
}

export function getProductGridPageMeta(subType) {
  if (subType === 'smartLock') {
    return { title: '智能门锁实拍', sub: '' }
  }
  if (subType === 'hardware') {
    return { title: '工程小五金实拍', sub: 'ENGINEERING HARDWARE' }
  }
  return { title: '门锁五金实拍', sub: 'DOOR LOCK HARDWARE' }
}

/**
 * @param {Record<string, unknown>} row
 * @param {'smartLock'|'lock'|'hardware'} subType
 */
export function buildProductGridItemFromRow(row, subType) {
  const base = createDefaultProductItem(subType, { composite: false })
  const item = {
    ...base,
    id: nanoid(),
    deleted: false
  }

  const name = trimStr(row['产品名称'] || row['名称'] || row['Name'])
  const model = trimStr(row['型号'] || row['Model'])
  if (name) item.name = name
  if (model) item.model = model

  const setSpec = (label, val) => {
    if (val == null || trimStr(val) === '') return
    const s = item.specs.find((x) => x && x.label === label)
    if (s) s.value = trimStr(val)
  }

  setSpec('材质', row['材质'] || row['material'])
  setSpec('表面处理', row['表面处理'] || row['finish'])

  if (subType === 'hardware') {
    setSpec('规格', row['规格'] || row['参数'] || row['Spec'])
  } else {
    const lockSpec =
      trimStr(row['可选锁体']) ||
      trimStr(row['规格']) ||
      trimStr(row['参数']) ||
      trimStr(row['Spec'])
    setSpec('可搭配锁体及规格', lockSpec)
  }

  let scope =
    trimStr(row['使用范围']) ||
    trimStr(row['适用范围']) ||
    trimStr(row['scope'])
  const j1 = trimStr(row['安装中心距'])
  const j2 = trimStr(row['锁体中心距离'])
  const extra = [j1 && `安装中心距 ${j1}`, j2 && `锁体中心距 ${j2}`].filter(Boolean).join('；')
  if (extra) {
    scope = scope ? `${scope}；${extra}` : extra
  }
  setSpec('适用范围', scope)

  if (subType === 'smartLock') {
    setSpec('功能', row['功能'] || row['规格'])
  }

  const img = trimStr(row['图片文件名'])
  if (img) {
    item.imageHint = img
  }

  const price = row['价格'] ?? row['Price']
  if (price != null && trimStr(price) !== '') {
    item.price = trimStr(price)
  }

  return item
}
