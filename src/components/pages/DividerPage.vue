<script setup>
import A4Page from '../layout/A4Page.vue'
import { computed } from 'vue'
import { useCatalogStore } from '../../stores/index'
import EditableText from '../ui/EditableText.vue'

const props = defineProps({
  pageIndex: {
    type: Number,
    required: true
  }
})

const store = useCatalogStore()

const pageData = computed(() => {
  return store.pages[props.pageIndex] || {}
})

const dividerNumber = computed(() => {
  return pageData.value.pageNumber || pageData.value.dividerNumber || '06'
})

const dividerText = computed(() => {
  return pageData.value.title || '智能门控'
})

const dividerDescription = computed(() => {
  return pageData.value.sub || pageData.value.subtitle || 'SMART HARDWARE COLLECTION'
})

function updateDividerText(val) {
  if (!pageData.value) return
  pageData.value.title = val
}

function updateDividerDescription(val) {
  if (!pageData.value) return
  pageData.value.sub = val
  pageData.value.subtitle = val
}

function updateDividerNumber(val) {
  if (!pageData.value) return
  pageData.value.pageNumber = val
}
</script>

<template>
  <!-- 过渡页：全紫色背景，无页眉页脚，直接使用绝对定位包裹整页 -->
  <A4Page :showHeader="false" :showFooter="false">
    <div class="divider-wrapper">
      <!-- 超大透明数字背景 -->
      <EditableText tag="div" className="divider-number" :value="String(dividerNumber)" @update:value="updateDividerNumber" />

      <!-- 主标题 -->
      <EditableText tag="h2" :value="dividerText" @update:value="updateDividerText" />

      <!-- 副标题 -->
      <EditableText tag="p" :value="dividerDescription" @update:value="updateDividerDescription" />

      <!-- 装饰线（在标题之后） -->
      <div class="divider-line"></div>
    </div>
  </A4Page>
</template>

<style scoped>
/* 过渡页：全页覆盖紫色背景，撑满 page-content */
.divider-wrapper {
  /* 撑满父容器 page-content（flex-grow:1） */
  flex: 1;
  /* 自身向外扩展，抵消 page-content 的 0 15mm padding */
  margin: 0 -15mm;
  padding-left: 30mm;
  background-color: #5E4585; /* --color-archie-purple */
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.divider-number {
  font-size: 450px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.04);
  position: absolute;
  bottom: -40mm;
  right: -25mm;
  line-height: 0.8;
  font-family: 'Inter', sans-serif;
  z-index: 1;
  pointer-events: none;
}

h2 {
  color: #fff;
  font-size: 56px;
  letter-spacing: 8px;
  margin-bottom: 15px;
  position: relative;
  z-index: 2;
  font-family: 'Noto Serif SC', serif;
  font-weight: 700;
}

p {
  color: #9A805E; /* --color-archie-gold */
  font-size: 14px;
  letter-spacing: 4px;
  position: relative;
  z-index: 2;
  margin: 0;
}

.divider-line {
  width: 80px;
  height: 1.5px;
  background-color: #9A805E; /* --color-archie-gold */
  margin-top: 40px;
  position: relative;
  z-index: 2;
}

/* 打印优化 */
@media print {
  .divider-wrapper {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
