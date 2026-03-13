<script setup>
import { computed, ref, watch } from 'vue'
import { useCatalogStore } from '../../stores/index'
import A4Page from '../layout/A4Page.vue'

const store = useCatalogStore()
const props = defineProps({
  /** 年份 */
  year: {
    type: String,
    default: '2026'
  },
  
  /** 主标题 */
  mainTitle: {
    type: String,
    default: '雅洁五金'
  },
  
  /** 英文品牌名 */
  englishBrand: {
    type: String,
    default: 'ARCHIE'
  },
  
  /** 副标题 */
  subtitle: {
    type: String,
    default: '工程产品手册'
  },
  
  /** 英文副标题 */
  englishSubtitle: {
    type: String,
    default: 'ENGINEERING SOLUTIONS'
  },
  
  /** 背景渐变颜色 */
  backgroundGradient: {
    type: String,
    default: 'radial-gradient(circle at 50% 30%, #644B8E 0%, #2A1A40 100%)'
  },
  
  /** 水印文本 */
  watermarkText: {
    type: String,
    default: 'ARCHIE'
  },
  
  /** 是否显示裁切线 */
  showCropMarks: {
    type: Boolean,
    default: true
  },
  
  /** 是否显示装饰背景 */
  showDecoration: {
    type: Boolean,
    default: true
  },
  
  /** 页面索引（用于更新store） */
  pageIndex: {
    type: Number,
    default: -1
  }
})

// 本地编辑状态
const localProps = ref({
  year: props.year,
  mainTitle: props.mainTitle,
  englishBrand: props.englishBrand,
  subtitle: props.subtitle,
  englishSubtitle: props.englishSubtitle,
  watermarkText: props.watermarkText
})

// 调试日志
console.log('CatalogCover.vue - props received:', props)

// 是否处于编辑模式
const isEditing = ref(false)

// 封面样式
const coverStyle = computed(() => ({
  background: props.backgroundGradient
}))

// 水印样式
const watermarkStyle = computed(() => ({
  opacity: 0.04
}))

// 监听props变化，更新本地状态
watch(() => props, (newProps) => {
  localProps.value = {
    year: newProps.year,
    mainTitle: newProps.mainTitle,
    englishBrand: newProps.englishBrand,
    subtitle: newProps.subtitle,
    englishSubtitle: newProps.englishSubtitle,
    watermarkText: newProps.watermarkText
  }
}, { deep: true, immediate: true })

// 保存编辑内容到store
function saveEdit() {
  if (props.pageIndex >= 0) {
    store.updatePageData(props.pageIndex, {
      props: {
        ...store.pages[props.pageIndex]?.props || {},
        ...localProps.value
      }
    })
  }
  isEditing.value = false
}

// 取消编辑
function cancelEdit() {
  localProps.value = {
    year: props.year,
    mainTitle: props.mainTitle,
    englishBrand: props.englishBrand,
    subtitle: props.subtitle,
    englishSubtitle: props.englishSubtitle,
    watermarkText: props.watermarkText
  }
  isEditing.value = false
}

// 开始编辑
function startEdit() {
  isEditing.value = true
}
</script>

