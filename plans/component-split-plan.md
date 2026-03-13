# 雅洁五金 2026 - 组件化拆分方案

## 1. 当前组件结构分析

### 1.1 现有组件
```
src/components/
├── ConfirmModal.vue     # 确认对话框
├── ProductCard.vue      # 产品卡片
└── TheSidebar.vue       # 右侧工具栏
```

### 1.2 主要问题
1. **App.vue 过于臃肿** (256行)
   - 包含页面渲染、拖拽逻辑、工具栏、文本编辑
   - 缺乏组件化分离
2. **职责不清晰**
   - 布局、业务逻辑、UI交互混杂
3. **复用性差**
   - 相似功能代码重复
4. **测试困难**
   - 组件耦合度高，难以单元测试

## 2. 目标组件结构

### 2.1 重构后组件目录结构
```
src/
├── components/
│   ├── layout/          # 布局组件
│   │   ├── EditorLayout.vue
│   │   ├── LeftSidebar.vue
│   │   ├── MainCanvas.vue
│   │   ├── RightSidebar.vue
│   │   └── TopNavigation.vue
│   │
│   ├── page/            # 页面相关组件
│   │   ├── PageThumbnail.vue
│   │   ├── PageCard.vue
│   │   ├── PageControls.vue
│   │   ├── BlockEditor.vue
│   │   └── ProductGrid.vue
│   │
│   ├── properties/      # 属性面板组件
│   │   ├── PageProperties.vue
│   │   ├── BlockProperties.vue
│   │   ├── ProductProperties.vue
│   │   ├── TextProperties.vue
│   │   └── ImageProperties.vue
│   │
│   ├── ui/              # 通用UI组件
│   │   ├── Toolbar.vue
│   │   ├── ContextMenu.vue
│   │   ├── ModalManager.vue
│   │   ├── ToastNotification.vue
│   │   └── LoadingOverlay.vue
│   │
│   ├── shared/          # 共享组件
│   │   ├── DraggableItem.vue
│   │   ├── ResizableBox.vue
│   │   ├── ColorPicker.vue
│   │   └── FontSelector.vue
│   │
│   └── legacy/          # 旧组件（逐步迁移）
│       ├── ConfirmModal.vue
│       ├── ProductCard.vue
│       └── TheSidebar.vue
│
├── composables/         # 组合式函数
│   ├── useDragAndDrop.ts
│   ├── useUndoRedo.ts
│   ├── usePageManagement.ts
│   └── useImageProcessing.ts
│
└── utils/              # 工具函数
    ├── domHelpers.ts
    ├── styleHelpers.ts
    └── validationHelpers.ts
```

## 3. 核心组件详细设计

### 3.1 EditorLayout.vue (布局容器)
```vue
<!-- 职责：三栏式布局容器，管理子组件通信 -->
<template>
  <div class="editor-layout">
    <TopNavigation />
    <div class="layout-content">
      <LeftSidebar />
      <MainCanvas />
      <RightSidebar />
    </div>
  </div>
</template>

<script setup>
// 导入子组件
import TopNavigation from './TopNavigation.vue'
import LeftSidebar from './LeftSidebar.vue'
import MainCanvas from './MainCanvas.vue'
import RightSidebar from './RightSidebar.vue'

// 布局状态管理
const layoutState = reactive({
  leftSidebarWidth: 240,
  rightSidebarWidth: 300,
  isRightSidebarCollapsed: false,
})

// 提供布局上下文给子组件
provide('layoutState', layoutState)
</script>
```

### 3.2 LeftSidebar.vue (左侧页面导航)
```vue
<!-- 职责：显示页面缩略图，支持拖拽排序 -->
<template>
  <aside class="left-sidebar" :style="{ width: `${width}px` }">
    <div class="sidebar-header">
      <h3>页面导航</h3>
      <button @click="addPage">+ 添加</button>
    </div>
    
    <draggable 
      v-model="pages" 
      class="page-thumbnails"
      @end="onPageReorder"
    >
      <PageThumbnail
        v-for="page in pages"
        :key="page.id"
        :page="page"
        :is-active="activePageId === page.id"
        @click="selectPage(page.id)"
        @delete="deletePage(page.id)"
      />
    </draggable>
  </aside>
</template>

<script setup>
import { useCatalogStore } from '@/stores'
import PageThumbnail from '@/components/page/PageThumbnail.vue'
import draggable from 'vuedraggable'

const store = useCatalogStore()
const pages = computed(() => store.pages)
const activePageId = ref(null)

function selectPage(pageId) {
  activePageId.value = pageId
  // 触发页面切换事件
}

function addPage() {
  store.addPage('custom')
}
</script>
```

