/**
 * 移动页面命令
 */
import { BaseCommand } from '../core/BaseCommand'
import { Result, ok, err, CommandError } from '../types'
import { PageStore, PageData } from './types'

/**
 * 移动页面命令
 * 用于在图册中移动页面位置
 */
export class MovePageCommand extends BaseCommand<void> {
  /**
   * 移动前的页面数组快照
   * 用于撤销操作
   */
  private previousPages: PageData[] | null = null

  /**
   * 构造函数
   * @param store 页面存储
   * @param fromIndex 源索引
   * @param toIndex 目标索引
   */
  constructor(
    private store: PageStore,
    private fromIndex: number,
    private toIndex: number
  ) {
    super('MovePage')
  }

  /**
   * 获取缓存键
   * 基于源索引和目标索引生成唯一键
   */
  get cacheKey(): string {
    return `${this.name}-${this.fromIndex}-${this.toIndex}-${this.timestamp}`
  }

  /**
   * 执行命令
   * 移动页面到新位置
   */
  execute(): Result<void> {
    return this.safeExecute(() => {
      // 保存当前页面状态，用于撤销
      this.previousPages = [...this.store.getPages()]
      
      // 执行移动
      this.store._movePage(this.fromIndex, this.toIndex)
    })
  }

  /**
   * 撤销命令
   * 恢复页面到移动前的位置
   */
  undo(): Result<void> {
    return this.safeExecute(() => {
      // 如果没有保存之前的状态，无法撤销
      if (!this.previousPages) {
        throw new Error('无法撤销未执行的移动页面命令')
      }
      
      // 恢复之前的状态
      this.store.setPages(this.previousPages)
    })
  }

  /**
   * 判断是否可以与另一个命令合并
   * 如果是短时间内对同一页面的多次移动，可以合并
   * @param command 另一个命令
   */
  canMerge(command: MovePageCommand): boolean {
    // 只有同类型的命令才能合并
    if (!(command instanceof MovePageCommand)) {
      return false
    }
    
    // 只有短时间内（500ms）的命令才能合并
    const timeDiff = Math.abs(this.timestamp - command.timestamp)
    if (timeDiff > 500) {
      return false
    }
    
    // 只有目标索引与当前源索引相同的命令才能合并
    // 例如：A->B, B->C 可以合并为 A->C
    return this.toIndex === command.fromIndex
  }

  /**
   * 与另一个命令合并
   * 合并后，源索引保持不变，目标索引更新为新命令的目标索引
   * @param command 另一个命令
   */
  merge(command: MovePageCommand): void {
    if (!this.canMerge(command)) {
      throw new Error('无法合并不兼容的命令')
    }
    
    // 更新目标索引
    this.toIndex = command.toIndex
  }
}