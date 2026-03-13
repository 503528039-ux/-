/**
 * catalog.ts - 雅洁五金 2026 年工程图册产品数据
 *
 * 基于 页面代码.txt 提取的产品信息
 * 按照 CLAUDE.md 规范分配页面 ID
 */

// ===== 类型定义 =====

/** 规格参数项 */
export interface SpecItem {
  label: string
  value: string
  fullWidth?: boolean
}

/** 产品数据 */
export interface Product {
  id: string                    // 唯一标识
  name: string                  // 产品名称
  model: string                 // 产品型号
  image?: string                // 实拍图路径
  lineImage?: string            // 线图路径（复合模式）
  category: ProductCategory     // 产品分类
  subType: ProductSubType       // 子类型
  specs: SpecItem[]             // 规格参数
  techTag?: string              // 技术标签（复合模式）
  pageId: number                // 所属页面 ID
}

/** 产品分类 */
export type ProductCategory = 'lock' | 'hardware'

/** 产品子类型 */
export type ProductSubType = 'lock' | 'hinge' | 'stopper' | 'bolt' | 'safety'

/** 页面数据 */
export interface CatalogPage {
  id: number                    // 页码
  type: PageType                // 页面类型
  title: string                 // 页面标题
  titleEn?: string              // 英文标题
  subtitle?: string             // 副标题
  products?: string[]           // 产品 ID 列表
  displayMode?: DisplayMode     // 显示模式
}

/** 页面类型 */
export type PageType =
  | 'cover'           // 封面
  | 'profile'         // 公司简介
  | 'certificate'     // 荣誉资质
  | 'partner'         // 合作伙伴
  | 'case'            // 工程案例
  | 'finish'          // 表面处理
  | 'toc'             // 目录
  | 'divider'         // 过渡页
  | 'product'         // 产品页
  | 'back'            // 封底

/** 显示模式 */
export type DisplayMode = 'standard' | 'composite'

/** 目录项 */
export interface TocItem {
  index: string                 // 序号（如 "01"）
  title: string                 // 中文标题
  titleEn: string               // 英文标题
  pageNumber: number            // 页码
  highlight?: boolean           // 是否高亮显示
}

// ===== 门锁五金类产品（PAGE 09 - 标准模式）=====

export const lockProducts: Product[] = [
  {
    id: 'AJ-M102-BK',
    name: '极简磁吸分体锁',
    model: 'AJ-M102-BK',
    image: '',
    category: 'lock',
    subType: 'lock',
    specs: [
      { label: '材质', value: '优质锌合金' },
      { label: '表面处理', value: '拉丝黑', fullWidth: true },
      { label: '搭配锁体', value: '磁吸静音锁体', fullWidth: true },
      { label: '适用范围', value: '室内套装门', fullWidth: true }
    ],
    pageId: 9
  },
  {
    id: 'AJ-M105-GD',
    name: '现代简约执手锁',
    model: 'AJ-M105-GD',
    image: '',
    category: 'lock',
    subType: 'lock',
    specs: [
      { label: '材质', value: 'SUS304不锈钢' },
      { label: '表面处理', value: 'PVD 钛金', fullWidth: true },
      { label: '搭配锁体', value: '机械标准锁体', fullWidth: true },
      { label: '适用范围', value: '商用办公/住宅', fullWidth: true }
    ],
    pageId: 9
  },
  {
    id: 'AJ-S201-SN',
    name: '重型推拉门锁',
    model: 'AJ-S201-SN',
    image: '',
    category: 'lock',
    subType: 'lock',
    specs: [
      { label: '材质', value: '优质锌合金' },
      { label: '表面处理', value: '砂镍', fullWidth: true },
      { label: '搭配锁体', value: '专属钩舌锁体', fullWidth: true },
      { label: '适用范围', value: '阳台推拉门', fullWidth: true }
    ],
    pageId: 9
  },
  {
    id: 'AJ-H305-GY',
    name: '隐形门单面锁',
    model: 'AJ-H305-GY',
    image: '',
    category: 'lock',
    subType: 'lock',
    specs: [
      { label: '材质', value: '航空铝合金' },
      { label: '表面处理', value: '枪灰色', fullWidth: true },
      { label: '搭配锁体', value: '单舌隐形锁体', fullWidth: true },
      { label: '适用范围', value: '背景墙隐形门', fullWidth: true }
    ],
    pageId: 9
  },
  {
    id: 'AJ-C402-AB',
    name: '欧式古典分体锁',
    model: 'AJ-C402-AB',
    image: '',
    category: 'lock',
    subType: 'lock',
    specs: [
      { label: '材质', value: '高纯度黄铜' },
      { label: '表面处理', value: '青古铜', fullWidth: true },
      { label: '搭配锁体', value: '欧标静音锁体', fullWidth: true },
      { label: '适用范围', value: '星级酒店/别墅', fullWidth: true }
    ],
    pageId: 9
  },
  {
    id: 'AJ-G501-BK',
    name: '窄边框玻璃门锁',
    model: 'AJ-G501-BK',
    image: '',
    category: 'lock',
    subType: 'lock',
    specs: [
      { label: '材质', value: '航空铝合金' },
      { label: '表面处理', value: '极简哑黑', fullWidth: true },
      { label: '搭配锁体', value: '极窄磁吸锁体', fullWidth: true },
      { label: '适用范围', value: '铝框玻璃门', fullWidth: true }
    ],
    pageId: 9
  }
]

