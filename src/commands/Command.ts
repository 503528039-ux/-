/**
 * 命令基类
 * 遵循 Quiet Luxury 设计理念：简洁、优雅、可维护
 *
 * 注意：此文件已废弃，请使用 types/index.ts 中的 Command 接口
 * 和 core/BaseCommand.ts 中的 BaseCommand 类
 */
import { Result } from './types'

export abstract class Command<T = unknown> {
  /**
   * 命令名称
   */
  abstract readonly name: string

  /**
   * 命令创建时间戳
   */
  readonly timestamp: number = Date.now()

  /**
   * 缓存键 - 用于命令实例缓存
   */
  get cacheKey(): string {
    return `${this.name}-${this.timestamp}`
  }

  /**
   * 执行命令
   * @returns Result<T>
   */
  abstract execute(): Result<T>

  /**
   * 撤销命令
   * @returns Result<void>
   */
  abstract undo(): Result<void>
}
