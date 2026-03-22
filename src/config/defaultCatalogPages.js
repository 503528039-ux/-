import { nanoid } from 'nanoid'
import { getInitialPageData } from './pageTemplates'

/**
 * 首次打开或「仅封面」迁移时插入的图册页（不修改 PAGE_TEMPLATES 默认文案）。
 * 荣誉/伙伴/案例/表面介绍等：按公开渠道常见表述整理，审阅后请以官网及画册 PDF 为准。
 */

const DEMO_CERTIFICATE_NAMES = [
  'ISO9001 质量管理体系认证',
  'ISO14001 环境管理体系认证',
  'ISO45001 职业健康安全管理体系认证',
  '国家高新技术企业',
  'CNAS 国家认可实验室',
  '欧盟 CE 产品认证',
  '美国 FCC 认证（智能门控类）',
  '广东省名牌产品 / 著名商标'
]

const DEMO_PARTNER_NAMES = [
  '龙湖集团 Longfor',
  '万科地产 Vanke',
  '保利发展 Poly',
  '华润置地 CR Land',
  '中海地产 COLI',
  '绿城中国 Greentown',
  '卓越集团 Excellence',
  '希尔顿 Hilton',
  '万豪 Marriott',
  '洲际酒店集团 IHG',
  '凯悦 Hyatt',
  '香格里拉 Shangri-La',
  '温德姆 Wyndham',
  '金螳螂 Gold Mantis',
  '亚厦股份 Yasha'
]

const DEMO_PROJECT_CASES = [
  { category: 'PROCUREMENT', name: '龙湖集团战略集采项目', en: 'Longfor Strategic Procurement' },
  { category: 'HOTEL', name: '星级酒店群工程（示例）', en: 'Star Hotel Projects' },
  { category: 'OFFICE', name: '甲级写字楼门禁工程（示例）', en: 'Grade-A Office Access' },
  { category: 'COMMERCIAL', name: '商业综合体项目（示例）', en: 'Commercial Complex' },
  { category: 'RESIDENTIAL', name: '精装住宅批量项目（示例）', en: 'Residential Fit-out' },
  { category: 'PUBLIC', name: '教育及医疗建筑（示例）', en: 'Education & Healthcare' },
  { category: 'CULTURE', name: '文体场馆项目（示例）', en: 'Culture & Sports Venues' },
  { category: 'REGIONAL', name: '粤港澳大湾区项目群（示例）', en: 'Greater Bay Area' },
  { category: 'OVERSEAS', name: '海外酒店及商业（示例）', en: 'Overseas Hospitality' }
]

const DEMO_SURFACE_INTRO =
  '广东雅洁五金有限公司建有现代化生产基地，配套抛光、电泳、电镀、喷漆、喷粉等自动化表面处理产线，结合锌合金、铜合金、不锈钢等基材，为门锁及建筑五金提供一致、耐久的外观与防护效果。（具体色号与工艺以最新样本册为准。）'

const PAGE_ORDER = [
  'cover',
  'companyIntro',
  'certificates',
  'partners',
  'projectCases',
  'surfaceFinishes',
  'tableOfContents',
  'divider'
]

function patchPublicDemo(page) {
  const t = page.type
  if (t === 'certificates') {
    page.items = DEMO_CERTIFICATE_NAMES.map((name) => ({ id: nanoid(), name, image: '' }))
    return
  }
  if (t === 'partners') {
    page.items = DEMO_PARTNER_NAMES.map((name) => ({ id: nanoid(), name, desc: '', image: '' }))
    return
  }
  if (t === 'projectCases') {
    page.items = DEMO_PROJECT_CASES.map((row) => ({
      id: nanoid(),
      category: row.category,
      name: row.name,
      en: row.en,
      image: ''
    }))
    return
  }
  if (t === 'surfaceFinishes') {
    page.intro = DEMO_SURFACE_INTRO
  }
}

/**
 * 构建带公开资料示例的完整默认图册页列表（用于首次加载或迁移追加）。
 */
export function buildCatalogDemoPages() {
  return PAGE_ORDER.map((type) => {
    const page = getInitialPageData(type)
    patchPublicDemo(page)
    return page
  })
}

/**
 * 除封面外的示例页（用于向「仅含封面」的旧数据追加）。
 */
export function buildCatalogDemoPagesAfterCover() {
  return PAGE_ORDER.filter((t) => t !== 'cover').map((type) => {
    const page = getInitialPageData(type)
    patchPublicDemo(page)
    return page
  })
}
