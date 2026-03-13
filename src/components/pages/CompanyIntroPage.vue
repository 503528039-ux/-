<script setup>
import { computed } from 'vue'
import { useCatalogStore } from '../../stores/index'
import A4Page from '../layout/A4Page.vue'

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

const headerTitle = computed(() => {
  return `2026 工程产品手册 / 公司概况`
})

const heroSrc = computed(() => {
  return pageData.value.heroImage || 'https://placehold.co/800x400/E5E5EA/86868B?text=%5B%2B%E9%9B%85%E6%B4%81%E5%B7%A5%E4%B8%9A%E5%9B%AD%E5%A4%96%E8%A7%82%2B%5D'
})
</script>

<template>
  <A4Page
    :page-title="headerTitle"
    :page-number="props.pageIndex + 1"
    :showHeader="true"
    :showFooter="true"
  >
    <h2 class="section-title">{{ pageData.title || '品牌故事' }}</h2>
    <div class="section-subtitle">{{ pageData.sub || 'Company Profile' }}</div>

    <div class="hero-img">
      <img :src="heroSrc" alt="雅洁工业园外观">
    </div>

    <div class="text-cols" style="white-space: pre-line;">
      {{ pageData.story || '' }}
    </div>
  </A4Page>
</template>
