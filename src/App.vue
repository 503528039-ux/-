<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { scrollCatalogPageToIndex } from './utils/catalogPageScroll.js'
import { useCatalogStore } from './stores/index'
import TheSidebar from './components/TheSidebar.vue'
import draggable from 'vuedraggable'

// 导入所有页面模板组件
import CatalogCover from './components/pages/CatalogCover.vue'
import CompositeProductPage from './components/pages/CompositeProductPage.vue'
import CompanyIntroPage from './components/pages/CompanyIntroPage.vue'
import CertificatesPage from './components/pages/CertificatesPage.vue'
import PartnersPage from './components/pages/PartnersPage.vue'
import SurfaceFinishesPage from './components/pages/SurfaceFinishesPage.vue'
import DividerPage from './components/pages/DividerPage.vue'
import TableOfContentsPage from './components/pages/TableOfContentsPage.vue'
import ProjectCasesPage from './components/pages/ProjectCasesPage.vue'
import ProductGridPage from './components/pages/ProductGridPage.vue'
import BackCoverPage from './components/pages/BackCoverPage.vue'
import FreePage from './components/pages/FreePage.vue'

// 导入布局组件
import A4Page from './components/layout/A4Page.vue'
import PageHeader from './components/layout/PageHeader.vue'
import PageFooter from './components/layout/PageFooter.vue'

const store = useCatalogStore()

/** 全局拖放占位（避免未定义） */
function handleGlobalDrop(_e) {
  /* 可后续接入批量导入 */
}

const gotoPageInput = ref('')
const gotoPageError = ref('')

function scrollToPageFromInput() {
  gotoPageError.value = ''
  const r = scrollCatalogPageToIndex(gotoPageInput.value, store.pages.length)
  if (!r.ok) {
    gotoPageError.value = r.message || '跳转失败'
    return
  }
}

/** 将指定页移到输入的目标顺序（1-based，与「第 N 页」一致） */
function applyPageOrder(pageId) {
  const fromIndex = store.pages.findIndex((p) => p.id === pageId)
  if (fromIndex < 0) return
  const el = document.getElementById('page-order-input-' + pageId)
  if (!el) return
  const raw = el.value
  el.value = ''
  store.movePageToOneBasedPosition(fromIndex, raw)
}

// 页面类型到组件的映射 - 基于最新页面代码.html设计规范
const pageComponents = {
  // 最新页面代码中的13个标准页面模板
  'cover': CatalogCover,                    // PAGE 01: 封面页
  'companyIntro': CompanyIntroPage,         // PAGE 02: 公司简介页
  'certificates': CertificatesPage,         // PAGE 03: 荣誉资质页 (4×2网格)
  'partners': PartnersPage,                 // PAGE 04: 战略合作伙伴页 (3×5网格)
  'projectCases': ProjectCasesPage,         // PAGE 05: 工程案例页 (3×3网格)
  'surfaceFinishes': SurfaceFinishesPage,   // PAGE 06: 表面处理页 (6×6网格)
  'tableOfContents': TableOfContentsPage,   // PAGE 07: 目录页
  'divider': DividerPage,                   // PAGE 08: 过渡页
  'product': ProductGridPage,               // PAGE 09: 门锁五金实拍页 (2×3网格)
  'productGrid': ProductGridPage,           // PAGE 10: 工程小五金实拍页 (2×3网格)
  'compositeProduct': CompositeProductPage, // PAGE 11/12: 复合产品页 (实拍+线图)
  'backCover': BackCoverPage,               // PAGE 13: 封底页
  
  // 特殊页面类型
  'free': FreePage                          // 自由编辑页 (非标准页面)
}

// 获取组件类型
const getComponentType = (pageType) => {
  const component = pageComponents[pageType]
  console.log('App.vue - getComponentType:', 'pageType:', pageType, 'mapped to:', component || 'CatalogCover (default)')
  
  if (!component) {
    console.error('App.vue - ERROR: No component found for pageType:', pageType, 'Available keys:', Object.keys(pageComponents))
  }
  
  return component || CatalogCover
}

// 获取页面props
const getPageProps = (page, index) => {
  // 对于所有遵循新架构的组件，只需要传递 pageIndex
  // 组件内部会通过 useCatalogStore 获取对应索引的数据
  return {
    pageIndex: index
  }
}

// 初始化：如果store为空，不再手动添加，store 内部已处理默认封面
onMounted(() => {
  // if (store.pages.length === 0) {
  //   store.addPage('cover')
  // }
})

