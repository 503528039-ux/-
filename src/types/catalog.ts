/**
 * 雅洁五金2026工程图册 - TypeScript类型定义
 * 基于页面代码.txt中的页面模板和现有数据结构
 */

// ===== 页面类型枚举 =====
export enum PageType {
  /** 封面页 */
  COVER = 'cover',
  
  /** 公司简介页 */
  COMPANY_INTRO = 'companyIntro',
  
  /** 荣誉资质页 (4×2网格) */
  CERTIFICATES = 'certificates',
  
  /** 战略合作伙伴页 (3×5网格) */
  PARTNERS = 'partners',
  
  /** 工程案例页 */
  PROJECT_CASES = 'projectCases',
  
  /** 表面处理页 (一行6个) */
  SURFACE_FINISHES = 'surfaceFinishes',
  
  /** 目录页 */
  TABLE_OF_CONTENTS = 'tableOfContents',
  
  /** 过渡页 */
  DIVIDER = 'divider',
  
  /** 传统产品页 (门锁/五金) */
  PRODUCT = 'product',
  
  /** 6宫格产品页 */
  PRODUCT_GRID = 'productGrid',
  
  /** 复合模式产品页 (实拍+线图) */
  COMPOSITE_PRODUCT = 'compositeProduct',
  
  /** 封底页 */
  BACK_COVER = 'backCover',
  
  /** 自定义画布页 (现有类型) */
  CANVAS = 'canvas',
  
  /** 品牌故事页 (现有类型) */
  BRAND = 'brand',
  
  /** 介绍页 (现有类型) */
  INTRO = 'intro',
  
  /** 自定义页 (现有类型) */
  CUSTOM = 'custom',
  
  /** 自由编辑页 */
  FREE = 'free'
}

// ===== 产品子类型枚举 =====
export enum ProductSubType {
  /** 门锁五金 */
  LOCK = 'lock',
  
  /** 工程小五金 */
  HARDWARE = 'hardware'
}

// ===== 页面块类型 =====
export enum BlockType {
  /** 文本块 */
  TEXT = 'text',
  
  /** 图片块 */
  IMAGE = 'image',
  
  /** 形状块 */
  SHAPE = 'shape'
}

// ===== 页面项类型 =====
export enum ItemType {
  /** 荣誉证书 */
  CERT = 'cert',
  
  /** 合作伙伴 */
  PARTNER = 'partner',
  
  /** 工程项目 */
  PROJECT = 'project',
  
  /** 表面处理 */
  FINISH = 'finish',
  
  /** 产品 */
  PRODUCT = 'product'
}

// ===== 核心数据接口 =====

/**
 * 页面数据接口
 */
export interface PageData {
  /** 页面唯一ID */
  id: string;
  
  /** 页面类型 */
  type: PageType;
  
  /** 产品子类型 (仅产品页有效) */
  subType?: ProductSubType;
  
  /** 页面标题 */
  title: string;
  
  /** 页面宽度 (mm) */
  width: number;
  
  /** 页面高度 (mm) */
  height: number;
  
  /** 背景图片URL */
  bgImage?: string;
  
  /** 页面块数组 */
  blocks: PageBlock[];
  
  /** 页面项数组 (荣誉、合作伙伴、产品等) */
  items?: PageItem[];
  
  /** 是否显示页码 */
  showPageNum: boolean;
  
  /** 页码 */
  pageNumber?: string;
  
  /** 重置页码 */
  resetNumbering?: boolean;
  
  /** 停止页码 */
  stopNumbering?: boolean;
  
  /** 画布类型 (仅canvas类型页有效) */
  canvasType?: string;
  
  /** 页面组件props数据 */
  props?: Record<string, any>;
}

/**
 * 页面块接口
 */
export interface PageBlock {
  /** 块唯一ID */
  id: string;
  
  /** 块类型 */
  type: BlockType;
  
  /** 块内容 (HTML文本或图片URL) */
  content: string;
  