// ===== 工程小五金类产品（PAGE 10 - 标准模式）=====

export const hardwareProducts: Product[] = [
  {
    id: 'AJ-HY-201',
    name: '重型不锈钢合页',
    model: 'AJ-HY-201',
    image: '',
    category: 'hardware',
    subType: 'hinge',
    specs: [
      { label: '材质', value: 'SUS304' },
      { label: '表面处理', value: '不锈钢拉丝', fullWidth: true },
      { label: '规格', value: '4" x 3" x 3.0mm', fullWidth: true },
      { label: '适用范围', value: '入户大门', fullWidth: true }
    ],
    pageId: 10
  },
  {
    id: 'AJ-HY-305',
    name: '隐形门液压合页',
    model: 'AJ-HY-305',
    image: '',
    category: 'hardware',
    subType: 'hinge',
    specs: [
      { label: '材质', value: '航空铝合金' },
      { label: '表面处理', value: '极简黑', fullWidth: true },
      { label: '规格', value: '6" x 3" x 3.5mm', fullWidth: true },
      { label: '适用范围', value: '背景墙隐形门', fullWidth: true }
    ],
    pageId: 10
  },
  {
    id: 'AJ-DX-01',
    name: '强磁防撞地吸',
    model: 'AJ-DX-01',
    image: '',
    category: 'hardware',
    subType: 'stopper',
    specs: [
      { label: '材质', value: '纯铜 / 强磁' },
      { label: '表面处理', value: 'PVD 钛金', fullWidth: true },
      { label: '规格', value: 'Ø45 x 60mm', fullWidth: true },
      { label: '适用范围', value: '室内通用木门', fullWidth: true }
    ],
    pageId: 10
  },
  {
    id: 'AJ-DX-05',
    name: '静音硅胶门吸',
    model: 'AJ-DX-05',
    image: '',
    category: 'hardware',
    subType: 'stopper',
    specs: [
      { label: '材质', value: '锌合金 + 硅胶' },
      { label: '表面处理', value: '枪灰色', fullWidth: true },
      { label: '规格', value: '50 x 85mm', fullWidth: true },
      { label: '适用范围', value: '卧室/书房', fullWidth: true }
    ],
    pageId: 10
  },
  {
    id: 'AJ-CX-02',
    name: '隐形天地插销',
    model: 'AJ-CX-02',
    image: '',
    category: 'hardware',
    subType: 'bolt',
    specs: [
      { label: '材质', value: 'SUS304不锈钢' },
      { label: '表面处理', value: '拉丝砂镍', fullWidth: true },
      { label: '规格', value: '6寸/8寸/10寸', fullWidth: true },
      { label: '适用范围', value: '双开门/子母门', fullWidth: true }
    ],
    pageId: 10
  },
  {
    id: 'AJ-AQ-01',
    name: '纯铜防盗安全扣',
    model: 'AJ-AQ-01',
    image: '',
    category: 'hardware',
    subType: 'safety',
    specs: [
      { label: '材质', value: '高纯度黄铜' },
      { label: '表面处理', value: '青古铜', fullWidth: true },
      { label: '规格', value: '120 x 25mm', fullWidth: true },
      { label: '适用范围', value: '酒店/高档客房', fullWidth: true }
    ],
    pageId: 10
  }
]

