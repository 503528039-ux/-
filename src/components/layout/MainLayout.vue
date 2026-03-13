<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useCatalogStore } from '@/stores/index'
import { usePerformanceOptimization } from '@/composables/usePerformanceOptimization'

// 状态管理
const store = useCatalogStore()

// 性能优化
const performance = usePerformanceOptimization()

// 布局状态
const showLeftSidebar = ref(true)
const showRightSidebar = ref(true)
const printMode = ref(false)
const zoomLevel = ref(0.8)

// A4 纸张尺寸 (以像素为单位，基于 96 DPI)
const paperWidth = computed(() => 210 * 3.78) // 210mm ≈ 794px
const paperHeight = computed(() => 297 * 3.78) // 297mm ≈ 1123px

// 页面数据 - 从store中获取
const pages = computed(() => store.pages || [])

// 页面缩略图数据 - 基于store中的真实数据生成
const pageThumbnails = computed(() => {
  if (!pages.value || pages.value.length === 0) {
    // 如果没有数据，返回默认示例数据
    return [
      { id: '1', title: '封面', type: 'cover', typeLabel: '封面页', number: 'P.01', previewText: '封面设计' },
      { id: '2', title: '目录', type: 'toc', typeLabel: '目录页', number: 'P.02', previewText: '目录内容' },
      { id: '3', title: '品牌介绍', type: 'brand', typeLabel: '品牌页', number: 'P.03', previewText: '品牌故事' },
    ]
  }
  
  // 将store中的页面数据转换为缩略图格式
  return pages.value.map((page, index) => {
    // 从store页面数据中提取信息
    const pageType = page.type || 'product'
    const pageTitle = page.title || `页面 ${index + 1}`
    const pageNumber = page.pageNumber || `P.${String(index + 1).padStart(2, '0')}`
    
    // 根据页面类型设置标签和预览文本
    let typeLabel = '产品页'
    let previewText = '页面内容'
    
    switch (pageType) {
      case 'cover':
        typeLabel = '封面页'
        previewText = '封面设计'
        break
      case 'toc':
        typeLabel = '目录页'
        previewText = '目录内容'
        break
      case 'brand':
        typeLabel = '品牌页'
        previewText = '品牌故事'
        break
      case 'project':
        typeLabel = '案例页'
        previewText = '项目案例'
        break
      case 'back':
        typeLabel = '封底页'
        previewText = '封底信息'
        break
      default:
        typeLabel = '产品页'
        previewText = pageTitle
    }
    
    return {
      id: page.id || `page-${index}`,
      title: pageTitle,
      type: pageType,
      typeLabel,
      number: pageNumber,
      previewText,
      originalPage: page // 保留原始页面引用
    }
  })
})

const activePageId = ref(pageThumbnails.value[0]?.id || '1')

// 计算属性
const canUndo = computed(() => store.canUndo)
const canRedo = computed(() => store.canRedo)

// 性能优化计算属性
const performanceStatus = computed(() => {
  const score = performance.performanceScore.value
  if (score >= 80) return { label: '极佳', color: 'text-functional-success', bg: 'bg-functional-success/10' }
  if (score >= 60) return { label: '良好', color: 'text-functional-warning', bg: 'bg-functional-warning/10' }
  return { label: '需优化', color: 'text-functional-error', bg: 'bg-functional-error/10' }
})

// 防抖的缩放控制
const debouncedZoomChange = performance.debounce((newZoom) => {
  zoomLevel.value = newZoom
}, performance.debounceConfig.input)

// 方法
const toggleLeftSidebar = () => {
  showLeftSidebar.value = !showLeftSidebar.value
}

const toggleRightSidebar = () => {
  showRightSidebar.value = !showRightSidebar.value
}

const togglePrintMode = () => {
  printMode.value = !printMode.value
  if (printMode.value) {
    zoomLevel.value = 1.0
  }
}

const handleUndo = () => {
  store.undo()
}

const handleRedo = () => {
  store.redo()
}

const selectPage = (pageId) => {
  activePageId.value = pageId
  
  // 找到选中的页面
  const selectedPage = pageThumbnails.value.find(page => page.id === pageId)
  if (selectedPage?.originalPage) {
    // 这里可以触发页面加载逻辑，例如更新中间编辑区的内容
    console.log('选中页面:', selectedPage.title, selectedPage.originalPage)
  }
}

