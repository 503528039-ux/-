/**
 * 命令管理器
 * 负责命令的执行、撤销和重做
 */
import { Command, CommandManager as ICommandManager, Result, ok, err, CommandError } from '../types'

/**
 * 命令管理器实现
 * 管理命令的执行、撤销和重做
 */
export class CommandManager implements ICommandManager {
  /**
   * 撤销栈 - 存储已执行的命令
   */
  private undoStack: Command[] = []

  /**
   * 重做栈 - 存储已撤销的命令
   */
  private redoStack: Command[] = []

  /**
   * 检查是否可以撤销
   */
  get canUndo(): boolean {
    return this.undoStack.length > 0
  }

  /**
   * 检查是否可以重做
   */
  get canRedo(): boolean {
    return this.redoStack.length > 0
  }

  /**
   * 命令缓存 - 使用 WeakMap 缓存命令实例
   * 键为命令的缓存键，值为命令实例
   */
  private commandCache = new WeakMap<object, Command>()

  /**
   * 最大栈大小 - 限制撤销栈的大小，防止内存占用过大
   */
  private MAX_STACK_SIZE = 50

  /**
   * 是否处于回退模式 - 用于优雅降级
   */
  private fallbackMode = false

  /**
   * 构造函数
   * @param maxStackSize 最大栈大小，默认为 50
   */
  constructor(maxStackSize?: number) {
    if (maxStackSize !== undefined) {
      this.MAX_STACK_SIZE = maxStackSize
    }
  }

  /**
   * 执行命令
   * @param command 要执行的命令
   * @returns 命令执行结果
   */
  execute<T>(command: Command<T>): Result<T> {
    // 如果处于回退模式，使用备用实现
    if (this.fallbackMode) {
      return this.executeFallback(command)
    }

    try {
      // 尝试从缓存中获取命令
      const cachedCommand = this.getCachedCommand(command) as Command<T> | undefined
      const commandToExecute = cachedCommand || command

      // 尝试合并命令
      const lastCommand = this.getLastCommand()
      if (lastCommand && lastCommand.canMerge && lastCommand.canMerge(commandToExecute) && lastCommand.merge) {
        lastCommand.merge(commandToExecute)
        return ok(undefined as unknown as T)
      }

      // 执行命令
      const result = commandToExecute.execute()

      // 如果执行成功，将命令添加到撤销栈
      if (result.success) {
        this.addToUndoStack(commandToExecute)
        // 清空重做栈
        this.redoStack = []
        // 缓存命令
        this.cacheCommand(commandToExecute)
      }

      return result
    } catch (error) {
      // 启用回退模式
      this.enableFallback()
      // 使用回退模式执行
      return this.executeFallback(command)
    }
  }

  /**
   * 撤销上一个命令
   * @returns 撤销结果
   */
  undo(): Result<void> {
    // 如果撤销栈为空，返回错误
    if (this.undoStack.length === 0) {
      return err(new CommandError('没有可撤销的命令', {} as Command))
    }

    try {
      // 从撤销栈中弹出最后一个命令
      const command = this.undoStack.pop()!
      
      // 执行撤销操作
      const result = command.undo()
      
      // 如果撤销成功，将命令添加到重做栈
      if (result.success) {
        this.redoStack.push(command)
      } else {
        // 如果撤销失败，将命令放回撤销栈
        this.undoStack.push(command)
      }
      
      return result
    } catch (error) {
      return err(new CommandError('撤销命令失败', {} as Command, error))
    }
  }

  /**
   * 重做上一个被撤销的命令
   * @returns 重做结果
   */
  redo(): Result<void> {
    // 如果重做栈为空，返回错误
    if (this.redoStack.length === 0) {
      return err(new CommandError('没有可重做的命令', {} as Command))
    }

    try {
      // 从重做栈中弹出最后一个命令
      const command = this.redoStack.pop()!
      
      // 执行命令
      const result = command.execute()
      
      // 如果执行成功，将命令添加到撤销栈
      if (result.success) {
        this.undoStack.push(command)
      } else {
        // 如果执行失败，将命令放回重做栈
        this.redoStack.push(command)
      }
      
      return ok(undefined)
    } catch (error) {
      return err(new CommandError('重做命令失败', {} as Command, error))
    }
  }

  /**
   * 清空命令历史
   */
  clear(): void {
    this.undoStack = []
    this.redoStack = []
    // 不清除命令缓存，因为 WeakMap 会自动回收不再使用的对象
  }

