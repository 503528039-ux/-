/**
 * 空标题/副标题、格子内文案写回默认值，使 localStorage / 导出 JSON 可读。
 * 页面级与 pageTemplates / AddPageCommand 对齐；格子级：空即统一占位（用户要求「统一一句」「空即是默认」）。
 */
import { PAGE_TEMPLATES } from '../config/pageTemplates'

/** 格子中文可编辑文案统一默认 */
export const DEFAULT_CELL_CN = '默认名称'

/** 格子英文行统一默认 */
export const DEFAULT_CELL_EN = 'Name'

function trimStr(v) {
  if (v == null) return ''
  return String(v).trim()
}

/**
 * @param {Record<string, unknown>} page
 * @returns {{ title: string, sub: string, intro?: string, story?: string } | null}
 */
function getDefaultTextsForPage(page) {
  if (!page || typeof page !== 'object') return null
  const t = page.type
  const st = page.subType || 'lock'

  if (t === 'productGrid') {
    if (st === 'smartLock') {
      return { title: '智能门锁实拍', sub: '' }
    }
    if (st === 'lock') {
      return { title: '门锁五金实拍', sub: 'DOOR LOCK HARDWARE' }
    }
    return { title: '工程小五金实拍', sub: 'ENGINEERING HARDWARE' }
  }

  if (t === 'compositeProduct') {
    if (st === 'smartLock') {
      return { title: '智能门锁复合图解', sub: '' }
    }
    if (st === 'lock') {
      return { title: '门锁五金复合图解', sub: 'DOOR LOCK COMPOSITE' }
    }
    return { title: '工程小五金复合图解', sub: 'ENGINEERING HARDWARE COMPOSITE' }
  }

  if (t === 'product') {
    if (st === 'lock') {
      return { title: 'DOOR LOCK SYSTEM', sub: '门锁五金系统' }
    }
    return { title: 'HARDWARE ACCESSORIES', sub: '小五金配件系列' }
  }

  if (t === 'toc') {
    return { title: 'CONTENTS / 目录', sub: '' }
  }

  const tpl = PAGE_TEMPLATES[t]
  if (tpl && tpl.title != null) {
    const out = {
      title: String(tpl.title),
      sub: tpl.sub != null ? String(tpl.sub) : ''
    }
    if (t === 'surfaceFinishes' && tpl.intro != null) {
      out.intro = String(tpl.intro)
    }
    if (t === 'companyIntro' && tpl.story != null) {
      out.story = String(tpl.story)
    }
    return out
  }

  return null
}

/**
 * 资质 / 伙伴 / 案例 / 表面处理 / 产品格 / 目录行 等：空字段写统一默认
 * @param {Record<string, unknown>} page
 */
function normalizeGridCellsForPage(page) {
  if (!page || typeof page !== 'object') return
  const t = page.type

  if (t === 'certificates' && Array.isArray(page.items)) {
    page.items.forEach((it) => {
      if (!it || it.deleted) return
      const n = trimStr(it.name)
      const tx = trimStr(it.text)
      if (!n && !tx) {
        it.name = DEFAULT_CELL_CN
        it.text = DEFAULT_CELL_CN
      } else {
        const merged = n || tx
        it.name = merged
        it.text = merged
      }
    })
    return
  }

  if (t === 'partners' && Array.isArray(page.items)) {
    page.items.forEach((it) => {
      if (!it || it.deleted) return
      if (!trimStr(it.name)) it.name = DEFAULT_CELL_CN
    })
    return
  }

  if (t === 'projectCases' && Array.isArray(page.items)) {
    page.items.forEach((it) => {
      if (!it || it.deleted) return
      if (!trimStr(it.name)) it.name = DEFAULT_CELL_CN
      const enLine = trimStr(it.en) || trimStr(it.enTitle)
      if (!enLine) {
        it.en = DEFAULT_CELL_EN
        it.enTitle = DEFAULT_CELL_EN
      } else {
        it.en = enLine
        it.enTitle = enLine
      }
    })
    return
  }

  if (t === 'surfaceFinishes') {
    if (Array.isArray(page.features)) {
      page.features.forEach((f) => {
        if (!f) return
        if (!trimStr(f.title)) f.title = DEFAULT_CELL_CN
        if (!trimStr(f.sub)) f.sub = DEFAULT_CELL_CN
      })
    }
    if (Array.isArray(page.items)) {
      page.items.forEach((it) => {
        if (!it || it.deleted) return
        if (!trimStr(it.name)) it.name = DEFAULT_CELL_CN
        const enLine = trimStr(it.en) || trimStr(it.enName)
        if (!enLine) {
          it.en = DEFAULT_CELL_EN
          it.enName = DEFAULT_CELL_EN
        } else {
          it.en = enLine
          it.enName = enLine
        }
      })
    }
    return
  }

  if ((t === 'productGrid' || t === 'compositeProduct' || t === 'product') && Array.isArray(page.items)) {
    page.items.forEach((it) => {
      if (!it || it.deleted) return
      if (!trimStr(it.name)) it.name = DEFAULT_CELL_CN
      if (!trimStr(it.model)) it.model = DEFAULT_CELL_CN
      if (Array.isArray(it.specs)) {
        it.specs.forEach((s) => {
          if (s && typeof s === 'object' && !trimStr(s.value)) s.value = DEFAULT_CELL_CN
        })
      }
    })
    return
  }

  if (t === 'tableOfContents' && Array.isArray(page.tocItems)) {
    page.tocItems.forEach((row) => {
      if (!row) return
      if (!trimStr(row.title)) row.title = DEFAULT_CELL_CN
      if (!trimStr(row.titleEn)) row.titleEn = DEFAULT_CELL_EN
    })
  }
}

/**
 * 就地补全单页空标题/副标题/部分正文 + 格子文案
 * @param {Record<string, unknown>} page
 */
export function normalizePageTextFields(page) {
  const defs = getDefaultTextsForPage(page)
  if (defs) {
    if (!trimStr(page.title)) {
      page.title = defs.title
    }

    const subEmpty = !trimStr(page.sub) && !trimStr(page.subtitle)
    if (subEmpty && defs.sub !== undefined) {
      page.sub = defs.sub
      page.subtitle = defs.sub
    }

    if (defs.intro != null && !trimStr(page.intro)) {
      page.intro = defs.intro
    }

    if (defs.story != null && !trimStr(page.story)) {
      page.story = defs.story
    }
  }

  normalizeGridCellsForPage(page)
}

/**
 * @param {unknown[]} pages
 * @returns {unknown[]}
 */
export function normalizeCatalogPages(pages) {
  if (!Array.isArray(pages)) return pages
  pages.forEach((p) => normalizePageTextFields(p))
  return pages
}
