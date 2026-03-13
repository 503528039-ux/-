# Command Pattern 迁移计划

## 1. 前置准备（Day 1 上午）

### 1.1 代码备份
```bash
# 在实施之前备份关键文件
src/stores/catalog.js -> src/stores/catalog.js.bak
```

### 1.2 功能摘要
当前 [`catalog.js`](雅洁五金2026年工程图册/src/stores/catalog.js) 中的关键功能：
- 页面管理（增删改查）
- 撤销/重做（基于快照）
- 数据持久化
- 拖拽排序
- Excel 导入/导出

## 2. 渐进式迁移路径

### Phase 1: 基础设施（Day 1 下午）

1. **TypeScript 配置**
   ```json
   // tsconfig.json 补充
   {
     "compilerOptions": {
       "target": "ES2020",
       "useDefineForClassFields": true,
       "module": "ESNext",
       "lib": ["ES2020", "DOM", "DOM.Iterable"],
       "skipLibCheck": true,
       "experimentalDecorators": true
     }
   }
   ```

2. **目录结构**
   ```
   src/
     ├── commands/
     │   ├── types/          # TypeScript 类型定义
     │   ├── core/           # 核心命令类
     │   ├── page/          # 页面相关命令
     │   └── product/       # 产品相关命令
     └── stores/
         └── modules/       # Store 模块化
   ```

### Phase 2: 核心重构（Day 2）

1. **命令基础设施**
   - 实现 Command 基类
   - 实现 CommandManager
   - 添加命令注册机制

2. **Store 改造**
   ```typescript
   // 保持向后兼容的方式重构
   export const useCatalogStore = defineStore('catalog', () => {
     // 1. 保留原有的 ref/computed
     const pages = ref([])
     const snapshots = ref([])
     
     // 2. 添加新的命令管理器
     const commandManager = new CommandManager()
     
     // 3. 双轨制：同时支持旧方法和新命令
     function addPage(type = 'product') {
       if (import.meta.env.VITE_USE_COMMANDS === 'true') {
         commandManager.execute(new AddPageCommand(this, type))
       } else {
         // 原有逻辑
         const page = createPageData(type)
         pages.value.push(page)
         recordSnapshot()
       }
     }
   })
   ```

### Phase 3: 命令实现（Day 3）

1. **页面命令**
   - AddPageCommand
   - RemovePageCommand
   - MovePageCommand
   - UpdatePageCommand

2. **产品命令**
   - AddProductCommand
   - RemoveProductCommand
   - UpdateProductCommand
   - MoveProductCommand

3. **批量命令**
   - ImportExcelCommand
   - ResetDataCommand
   - BatchUpdateCommand

### Phase 4: 数据持久化（Day 4 上午）

1. **命令序列化**
   ```typescript
   interface SerializedCommand {
     type: string
     payload: any
     timestamp: number
   }
   
   // 持久化管理器
   class PersistenceManager {
     serialize(command: Command): SerializedCommand
     deserialize(data: SerializedCommand): Command
     save(commands: Command[]): void
     load(): Command[]
   }
   ```

2. **状态恢复**
   ```typescript
   // 启动时恢复命令历史
   onMounted(() => {
     const commands = persistenceManager.load()
     commands.forEach(cmd => commandManager.execute(cmd))
   })
   ```

### Phase 5: 性能优化（Day 4 下午）

1. **命令合并**
   ```typescript
   class MovePageCommand extends Command {
     canMerge(command: Command): boolean {
       return command instanceof MovePageCommand &&
              Date.now() - command.timestamp < 500
     }
     
     merge(command: MovePageCommand): void {
       this.toIndex = command.toIndex
     }
   }
   ```

2. **延迟执行**
   ```typescript
   class CommandManager {
     private batchTimeout: number | null = null
     
     executeBatch(commands: Command[]): void {
       if (this.batchTimeout) {
         clearTimeout(this.batchTimeout)
       }
       
       this.batchTimeout = setTimeout(() => {
         commands.forEach(cmd => this.execute(cmd))
         this.batchTimeout = null
       }, 16) // 一帧的时间
     }
   }
   ```

### Phase 6: 测试与验证（Day 5）