### 3.3 MainCanvas.vue (主编辑区)
```vue
<!-- 职责：显示当前选中页面的编辑视图 -->
<template>
  <main class="main-canvas">
    <div class="canvas-container">
      <PageCard
        v-for="page in visiblePages"
        :key="page.id"
        :page="page"
        :is-active="activePageId === page.id"
        @block-selected="onBlockSelected"
        @block-updated="onBlockUpdated"
      />
    </div>
    
    <!-- 浮动工具栏 -->
    <FloatingToolbar
      v-if="selectedBlock"
      :block="selectedBlock"
      @update="onBlockUpdate"
    />
  </main>
</template>

<script setup>
import { useCatalogStore } from '@/stores'
import PageCard from '@/components/page/PageCard.vue'
import FloatingToolbar from '@/components/ui/FloatingToolbar.vue'

const store = useCatalogStore()
const visiblePages = computed(() => [store.pages[0]]) // 简化：只显示第一页
const selectedBlock = ref(null)

function onBlockSelected(block) {
  selectedBlock.value = block
}
</script>
```

### 3.4 RightSidebar.vue (右侧属性面板)
```vue
<!-- 职责：显示选中元素的属性，支持编辑 -->
<template>
  <aside class="right-sidebar" :class="{ collapsed }">
    <div class="sidebar-header">
      <h3>属性面板</h3>
      <button @click="toggleCollapse">
        {{ collapsed ? '展开' : '折叠' }}
      </button>
    </div>
    
    <div v-if="!collapsed" class="property-sections">
      <PageProperties 
        v-if="selectedPage" 
        :page="selectedPage"
        @update="onPageUpdate"
      />
      
      <BlockProperties
        v-if="selectedBlock"
        :block="selectedBlock"
        @update="onBlockUpdate"
      />
      
      <ProductProperties
        v-if="selectedProduct"
        :product="selectedProduct"
        @update="onProductUpdate"
      />
    </div>
  </aside>
</template>

<script setup>
import PageProperties from '@/components/properties/PageProperties.vue'
import BlockProperties from '@/components/properties/BlockProperties.vue'
import ProductProperties from '@/components/properties/ProductProperties.vue'

const collapsed = ref(false)
const selectedPage = ref(null)
const selectedBlock = ref(null)
const selectedProduct = ref(null)

function toggleCollapse() {
  collapsed.value = !collapsed.value
}
</script>
```

## 4. 从 App.vue 迁移功能

### 4.1 需要迁移的功能模块

#### 模块 1: 拖拽逻辑 (lines 17-40)
```typescript
// 迁移到 composables/useDragAndDrop.ts
export function useDragAndDrop() {
  const startDrag = (e, block, page) => { /* ... */ }
  const doDrag = (e) => { /* ... */ }
  const stopDrag = () => { /* ... */ }
  
  return { startDrag, doDrag, stopDrag }
}
```

#### 模块 2: 缩放逻辑 (lines 32-40)
```typescript
// 迁移到 composables/useResize.ts
export function useResize() {
  const startBlockResize = (e, block) => { /* ... */ }
  const doBlockResize = (e) => { /* ... */ }
  const stopBlockResize = () => { /* ... */ }
  
  return { startBlockResize, doBlockResize, stopBlockResize }
}
```

#### 模块 3: 键盘快捷键 (lines 44-56)
```typescript
// 迁移到 composables/useKeyboardShortcuts.ts
export function useKeyboardShortcuts() {
  const handleKeydown = (e) => {
    if ((e.ctrlKey || e.metaKey)) {
      if (e.key === 'z') { e.preventDefault(); store.undo(); }
      if (e.key === 'y') { e.preventDefault(); store.redo(); }
    }
  }
  
  return { handleKeydown }
}
```

#### 模块 4: 图片处理 (lines 58-87)
```typescript
// 迁移到 composables/useImageProcessing.ts
export function useImageProcessing() {
  const handleImg = (f, t, k) => { /* ... */ }
  const handleGlobalDrop = (e, t, k) => { /* ... */ }
  
  return { handleImg, handleGlobalDrop }
}
```

### 4.2 模板内容迁移

#### 页面卡片渲染 (lines 115-253)
```vue
<!-- 迁移到 PageCard.vue -->
<template>
  <div class="page-card">
    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 块渲染 -->
      <BlockEditor
        v-for="block in page.blocks"
        :key="block.id"
        :block="block"
        @selected="onBlockSelected"
      />
    </div>
    
    <!-- 页面控制 -->
    <PageControls :page="page" />
  </div>
</template>
```

#### 工具栏 (lines 101-113)
```vue
<!-- 迁移到 FloatingToolbar.vue -->
<template>
  <div class="floating-toolbar">
    <!-- 文本编辑工具 -->
    <button @click="execCmd('bold')">B</button>
    <button @click="execCmd('italic')">I</button>
    <!-- ... -->
  </div>
</template>
```

## 5. 组件通信设计

### 5.1 状态管理架构
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │   Composables   │    │   Pinia Store   │
│                 │    │                 │    │                 │
│  EditorLayout   │◄──►│ useDragAndDrop  │◄──►│  catalog-new.js │
│  PageCard       │    │ useUndoRedo     │    │                 │
│  Properties     │    │ usePageManagement│    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                         ┌───────▼───────┐
                         │   Event Bus   │
                         │  (provide/    │
                         │   inject)     │
                         └───────────────┘