// ===== 门锁五金复合模式产品（PAGE 11）=====

export const lockCompositeProducts: Product[] = [
  {
    id: 'AJ-M102-BK-C',
    name: '极简磁吸分体锁',
    model: 'AJ-M102-BK',
    image: '',
    lineImage: '',
    category: 'lock',
    subType: 'lock',
    techTag: 'SCALE 1:1',
    specs: [
      { label: '材质', value: '优质锌合金' },
      { label: '表面处理', value: '拉丝黑', fullWidth: true },
      { label: '搭配锁体', value: '磁吸静音锁体', fullWidth: true },
      { label: '适用范围', value: '室内套装门', fullWidth: true }
    ],
    pageId: 11
  },
  {
    id: 'AJ-M105-GD-C',
    name: '现代简约执手锁',
    model: 'AJ-M105-GD',
    image: '',
    lineImage: '',
    category: 'lock',
    subType: 'lock',
    techTag: 'SCALE 1:1',
    specs: [
      { label: '材质', value: 'SUS304不锈钢' },
      { label: '表面处理', value: 'PVD 钛金', fullWidth: true },
      { label: '搭配锁体', value: '机械标准锁体', fullWidth: true },
      { label: '适用范围', value: '商用办公/住宅', fullWidth: true }
    ],
    pageId: 11
  },
  {
    id: 'AJ-S201-SN-C',
    name: '重型推拉门锁',
    model: 'AJ-S201-SN',
    image: '',
    lineImage: '',
    category: 'lock',
    subType: 'lock',
    techTag: 'DWG-03',
    specs: [
      { label: '材质', value: '优质锌合金' },
      { label: '表面处理', value: '砂镍', fullWidth: true },
      { label: '搭配锁体', value: '专属钩舌锁体', fullWidth: true },
      { label: '适用范围', value: '阳台推拉门', fullWidth: true }
    ],
    pageId: 11
  },
  {
    id: 'AJ-H305-GY-C',
    name: '隐形门单面锁',
    model: 'AJ-H305-GY',
    image: '',
    lineImage: '',
    category: 'lock',
    subType: 'lock',
    techTag: 'DWG-04',
    specs: [
      { label: '材质', value: '航空铝合金' },
      { label: '表面处理', value: '枪灰色', fullWidth: true },
      { label: '搭配锁体', value: '单舌隐形锁体', fullWidth: true },
      { label: '适用范围', value: '背景墙隐形门', fullWidth: true }
    ],
    pageId: 11
  },
  {
    id: 'AJ-C402-AB-C',
    name: '欧式古典分体锁',
    model: 'AJ-C402-AB',
    image: '',
    lineImage: '',
    category: 'lock',
    subType: 'lock',
    techTag: 'DWG-05',
    specs: [
      { label: '材质', value: '高纯度黄铜' },
      { label: '表面处理', value: '青古铜', fullWidth: true },
      { label: '搭配锁体', value: '欧标静音锁体', fullWidth: true },
      { label: '适用范围', value: '星级酒店/别墅', fullWidth: true }
    ],
    pageId: 11
  },
  {
    id: 'AJ-G501-BK-C',
    name: '窄边框玻璃门锁',
    model: 'AJ-G501-BK',
    image: '',
    lineImage: '',
    category: 'lock',
    subType: 'lock',
    techTag: 'DWG-06',
    specs: [
      { label: '材质', value: '航空铝合金' },
      { label: '表面处理', value: '极简哑黑', fullWidth: true },
      { label: '搭配锁体', value: '极窄磁吸锁体', fullWidth: true },
      { label: '适用范围', value: '铝框玻璃门', fullWidth: true }
    ],
    pageId: 11
  }
]

// ===== 工程小五金复合模式产品（PAGE 12）=====