  /** X坐标 (px) */
  x: number;
  
  /** Y坐标 (px) */
  y: number;
  
  /** 宽度 (px) */
  width: number;
  
  /** 高度 (px) */
  height: number;
  
  /** 旋转角度 */
  rotation?: number;
  
  /** 透明度 (0-1) */
  opacity?: number;
  
  /** 层级 */
  zIndex?: number;
}

/**
 * 页面项接口 (通用)
 */
export interface PageItem {
  /** 项唯一ID */
  id: string;
  
  /** 项类型 */
  type: ItemType;
  
  /** 名称/标题 */
  name: string;
  
  /** 图片URL */
  img: string;
  
  /** 描述/附加信息 */
  desc?: string;
  
  /** 位置信息 (工程案例用) */
  loc?: string;
}

/**
 * 产品数据接口
 */
export interface Product extends PageItem {
  /** 产品子类型 */
  subType: ProductSubType;
  
  /** 产品型号 */
  model: string;
  
  /** 材质 */
  material: string;
  
  /** 规格 */
  spec: string;
  
  /** 表面处理 */
  finish: string;
  
  /** 搭配锁体 (仅锁具) */
  body?: string;
  
  /** 适用门型 (仅锁具) */
  door?: string;
  
  /** 价格 */
  price?: string;
  
  /** 产品实拍图 */
  image: string;
  
  /** 产品实拍图缩放比例 */
  pScale: number;
  
  /** 产品线图 */
  lineImage: string;
  
  /** 产品线图缩放比例 */
  lScale: number;
}

/**
 * 荣誉证书接口
 */
export interface Certificate extends PageItem {
  /** 证书类型 */
  certType: string;
}

/**
 * 合作伙伴接口
 */
export interface Partner extends PageItem {
  /** 合作伙伴类型 */
  partnerType: string;
}

/**
 * 工程案例接口
 */
export interface ProjectCase extends PageItem {
  /** 案例类型 */
  projectType: string;
  
  /** 位置 */
  location: string;
}

/**
 * 表面处理接口
 */
export interface SurfaceFinish extends PageItem {
  /** 英文名称 */
  enName: string;
  
  /** 颜色类名 */
  colorClass: string;
}

// ===== 页面模板配置 =====

/**
 * 页面模板配置接口
 */
export interface PageTemplateConfig {
  /** 模板类型 */
  type: PageType;
  
  /** 模板名称 */
  name: string;
  
  /** 模板描述 */
  description: string;
  
  /** 默认宽度 (mm) */
  defaultWidth: number;
  
  /** 默认高度 (mm) */
  defaultHeight: number;
  
  /** 是否有背景图片 */
  hasBackground: boolean;
  
  /** 是否显示页码 */
  showPageNumber: boolean;
  
  /** 默认项类型 */
  defaultItemType?: ItemType;
  
  /** 默认项数量 */
  defaultItemCount?: number;
  
  /** 网格配置 */
  gridConfig?: {
    /** 列数 */
    columns: number;
    
    /** 行数 */
    rows: number;
    
    /** 水平间距 (mm) */
    horizontalGap: number;
    
    /** 垂直间距 (mm) */
    verticalGap: number;
  };
}

