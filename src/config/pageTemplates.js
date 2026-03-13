import { nanoid } from 'nanoid'

/**
 * 2026年图册标准页面模板配置
 * 基于《最新页面代码.html》设计规范
 */
export const PAGE_TEMPLATES = {
  // PAGE 01: 封面
  'cover': {
    type: 'cover',
    title: '雅洁五金',
    sub: '工程产品手册',
    year: '2026',
    englishBrand: 'ARCHIE',
    englishSubtitle: 'ENGINEERING SOLUTIONS',
    watermarkText: 'ARCHIE',
    blocks: [],
    items: [],
    width: 210,
    height: 297
  },

  // PAGE 02: 公司简介
  'companyIntro': {
    type: 'companyIntro',
    title: '品牌故事',
    sub: 'Company Profile',
    heroImage: '',
    story: `雅洁五金（ARCHIE），始创于1990年，总部位于中国建筑五金之都。三十多年来，我们始终专注于高端建筑门控五金、智能安防系统及卫浴挂件的研发、制造与销售，是国内最具规模和影响力的工程五金解决方案供应商之一。\n\n在占地面积超 10 万平方米的现代化工业园内，雅洁拥有行业领先的自动化压铸、CNC精密加工、全自动抛光及无尘环保电镀生产线。从原材料入库到成品交付，每一道工序都严格遵循 ISO9001 质量管理体系标准，确保每一件产品都能达到卓越的精度与耐用性。\n\n设计，是雅洁的灵魂。我们拥有百人规模的工业设计及技术研发团队，历年来荣获红星奖、红点奖等多项国内外顶级设计大奖。雅洁不仅提供标准的五金产品，更为高端酒店、商业综合体、甲级写字楼及豪宅项目提供深度定制的“静音、安全、极简”门控整体解决方案。`,
    items: [],
    width: 210,
    height: 297
  },

  // PAGE 03: 荣誉资质 (4x2 网格)
  'certificates': {
    type: 'certificates',
    title: '权威认证与资质',
    sub: 'Certificates & Honors',
    items: [
      { id: nanoid(), name: 'ISO9001 质量体系认证', image: '' },
      { id: nanoid(), name: '欧盟 CE 安全认证', image: '' },
      { id: nanoid(), name: '美国 UL 防火认证', image: '' },
      { id: nanoid(), name: '德国红点设计大奖', image: '' },
      { id: nanoid(), name: '中国智能锁十大品牌', image: '' },
      { id: nanoid(), name: '静音锁体发明专利', image: '' },
      { id: nanoid(), name: '国家高新技术企业', image: '' },
      { id: nanoid(), name: '绿色建材产品认证', image: '' }
    ],
    width: 210,
    height: 297
  },

  // PAGE 04: 战略合作伙伴 (3x5 网格)
  'partners': {
    type: 'partners',
    title: '战略合作伙伴',
    sub: 'Global Partners',
    items: Array(15).fill(null).map(() => ({ id: nanoid(), name: '合作伙伴名称', desc: '', image: '' })),
    width: 210,
    height: 297
  },

  // PAGE 05: 工程案例 (3x3 网格)
  'projectCases': {
    type: 'projectCases',
    title: '筑造地标',
    sub: 'Engineering Cases',
    subtitle: 'Engineering Cases',
    items: [
      { id: nanoid(), category: 'COMMERCIAL', name: '上海中心大厦', en: 'Shanghai Tower', image: '' },
      { id: nanoid(), category: 'HOTEL', name: '三亚海棠湾洲际酒店', en: 'IHG Resort Sanya', image: '' },
      { id: nanoid(), category: 'OFFICE', name: '深圳平安金融中心', en: 'Ping An Finance Center', image: '' },
      { id: nanoid(), category: 'COMMERCIAL', name: '广州周大福金融中心', en: 'CTF Finance Centre', image: '' },
      { id: nanoid(), category: 'HOTEL', name: '北京瑰丽酒店', en: 'Rosewood Beijing', image: '' },
      { id: nanoid(), category: 'HOTEL', name: '杭州柏悦酒店', en: 'Park Hyatt Hangzhou', image: '' },
      { id: nanoid(), category: 'COMMERCIAL', name: '成都万象城', en: 'Chengdu MixC', image: '' },
      { id: nanoid(), category: 'OFFICE', name: '武汉国际金融中心', en: 'Wuhan IFS', image: '' },
      { id: nanoid(), category: 'HOTEL', name: '澳门 W 酒店', en: 'W Macau', image: '' }
    ],
    width: 210,
    height: 297
  },

  // PAGE 06: 表面处理 (6x6 网格)
  'surfaceFinishes': {
    type: 'surfaceFinishes',
    title: '质感美学',
    sub: 'Surface Finishes',
    subtitle: 'Surface Finishes',
    intro: '雅洁五金拥有行业顶级的无尘电镀及 PVD 真空镀膜生产线。通过数十道严苛的表面处理工艺，为五金产品赋予极具层次感的光影美学。',
    items: [
      { id: nanoid(), colorClass: 'swatch-pvd', name: 'PVD 钛金', en: 'PVD Titanium' },
      { id: nanoid(), colorClass: 'swatch-black', name: '哑光黑', en: 'Matte Black' },
      { id: nanoid(), colorClass: 'swatch-nickel', name: '拉丝砂镍', en: 'Satin Nickel' },
      { id: nanoid(), colorClass: 'swatch-gunmetal', name: '拉丝枪灰', en: 'Gunmetal' },
      { id: nanoid(), colorClass: 'swatch-bronze', name: '青古铜', en: 'A. Bronze' },
      { id: nanoid(), colorClass: 'swatch-white', name: '烤漆白', en: 'Baked White' },

      { id: nanoid(), colorClass: 'swatch-pvd', name: '镜面金', en: 'Polished Gold' },
      { id: nanoid(), colorClass: 'swatch-black', name: '氟碳黑', en: 'Fluorocarbon' },
      { id: nanoid(), colorClass: 'swatch-nickel', name: '珍珠镍', en: 'Pearl Nickel' },
      { id: nanoid(), colorClass: 'swatch-gunmetal', name: '深空灰', en: 'Space Gray' },
      { id: nanoid(), colorClass: 'swatch-bronze', name: '红古铜', en: 'Red Bronze' },
      { id: nanoid(), colorClass: 'swatch-white', name: '象牙白', en: 'Ivory White' },

      { id: nanoid(), colorClass: 'swatch-pvd', name: '香槟金', en: 'Champagne' },
      { id: nanoid(), colorClass: 'swatch-black', name: '黑拉丝', en: 'Brushed Black' },
      { id: nanoid(), colorClass: 'swatch-nickel', name: '亮铬', en: 'Polished Chrome' },
      { id: nanoid(), colorClass: 'swatch-gunmetal', name: '哑光枪灰', en: 'Matte Gunmetal' },
      { id: nanoid(), colorClass: 'swatch-bronze', name: '黄古铜', en: 'Yellow Bronze' },
      { id: nanoid(), colorClass: 'swatch-white', name: '极地白', en: 'Polar White' },

      { id: nanoid(), colorClass: 'swatch-pvd', name: '玫瑰金', en: 'Rose Gold' },
      { id: nanoid(), colorClass: 'swatch-black', name: '碳素黑', en: 'Carbon Black' },
      { id: nanoid(), colorClass: 'swatch-nickel', name: '砂铬', en: 'Satin Chrome' },
      { id: nanoid(), colorClass: 'swatch-gunmetal', name: '陨石灰', en: 'Meteorite Gray' },
      { id: nanoid(), colorClass: 'swatch-bronze', name: '咖啡古铜', en: 'Coffee Bronze' },
      { id: nanoid(), colorClass: 'swatch-white', name: '珠光白', en: 'Pearl White' },

      { id: nanoid(), colorClass: 'swatch-pvd', name: '拉丝金', en: 'Brushed Gold' },
      { id: nanoid(), colorClass: 'swatch-black', name: '曜石黑', en: 'Obsidian Black' },
      { id: nanoid(), colorClass: 'swatch-nickel', name: '不锈钢亮光', en: 'Polished SS' },
      { id: nanoid(), colorClass: 'swatch-gunmetal', name: '银灰', en: 'Silver Gray' },
      { id: nanoid(), colorClass: 'swatch-bronze', name: '仿金铜', en: 'Imitation Brass' },
      { id: nanoid(), colorClass: 'swatch-white', name: '奶油白', en: 'Cream White' },

      { id: nanoid(), colorClass: 'swatch-pvd', name: '仿金', en: 'Imitation Gold' },
      { id: nanoid(), colorClass: 'swatch-black', name: '晶钻黑', en: 'Diamond Black' },
      { id: nanoid(), colorClass: 'swatch-nickel', name: '不锈钢砂光', en: 'Satin SS' },
      { id: nanoid(), colorClass: 'swatch-gunmetal', name: '铁灰', en: 'Iron Gray' },
      { id: nanoid(), colorClass: 'swatch-bronze', name: '紫古铜', en: 'Purple Bronze' },
      { id: nanoid(), colorClass: 'swatch-white', name: '陶瓷白', en: 'Ceramic White' }
    ],
    width: 210,
    height: 297
  },

  // PAGE 07: 目录
  'tableOfContents': {
    type: 'tableOfContents',
    title: '总目录',
    sub: 'TABLE OF CONTENTS',
    items: [],
    width: 210,
    height: 297
  },

  // PAGE 08: 过渡页
  'divider': {
    type: 'divider',
    title: '智能门控',
    sub: 'SMART HARDWARE COLLECTION',
    sectionNumber: '01',
    pageNumber: '06',
    width: 210,
    height: 297
  },

  // PAGE 09/10: 产品实拍 (2x3 六宫格)
  'productGrid': {
    type: 'productGrid',
    title: '产品系列',
    sub: '实拍版',
    items: Array(6).fill(null).map(() => ({
      id: nanoid(),
      name: '产品名称',
      model: 'AJ-MODEL-001',
      image: '',
      specs: [
        { label: '材质', value: '优质合金' },
        { label: '表面处理', value: '拉丝黑' },
        { label: '规格', value: '标准规格' },
        { label: '适用范围', value: '室内门' }
      ]
    })),
    width: 210,
    height: 297
  },

  // PAGE 11/12: 复合产品 (实拍+线图)
  'compositeProduct': {
    type: 'compositeProduct',
    title: '产品系列',
    sub: '复合图解',
    items: Array(6).fill(null).map(() => ({
      id: nanoid(),
      name: '复合模式产品',
      model: 'AJ-TECH-001',
      image: '',
      lineImage: '',
      techTag: 'SCALE 1:1',
      specs: [
        { label: '材质', value: 'SUS304' },
        { label: '表面处理', value: '拉丝' },
        { label: '规格', value: '标准规格' },
        { label: '适用范围', value: '工程门' }
      ]
    })),
    width: 210,
    height: 297
  },

  // PAGE 13: 封底
  'backCover': {
    type: 'backCover',
    title: 'ARCHIE',
    sub: '雅洁五金',
    qrCodeUrl: '',
    phone: '400-888-xxxx',
    website: 'www.archie.com.cn',
    address: '广东省佛山市南海区大沥镇雅洁工业园',
    companyNameCn: '广东雅洁五金有限公司',
    companyNameEn: 'GUANGDONG ARCHIE HARDWARE CO., LTD.',
    width: 210,
    height: 297
  },

  // 自由编辑页
  'free': {
    type: 'free',
    title: '自由编辑页',
    sub: 'FREE LAYOUT',
    blocks: [],
    items: [],
    width: 210,
    height: 297
  }
}

/**
 * 根据类型获取初始页面数据
 * @param {string} type 模板类型
 * @returns {Object} 初始页面数据
 */
export function getInitialPageData(type) {
  const template = PAGE_TEMPLATES[type] || PAGE_TEMPLATES['free']
  const cloned = JSON.parse(JSON.stringify(template))
  cloned.id = nanoid()
  if (Array.isArray(cloned.items)) {
    cloned.items = cloned.items.map((it) => ({ ...it, id: nanoid() }))
  }
  if (Array.isArray(cloned.blocks)) {
    cloned.blocks = cloned.blocks.map((b) => ({ ...b, id: nanoid() }))
  }
  return cloned
}