1. **单元测试**
   ```typescript
   describe('Command System', () => {
     test('should handle complex undo/redo scenarios', () => {
       const store = useCatalogStore()
       
       // 1. 添加页面
       store.addPage('product')
       expect(store.pages.length).toBe(1)
       
       // 2. 撤销
       store.undo()
       expect(store.pages.length).toBe(0)
       
       // 3. 重做
       store.redo()
       expect(store.pages.length).toBe(1)
     })
   })
   ```

2. **性能测试**
   ```typescript
   describe('Performance', () => {
     test('should handle 1000 operations under 1 second', () => {
       const start = performance.now()
       
       for (let i = 0; i < 1000; i++) {
         store.addPage('product')
         store.undo()
         store.redo()
       }
       
       const duration = performance.now() - start
       expect(duration).toBeLessThan(1000)
     })
   })
   ```

## 3. 回滚计划

### 3.1 快速回滚机制
```typescript
// 在 store 中添加版本切换功能
function switchToLegacy() {
  localStorage.setItem('use_commands', 'false')
  location.reload()
}

function switchToCommands() {
  localStorage.setItem('use_commands', 'true')
  location.reload()
}
```

### 3.2 数据迁移
```typescript
// 在 store 初始化时进行数据迁移
function migrateDataIfNeeded() {
  const version = localStorage.getItem('data_version')
  
  if (version === '1.0') {
    // 旧版数据结构
    const oldData = JSON.parse(localStorage.getItem('catalog_data'))
    // 转换为新格式
    const newData = convertToNewFormat(oldData)
    // 保存
    localStorage.setItem('catalog_data', JSON.stringify(newData))
    localStorage.setItem('data_version', '2.0')
  }
}
```

## 4. 监控指标

### 4.1 性能指标
```typescript
class PerformanceMonitor {
  private metrics: {
    commandExecutionTime: number[]
    memoryUsage: number[]
    undoRedoLatency: number[]
  }
  
  recordCommandExecution(duration: number): void
  recordMemoryUsage(): void
  recordUndoRedoLatency(duration: number): void
  
  generateReport(): PerformanceReport
}
```

### 4.2 错误监控
```typescript
class ErrorTracker {
  private errors: {
    timestamp: number
    command: string
    error: Error
    context: any
  }[]
  
  trackError(error: Error, command: Command): void
  getErrorReport(): ErrorReport
}
```

## 5. 验收标准

1. **功能完整性**
   - [ ] 所有现有功能都有对应的命令实现
   - [ ] 撤销/重做操作与原有行为一致
   - [ ] 数据持久化正常工作

2. **性能指标**
   - [ ] 命令执行时间 < 16ms（一帧）
   - [ ] 内存占用增长 < 20%
   - [ ] 大量操作时界面不卡顿

3. **代码质量**
   - [ ] TypeScript 类型覆盖率 > 90%
   - [ ] 单元测试覆盖率 > 80%
   - [ ] 无 any 类型
   - [ ] 符合 ESLint 规范

## 6. 应急预案

1. **功能降级**
   ```typescript
   class CommandManager {
     private fallbackMode = false
     
     enableFallback(): void {
       this.fallbackMode = true
       console.warn('Switching to fallback mode')
     }
     
     execute(command: Command): void {
       if (this.fallbackMode) {
         // 使用旧的实现方式
         this.executeLegacy(command)
       } else {
         try {
           command.execute()
         } catch (e) {
           console.error('Command execution failed:', e)
           this.enableFallback()
           this.executeLegacy(command)
         }
       }
     }
   }
   ```

2. **数据恢复**
   ```typescript
   class DataRecovery {
     private snapshots: Map<number, any> = new Map()
     
     takeSnapshot(): void {
       const timestamp = Date.now()
       const state = deepClone(store.pages)
       this.snapshots.set(timestamp, state)
       
       // 只保留最近的 5 个快照
       if (this.snapshots.size > 5) {
         const oldest = Math.min(...this.snapshots.keys())
         this.snapshots.delete(oldest)
       }
     }
     
     recover(timestamp: number): void {
       const state = this.snapshots.get(timestamp)
       if (state) {
         store.pages = state
         console.info('Recovered to:', new Date(timestamp))
       }
     }
   }
   ```

## 7. 时间节点

- **Day 1**: 基础设施搭建
- **Day 2**: 核心重构
- **Day 3**: 命令实现
- **Day 4**: 持久化和性能优化
- **Day 5**: 测试与验证
- **Day 6**: 预留 Buffer（处理意外情况）
- **Day 7**: 正式上线