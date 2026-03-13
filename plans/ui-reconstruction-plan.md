# 雅洁五金 2026 工程图册 - UI 重构方案

## 1. 项目现状分析

### 1.1 技术栈确认
- **前端框架**: Vue 3 (Composition API)
- **状态管理**: Pinia + 命令模式 (Command Pattern)
- **样式方案**: Tailwind CSS
- **构建工具**: Vite
- **核心依赖**: vuedraggable, xlsx, nanoid

### 1.2 当前架构问题
1. **组件耦合度高**: `App.vue` 文件超过 250 行，包含页面渲染、拖拽逻辑、工具栏、文本编辑等
2. **布局单一**: 当前为垂直流式布局，缺乏专业级编辑器的三栏式结构
3. **视觉风格不统一**: 虽然已有品牌色，但缺乏系统性的设计语言
4. **交互反馈不足**: 撤销/重做等操作缺乏视觉反馈
5. **性能优化空间**: 大量内联样式和事件处理

### 1.3 重构约束条件
- ✅ 必须保持与现有 Store 逻辑解耦
- ✅ 禁止修改 Command 管理逻辑
- ✅ 仅针对样式、布局及组件交互进行升级
- ✅ 确保数据迁移系统 (Schema v1) 兼容性

## 2. 视觉设计系统 (Quiet Luxury & Engineering)

### 2.1 色彩体系
```css
/* 主色调 - 静奢工业风 */
--bg-primary: #F5F5F7;      /* 极简浅灰背景 */
--bg-card: #FFFFFF;         /* 白色卡片 */
--border-light: #D2D2D7;    /* 极细深灰边框 */
--text-primary: #1D1D1F;    /* 炭黑主文字 */
--text-secondary: #86868B;  /* 中灰辅助文字 */
--brand-purple: #4C1A79;    /* 品牌紫色 */
--brand-orange: #FF6B00;    /* 品牌橙色 */

/* 功能色 */
--success: #34C759;
--warning: #FF9500;
--error: #FF3B30;
--info: #007AFF;
```

### 2.2 字体系统
- **标题字体**: Inter (优先) / PingFang SC (中文备选)
- **正文字体**: SF Pro Text / -apple-system
- **技术参数**: SF Mono / Monaco (等宽字体)
- **字号层级**: 12px / 14px / 16px / 20px / 24px / 32px / 48px

### 2.3 材质效果
- **侧边栏**: `backdrop-blur-md bg-white/95` (macOS 玻璃质感)
- **卡片**: `shadow-lg rounded-xl` (柔和投影)
- **分隔线**: `border-b border-gray-100` (极细分割)
- **悬停效果**: `transition-all duration-300` (平滑过渡)

## 3. 三栏式布局架构

### 3.1 整体布局结构
```
┌─────────────────────────────────────────────────────────────┐
│                     Top Navigation Bar                       │
├─────────────┬──────────────────────────────┬────────────────┤
│             │                              │                │
│  左侧边栏   │        主编辑区              │   右侧面板     │
│  (240px)    │        (Flexible)            │   (300px)      │
│             │                              │                │
│  Page Nav   │        Canvas Area           │  Properties    │
│  with Blur  │        with Shadow           │  Inspector     │
│             │                              │                │
├─────────────┴──────────────────────────────┴────────────────┤
│                     Status Bar / Footer                      │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 各区域功能定义

#### 左侧边栏 (Page Navigation - 240px)
- **背景效果**: 高斯模糊玻璃质感
- **内容**: 页面缩略图网格 (Grid)
- **交互**: 拖拽排序、点击切换、缩略图预览
- **状态**: 当前选中页面高亮显示

#### 主编辑区 (Main Canvas - Flexible)
- **背景**: 极简浅灰 (#F5F5F7)
- **内容**: 图册页面以白色卡片形式悬浮
- **效果**: 柔和投影 (shadow-xl)、圆角 (rounded-2xl)
- **交互**: 页面缩放、滚动、拖拽调整顺序

#### 右侧面板 (Property Inspector - 300px)
- **结构**: 可折叠面板组 (Accordion)
- **内容**: 页面属性、块属性、产品参数
- **交互**: 折叠/展开、实时预览、批量编辑
- **状态**: 根据选中元素动态切换内容

## 4. 组件化拆分方案

### 4.1 核心布局组件
```
src/components/layout/
├── EditorLayout.vue          # 三栏式布局容器
├── LeftSidebar.vue           # 左侧页面导航
├── MainCanvas.vue            # 主编辑区
├── RightSidebar.vue          # 右侧属性面板
└── TopNavigation.vue         # 顶部导航栏
```

### 4.2 页面相关组件
```
src/components/page/
├── PageThumbnail.vue         # 页面缩略图
├── PageCard.vue              # 页面卡片 (主编辑区)
├── PageControls.vue          # 页面操作控件
├── BlockEditor.vue           # 块编辑器
└── ProductGrid.vue           # 产品网格 (重构现有 ProductCard)
```

### 4.3 属性面板组件
```
src/components/properties/
├── PageProperties.vue        # 页面属性
├── BlockProperties.vue       # 块属性
├── ProductProperties.vue     # 产品属性
├── TextProperties.vue        # 文本属性
└── ImageProperties.vue       # 图片属性
```

### 4.4 工具组件
```
src/components/ui/
├── Toolbar.vue               # 浮动工具栏
├── ContextMenu.vue           # 右键菜单
├── ModalManager.vue          # 模态框管理
├── ToastNotification.vue     # 通知提示
└── LoadingOverlay.vue        # 加载遮罩
```

## 5. 重构实施计划

### Phase 1: 基础布局搭建 (1-2天)
1. 创建三栏式布局组件结构
2. 实现响应式布局系统
3. 集成现有 Store 数据流
4. 确保基础交互功能正常

### Phase 2: 视觉系统升级 (2-3天)
1. 应用 Quiet Luxury 色彩体系
2. 实现玻璃质感侧边栏
3. 优化卡片阴影和圆角
4. 统一字体和间距系统

### Phase 3: 组件功能完善 (3-4天)
1. 左侧页面导航功能
2. 右侧属性面板交互
3. 主编辑区拖拽优化
4. 撤销/重做视觉反馈

### Phase 4: 性能优化与测试 (1-2天)
1. 组件懒加载优化
2. 渲染性能测试
3. 跨浏览器兼容性
4. 移动端适配

## 6. 关键技术实现要点

### 6.1 布局实现
```vue
<!-- EditorLayout.vue 示例 -->
<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <TopNavigation />
    <div class="flex flex-1 overflow-hidden">
      <LeftSidebar :width="240" />
      <MainCanvas class="flex-1" />
      <RightSidebar :width="300" :collapsed="isRightSidebarCollapsed" />
    </div>
  </div>
