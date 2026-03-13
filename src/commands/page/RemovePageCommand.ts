/**
 * 删除页面命令
 */
import { BaseCommand } from '../core/BaseCommand'
import { Result, ok, err, CommandError } from '../types'
import { PageStore, PageData } from './types'

/**
 * 删除页面命令
 * 用于从图册中删除页面
 */
export class RemovePageCommand extends BaseCommand<void> {
  /**
   * 被删除的页面数据
   * 用于撤销操作
   */
  private removedPage: PageData | null = null
  
  /**
   * 被删除页面的索引
   * 用于撤销操作
   */
  private pageIndex: number = -1

  /**
   * 构造函数
   * @param store 页面存储
   * @param pageId 要删除的页面ID
   */
  constructor(
    private store: PageStore,
    private pageId: string
  ) {
    super('RemovePage')
  }

  /**
   * 获取缓存键
   * 基于页面ID生成唯一键
   */
  get cacheKey(): string {
    return `${this.name}-${this.pageId}-${this.timestamp}`
  }

  /**
   * 执行命令
   * 从图册中删除页面
   */
  execute(): Result<void> {
    return this.safeExecute(() => {
      // 获取当前页面列表
      const pages = this.store.getPages()
      
      // 查找要删除的页面
      this.pageIndex = pages.findIndex(page => page.id === this.pageId)
      
      // 如果页面不存在，抛出错误
      if (this.pageIndex === -1) {
        throw new Error(`找不到ID为 ${this.pageId} 的页面`)
      }
      
      // 保存页面数据，用于撤销
      this.removedPage = { ...pages[this.pageIndex] }
      
      // 删除页面
      this.store._removePage(this.pageId)
    })
  }

  /**
   * 撤销命令
   * 恢复被删除的页面
   */
  undo(): Result<void> {
    return this.safeExecute(() => {
      // 如果没有保存被删除的页面，无法撤销
      if (!this.removedPage || this.pageIndex === -1) {
        throw new Error('无法撤销未执行的删除页面命令')
      }
      
      // 获取当前页面列表
      const pages = this.store.getPages()
      
      // 创建新的页面列表，在原来的位置插入被删除的页面
      const newPages = [
        ...pages.slice(0, this.pageIndex),
        this.removedPage,
        ...pages.slice(this.pageIndex)
      ]
      
      // 更新页面列表
      this.store.setPages(newPages)
    })
  }

  /**
   * 判断是否可以与另一个命令合并
   * 删除页面命令不支持合并
   * @param command 另一个命令
   */
  canMerge(command: any): boolean {
    return false
  }
}