<script setup>
/**
 * 复合图解页：固定 6 槽，删除不占位重排（deleted 占位）
 */
import { computed } from 'vue'
import { useCatalogStore } from '../../stores/index'
import {
  MAX_PRODUCT_GRID,
  createDefaultProductItemForPage,
  clearedProductSlot,
  resetProductSlot,
  isProductSlotFilled
} from '../../utils/productGridItems'
import { getProductPageHeaderTitle } from '../../utils/productPageHeaderTitle'
import A4Page from '../layout/A4Page.vue'
import ProductCard from '../ProductCard.vue'

const props = defineProps({
  pageIndex: { type: Number, required: true }
})

const store = useCatalogStore()

const pageData = computed(() => store.pages[props.pageIndex] || {})

const productsList = computed(() => {
  const page = pageData.value
  if (!page) return []
  if (!Array.isArray(page.items)) page.items = []
  while (page.items.length < MAX_PRODUCT_GRID) {
    page.items.push(createDefaultProductItemForPage(page, { composite: true }))
  }
  return page.items.slice(0, MAX_PRODUCT_GRID)
})

const filledProductCount = computed(() => productsList.value.filter((p) => isProductSlotFilled(p)).length)
const canAddProduct = computed(() => filledProductCount.value < MAX_PRODUCT_GRID)
const hasGridInPrint = computed(() => filledProductCount.value > 0)

/** 与六宫格页一致：按品类页眉（不区分无线/有线） */
const displayTitle = computed(() => getProductPageHeaderTitle(pageData.value))

function addProductCell() {
  const page = store.pages[props.pageIndex]
  if (!page || store.printMode) return
  if (!Array.isArray(page.items)) page.items = []
  const sub = page.subType || 'lock'

  for (let i = 0; i < MAX_PRODUCT_GRID; i++) {
    if (page.items[i]?.deleted) {
      page.items[i] = resetProductSlot(page.items[i], sub, { composite: true })
      return
    }
  }
  for (let i = 0; i < MAX_PRODUCT_GRID; i++) {
    if (!isProductSlotFilled(page.items[i])) {
      page.items[i] = resetProductSlot(page.items[i] || {}, sub, { composite: true })
      return
    }
  }
}

function removeProductCell(index) {
  const page = store.pages[props.pageIndex]
  if (!page?.items || !Array.isArray(page.items)) return
  if (index < 0 || index >= MAX_PRODUCT_GRID) return
  const prev = page.items[index]
  if (!prev) return
  const sub = page.subType || 'lock'
  page.items[index] = clearedProductSlot(prev, sub, { composite: true })
}
</script>

<template>
  <A4Page
    :custom-class="'composite-mode'"
    :page-index="props.pageIndex"
    :page-title="displayTitle"
    :page-number="props.pageIndex + 1"
  >
    <div
      v-if="!store.printMode"
      class="products-add-row"
      :class="{ 'products-add-row--hidden': !canAddProduct }"
    >
      <button type="button" class="products-add-btn" @click.stop="addProductCell">新增一格</button>
    </div>

    <div v-if="!store.printMode || hasGridInPrint" class="grid-6">
      <ProductCard
        v-for="(product, idx) in productsList"
        :key="'composite-product-slot-' + idx"
        :data="product"
        :force-composite="true"
        :page-index="props.pageIndex"
        :product-index="idx"
        :request-remove="() => removeProductCell(idx)"
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
.products-add-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 5mm;
}

.products-add-row--hidden {
  visibility: hidden;
  pointer-events: none;
}

.products-add-btn {
  border: none;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(94, 69, 133, 0.12);
  color: var(--archie-purple, #5e4585);
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

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