// ===== 页面模板配置常量 =====
export const PAGE_TEMPLATES: Record<PageType, PageTemplateConfig> = {
  [PageType.COVER]: {
    type: PageType.COVER,
    name: '封面页',
    description: '品牌封面，包含裁切线和装饰元素',
    defaultWidth: 210,
    defaultHeight: 297,
    hasBackground: true,
    showPageNumber: false
  },
  
  [PageType.COMPANY_INTRO]: {
    type: PageType.COMPANY_INTRO,
    name: '公司简介页',
    description: '公司介绍，包含全宽图片和双栏文字',
    defaultWidth: 210,
    defaultHeight: 297,
    hasBackground: false,
    showPageNumber: true
  },
  
  [PageType.CERTIFICATES]: {
    type: PageType.CERTIFICATES,
    name: '荣誉资质页',
    description: '4×2网格展示荣誉证书',
    defaultWidth: 210,
    defaultHeight: 297,
    hasBackground: false,
    showPageNumber: true,
    defaultItemType: ItemType.CERT,
    defaultItemCount: 8,
    gridConfig: {
      columns: 4,
      rows: 2,
      horizontalGap: 12,
      verticalGap: 12
    }
  },
  
  [PageType.PARTNERS]: {
    type: PageType.PARTNERS,
    name: '合作伙伴页',
    description: '3×5网格展示战略合作伙伴',
    defaultWidth: 210,
    defaultHeight: 297,
    hasBackground: false,
    showPageNumber: true,
    defaultItemType: ItemType.PARTNER,
    defaultItemCount: 15,
    gridConfig: {
      columns: 3,
      rows: 5,
      horizontalGap: 8,
      verticalGap: 8
    }
  },
  
  [PageType.PROJECT_CASES]: {
    type: PageType.PROJECT_CASES,
    name: '工程案例页',
    description: '全屏图片展示工程案例',
    defaultWidth: 210,
    defaultHeight: 297,
    hasBackground: false,
    showPageNumber: true,
    defaultItemType: ItemType.PROJECT,
    defaultItemCount: 2
  },
  
  [PageType.SURFACE_FINISHES]: {
    type: PageType.SURFACE_FINISHES,
    name: '表面处理页',
    description: '一行6个展示表面处理工艺',
    defaultWidth: 210,
    defaultHeight: 297,
    hasBackground: false,
    showPageNumber: true,
    defaultItemType: ItemType.FINISH,
    defaultItemCount: 6,
    gridConfig: {
      columns: 6,
      rows: 1,
      horizontalGap: 4,
      verticalGap: 10
    }
  },
  
  [PageType.TABLE_OF_CONTENTS]: {
    type: PageType.TABLE_OF_CONTENTS,
    name: '目录页',
    description: '带点状线的目录列表',
    defaultWidth: 210,
    defaultHeight: 297,
    hasBackground: false,
    showPageNumber: true
  },
  
  [PageType.DIVIDER]: {
    type: PageType.DIVIDER,
    name: '过渡页',
    description: '纯色背景过渡页，包含大数字装饰',
    defaultWidth: 210,
    defaultHeight: 297,
    hasBackground: true,
    showPageNumber: false
  },
  
  [PageType.PRODUCT]: {
    type: PageType.PRODUCT,
    name: '传统产品页',
    description: '传统布局的产品展示页面',
    defaultWidth: 210,
    defaultHeight: 297,
    hasBackground: false,
    showPageNumber: true,
    defaultItemType: ItemType.PRODUCT,
    defaultItemCount: 6,
    gridConfig: {
      columns: 2,
      rows: 3,
      horizontalGap: 8,
      verticalGap: 8
    }
  },
  
  [PageType.PRODUCT_GRID]: {
    type: PageType.PRODUCT_GRID,
    name: '6宫格产品页',
    description: '2×3网格展示产品',
    defaultWidth: 210,
    defaultHeight: 297,
    hasBackground: false,
    showPageNumber: true,
    defaultItemType: ItemType.PRODUCT,
    defaultItemCount: 6,
    gridConfig: {
      columns: 2,
      rows: 3,
      horizontalGap: 8,
      verticalGap: 8
    }
  },
  
  [PageType.COMPOSITE_PRODUCT]: {
    type: PageType.COMPOSITE_PRODUCT,
    name: '复合模式产品页',
    description: '实拍图+线图组合展示',
    defaultWidth: 210,
    defaultHeight: 297,
    hasBackground: false,
    showPageNumber: true,
    defaultItemType: ItemType.PRODUCT,
    defaultItemCount: 6,
    gridConfig: {
      columns: 2,
      rows: 3,
      horizontalGap: 8,
      verticalGap: 8
    }
  },
  
  [PageType.BACK_COVER]: {
    type: PageType.BACK_COVER,
    name: '封底页',
    description: '联系信息和二维码',
    defaultWidth: 210,
    defaultHeight: 297,
    hasBackground: true,
    showPageNumber: false
  },
  
  // 现有类型保持兼容
  [PageType.CANVAS]: {
    type: PageType.CANVAS,
    name: '画布页',
    description: '自定义画布',
    defaultWidth: 210,
    defaultHeight: 297,
    hasBackground: false,
    showPageNumber: true
  },
  
  [PageType.BRAND]: {
    type: PageType.BRAND,
    name: '品牌页',
    description: '品牌故事',
    defaultWidth: 210,
    defaultHeight: 297,
    hasBackground: false,
    showPageNumber: true
  },
  
  [PageType.INTRO]: {
    type: PageType.INTRO,
    name: '介绍页',
    description: '产品介绍',
    defaultWidth: 210,
    defaultHeight: 297,
    hasBackground: false,
    showPageNumber: true
  },
  
  [PageType.CUSTOM]: {
    type: PageType.CUSTOM,
    name: '自定义页',
    description: '自定义页面',
    defaultWidth: 210,
    defaultHeight: 297,
    hasBackground: false,
    showPageNumber: true
  },
  
  [PageType.FREE]: {
    type: PageType.FREE,
    name: '自由编辑页',
    description: '自由编辑页面',
    defaultWidth: 210,
    defaultHeight: 297,
    hasBackground: false,
    showPageNumber: true
  }
};

