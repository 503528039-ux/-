/**
 * 六宫格产品页（无线图 / 复合图解）固定槽位与默认条目
 * 与 AddPageCommand 中 productGrid、compositeProduct 模板对齐
 */

export const MAX_PRODUCT_GRID = 6

function trimStr(v) {
  if (v == null) return ''
  return String(v).trim()
}

/**
 * @param {string} subType - 'lock' | 'hardware' | 'smartLock'
 * @param {{ composite?: boolean }} opts
 */
export function createDefaultProductItem(subType = 'lock', opts = {}) {
  const composite = !!opts.composite
  const isLock = subType === 'lock'
  const isSmartLock = subType === 'smartLock'
  const base = {
    id: '',
    deleted: false,
    name: isSmartLock ? '智能门锁' : isLock ? '产品名称' : '小五金配件',
    model: isSmartLock ? 'AJ-SL-001' : isLock ? 'AJ-MODEL-001' : 'AJ-HW-001',
    image: '',
    specs: [
      ...(isSmartLock ? [{ label: '功能', value: '指纹 / 密码 / NFC / 远程' }] : []),
      { label: '材质', value: isLock || isSmartLock ? 'SUS304' : '优质合金' },
      { label: '表面处理', value: isLock || isSmartLock ? '拉丝黑' : '电镀' },
      { label: isLock || isSmartLock ? '可搭配锁体及规格' : '规格', value: '标准规格' },
      { label: '适用范围', value: isSmartLock ? '智能门 / 公寓门' : isLock ? '工程门' : '工程配件' }
    ]
  }
  if (composite) {
    return {
      ...base,
      name: isSmartLock ? '智能门锁（复合）' : isLock ? '复合模式产品' : '复合配件',
      model: isSmartLock ? 'AJ-SL-TECH-001' : isLock ? 'AJ-TECH-001' : 'AJ-HW-TECH-001',
      lineImage: '',
      techTag: 'SCALE 1:1',
      specs: [
        ...(isSmartLock ? [{ label: '功能', value: '指纹 / 密码 / NFC / 远程' }] : []),
        { label: '材质', value: 'SUS304' },
        { label: '表面处理', value: isLock || isSmartLock ? '拉丝黑' : '电镀' },
        { label: isLock || isSmartLock ? '可搭配锁体及规格' : '规格', value: '标准规格' },
        { label: '适用范围', value: isSmartLock ? '智能门 / 公寓门' : isLock ? '工程门' : '工程配件' }
      ]
    }
  }
  return base
}

/**
 * @param {Record<string, unknown>} page
 * @param {{ composite?: boolean }} opts
 */
export function createDefaultProductItemForPage(page, opts = {}) {
  const st = (page && page.subType) || 'lock'
  return createDefaultProductItem(st, opts)
}

/** 是否视为「已占用」格（非 deleted 且有任一实质内容） */
export function isProductSlotFilled(p) {
  if (!p || p.deleted) return false
  if (trimStr(p.image) || trimStr(p.lineImage)) return true
  if (trimStr(p.name) || trimStr(p.model)) return true
  if (Array.isArray(p.specs) && p.specs.some((s) => s && trimStr(s.value))) return true
  return false
}

/** 删除占位：清空内容，保留 specs 行结构（标签保留，值清空） */
export function clearedProductSlot(prev, subType, opts = {}) {
  const composite = !!opts.composite
  const template = createDefaultProductItem(subType || 'lock', { composite })
  const specSource = Array.isArray(prev?.specs) && prev.specs.length ? prev.specs : template.specs
  const specs = specSource.map((row, i) => ({
    label: row?.label ?? template.specs[i]?.label ?? '',
    value: '',
    ...(row?.fullWidth ? { fullWidth: true } : {})
  }))
  const out = {
    ...prev,
    id: prev?.id || '',
    deleted: true,
    name: '',
    model: '',
    image: '',
    specs
  }
  if (composite) {
    out.lineImage = ''
    if (out.techTag == null) out.techTag = 'SCALE 1:1'
  } else {
    out.lineImage = ''
  }
  return out
}

/** 将一格恢复为默认可编辑内容 */
export function resetProductSlot(prev, subType, opts = {}) {
  const fresh = createDefaultProductItem(subType || 'lock', opts)
  return {
    ...fresh,
    id: prev?.id || fresh.id
  }
}