export const hardwareCompositeProducts: Product[] = [
  {
    id: 'AJ-HY-201-C',
    name: '重型不锈钢合页',
    model: 'AJ-HY-201',
    image: '',
    lineImage: '',
    category: 'hardware',
    subType: 'hinge',
    techTag: 'SCALE 1:2',
    specs: [
      { label: '材质', value: 'SUS304' },
      { label: '表面处理', value: '不锈钢拉丝', fullWidth: true },
      { label: '规格', value: '4" x 3" x 3.0mm', fullWidth: true },
      { label: '适用范围', value: '入户大门', fullWidth: true }
    ],
    pageId: 12
  },
  {
    id: 'AJ-HY-305-C',
    name: '隐形门液压合页',
    model: 'AJ-HY-305',
    image: '',
    lineImage: '',
    category: 'hardware',
    subType: 'hinge',
    techTag: 'SCALE 1:2',
    specs: [
      { label: '材质', value: '航空铝合金' },
      { label: '表面处理', value: '极简黑', fullWidth: true },
      { label: '规格', value: '6" x 3" x 3.5mm', fullWidth: true },
      { label: '适用范围', value: '背景墙隐形门', fullWidth: true }
    ],
    pageId: 12
  },
  {
    id: 'AJ-DX-01-C',
    name: '强磁防撞地吸',
    model: 'AJ-DX-01',
    image: '',
    lineImage: '',
    category: 'hardware',
    subType: 'stopper',
    techTag: 'DWG-03',
    specs: [
      { label: '材质', value: '纯铜 / 强磁' },
      { label: '表面处理', value: 'PVD 钛金', fullWidth: true },
      { label: '规格', value: 'Ø45 x 60mm', fullWidth: true },
      { label: '适用范围', value: '室内通用木门', fullWidth: true }
    ],
    pageId: 12
  },
  {
    id: 'AJ-DX-05-C',
    name: '静音硅胶门吸',
    model: 'AJ-DX-05',
    image: '',
    lineImage: '',
    category: 'hardware',
    subType: 'stopper',
    techTag: 'DWG-04',
    specs: [
      { label: '材质', value: '锌合金 + 硅胶' },
      { label: '表面处理', value: '枪灰色', fullWidth: true },
      { label: '规格', value: '50 x 85mm', fullWidth: true },
      { label: '适用范围', value: '卧室/书房', fullWidth: true }
    ],
    pageId: 12
  },
  {
    id: 'AJ-CX-02-C',
    name: '隐形天地插销',
    model: 'AJ-CX-02',
    image: '',
    lineImage: '',
    category: 'hardware',
    subType: 'bolt',
    techTag: 'DWG-05',
    specs: [
      { label: '材质', value: 'SUS304不锈钢' },
      { label: '表面处理', value: '拉丝砂镍', fullWidth: true },
      { label: '规格', value: '6寸/8寸/10寸', fullWidth: true },
      { label: '适用范围', value: '双开门/子母门', fullWidth: true }
    ],
    pageId: 12
  },
  {
    id: 'AJ-AQ-01-C',
    name: '纯铜防盗安全扣',
    model: 'AJ-AQ-01',
    image: '',
    lineImage: '',
    category: 'hardware',
    subType: 'safety',
    techTag: 'DWG-06',
    specs: [
      { label: '材质', value: '高纯度黄铜' },
      { label: '表面处理', value: '青古铜', fullWidth: true },
      { label: '规格', value: '120 x 25mm', fullWidth: true },
      { label: '适用范围', value: '酒店/高档客房', fullWidth: true }
    ],
    pageId: 12
  }
]

// ===== 所有产品合集 =====

export const allProducts: Product[] = [
  ...lockProducts,
  ...hardwareProducts,
  ...lockCompositeProducts,
  ...hardwareCompositeProducts
]

// ===== 页面配置 =====

