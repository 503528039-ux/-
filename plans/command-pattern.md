# Command Pattern 实现计划

## 1. 核心类设计

### 1.1 Command 基类
```typescript
abstract class Command {
  abstract execute(): void
  abstract undo(): void
}
```

### 1.2 CommandManager 类
```typescript
class CommandManager {
  private undoStack: Command[] = []
  private redoStack: Command[] = []
  
  execute(command: Command): void {
    command.execute()
    this.undoStack.push(command)
    this.redoStack = [] // 清空重做栈
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
}
```

### 1.3 具体命令类
```typescript
// 添加页面命令
class AddPageCommand extends Command {
  constructor(
    private store: CatalogStore,
    private pageData: PageData
  ) {
    super()
  }
  
  execute() {
    this.pageId = this.store._addPage(this.pageData)
  }
  
  undo() {
    this.store._removePage(this.pageId)
  }
}

// 移动页面命令
class MovePageCommand extends Command {
  constructor(
    private store: CatalogStore,
    private fromIndex: number,
    private toIndex: number
  ) {
    super()
  }
  
  execute() {
    this.store._movePage(this.fromIndex, this.toIndex)
  }
  
  undo() {
    this.store._movePage(this.toIndex, this.fromIndex)
  }
}
```

## 2. 集成到 Store

### 2.1 在 catalog.js 中添加 CommandManager
```typescript
export const useCatalogStore = defineStore('catalog', () => {
  const commandManager = new CommandManager()
  
  // 原有的 recordSnapshot 和 snapshots 可以移除
  // const snapshots = ref([])
  // function recordSnapshot() { ... }
  
  // 改用 CommandManager 处理撤销/重做
  function undo() {
    commandManager.undo()
  }
  
  function redo() {
    commandManager.redo()
  }
  
  // 原有的页面操作方法改为内部方法
  function _addPage(pageData) { ... }
  function _removePage(pageId) { ... }
  function _movePage(fromIndex, toIndex) { ... }
  
  // 对外暴露的方法包装为命令
  function addPage(type = 'product') {
    const pageData = createPageData(type)
    commandManager.execute(new AddPageCommand(this, pageData))
  }
  
  function movePage(fromIndex, toIndex) {
    commandManager.execute(new MovePageCommand(this, fromIndex, toIndex))
  }
})
```

## 3. 优雅调用示例

```typescript
// 在组件中使用
const store = useCatalogStore()

// 添加页面
store.addPage('product')

// 移动页面
store.movePage(1, 2)

// 撤销
store.undo()

// 重做
store.redo()
```

## 4. 性能优化

1. 使用 WeakMap 缓存命令实例
2. 限制撤销栈大小（如最多 50 步）
3. 使用 requestIdleCallback 延迟非关键操作

## 5. 测试计划

1. 单元测试 CommandManager
2. 单元测试具体命令类
3. 集成测试 Store 的撤销/重做功能
4. 性能测试（大量操作的内存占用）