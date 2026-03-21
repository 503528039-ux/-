/**
 * 批量/整册页面顺序重排命令（一次替换 pages 数组）
 */
import { BaseCommand } from '../core/BaseCommand'
import { Result } from '../types'
import { PageStore, PageData } from './types'

export class ReorderPagesCommand extends BaseCommand<void> {
  private previousPages: PageData[] | null = null

  constructor(
    private store: PageStore,
    private nextPages: PageData[]
  ) {
    super('ReorderPages')
  }

  get cacheKey(): string {
    return `${this.name}-${this.timestamp}`
  }

  execute(): Result<void> {
    return this.safeExecute(() => {
      this.previousPages = [...this.store.getPages()]
      this.store.setPages(JSON.parse(JSON.stringify(this.nextPages)) as PageData[])
    })
  }

  undo(): Result<void> {
    return this.safeExecute(() => {
      if (!this.previousPages) {
        throw new Error('无法撤销未执行的页面重排命令')
      }
      this.store.setPages(this.previousPages)
    })
  }
}