```

### 5.2 事件总线设计
```typescript
// src/composables/useEventBus.ts
import { inject, provide, reactive } from 'vue'

type EventType = 'page-selected' | 'block-updated' | 'undo-redo' | 'data-changed'

interface EventBus {
  emit: (event: EventType, payload?: any) => void
  on: (event: EventType, handler: (payload?: any) => void) => void
  off: (event: EventType, handler: (payload?: any) => void) => void
}

export function useEventBus(): EventBus {
  const listeners = reactive(new Map<EventType, Set<Function>>())
  
  const emit = (event: EventType, payload?: any) => {
    const handlers = listeners.get(event)
    if (handlers) {
      handlers.forEach(handler => handler(payload))
    }
  }
  
  const on = (event: EventType, handler: Function) => {
    if (!listeners.has(event)) {
      listeners.set(event, new Set())
    }
    listeners.get(event)!.add(handler)
  }
  
  const off = (event: EventType, handler: Function) => {
    const handlers = listeners.get(event)
    if (handlers) {
      handlers.delete(handler)
    }
  }
  
  return { emit, on, off }
}

// 提供全局事件总线
export function provideEventBus() {
  const eventBus = useEventBus()
  provide('eventBus', eventBus)
  return eventBus
}

// 注入事件总线
export function useEventBusInjection(): EventBus {
  const eventBus = inject<EventBus>('eventBus')
  if (!eventBus) {
    throw new Error('Event bus not provided')
  }
  return eventBus
}
```

## 6. 渐进式迁移策略

### 6.1 阶段 1: 基础布局搭建
1. 创建 `EditorLayout.vue` 和子组件
2. 保持现有 `App.vue` 功能不变
3. 在新布局中嵌入现有内容
4. 验证布局正常工作

### 6.2 阶段 2: 功能模块提取
1. 创建 `composables/` 目录，提取逻辑
2. 逐步将 `App.vue` 中的函数迁移到组合式函数
3. 更新组件引用，使用新的组合式函数
4. 确保功能不受影响

### 6.3 阶段 3: 组件重构
1. 创建新的组件文件
2. 从 `App.vue` 中提取模板片段到新组件
3. 使用组合式函数提供逻辑
4. 逐步替换 `App.vue` 中的对应部分

### 6.4 阶段 4: 完全迁移
1. 当所有功能都迁移完成后
2. 将 `App.vue` 替换为新的组件结构
3. 删除旧的 `App.vue` 文件
4. 进行完整测试

## 7. 测试策略

### 7.1 单元测试
```typescript
// 测试组合式函数
describe('useDragAndDrop', () => {
  it('should start drag correctly', () => {
    const { startDrag } = useDragAndDrop()
    // 测试逻辑
  })
})

// 测试组件
describe('PageCard.vue', () => {
  it('should render page content', () => {
    const wrapper = mount(PageCard, {
      props: { page: mockPage }
    })
    expect(wrapper.find('.page-content').exists()).toBe(true)
  })
})
```

### 7.2 集成测试
```typescript
describe('EditorLayout Integration', () => {
  it('should communicate between components', async () => {
    const wrapper = mount(EditorLayout)
    
    // 模拟页面选择
    await wrapper.findComponent(LeftSidebar).vm.$emit('page-selected', 'page-1')
    
    // 验证主画布更新
    expect(wrapper.findComponent(MainCanvas).props('activePageId')).toBe('page-1')
  })
})
```

### 7.3 E2E 测试
```typescript
describe('End-to-End Workflow', () => {
  it('should complete page editing workflow', () => {
    // 1. 添加页面
    // 2. 编辑内容
    // 3. 保存更改
    // 4. 验证结果
  })
})
```

## 8. 性能优化考虑

### 8.1 组件懒加载
```vue
<script setup>
import { defineAsyncComponent } from 'vue'

const RightSidebar = defineAsyncComponent(() =>
  import('@/components/layout/RightSidebar.vue')
)
</script>
```

### 8.2 虚拟滚动
```vue
<template>
  <VirtualScroll :items="pages" :item-height="120">
    <template #default="{ item }">
      <PageThumbnail :page="item" />
    </template>
  </VirtualScroll>
</template>
```

### 8.3 记忆化计算
```typescript
const expensiveComputation = computed(() => {
  // 复杂计算
  return computeResult.value
})
```

## 9. 风险与缓解措施

### 9.1 技术风险
- **组件通信复杂**: 使用事件总线可能导致难以调试
  - 缓解: 使用 TypeScript 强类型，添加详细日志
- **性能下降**: 过度组件化可能影响渲染性能
  - 缓解: 使用性能监控，优化关键路径

### 9.2 开发风险
- **迁移周期长**: 影响新功能开发
  - 缓解: 分阶段实施，确保每个阶段可独立运行
- **团队学习曲线**: 新架构需要团队适应
  - 缓解: 提供详细文档和示例代码

### 9.3 质量风险
- **回归缺陷**: 迁移过程中引入 bug
  - 缓解: 完善的测试覆盖，代码审查

## 10. 成功标准

### 10.1 技术指标
- [ ] App.vue 行数减少 80% 以上
