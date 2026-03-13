<script setup>
import { computed } from 'vue'
import A4Page from '../layout/A4Page.vue'
import { useCatalogStore } from '../../stores/index'

const props = defineProps({
  /** 页面在 store.pages 中的索引 */
  pageIndex: {
    type: Number,
    required: true
  }
})

const store = useCatalogStore()

/** 当前页面数据 */
const pageData = computed(() => {
  return store.pages[props.pageIndex] || {}
})

/** 是否有数据 */
const hasData = computed(() => {
  return (pageData.value.blocks && pageData.value.blocks.length > 0) || pageData.value.title
})
</script>

<template>
  <A4Page :page-number="props.pageIndex + 1">
    <div v-if="hasData" class="free-page-content">
      <h2 class="section-title">{{ pageData.title || '自由编辑页' }}</h2>
      <p class="section-subtitle">{{ pageData.sub || 'FREE LAYOUT' }}</p>
      
      <!-- 自由页内容区域 -->
      <div class="canvas-area">
        <div v-for="(block, index) in pageData.blocks" :key="block.id || index" class="absolute border border-dashed border-gray-200 p-2">
           <div v-if="block.type === 'txt'" v-html="block.val"></div>
           <img v-else-if="block.type === 'img'" :src="block.val" class="max-w-full h-auto">
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">🎨</div>
      <p class="empty-text">空白编辑页</p>
      <p class="empty-hint">您可以添加文本块、图片或拖拽元素到此处</p>
    </div>
  </A4Page>
</template>

<style scoped>
.free-page-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.section-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 28px;
  color: #5E4585;
  margin-bottom: 5px;
}

.section-subtitle {
  font-size: 11px;
  color: #9A805E;
  letter-spacing: 2px;
  margin-bottom: 15mm;
  text-transform: uppercase;
}

.canvas-area {
  flex-grow: 1;
  position: relative;
  border: 1px dashed #E5E5EA;
  border-radius: 8px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 16px;
  background-color: #f8f8fa;
  border-radius: 12px;
  margin: 20mm;
  border: 2px dashed #e5e5e7;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.empty-hint {
  font-size: 14px;
  color: #86868b;
  max-width: 200px;
  text-align: center;
}

@media print {
  .empty-state {
    display: none;
  }
}
</style>
