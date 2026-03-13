/**
 * 页面相关类型定义
 */

/**
 * 页面类型
 * 与 catalog.js 中的 createPageData 函数完全对齐
 */
export type PageType = 'toc' | 'cover' | 'product' | 'blank' | 'text' | 'brand' | 'intro' | 'cert' | 'partner' | 'project' | 'back' | 'custom' | 'finish'

/**
 * 页面子类型
 */
export type PageSubType = 'lock' | 'hardware' | 'general'

/**
 * 页面块类型
 * 与 catalog.js 中的块类型完全对齐
 */
export type BlockType = 'txt' | 'img' | 'product-grid' | 'product-list' | 'text' | 'toc' | 'image'

/**
 * 页面块
 * 与 catalog.js 中的块结构完全对齐
 */
export interface Block {
  id: string
  type: BlockType
  val?: string  // 文本内容或图片URL
  w?: number    // 宽度
  h?: number    // 高度
  x?: number    // X坐标
  y?: number    // Y坐标
  cols?: number
  rows?: number
  items?: any[]
  content?: string
}

/**
 * 页面数据
 * 与 catalog.js 中的页面结构完全对齐
 */
export interface PageData {
  id: string
  type: PageType
  subType?: PageSubType
  title?: string
  sub?: string
  pageNumber?: string
  showPageNum?: boolean
  resetNumbering?: boolean
  stopNumbering?: boolean
  bgImage?: string
  blocks: Block[]
  items: any[]
  width?: number
  height?: number
  canvasType?: string
}

/**
 * 页面存储接口
 * 定义页面操作的方法
 */
export interface PageStore {
  /**
   * 获取所有页面
   */
  getPages(): PageData[]
  
  /**
   * 设置所有页面
   */
  setPages(pages: PageData[]): void
  
  /**
   * 添加页面
   * @param page 页面数据
   * @returns 页面ID
   */
  _addPage(page: PageData): string
  
  /**
   * 移除页面
   * @param pageId 页面ID
   */
  _removePage(pageId: string): void
  
  /**
   * 移动页面
   * @param fromIndex 源索引
   * @param toIndex 目标索引
   */
  _movePage(fromIndex: number, toIndex: number): void
  
  /**
   * 更新页面
   * @param pageId 页面ID
   * @param data 更新的数据
   */
  _updatePage(pageId: string, data: Partial<PageData>): void
}