// ===== 工具类型 =====

/**
 * 创建页面参数
 */
export interface CreatePageParams {
  type: PageType;
  subType?: ProductSubType;
  title?: string;
  width?: number;
  height?: number;
  bgImage?: string;
}

/**
 * 创建产品参数
 */
export interface CreateProductParams {
  subType?: ProductSubType;
  name?: string;
  model?: string;
  material?: string;
  spec?: string;
  finish?: string;
  body?: string;
  door?: string;
  price?: string;
}

/**
 * 拖拽操作参数
 */
export interface DragOperation {
  pageId: string;
  blockId: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

/**
 * 调整大小操作参数
 */
export interface ResizeOperation {
  pageId: string;
  blockId: string;
  startWidth: number;
  startHeight: number;
  currentWidth: number;
  currentHeight: number;
}

// ===== 类型守卫 =====

/**
 * 检查是否为产品类型
 */
export function isProduct(item: PageItem): item is Product {
  return item.type === ItemType.PRODUCT;
}

/**
 * 检查是否为荣誉证书类型
 */
export function isCertificate(item: PageItem): item is Certificate {
  return item.type === ItemType.CERT;
}

/**
 * 检查是否为合作伙伴类型
 */
export function isPartner(item: PageItem): item is Partner {
  return item.type === ItemType.PARTNER;
}

/**
 * 检查是否为工程案例类型
 */
export function isProjectCase(item: PageItem): item is ProjectCase {
  return item.type === ItemType.PROJECT;
}

/**
 * 检查是否为表面处理类型
 */
export function isSurfaceFinish(item: PageItem): item is SurfaceFinish {
  return item.type === ItemType.FINISH;
}

// ===== 默认值 =====

/**
 * 创建默认页面数据
 */
export function createDefaultPageData(type: PageType, subType?: ProductSubType): PageData {
  const template = PAGE_TEMPLATES[type];
  
  return {
    id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    subType,
    title: template.name,
    width: template.defaultWidth,
    height: template.defaultHeight,
    bgImage: '',
    blocks: [],
    items: [],
    showPageNum: template.showPageNumber
  };
}

/**
 * 创建默认产品数据
 */
export function createDefaultProduct(params: CreateProductParams = {}): Product {
  const {
    subType = ProductSubType.LOCK,
    name = '',
    model = '',
    material = '',
    spec = '',
    finish = '',
    body = '',
    door = '',
    price = ''
  } = params;
  
  return {
    id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: ItemType.PRODUCT,
    subType,
    name,
    model,
    material,
    spec,
    finish,
    body,
    door,
    price,
    img: '',
    image: '',
    pScale: 1.0,
    lineImage: '',
    lScale: 1.0
  };
}

/**
 * 创建默认页面项
 */
export function createDefaultPageItem(type: ItemType): PageItem {
  const base = {
    id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    name: '',
    img: ''
  };
  
  switch (type) {
    case ItemType.CERT:
      return { ...base, name: '荣誉证书' };
    case ItemType.PARTNER:
      return { ...base, name: '合作伙伴', desc: '合作描述' };
    case ItemType.PROJECT:
      return { ...base, name: '工程项目', loc: '项目地点' };
    case ItemType.FINISH:
      return { ...base, name: '表面处理' };
    case ItemType.PRODUCT:
      return createDefaultProduct();
    default:
      return base;
  }
}

/**
 * 根据页面类型获取对应的组件名称
 */
export function getComponentNameByPageType(pageType: PageType | string): string {
  const componentMap: Record<string, string> = {
    [PageType.COVER]: 'CatalogCover',
    [PageType.COMPANY_INTRO]: 'CompanyIntroPage',
    [PageType.CERTIFICATES]: 'CertificatesPage',
    [PageType.PARTNERS]: 'PartnersPage',
    [PageType.PROJECT_CASES]: 'ProjectCasesPage',
    [PageType.SURFACE_FINISHES]: 'SurfaceFinishesPage',
    [PageType.TABLE_OF_CONTENTS]: 'TableOfContentsPage',
    [PageType.DIVIDER]: 'DividerPage',
    [PageType.PRODUCT]: 'ProductGridPage',
    'product': 'ProductGridPage',
    [PageType.PRODUCT_GRID]: 'ProductGridPage',
    [PageType.COMPOSITE_PRODUCT]: 'CompositeProductPage',
    [PageType.BACK_COVER]: 'BackCoverPage',
    [PageType.CANVAS]: 'CanvasPage',
    [PageType.BRAND]: 'BrandPage',
    [PageType.INTRO]: 'IntroPage',
    [PageType.CUSTOM]: 'CustomPage',
    [PageType.FREE]: 'FreePage',
    'free': 'FreePage'
  };
  
  return componentMap[pageType] || 'CatalogCover';
}

/**
 * 创建默认页面props
 */
export function createDefaultPageProps(pageType: PageType): Record<string, any> {
  switch (pageType) {
    case PageType.COVER:
      return {
        title: '雅洁五金2026工程图册',
        subtitle: 'ARCHIE HARDWARE 2026 CATALOG',
        year: '2026'
      };
    case PageType.COMPANY_INTRO:
      return {
        companyName: '雅洁五金有限公司',
        foundedYear: '1998',
        description: '专注于高端五金配件研发与制造',
        values: ['创新', '品质', '服务', '合作']
      };
    case PageType.CERTIFICATES:
      return {
        title: '荣誉资质',
        subtitle: 'CERTIFICATES & HONORS',
        certificates: Array(8).fill(null).map((_, i) => ({
          id: `cert-${i + 1}`,
          name: `荣誉证书 ${i + 1}`,
          image: ''
        }))
      };
    case PageType.PARTNERS:
      return {
        title: '战略合作伙伴',
        subtitle: 'STRATEGIC PARTNERS',
        partners: Array(15).fill(null).map((_, i) => ({
          id: `partner-${i + 1}`,
          name: `合作伙伴 ${i + 1}`,
          image: '',
          description: '长期战略合作'
        }))
      };
    case PageType.PROJECT_CASES:
      return {
        topCase: {
          image: '',
          category: '商业综合体',
          title: '上海中心大厦',
          location: '上海市浦东新区陆家嘴金融贸易区'
        },
        bottomCase: {
          image: '',
          category: '高端住宅',
          title: '北京国贸三期公寓',
          location: '北京市朝阳区建国门外大街'
        }
      };
    case PageType.SURFACE_FINISHES:
      return {
        title: '表面处理工艺',
        subtitle: 'SURFACE FINISHES',
        finishes: Array(6).fill(null).map((_, i) => ({
          id: `finish-${i + 1}`,
          name: `表面处理 ${i + 1}`,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
        }))
      };
    case PageType.TABLE_OF_CONTENTS:
      return {
        title: '目录',
        subtitle: 'TABLE OF CONTENTS',
        items: [
          { id: '1', title: '公司介绍', page: '1' },
          { id: '2', title: '荣誉资质', page: '2-3' },
          { id: '3', title: '合作伙伴', page: '4-5' },
          { id: '4', title: '工程案例', page: '6' },
          { id: '5', title: '表面处理', page: '7' },
          { id: '6', title: '产品目录', page: '8-15' }
        ]
      };
    case PageType.DIVIDER:
      return {
        title: '产品系列',
        subtitle: 'PRODUCT SERIES',
        number: '01'
      };
    case PageType.PRODUCT:
      return {
        pageTitle: '传统产品页',
        pageSubtitle: 'LEGACY PRODUCT PAGE',
        sectionTitle: '门锁五金系统',
        sectionDescription: '传统布局的产品展示页面',
        products: Array(6).fill(null).map((_, i) => ({
          id: `legacy-product-${i + 1}`,
          name: `传统门锁 ${String.fromCharCode(65 + i)}`,
          model: `YJ-L${String.fromCharCode(65 + i)}${i + 1}`,
          category: '传统锁具',
          image: ''
        })),
        currentPage: 1,
        totalPages: 1,
        pageNumber: '传统产品'
      };
    case PageType.PRODUCT_GRID:
      return {
        pageTitle: '标准产品',
        pageSubtitle: 'STANDARD PRODUCTS',
        sectionTitle: '门锁系列',
        sectionDescription: '精选高品质门锁产品，适用于各类建筑场景',
        products: Array(6).fill(null).map((_, i) => ({
          id: `product-${i + 1}`,
          name: `智能门锁 ${String.fromCharCode(65 + i)}`,
          model: `YJ-${String.fromCharCode(65 + i)}${i + 1}`,
          category: '智能锁',
          image: ''
        })),
        currentPage: 1,
        totalPages: 3,
        pageNumber: '产品网格'
      };
    case PageType.COMPOSITE_PRODUCT:
      return {
        title: '复合产品展示',
        subtitle: 'COMPOSITE PRODUCT DISPLAY',
        products: Array(4).fill(null).map((_, i) => ({
          id: `composite-${i + 1}`,
          name: `复合产品 ${i + 1}`,
          realImage: '',
          lineImage: '',
          description: '实拍图+线框图对比展示'
        }))
      };
    case PageType.BACK_COVER:
      return {
        companyName: '雅洁五金有限公司',
        phone: '+86 757 8555 1234',
        email: 'info@archie-hardware.com',
        address: '广东省佛山市南海区大沥镇',
        website: 'www.archie-hardware.com',
        copyrightYear: '2026'
      };
    default:
      return {};
  }
}

// ===== 全局产品清单相关类型 =====

/** 全局产品数据接口 */
export interface GlobalProduct {
  /** 产品ID */
  id: string;
  /** 产品名称 */
  name: string;
  /** 产品型号 */
  model: string;
  /** 产品类别 */
  category: string;
  /** 产品图片URL */
  image: string;
  /** 材质 */
  material?: string;
  /** 规格 */
  spec?: string;
  /** 表面处理 */
  finish?: string;
  /** 价格 */
  price?: string;
  /** 是否已导入到页面 */
  imported?: boolean;
}

/** 全局产品清单状态 */
export interface GlobalProductState {
  /** 产品列表 */
  products: GlobalProduct[];
  /** 最后更新时间 */
  lastUpdated: Date;
  /** 来源文件 */
  sourceFile?: string;
}

/** 产品网格页面数据更新选项 */
export interface ProductGridUpdateOptions {
  /** 是否替换现有产品 */
  replaceExisting: boolean;
  /** 起始索引 */
  startIndex: number;
  /** 最大产品数量 */
  maxProducts: number;
}

// ===== 全局产品清单函数 =====

/**
 * 创建默认全局产品
 */
export function createDefaultGlobalProduct(params: Partial<GlobalProduct> = {}): GlobalProduct {
  return {
    id: params.id || `global-product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: params.name || '新产品',
    model: params.model || 'NEW-001',
    category: params.category || '未分类',
    image: params.image || '',
    material: params.material || '不锈钢',
    spec: params.spec || '标准规格',
    finish: params.finish || '拉丝',
    price: params.price || '¥0.00',
    imported: params.imported || false,
    ...params
  };
}

/**
 * 从Excel数据创建全局产品列表
 */
export function createGlobalProductsFromExcelData(data: any[]): GlobalProduct[] {
  return data.map((row, index) => {
    // 兼容各种表头写法
    const name = row['名称'] || row['Name'] || row['产品名称'] || row['name'] || `产品${index + 1}`;
    const model = row['型号'] || row['Model'] || row['model'] || `MODEL-${index + 1}`;
    const category = row['类别'] || row['Category'] || row['category'] || '通用';
    const material = row['材质'] || row['Material'] || row['material'] || '不锈钢';
    const spec = row['规格'] || row['Spec'] || row['spec'] || '标准';
    const finish = row['表面处理'] || row['Finish'] || row['finish'] || '拉丝';
    const price = row['价格'] || row['Price'] || row['price'] || '';
    const image = row['图片'] || row['Image'] || row['image'] || '';

    return createDefaultGlobalProduct({
      id: `excel-${model}-${index}`,
      name,
      model,
      category,
      material,
      spec,
      finish,
      price,
      image
    });
  });
}

/**
 * 更新产品网格页面的产品数据
 * @param pageData 页面数据
 * @param globalProducts 全局产品列表
 * @param options 更新选项
 */
export function updateProductGridWithGlobalProducts(
  pageData: PageData,
  globalProducts: GlobalProduct[],
  options: ProductGridUpdateOptions = { replaceExisting: true, startIndex: 0, maxProducts: 6 }
): PageData {
  if (pageData.type !== PageType.PRODUCT_GRID) {
    return pageData;
  }

  const availableProducts = globalProducts.filter(p => !p.imported || options.replaceExisting);
  const productsToUse = availableProducts.slice(options.startIndex, options.startIndex + options.maxProducts);

  // 标记产品为已导入
  productsToUse.forEach(p => p.imported = true);

  // 更新页面props
  const updatedProps = {
    ...pageData.props,
    products: productsToUse.map((product, index) => ({
      id: product.id,
      name: product.name,
      model: product.model,
      category: product.category,
      image: product.image,
      // 保留原有索引或使用新索引
      ...(pageData.props?.products?.[index] || {})
    }))
  };

  return {
    ...pageData,
    props: updatedProps
  };
}

/**
 * 获取所有产品网格页面
 */
export function getAllProductGridPages(pages: PageData[]): PageData[] {
  return pages.filter(page => page.type === PageType.PRODUCT_GRID);
}

/**
 * 批量更新所有产品网格页面
 */
export function updateAllProductGridPages(
  pages: PageData[],
  globalProducts: GlobalProduct[],
  options?: ProductGridUpdateOptions
): PageData[] {
  return pages.map(page => {
    if (page.type === PageType.PRODUCT_GRID) {
      return updateProductGridWithGlobalProducts(page, globalProducts, options);
    }
    return page;
  });
}