// 键盘快捷键
const handleKeydown = (e) => { 
  if((e.ctrlKey||e.metaKey)) {
    if(e.key==='z') { e.preventDefault(); store.undo(); }
    if(e.key==='y') { e.preventDefault(); store.redo(); }
  }
}
onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="min-h-screen bg-[#f5f5f7] py-10 flex flex-col items-center gap-8 print:bg-white print:p-0"
       @dragover.prevent
       @drop.prevent="handleGlobalDrop($event, null, null)">
    
    <TheSidebar />

    <!-- 左侧固定：批量选页 + 页码跳转 -->
    <div
      v-if="!store.printMode && store.pages.length > 0"
      class="fixed left-4 top-24 z-[60] flex flex-col gap-2 no-print"
    >
      <button
        type="button"
        class="px-3 py-2 rounded-full bg-white border-2 border-[#5e4585] text-[#5e4585] text-xs font-bold shadow-lg hover:bg-[#f5f3fa]"
        @click="store.batchSelectMode = !store.batchSelectMode"
      >
        {{ store.batchSelectMode ? '退出批量' : '批量选页' }}
      </button>
      <div class="w-[148px] rounded-xl bg-white/95 border border-gray-200 shadow-md p-2">
        <div class="text-[10px] font-semibold text-gray-600 mb-1">跳转页码</div>
        <div class="flex gap-1 items-center">
          <input
            v-model="gotoPageInput"
            type="number"
            min="1"
            :max="store.pages.length"
            placeholder="1"
            class="w-14 min-w-0 px-1.5 py-1 text-sm border border-gray-200 rounded"
            @keyup.enter="scrollToPageFromInput"
          >
          <button
            type="button"
            class="shrink-0 px-2 py-1 text-[11px] font-semibold bg-[#5e4585] text-white rounded hover:opacity-90"
            @click="scrollToPageFromInput"
          >
            跳转
          </button>
        </div>
        <p v-if="gotoPageError" class="text-[10px] text-red-500 mt-1 leading-tight">{{ gotoPageError }}</p>
      </div>
    </div>
    
    <!-- 空状态提示 -->
    <div v-if="!store.printMode && store.pages.length === 0" class="w-full max-w-4xl mx-auto mb-12 p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 text-center">
      <div class="text-6xl mb-4">📚</div>
      <h3 class="text-2xl font-bold text-gray-800 mb-2">雅洁五金2026工程图册</h3>
      <p class="text-gray-600 mb-6">点击侧边栏按钮添加页面，开始创建您的专业图册</p>
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-brand-archie-purple text-white rounded-lg">
        <span>🎨</span>
        <span>已创建 11 种专业页面模板</span>
      </div>
    </div>
    
    <!-- 动态页面渲染 -->
    <draggable 
      v-model="store.pages" 
      item-key="id" 
      handle=".drag-handle" 
      class="flex flex-col gap-10 print:block print:gap-0" 
      @end="store.recordDragEnd()"
    >
       <template #item="{ element: page, index }">
        <div
            :id="'catalog-page-' + (index + 1)"
            class="page-outer-wrapper relative group print:shadow-none print:m-0 overflow-hidden flex flex-col mx-auto transition-all duration-300"
             :class="page.type === 'cover' ? 'shadow-xl' : 'bg-white shadow-xl'"
             :style="{ width: page.width + 'mm', height: page.height + 'mm' }"
        >
          
          <!-- 批量勾选 -->
          <label
            v-if="!store.printMode && store.batchSelectMode"
            class="absolute top-4 left-4 z-[60] flex items-center gap-2 no-print cursor-pointer select-none bg-white/90 rounded-full px-2 py-1 shadow border border-gray-200"
            @click.stop
          >
            <input
              type="checkbox"
              class="rounded border-gray-400"
              :checked="store.isBatchPageSelected(page.id)"
              @change="store.setBatchPageSelected(page.id, $event.target.checked)"
            />
            <span class="text-xs text-gray-600">第 {{ index + 1 }} 页</span>
          </label>

          <!-- 页面操作工具栏 -->
          <div v-if="!store.printMode" class="absolute top-4 -right-12 group-hover:right-4 transition-all duration-300 flex flex-col gap-2 no-print z-50">
            <div class="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-xs font-bold">{{ index + 1 }}</div>
            <button class="drag-handle w-8 h-8 bg-blue-500 text-white rounded-full shadow flex items-center justify-center cursor-move">✥</button>
            <button @click="store.movePage(index, -1)" class="w-8 h-8 bg-white text-gray-600 rounded-full shadow flex items-center justify-center hover:bg-gray-50">↑</button>
            <button @click="store.movePage(index, 1)" class="w-8 h-8 bg-white text-gray-600 rounded-full shadow flex items-center justify-center hover:bg-gray-50">↓</button>
            <button @click="store.removePage(index)" class="w-8 h-8 bg-white text-red-500 border border-red-200 rounded-full shadow flex items-center justify-center hover:bg-red-50">×</button>
            <div class="mt-1 pt-1.5 border-t border-gray-100 flex flex-col items-center gap-0.5 w-10">
              <span class="text-[8px] text-gray-400 text-center leading-tight">移到第</span>
              <input
                :id="'page-order-input-' + page.id"
                type="number"
                :min="1"
                :max="store.pages.length"
                class="w-9 h-7 text-center text-[10px] border border-gray-200 rounded tabular-nums"
                :placeholder="String(index + 1)"
                @keyup.enter="applyPageOrder(page.id)"
              >
              <button
                type="button"
                class="w-9 h-6 text-[9px] font-semibold bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-700"
                title="移动到该序号"
                @click="applyPageOrder(page.id)"
              >
                移动
              </button>
            </div>
          </div>
          
          <!-- 动态组件渲染 -->
          <component
            :is="getComponentType(page.type)"
            v-bind="getPageProps(page, index)"
            class="h-full"
          />
          
        </div>
      </template>
    </draggable>
    
    <!-- 打印模式退出按钮 -->
    <button v-if="store.printMode" @click="store.printMode=false" class="fixed top-5 right-5 z-50 bg-white px-6 py-2 rounded-full shadow font-bold hover:bg-gray-50 no-print">退出预览</button>
    
  </div>
</template>

<style scoped>
.page-outer-wrapper {
  width: 210mm;
  height: 297mm;
}

@media print {
  .page-outer-wrapper {
    margin: 0;
    box-shadow: none;
    /* 不加 break-after，避免与内层 A4Page 的 page-break-after 叠加产生空白页 */
  }

  .no-print {
    display: none !important;
  }
}
</style>
