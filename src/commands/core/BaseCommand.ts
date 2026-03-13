/**
 * 命令基类
 * 提供命令的基本实现和通用功能
 */
import { Command, Result, ok, err, CommandError } from '../types'

/**
 * 抽象命令基类
 * 实现 Command 接口的基本功能
 */
export abstract class BaseCommand<T = unknown> implements Command<T> {
  /**
   * 命令创建时间戳
   * 在构造函数中自动初始化
   */
  readonly timestamp: number

  /**
   * 构造函数
   * @param name 命令名称
   */
  constructor(readonly name: string) {
    this.timestamp = Date.now()
  }

  /**
   * 获取缓存键
   * 默认使用命令名称和时间戳
   * 子类可以覆盖此方法提供更精确的缓存键
   */
  get cacheKey(): string {
    return `${this.name}-${this.timestamp}`
  }

  /**
   * 执行命令
   * 抽象方法，由子类实现
   */
  abstract execute(): Result<T>

  /**
   * 撤销命令
   * 抽象方法，由子类实现
   */
  abstract undo(): Result<void>

  /**
   * 安全执行函数
   * 包装执行逻辑，提供统一的错误处理
   * @param fn 要执行的函数
   */
  protected safeExecute<U>(fn: () => U): Result<U> {
    try {
      const result = fn()
      return ok(result)
    } catch (error) {
      return err(new CommandError(
        `执行命令 ${this.name} 失败`,
        this,
        error
      ))
    }
  }

  /**
   * 判断是否可以与另一个命令合并
   * 默认不支持合并，子类可以覆盖此方法
   * @param command 另一个命令
   */
  canMerge(command: Command): boolean {
    return false
  }

  /**
   * 与另一个命令合并
   * 默认不支持合并，子类可以覆盖此方法
   * @param command 另一个命令
   */
  merge(command: Command): void {
    throw new Error(`命令 ${this.name} 不支持合并操作`)
  }
}