const addNewPage = () => {
  // 使用store的addPage方法添加新页面
  try {
    // 默认添加产品页
    store.addPage('product', 'lock')
    
    // 更新activePageId为新添加的页面
    if (pages.value.length > 0) {
      const newPage = pages.value[pages.value.length - 1]
      const newPageId = newPage.id || `page-${pages.value.length - 1}`
      activePageId.value = newPageId
    }
    
    console.log('成功添加新页面')
  } catch (error) {
    console.error('添加新页面失败:', error)
  }
}

const zoomIn = () => {
  const newZoom = Math.min(2.0, zoomLevel.value + 0.1)
  debouncedZoomChange(newZoom)
}

const zoomOut = () => {
  const newZoom = Math.max(0.2, zoomLevel.value - 0.1)
  debouncedZoomChange(newZoom)
}

const resetZoom = () => {
  zoomLevel.value = 1.0
}

// 键盘快捷键
const handleKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey)) {
    if (e.key === 'z') {
      e.preventDefault()
      handleUndo()
    }
    if (e.key === 'y') {
      e.preventDefault()
      handleRedo()
    }
    if (e.key === 'p') {
      e.preventDefault()
      togglePrintMode()
    }
    if (e.key === 'b' && e.shiftKey) {
      e.preventDefault()
      toggleLeftSidebar()
    }
    if (e.key === '=' || e.key === '+') {
      e.preventDefault()
      zoomIn()
    }
    if (e.key === '-') {
      e.preventDefault()
      zoomOut()
    }
    if (e.key === '0') {
      e.preventDefault()
      resetZoom()
    }
  }
}

// 监听性能变化
watch(() => performance.performanceScore.value, (score) => {
  if (score < 60) {
    console.warn('性能评分较低，建议优化:', performance.performanceSuggestions.value)
  }
})

// 生命周期
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  
  // 启用GPU加速
  performance.enableGPUAcceleration()
  
  // 初始化图片懒加载
  const cleanupLazyLoad = performance.lazyLoadImages()
  
  return () => {
    window.removeEventListener('keydown', handleKeydown)
    cleanupLazyLoad()
  }
})

onUnmounted(() => {
  // 性能优化清理
  performance.disableGPUAcceleration()
})
</script>