export const catalogPages: CatalogPage[] = [
  {
    id: 1,
    type: 'cover',
    title: '封面',
    titleEn: 'Cover'
  },
  {
    id: 2,
    type: 'profile',
    title: '品牌故事',
    titleEn: 'Company Profile',
    subtitle: '公司概况'
  },
  {
    id: 3,
    type: 'certificate',
    title: '荣誉资质',
    titleEn: 'Certificates & Honors'
  },
  {
    id: 4,
    type: 'partner',
    title: '战略合作伙伴',
    titleEn: 'Global Partners'
  },
  {
    id: 5,
    type: 'case',
    title: '工程案例',
    titleEn: 'Engineering Cases',
    subtitle: '筑造地标'
  },
  {
    id: 6,
    type: 'finish',
    title: '表面处理工艺',
    titleEn: 'Surface Finishes',
    subtitle: '质感美学'
  },
  {
    id: 7,
    type: 'toc',
    title: '总目录',
    titleEn: 'Table of Contents'
  },
  {
    id: 8,
    type: 'divider',
    title: '智能门控',
    titleEn: 'Smart Hardware Collection',
    subtitle: '06'
  },
  {
    id: 9,
    type: 'product',
    title: '门锁五金系列',
    titleEn: 'Locks Photo',
    subtitle: '实拍版',
    products: lockProducts.map(p => p.id),
    displayMode: 'standard'
  },
  {
    id: 10,
    type: 'product',
    title: '工程小五金系列',
    titleEn: 'Hardware Photo',
    subtitle: '实拍版',
    products: hardwareProducts.map(p => p.id),
    displayMode: 'standard'
  },
  {
    id: 11,
    type: 'product',
    title: '门锁五金系列',
    titleEn: 'Locks Tech',
    subtitle: '复合图解',
    products: lockCompositeProducts.map(p => p.id),
    displayMode: 'composite'
  },
  {
    id: 12,
    type: 'product',
    title: '工程小五金系列',
    titleEn: 'Hardware Tech',
    subtitle: '复合图解',
    products: hardwareCompositeProducts.map(p => p.id),
    displayMode: 'composite'
  },
  {
    id: 13,
    type: 'back',
    title: '封底',
    titleEn: 'Back Cover'
  }
]

// ===== 目录数据（对应 PAGE 07）=====

export const tableOfContents: TocItem[] = [
  { index: '01', title: '品牌故事', titleEn: 'Profile', pageNumber: 2 },
  { index: '02', title: '荣誉资质', titleEn: 'Certificates', pageNumber: 3 },
  { index: '03', title: '战略合作', titleEn: 'Partners', pageNumber: 4 },
  { index: '04', title: '工程案例', titleEn: 'Cases', pageNumber: 5 },
  { index: '05', title: '表面工艺', titleEn: 'Finishes', pageNumber: 6 },
  { index: '06', title: '门锁五金系列 (实拍版)', titleEn: 'Locks Photo', pageNumber: 9 },
  { index: '07', title: '工程小五金系列 (实拍版)', titleEn: 'Hardware Photo', pageNumber: 10 },
  { index: '08', title: '门锁五金 (实拍+线图)', titleEn: 'Locks Tech', pageNumber: 11, highlight: true },
  { index: '09', title: '工程小五金 (实拍+线图)', titleEn: 'Hardware Tech', pageNumber: 12, highlight: true }
]

// ===== 工具函数 =====

/**
 * 根据产品 ID 获取产品
 */
export function getProductById(id: string): Product | undefined {
  return allProducts.find(p => p.id === id)
}

/**
 * 根据页面 ID 获取产品列表
 */
export function getProductsByPageId(pageId: number): Product[] {
  return allProducts.filter(p => p.pageId === pageId)
}

/**
 * 根据分类获取产品
 */
export function getProductsByCategory(category: ProductCategory): Product[] {
  return allProducts.filter(p => p.category === category)
}

/**
 * 根据页面 ID 获取页面配置
 */
export function getPageById(pageId: number): CatalogPage | undefined {
  return catalogPages.find(p => p.id === pageId)
}

/**
 * 获取产品页面列表
 */
export function getProductPages(): CatalogPage[] {
  return catalogPages.filter(p => p.type === 'product')
}

/**
 * 获取总页数
 */
export function getTotalPages(): number {
  return catalogPages.length
}

// ===== 默认导出 =====

export default {
  lockProducts,
  hardwareProducts,
  lockCompositeProducts,
  hardwareCompositeProducts,
  allProducts,
  catalogPages,
  tableOfContents,
  getProductById,
  getProductsByPageId,
  getProductsByCategory,
  getPageById,
  getProductPages,
  getTotalPages
}