  /**
   * 获取撤销栈大小
   */
  get undoStackSize(): number {
    return this.undoStack.length
  }

  /**
   * 获取重做栈大小
   */
  get redoStackSize(): number {
    return this.redoStack.length
  }

  /**
   * 启用回退模式
   */
  private enableFallback(): void {
    this.fallbackMode = true
    console.warn('命令管理器已切换到回退模式')
  }

  /**
   * 回退模式下执行命令
   * 使用更简单的实现，确保基本功能可用
   * @param command 要执行的命令
   */
  private executeFallback<T>(command: Command<T>): Result<T> {
    try {
      const result = command.execute()
      if (result.success) {
        // 简化的历史记录
        if (this.undoStack.length >= this.MAX_STACK_SIZE) {
          this.undoStack.shift()
        }
        this.undoStack.push(command)
        this.redoStack = []
      }
      return result
    } catch (error) {
      return err(new CommandError('执行命令失败（回退模式）', command, error))
    }
  }

  /**
   * 将命令添加到撤销栈
   * @param command 要添加的命令
   */
  private addToUndoStack(command: Command): void {
    // 如果撤销栈已满，移除最早的命令
    if (this.undoStack.length >= this.MAX_STACK_SIZE) {
      this.undoStack.shift()
    }
    
    // 添加命令到撤销栈
    this.undoStack.push(command)
  }

  /**
   * 获取最后一个命令
   * @returns 最后一个命令，如果栈为空则返回 undefined
   */
  private getLastCommand(): Command | undefined {
    if (this.undoStack.length === 0) {
      return undefined
    }
    
    return this.undoStack[this.undoStack.length - 1]
  }

  /**
   * 从缓存中获取命令
   * @param command 要查找的命令
   * @returns 缓存的命令，如果未找到则返回 undefined
   */
  private getCachedCommand(command: Command): Command | undefined {
    // 使用命令的缓存键作为 WeakMap 的键
    const key = { key: command.cacheKey }
    return this.commandCache.get(key)
  }

  /**
   * 缓存命令
   * @param command 要缓存的命令
   */
  private cacheCommand(command: Command): void {
    // 使用命令的缓存键作为 WeakMap 的键
    const key = { key: command.cacheKey }
    this.commandCache.set(key, command)
  }

  /**
   * 使用 requestIdleCallback 延迟执行命令
   * 在浏览器空闲时执行，避免阻塞主线程
   * @param command 要执行的命令
   */
  executeWhenIdle<T>(command: Command<T>): void {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        this.execute(command)
      })
    } else {
      // 如果不支持 requestIdleCallback，使用 setTimeout 替代
      setTimeout(() => {
        this.execute(command)
      }, 0)
    }
  }

  /**
   * 批量执行命令
   * @param commands 要执行的命令数组
   */
  executeBatch(commands: Command[]): void {
    // 创建一个批处理命令
    const batchCommand = new BatchCommand(commands)
    this.execute(batchCommand)
  }
}

/**
 * 批处理命令
 * 将多个命令组合成一个命令
 */
class BatchCommand implements Command<void> {
  readonly name = 'BatchCommand'
  readonly timestamp = Date.now()

  /**
   * 构造函数
   * @param commands 要批处理的命令数组
   */
  constructor(private commands: Command[]) {}

  /**
   * 获取缓存键
   */
  get cacheKey(): string {
    return `${this.name}-${this.timestamp}-${this.commands.length}`
  }

  /**
   * 执行所有命令
   */
  execute(): Result<void> {
    try {
      for (const command of this.commands) {
        const result = command.execute()
        if (!result.success) {
          // 使用类型守卫检查错误
          return err(new CommandError(
            '批处理命令中的子命令执行失败', 
            this, 
            result.success === false ? result.error : undefined
          ))
        }
      }
      return ok(undefined)
    } catch (error) {
      return err(new CommandError('批处理命令执行失败', this, error))
    }
  }

  /**
   * 按照相反的顺序撤销所有命令
   */
  undo(): Result<void> {
    try {
      // 按照相反的顺序撤销命令
      for (let i = this.commands.length - 1; i >= 0; i--) {
        const result = this.commands[i].undo()
        if (!result.success) {
          return result
        }
      }
      return ok(undefined)
    } catch (error) {
      return err(new CommandError('批处理命令撤销失败', this, error))
    }
  }
}