<template>
  <div class="main-layout h-screen flex flex-col overflow-hidden bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="top-navigation flex-shrink-0 h-12 border-b border-gray-200 bg-white/95 backdrop-blur-md z-30">
      <div class="h-full px-4 flex items-center justify-between">
        <!-- 左侧：品牌标识和项目信息 -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-md bg-gradient-to-br from-brand-purple to-brand-orange"></div>
            <span class="font-display font-bold text-gray-900 tracking-tight">ARCHIE STUDIO</span>
            <span class="text-xs text-gray-500 font-mono">2026</span>
          </div>
          
          <div class="h-4 w-px bg-gray-200"></div>
          
          <div class="text-sm text-gray-700">
            <span class="font-medium">雅洁五金工程图册</span>
            <span class="text-gray-500 ml-2">· 编辑模式</span>
          </div>
        </div>
        
        <!-- 中间：全局操作 -->
        <div class="flex items-center gap-2">
          <button 
            @click="togglePrintMode"
            class="px-3 py-1.5 text-sm rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
            :class="{ 'bg-brand-blue/10 border-brand-blue text-brand-blue': printMode }"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            {{ printMode ? '退出预览' : '印刷预览' }}
          </button>
          
          <div class="h-4 w-px bg-gray-200"></div>
          
          <!-- 撤销/重做 -->
          <button 
            @click="handleUndo"
            :disabled="!canUndo"
            class="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="撤销 (Ctrl+Z)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          
          <button 
            @click="handleRedo"
            :disabled="!canRedo"
            class="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="重做 (Ctrl+Y)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-6a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>
        
        <!-- 右侧：用户和设置 -->
        <div class="flex items-center gap-3">
          <div class="text-xs text-gray-500 font-mono">
            <span>v2026.1</span>
            <span class="mx-1">·</span>
            <span>M4 Optimized</span>
          </div>
          
          <button class="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
    
    <!-- 主内容区：三栏布局 -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 左侧边栏：页面导航 -->
      <aside 
        class="left-sidebar flex-shrink-0 w-64 border-r border-gray-200 bg-white/95 backdrop-blur-md overflow-hidden transition-all duration-350 smooth z-20"
        :class="{ 'w-0 border-r-0': !showLeftSidebar }"
      >
        <div class="h-full flex flex-col">
          <!-- 侧边栏头部 -->
          <div class="sidebar-header flex-shrink-0 p-4 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                页面导航
              </h3>
              
              <button 
                @click="toggleLeftSidebar"
                class="p-1 rounded-md hover:bg-gray-100 transition-colors"
                :title="showLeftSidebar ? '隐藏侧边栏' : '显示侧边栏'"
              >
                <svg 
                  class="w-4 h-4 transition-transform duration-300" 
                  :class="{ 'rotate-180': !showLeftSidebar }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </div>
            
            <div class="mt-3">
              <div class="relative">
                <input 
                  type="text" 
                  placeholder="搜索页面..."
                  class="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md bg-gray-50 focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-colors"
                />
                <svg class="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <!-- 页面缩略图列表 -->
          <div class="flex-1 overflow-y-auto p-3">
            <div class="space-y-3">
              <!-- 页面缩略图示例 -->
              <div 
                v-for="page in pageThumbnails" 
                :key="page.id"
                class="page-thumbnail group relative bg-white border border-gray-200 rounded-lg p-3 cursor-pointer transition-all duration-250 hover:border-brand-blue hover:shadow-subtle"
                :class="{ 'border-brand-blue ring-1 ring-brand-blue': activePageId === page.id }"
                @click="selectPage(page.id)"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1 min-w-0">
                    <div class="text-xs font-medium text-gray-900 truncate">{{ page.title }}</div>
                    <div class="text-xs text-gray-500 mt-0.5">{{ page.typeLabel }}</div>
                  </div>
                  <div class="text-xs font-mono text-gray-400">{{ page.number }}</div>
                </div>
                
                <!-- 缩略图预览 -->
                <div class="aspect-[210/297] bg-gray-100 rounded border border-gray-200 overflow-hidden relative">
                  <!-- A4比例占位 -->
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-gray-300 text-xs">{{ page.previewText }}</div>
                  </div>
                  
                  <!-- 页面类型标识 -->
                  <div class="absolute top-1 right-1">
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-white/90 backdrop-blur-xs text-gray-700 border border-gray-200">
                      {{ page.type }}
                    </span>
                  </div>
                </div>
                
                <!-- 悬停操作 -->
                <div class="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button class="p-1 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 添加页面按钮 -->
          <div class="flex-shrink-0 p-3 border-t border-gray-100">
            <button 
              @click="addNewPage"
              class="w-full py-2 px-3 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center gap-2 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              添加新页面
            </button>
          </div>
        </div>
      </aside>
      
      <!-- 中间编辑区：A4纸张比例模拟 -->
      <main class="flex-1 overflow-hidden bg-gray-100/50 relative">
        <!-- 缩放控制 -->
        <div class="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-lg border border-gray-200 px-3 py-2 shadow-subtle">
          <button
            @click="zoomLevel = Math.max(0.2, zoomLevel - 0.1)"
            class="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            title="缩小"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>
          
          <span class="text-sm font-medium text-gray-700 min-w-[60px] text-center">
            {{ Math.round(zoomLevel * 100) }}%
          </span>
          
          <button
            @click="zoomLevel = Math.min(2.0, zoomLevel + 0.1)"
            class="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            title="放大"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          
          <div class="h-4 w-px bg-gray-200"></div>
          
          <button
            @click="zoomLevel = 1.0"
            class="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            100%
          </button>
        </div>
        
        <!-- A4纸张模拟区域 -->
        <div class="h-full flex items-center justify-center p-8">
          <div
            class="bg-white shadow-xl rounded-lg border border-gray-300 relative overflow-hidden transition-all duration-300"
            :style="{
              width: `${paperWidth * zoomLevel}px`,
              height: `${paperHeight * zoomLevel}px`,
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center'
            }"
          >
            <!-- 纸张内容区域 -->
            <div class="absolute inset-0 p-8">
              <!-- 页面内容占位 -->
              <div class="h-full flex flex-col">
                <!-- 页面标题 -->
                <div class="mb-6">
                  <div class="text-2xl font-display font-bold text-gray-900">雅洁五金工程图册</div>
                  <div class="text-sm text-gray-600 mt-1">2026年度产品目录 · 门锁系列</div>
                </div>
                
                <!-- 内容网格 -->
                <div class="flex-1 grid grid-cols-2 gap-6">
                  <!-- 左侧内容 -->
                  <div class="space-y-4">
                    <div class="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border border-gray-300"></div>
                    <div class="h-24 bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 rounded-lg border border-brand-purple/20"></div>
                    <div class="h-20 bg-gradient-to-br from-metal-gold/10 to-metal-copper/10 rounded-lg border border-metal-gold/20"></div>
                  </div>
                  
                  <!-- 右侧内容 -->
                  <div class="space-y-4">
                    <div class="h-40 bg-gradient-to-br from-surface-light to-surface-lighter rounded-lg border border-gray-300"></div>
                    <div class="h-28 bg-gradient-to-br from-functional-success/10 to-functional-info/10 rounded-lg border border-functional-success/20"></div>
                  </div>
                </div>
                
                <!-- 页脚 -->
                <div class="mt-6 pt-4 border-t border-gray-200">
                  <div class="text-xs text-gray-500 flex justify-between">
                    <span>雅洁五金 · 工程图册系统</span>
                    <span>页码: P.04</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 纸张边缘装饰 -->
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-purple via-brand-orange to-brand-blue"></div>
            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-metal-gold via-metal-copper to-metal-silver"></div>
          </div>
        </div>
        
        <!-- 底部状态栏 -->
        <div class="absolute bottom-0 left-0 right-0 h-8 bg-white/95 backdrop-blur-md border-t border-gray-200 flex items-center px-4 text-xs text-gray-600">
          <div class="flex items-center gap-4">
            <span>当前页面: 门锁系列 (P.04)</span>
            <span class="text-gray-400">·</span>
            <span>尺寸: {{ Math.round(paperWidth * zoomLevel) }} × {{ Math.round(paperHeight * zoomLevel) }} px</span>
            <span class="text-gray-400">·</span>
            <span>缩放: {{ Math.round(zoomLevel * 100) }}%</span>
          </div>
          
          <div class="ml-auto flex items-center gap-3">
            <!-- 性能监控 -->
            <div class="flex items-center gap-2" :title="performance.performanceSuggestions.value.join('; ')">
              <span class="text-gray-500">性能:</span>
              <span :class="performanceStatus.color" class="font-medium">
                {{ performanceStatus.label }} ({{ performance.performanceScore }}分)
              </span>
            </div>
            
            <span class="text-gray-400">·</span>
            
            <!-- FPS显示 -->
            <div class="flex items-center gap-1">
              <span class="text-gray-500">FPS:</span>
              <span :class="{
                'text-functional-success': performance.fps >= 55,
                'text-functional-warning': performance.fps >= 30 && performance.fps < 55,
                'text-functional-error': performance.fps < 30
              }" class="font-mono font-medium">
                {{ performance.fps }}
              </span>
            </div>
            
            <span class="text-gray-400">·</span>
            
            <!-- 内存使用 -->
            <div class="flex items-center gap-1">
              <span class="text-gray-500">内存:</span>
              <span :class="{
                'text-functional-success': performance.memoryUsage < 100,
                'text-functional-warning': performance.memoryUsage >= 100 && performance.memoryUsage < 150,
                'text-functional-error': performance.memoryUsage >= 150
              }" class="font-mono font-medium">
                {{ performance.memoryUsage }} MB
              </span>
            </div>
            
            <span class="text-gray-400">·</span>
            
            <!-- GPU加速状态 -->
            <div class="flex items-center gap-1">
              <span class="text-gray-500">GPU:</span>
              <span :class="performance.isHighPerformanceMode ? 'text-functional-success' : 'text-functional-warning'" class="font-medium">
                {{ performance.isHighPerformanceMode ? '启用' : '节能' }}
              </span>
            </div>
            
            <!-- M4芯片标识 -->
            <span class="px-1.5 py-0.5 text-[10px] rounded bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 text-brand-purple border border-brand-purple/20">
              M4 Optimized
            </span>
          </div>
        </div>
      </main>
      
      <!-- 右侧边栏：属性面板 -->
      <aside
        class="right-sidebar flex-shrink-0 w-80 border-l border-gray-200 bg-white/95 backdrop-blur-md overflow-hidden transition-all duration-350 smooth z-20"
        :class="{ 'w-0 border-l-0': !showRightSidebar }"
      >
        <div class="h-full flex flex-col">
          <!-- 侧边栏头部 -->
          <div class="sidebar-header flex-shrink-0 p-4 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                属性面板
              </h3>
              
              <button
                @click="toggleRightSidebar"
                class="p-1 rounded-md hover:bg-gray-100 transition-colors"
                :title="showRightSidebar ? '隐藏属性面板' : '显示属性面板'"
              >
                <svg
                  class="w-4 h-4 transition-transform duration-300"
                  :class="{ 'rotate-180': !showRightSidebar }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- 属性内容 -->
          <div class="flex-1 overflow-y-auto p-4">
            <div class="space-y-6">
              <!-- 页面属性 -->
              <div>
                <h4 class="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">页面属性</h4>
                <div class="space-y-3">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">页面标题</label>
                    <input
                      type="text"
                      class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-gray-50 focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-colors"
                      value="门锁系列"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">页面类型</label>
                    <select class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-gray-50 focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-colors">
                      <option>产品页</option>
                      <option>封面页</option>
                      <option>目录页</option>
                      <option>品牌页</option>
                      <option>案例页</option>
                    </select>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">宽度</label>
                      <div class="flex items-center">
                        <input
                          type="number"
                          class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-l-md bg-gray-50 focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-colors"
                          value="210"
                        />
                        <span class="px-2 py-1.5 text-xs text-gray-500 bg-gray-100 border border-l-0 border-gray-200 rounded-r-md">mm</span>
                      </div>
                    </div>
                    
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">高度</label>
                      <div class="flex items-center">
                        <input
                          type="number"
                          class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-l-md bg-gray-50 focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-colors"
                          value="297"
                        />
                        <span class="px-2 py-1.5 text-xs text-gray-500 bg-gray-100 border border-l-0 border-gray-200 rounded-r-md">mm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 样式属性 -->
              <div>
                <h4 class="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">样式属性</h4>
                <div class="space-y-3">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">背景颜色</label>
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded border border-gray-300 bg-white"></div>
                      <span class="text-xs text-gray-700">白色 (#FFFFFF)</span>
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">主色调</label>
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded border border-gray-300 bg-gradient-to-br from-brand-purple to-brand-orange"></div>
                      <span class="text-xs text-gray-700">品牌渐变</span>
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">边框样式</label>
                    <select class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-gray-50 focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-colors">
                      <option>实线</option>
                      <option>虚线</option>
                      <option>点线</option>
                      <option>无边框</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <!-- 操作按钮 -->
              <div class="pt-4 border-t border-gray-100">
                <div class="grid grid-cols-2 gap-2">
                  <button class="px-3 py-2 text-sm rounded-md bg-brand-purple text-white hover:bg-brand-purple/90 transition-colors">
                    应用更改
                  </button>
                  <button class="px-3 py-2 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                    重置
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.main-layout {
  font-family: theme('fontFamily.sans');
}

/* 平滑过渡效果 */
.smooth {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* 纸张阴影效果 */
.shadow-xl {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02);
}

/* 性能优化：启用GPU加速 */
.left-sidebar,
.right-sidebar,
.top-navigation {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15);
}

/* 打印模式优化 */
@media print {
  .main-layout {
    background: white !important;
  }
  
  .top-navigation,
  .left-sidebar,
  .right-sidebar,
  .bottom-status {
    display: none !important;
  }
}
</style>