</template>
```

### 6.2 玻璃质感侧边栏
```css
.left-sidebar {
  @apply backdrop-blur-md bg-white/95 border-r border-gray-200;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}
```

### 6.3 卡片悬浮效果
```css
.page-card {
  @apply bg-white rounded-2xl shadow-xl transition-all duration-300;
  &:hover {
    @apply shadow-2xl -translate-y-1;
  }
  &.active {
    @apply ring-2 ring-blue-500 ring-offset-2;
  }
}
```

### 6.4 属性面板折叠动画
```vue
<template>
  <div class="property-panel">
    <div 
      v-for="section in sections" 
      :key="section.id"
      class="border-b border-gray-100"
    >
      <button 
        @click="toggleSection(section.id)"
        class="w-full flex justify-between items-center p-4 hover:bg-gray-50"
      >
        <span class="font-medium">{{ section.title }}</span>
        <ChevronDownIcon :class="{'rotate-180': section.expanded}" />
      </button>
      <Transition name="slide">
        <div v-show="section.expanded" class="px-4 pb-4">
          <!-- 属性内容 -->
        </div>
      </Transition>
    </div>
  </div>
</template>
```

## 7. 风险与应对措施

### 7.1 技术风险
- **Store 兼容性**: 确保新组件能正确读取现有 Store 数据
  - 应对: 创建适配层组件，逐步迁移
- **性能影响**: 三栏式布局可能增加渲染复杂度
  - 应对: 使用虚拟滚动、组件懒加载

### 7.2 设计风险
- **视觉风格不一致**: 新旧组件风格差异
  - 应对: 建立设计 Token 系统，确保一致性
- **交互体验断裂**: 用户习惯改变
  - 应对: 保留核心交互模式，渐进式改进

### 7.3 时间风险
- **重构周期过长**: 影响项目进度
  - 应对: 分阶段实施，确保每个阶段可独立交付

## 8. 验收标准

### 8.1 功能完整性
- [ ] 三栏式布局正常工作
- [ ] 所有现有功能保持可用
- [ ] 撤销/重做视觉反馈完善
- [ ] 属性面板实时更新

### 8.2 视觉一致性
- [ ] Quiet Luxury 风格统一应用
- [ ] 玻璃质感侧边栏效果
- [ ] 卡片悬浮阴影自然
- [ ] 字体和间距系统规范

### 8.3 性能指标
- [ ] 页面加载时间 < 2s
- [ ] 交互响应时间 < 100ms
- [ ] 内存占用稳定
- [ ] 滚动流畅度 60fps

## 9. 下一步行动

1. **确认设计方案**: 与产品/设计团队评审
2. **创建组件脚手架**: 初始化新组件结构
3. **渐进式迁移**: 从 App.vue 逐步提取功能
4. **持续集成测试**: 确保每个改动可回滚

---

**文档版本**: v1.0  
**创建时间**: 2026-03-03  
**负责人**: 架构师团队  
**状态**: 待评审