<template>
   <A4Page
    :isCover="true"
    :showHeader="false"
    :showFooter="false"
    :customClass="'cover-page'"
  >
      <!-- 编辑工具栏（仅在非打印模式且非编辑状态时显示） -->
      <div
        v-if="!store.printMode && !isEditing"
        class="absolute top-4 left-4 z-50 flex gap-2 no-print"
      >
        <button
          @click="startEdit"
          class="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-lg shadow-md text-xs font-medium hover:bg-white transition-all flex items-center gap-1.5 border border-gray-200"
          title="编辑封面内容"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          编辑
        </button>
      </div>

      <!-- 编辑模态框（编辑状态时显示） -->
      <div
        v-if="isEditing"
        class="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800">编辑封面内容</h3>
            <button @click="cancelEdit" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">中文品牌</label>
              <input
                v-model="localProps.mainTitle"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-archie-purple focus:border-transparent"
                placeholder="输入中文品牌名"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">英文品牌</label>
              <input
                v-model="localProps.englishBrand"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-archie-purple focus:border-transparent"
                placeholder="输入英文品牌名"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">年份</label>
              <input
                v-model="localProps.year"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-archie-purple focus:border-transparent"
                placeholder="输入年份"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">副标题</label>
              <input
                v-model="localProps.subtitle"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-archie-purple focus:border-transparent"
                placeholder="输入副标题"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">英文副标题</label>
              <input
                v-model="localProps.englishSubtitle"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-archie-purple focus:border-transparent"
                placeholder="输入英文副标题"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">水印文本</label>
              <input
                v-model="localProps.watermarkText"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-archie-purple focus:border-transparent"
                placeholder="输入水印文本"
              />
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button
              @click="cancelEdit"
              class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              取消
            </button>
            <button
              @click="saveEdit"
              class="flex-1 px-4 py-2.5 bg-brand-archie-purple text-white rounded-lg hover:bg-purple-700 transition font-medium"
            >
              保存更改
            </button>
          </div>
        </div>
      </div>

      <!-- 水印背景 (使用 main.css 中的 .cover-watermark) -->
      <div v-if="watermarkText" class="cover-watermark">
        {{ watermarkText }}
      </div>

      <!-- 裁切线 (使用 main.css 中的 .cover-crop-marks) -->
      <div v-if="showCropMarks" class="cover-crop-marks">
        <div class="crop-tl"></div>
        <div class="crop-tr"></div>
        <div class="crop-bl"></div>
        <div class="crop-br"></div>
      </div>

      <!-- 装饰背景 (SVG) - 使用 main.css 中的 .cover-sketch-bg -->
      <div v-if="showDecoration" class="cover-sketch-bg">
        <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" style="width: 110%; transform: rotate(-5deg);">
          <defs>
            <linearGradient id="modern-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#C5A87B"/>
              <stop offset="40%" stop-color="#9A805E"/>
              <stop offset="70%" stop-color="#5E4B35"/>
              <stop offset="100%" stop-color="#2A1E12"/>
            </linearGradient>
            <filter id="luxury-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="15" dy="25" stdDeviation="20" flood-color="#000000" flood-opacity="0.5"/>
            </filter>
          </defs>
          <g filter="url(#luxury-shadow)">
            <circle cx="150" cy="180" r="70" fill="url(#modern-gold)"/>
            <circle cx="150" cy="180" r="55" fill="none" stroke="#C5A87B" stroke-width="2" opacity="0.3"/>
            <circle cx="150" cy="180" r="30" fill="url(#modern-gold)"/>
            <circle cx="150" cy="180" r="18" fill="#111" opacity="0.8"/>
            <circle cx="150" cy="380" r="70" fill="url(#modern-gold)"/>
            <circle cx="150" cy="380" r="55" fill="none" stroke="#C5A87B" stroke-width="2" opacity="0.3"/>
            <circle cx="150" cy="368" r="12" fill="#111"/>
            <path d="M 143 368 L 138 398 C 138 405, 162 405, 162 398 L 157 368 Z" fill="#111"/>
            <path d="M 150 162 C 200 162, 280 165, 420 165 C 445 165, 455 175, 455 180 C 455 185, 445 195, 420 195 L 150 195 Z" fill="url(#modern-gold)"/>
            <path d="M 160 165 C 220 168, 300 168, 410 168" fill="none" stroke="#C5A87B" stroke-width="3" opacity="0.4"/>
          </g>
        </svg>
      </div>

      <!-- 封面主内容 (使用 main.css 中的样式类) -->
      <h2 class="en-brand">{{ englishBrand }}</h2>
      <h1 class="cn-brand">{{ mainTitle }}</h1>
      
      <!-- 金色分隔线 (完全匹配 HTML) -->
      <div style="width: 2px; height: 50mm; background-color: var(--archie-gold); margin: 15mm auto; box-shadow: 0 0 10px rgba(154,128,94,0.5);"></div>
      
      <!-- 年份标题 -->
      <div class="year">{{ year }} {{ subtitle }}</div>
      
       <!-- 英文副标题 -->
      <div style="font-size: 10px; letter-spacing: 5px; color: var(--archie-gold); margin-top: 15px; opacity: 0.8; white-space: nowrap;">
        {{ englishSubtitle }}
      </div>
  </A4Page>
</template>

<style scoped>
/* 
  封面页样式 - 主要样式已在 src/assets/main.css 中定义
  此处仅保留组件特定的覆盖样式
*/

/* 响应式调整 - 小屏设备 */
@media screen and (max-width: 768px) {
  :deep(.cn-brand) {
    font-size: 70px !important;
    letter-spacing: 16px !important;
    margin-left: 16px !important;
  }
  
  :deep(.en-brand) {
    font-size: 18px !important;
    letter-spacing: 12px !important;
  }
  
  :deep(.year) {
    font-size: 36px !important;
    letter-spacing: 10px !important;
  }
  
  :deep(.cover-watermark) {
    font-size: 120px !important;
    letter-spacing: 20px !important;
  }
}

@media screen and (max-width: 480px) {
  :deep(.cn-brand) {
    font-size: 50px !important;
    letter-spacing: 12px !important;
    margin-left: 12px !important;
  }
  
  :deep(.en-brand) {
    font-size: 14px !important;
    letter-spacing: 8px !important;
  }
  
  :deep(.year) {
    font-size: 28px !important;
    letter-spacing: 8px !important;
  }
  
  :deep(.cover-watermark) {
    font-size: 80px !important;
    letter-spacing: 15px !important;
  }
}
</style>
