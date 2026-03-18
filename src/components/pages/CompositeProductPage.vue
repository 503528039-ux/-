<script setup>
import { computed } from 'vue'
import { useCatalogStore } from '../../stores/index'
import A4Page from '../layout/A4Page.vue'
import ProductCard from '../ProductCard.vue'

const props = defineProps({
  pageIndex: { type: Number, required: true }
})

const store = useCatalogStore()

const pageData = computed(() => store.pages[props.pageIndex] || {})
const productsList = computed(() => pageData.value.items || [])
const hasProducts = computed(() => productsList.value.length > 0)

const displayTitle = computed(() => {
  const title = pageData.value.title || '产品系列'
  const sub = pageData.value.sub || ''
  return sub
    ? `2026 工程产品手册 / ${title} (${sub})`
    : `2026 工程产品手册 / ${title}`
})
</script>

<template>
  <A4Page :page-title="displayTitle" :page-number="props.pageIndex + 1">
    <div v-if="hasProducts" class="grid-6">
      <ProductCard
        v-for="(product, idx) in productsList"
        :key="product.id || idx"
        :data="product"
        :page-index="props.pageIndex"
        :product-index="idx"
      />
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">🔄</div>
      <p class="empty-text">暂无复合产品数据</p>
      <p class="empty-hint">请从侧边栏新建页面，系统将自动填充示例数据</p>
    </div>
  </A4Page>
</template>

<style scoped>
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

.empty-icon { font-size: 48px; opacity: 0.5; }
.empty-text { font-size: 18px; font-weight: 600; color: #1d1d1f; }
.empty-hint { font-size: 14px; color: #86868b; max-width: 200px; text-align: center; }

@media print {
  .empty-state { display: none; }
}
</style>
