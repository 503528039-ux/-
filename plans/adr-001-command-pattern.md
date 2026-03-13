# ADR 001: 引入 Command Pattern 重构撤销/重做功能

## 状态
已接受（2026-03-01）

## 背景
当前的 [`catalog.js`](雅洁五金2026年工程图册/src/stores/catalog.js) 使用简单的快照数组实现撤销/重做功能，存在以下问题：
1. 内存占用高：每次操作都需要深拷贝整个状态
2. 性能隐患：状态树越大，快照创建和恢复越慢
3. 可维护性差：难以追踪具体的操作历史
4. 扩展性受限：难以实现选择性撤销或操作合并

## 决策
我们决定采用 Command Pattern 重构，主要基于以下考虑：

### 1. 技术选型
- **命令模式** vs **备忘录模式**
  - 命令模式：✅ 粒度更细、内存效率高、可扩展性强
  - 备忘录模式：❌ 状态快照占用内存大、难以实现选择性撤销

- **TypeScript** vs **JavaScript**
  - TypeScript：✅ 类型安全、接口清晰、重构友好
  - JavaScript：❌ 缺乏类型约束、维护成本高

### 2. 核心接口设计
```typescript
// 1. Command 基类
abstract class Command {
  abstract execute(): void
  abstract undo(): void
  get cacheKey(): string
}

// 2. CommandManager
class CommandManager {
  private undoStack: Command[]
  private redoStack: Command[]
  private commandCache: WeakMap<string, Command>
}

// 3. 具体命令
class AddPageCommand extends Command {
  constructor(
    private store: CatalogStore,
    private pageData: PageData
  ) { super() }
}
```

### 3. 性能优化决策
1. **命令实例缓存**
   - 使用 WeakMap 避免内存泄漏
   - 基于命令类型和参数生成缓存键
   - 复用相同参数的命令实例

2. **批量处理**
   - 使用 requestIdleCallback 延迟非关键操作
   - 合并短时间内的相同操作
   - 限制撤销栈大小（默认 50）

3. **状态管理**
   - 使用 shallowRef 优化大对象响应性
   - 避免不必要的深拷贝
   - 使用结构化克隆替代 JSON 序列化

### 4. 错误处理策略
```typescript
// 使用 Result 类型替代异常
type Result<T, E = Error> = Ok<T> | Err<E>

class CommandError extends Error {
  constructor(
    message: string,
    public readonly command: Command,
    public readonly context: any
  ) {
    super(message)
  }
}

// 优雅降级
class CommandManager {
  private fallbackMode = false
  
  execute(command: Command): Result<void, CommandError> {
    if (this.fallbackMode) {
      return this.executeLegacy(command)
    }
    try {
      command.execute()
      return Ok(undefined)
    } catch (e) {
      this.enableFallback()
      return Err(new CommandError('命令执行失败', command, e))
    }
  }
}
```

## 影响

### 1. 积极影响
- ✅ 内存占用显著降低（预计减少 70%）
- ✅ 操作响应更快（预计提升 50%）
- ✅ 代码更易维护（模块化、类型安全）
- ✅ 支持更复杂的撤销/重做场景

### 2. 潜在风险
- ⚠️ 初始学习成本增加
- ⚠️ 需要额外的类型定义
- ⚠️ 可能出现兼容性问题

### 3. 技术债务
- 旧的快照逻辑暂时保留
- 部分类型定义可能不完整
- 需要补充单元测试

## 实施计划

### Phase 1: 基础设施（Day 1）
- [x] 创建 Command Pattern 实现计划
- [x] 创建迁移计划文档
- [x] 创建设计总结文档
- [x] 创建 ADR

### Phase 2: 核心实现（Day 2-3）
- [ ] 创建 src/commands 目录结构
- [ ] 实现核心类和接口
- [ ] 添加基本的命令实现

### Phase 3: 重构（Day 4-5）
- [ ] 重构 catalog.js
- [ ] 添加性能优化
- [ ] 实现优雅降级

### Phase 4: 测试和文档（Day 6-7）
- [ ] 添加单元测试
- [ ] 补充文档
- [ ] 性能测试和优化

## 备选方案

### 1. 增强现有快照系统
```typescript
// ❌ 被否决：内存占用问题无法根本解决
class SnapshotManager {
  private snapshots: Array<{
    state: any
    timestamp: number
    metadata: any
  }>
}
```

### 2. 使用 Redux-like 方案
```typescript
// ❌ 被否决：过度设计，不符合当前需求
interface Action {
  type: string
  payload: any
}

function reducer(state: State, action: Action): State
```

### 3. 自定义 Proxy-based 方案
```typescript
// ❌ 被否决：性能开销大，调试困难
const store = new Proxy(baseStore, {
  set(target, prop, value) {
    recordChange(target, prop, value)
    return true
  }
})
```

## 结论

Command Pattern 是实现撤销/重做功能的最佳选择，因为它：
1. 符合 Quiet Luxury 设计理念
2. 提供了最佳的性能/复杂度平衡
3. 支持未来的功能扩展
4. 易于维护和测试

## 参考资料

1. [Command Pattern in TypeScript](https://refactoring.guru/design-patterns/command)
2. [Vue 3 Performance Guide](https://vuejs.org/guide/best-practices/performance.html)
3. [WeakMap MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)
4. [requestIdleCallback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)