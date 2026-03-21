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
  <A4Page :page-index="props.pageIndex" :showHeader="false" :showFooter="false">
    <div class="divider-wrapper">
      <!-- 右下角金色线框角标（方案 A） -->
      <div class="divider-corner" aria-hidden="true"></div>

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

.divider-corner {
  position: absolute;
  right: 12mm;
  bottom: 12mm;
  width: 50mm;
  height: 50mm;
  opacity: 0.5;
  z-index: 1;
  pointer-events: none;
}

.divider-corner::before,
.divider-corner::after {
  content: "";
  position: absolute;
  inset: 0;
  border-color: rgba(154, 128, 94, 0.65);
  border-style: solid;
  border-width: 0;
}

/* 外层 L 角 */
.divider-corner::before {
  border-right-width: 2px;
  border-bottom-width: 2px;
  border-radius: 2px;
}

/* 内层 L 角（形成双线框层次） */
.divider-corner::after {
  inset: 7mm;
  border-right-width: 1.5px;
  border-bottom-width: 1.5px;
  border-radius: 2px;
  opacity: 0.75;
}

:deep(h2) {
  color: #fff;
  /* 再放大约 20%（相对 70px） */
  font-size: 84px;
  letter-spacing: 6px;
  margin-bottom: 15px;
  position: relative;
  z-index: 2;
  font-family: 'Noto Serif SC', serif;
  font-weight: 700;
}

:deep(p) {
  color: #9A805E; /* --color-archie-gold */
  font-size: 16px;
  letter-spacing: 3.5px;
  position: relative;
  z-index: 2;
  margin: 0;
}

.divider-line {
  width: 110px;
  height: 2px;
  background-color: #9A805E; /* --color-archie-gold */
  margin-top: 32px;
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
