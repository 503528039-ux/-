/**
 * 命令模式类型定义
 * 遵循 Quiet Luxury 设计理念：简洁、优雅、可维护
 */

/**
 * 结果类型 - 用于错误处理
 * 替代异常，提供更优雅的错误处理方式
 */
export type Result<T, E = Error> = Ok<T> | Err<E>

/**
 * 成功结果
 */
export class Ok<T> {
  readonly success = true
  constructor(public readonly value: T) {}

  /**
   * 映射成功值
   */
  map<U>(fn: (value: T) => U): Result<U, never> {
    return new Ok(fn(this.value))
  }

  /**
   * 处理成功情况
   */
  match<U>(handlers: { ok: (value: T) => U; err: (error: never) => U }): U {
    return handlers.ok(this.value)
  }
}

/**
 * 错误结果
 */
export class Err<E> {
  readonly success = false
  constructor(public readonly error: E) {}

  /**
   * 映射错误值
   */
  mapErr<F>(fn: (error: E) => F): Result<never, F> {
    return new Err(fn(this.error))
  }

  /**
   * 处理错误情况
   */
  match<U>(handlers: { ok: (value: never) => U; err: (error: E) => U }): U {
    return handlers.err(this.error)
  }
}

/**
 * 命令接口
 * 定义命令的基本结构和行为
 */
export interface Command<T = unknown> {
  /**
   * 命令名称
   */
  readonly name: string

  /**
   * 命令创建时间戳
   */
  readonly timestamp: number

  /**
   * 缓存键 - 用于命令实例缓存
   */
  readonly cacheKey: string

  /**
   * 执行命令
   */
  execute(): Result<T>

  /**
   * 撤销命令
   */
  undo(): Result<void>

  /**
   * 判断是否可以与另一个命令合并
   * 用于优化连续的相似操作
   */
  canMerge?(command: Command): boolean

  /**
   * 与另一个命令合并
   * 用于优化连续的相似操作
   */
  merge?(command: Command): void
}

/**
 * 命令管理器接口
 * 负责命令的执行、撤销和重做
 */
export interface CommandManager {
  /**
   * 执行命令
   */
  execute<T>(command: Command<T>): Result<T>

  /**
   * 撤销上一个命令
   */
  undo(): Result<void>

  /**
   * 重做上一个被撤销的命令
   */
  redo(): Result<void>

  /**
   * 清空命令历史
   */
  clear(): void
}

/**
 * 命令错误类
 * 用于表示命令执行过程中的错误
 */
export class CommandError extends Error {
  constructor(
    message: string,
    public readonly command: Command,
    public readonly context?: unknown
  ) {
    super(message)
    this.name = 'CommandError'
  }
}

/**
 * 创建成功结果
 */
export function ok<T>(value: T): Ok<T> {
  return new Ok(value)
}

/**
 * 创建错误结果
 */
export function err<E>(error: E): Err<E> {
  return new Err(error)
}