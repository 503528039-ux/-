# Command Pattern 实现细节

## 1. 目录结构

```
src/
  ├── commands/
  │   ├── Command.ts           # 命令基类
  │   ├── CommandManager.ts    # 命令管理器
  │   ├── AddPageCommand.ts    # 添加页面命令
  │   ├── MovePageCommand.ts   # 移动页面命令
  │   ├── RemovePageCommand.ts # 删除页面命令
  │   └── index.ts            # 导出所有命令
  └── stores/
      └── catalog.js          # 集成命令模式
```

## 2. 核心接口定义

### 2.1 Command.ts
```typescript
export abstract class Command {
  abstract execute(): void
  abstract undo(): void
  
  // 用于性能优化的缓存键
  get cacheKey(): string {
    return this.constructor.name
  }
}
```

### 2.2 CommandManager.ts
```typescript
export class CommandManager {
  private undoStack: Command[] = []
  private redoStack: Command[] = []
  private commandCache = new WeakMap()
  private readonly MAX_STACK_SIZE = 50
  
  execute(command: Command): void {
    // 使用 WeakMap 缓存命令实例
    const cachedCommand = this.commandCache.get(command.cacheKey)
    if (cachedCommand) {
      command = cachedCommand
    } else {
      this.commandCache.set(command.cacheKey, command)
    }
    
    command.execute()
    this.undoStack.push(command)
    
    // 限制栈大小
    if (this.undoStack.length > this.MAX_STACK_SIZE) {
      this.undoStack.shift()
    }
    
    // 清空重做栈
    this.redoStack = []
  }
  
  undo(): void {
    const command = this.undoStack.pop()
    if (command) {
      command.undo()
      this.redoStack.push(command)
    }
  }
  
  redo(): void {
    const command = this.redoStack.pop()
    if (command) {
      command.execute()
      this.undoStack.push(command)
    }
  }
  
  // 清空所有历史记录
  clear(): void {
    this.undoStack = []
    this.redoStack = []
    this.commandCache = new WeakMap()
  }
}
```

### 2.3 AddPageCommand.ts
```typescript
export class AddPageCommand extends Command {
  private pageId: string | null = null
  
  constructor(
    private store: CatalogStore,
    private pageData: PageData
  ) {
    super()
  }
  
  execute(): void {
    // 使用 requestIdleCallback 优化性能
    requestIdleCallback(() => {
      this.pageId = this.store._addPage(this.pageData)
    })
  }
  
  undo(): void {
    if (this.pageId) {
      this.store._removePage(this.pageId)
    }
  }
}
```

### 2.4 MovePageCommand.ts
```typescript
export class MovePageCommand extends Command {
  private previousState: any = null
  
  constructor(
    private store: CatalogStore,
    private fromIndex: number,
    private toIndex: number
  ) {
    super()
  }
  
  execute(): void {
    // 保存移动前的状态
    this.previousState = [...this.store.pages]
    this.store._movePage(this.fromIndex, this.toIndex)
  }
  
  undo(): void {
    if (this.previousState) {
      this.store.pages = this.previousState
    }
  }
}
```

## 3. Store 集成

### 3.1 catalog.js 改造
```typescript
export const useCatalogStore = defineStore('catalog', () => {
  const commandManager = new CommandManager()
  
  // 移除旧的快照逻辑
  // const snapshots = ref([])
  // function recordSnapshot() { ... }
  
  // 改用命令模式
  function addPage(type = 'product') {
    const pageData = createPageData(type)
    commandManager.execute(new AddPageCommand(this, pageData))
  }
  
  function movePage(fromIndex: number, toIndex: number) {
    commandManager.execute(new MovePageCommand(this, fromIndex, toIndex))
  }
  
  function undo() {
    commandManager.undo()
  }
  
  function redo() {
    commandManager.redo()
  }
  
  // 内部方法（供命令类使用）
  function _addPage(pageData: PageData): string {
    const id = nanoid()
    pages.value.push({ ...pageData, id })
    return id
  }
  
  function _removePage(pageId: string): void {
    const index = pages.value.findIndex(p => p.id === pageId)
    if (index !== -1) {
      pages.value.splice(index, 1)
    }
  }
  
  function _movePage(fromIndex: number, toIndex: number): void {
    const page = pages.value[fromIndex]
    pages.value.splice(fromIndex, 1)
    pages.value.splice(toIndex, 0, page)
  }
  
  return {
    // 公开方法
    addPage,
    movePage,
    undo,
    redo,
    
    // 内部方法（但需要导出供命令类使用）
    _addPage,
    _removePage,
    _movePage
  }
})
```

## 4. 性能优化策略

1. **命令实例缓存**
   - 使用 WeakMap 缓存命令实例
   - 根据命令类型和参数生成缓存键
   - 避免重复创建相同命令的实例

2. **栈大小限制**
   - 限制撤销栈最大容量为 50
   - 超出限制时，移除最早的命令
   - 防止内存无限增长

3. **延迟执行**
   - 使用 requestIdleCallback 延迟非关键操作
   - 在浏览器空闲时执行命令
   - 保持界面响应流畅

4. **状态克隆优化**
   - 使用结构化克隆替代 JSON 序列化
   - 仅在必要时克隆状态
   - 减少内存占用

## 5. 测试策略

### 5.1 单元测试
```typescript
describe('CommandManager', () => {
  let manager: CommandManager
  
  beforeEach(() => {
    manager = new CommandManager()
  })
  
  test('execute should add command to undo stack', () => {
    const command = new AddPageCommand(store, pageData)
    manager.execute(command)
    expect(manager.undoStack.length).toBe(1)
  })
  
  test('undo should move command to redo stack', () => {
    const command = new AddPageCommand(store, pageData)
    manager.execute(command)
    manager.undo()
    expect(manager.undoStack.length).toBe(0)
    expect(manager.redoStack.length).toBe(1)
  })
})
```

### 5.2 性能测试
```typescript
describe('Performance', () => {
  test('should handle large number of commands', () => {
    const start = performance.now()
    for (let i = 0; i < 1000; i++) {
      manager.execute(new AddPageCommand(store, pageData))
    }
    const end = performance.now()
    expect(end - start).toBeLessThan(1000) // 1秒内完成
  })
})
```

## 6. 迁移策略

1. **渐进式迁移**
   - 保留旧的快照逻辑作为备份
   - 逐步将操作改造为命令模式
   - 完全迁移后移除旧代码

2. **兼容性处理**
   - 添加版本标记
   - 保存命令历史到 localStorage
   - 处理版本升级时的状态迁移

3. **回滚机制**
   - 保留快速回滚到上一个稳定版本的能力
   - 记录迁移过程中的关键节点
   - 提供手动回滚接口

## 7. 监控指标

1. **性能指标**
   - 命令执行时间
   - 内存占用
   - 撤销/重做响应时间

2. **稳定性指标**
   - 命令执行成功率
   - 状态一致性检查
   - 错误发生频率

3. **用户体验指标**
   - 界面响应时间
   - 操作流畅度
   - 撤销栈使用情况