<script setup lang="ts">
/**
 * ProductGridPage.vue - 六宫格产品展示页（无线图）
 * 固定 6 槽；删除仅标记 deleted + 清空，不 splice，网格位置不变。
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

const props = defineProps<{
  pageIndex: number
}>()

const store = useCatalogStore()

const pageData = computed(() => store.pages[props.pageIndex] || {})

const productsList = computed(() => {
  const page = pageData.value as Record<string, unknown>
  if (!page) return []
  if (!Array.isArray(page.items)) page.items = []
  const items = page.items as Record<string, unknown>[]
  while (items.length < MAX_PRODUCT_GRID) {
    items.push(createDefaultProductItemForPage(page, { composite: false }))
  }
  return items.slice(0, MAX_PRODUCT_GRID)
})

const filledProductCount = computed(
  () => productsList.value.filter((p) => isProductSlotFilled(p as Record<string, unknown>)).length
)

const canAddProduct = computed(() => filledProductCount.value < MAX_PRODUCT_GRID)

const hasGridInPrint = computed(() => filledProductCount.value > 0)

/** 与复合页一致：按品类页眉（不区分无线/有线） */
const displayTitle = computed(() =>
  getProductPageHeaderTitle(pageData.value as Record<string, unknown>)
)

const totalPages = computed(() => store.pages.length)

function addProductCell() {
  const page = store.pages[props.pageIndex] as Record<string, unknown> | undefined
  if (!page || store.printMode) return
  if (!Array.isArray(page.items)) page.items = []
  const sub = (page.subType as string) || 'lock'

  for (let i = 0; i < MAX_PRODUCT_GRID; i++) {
    const it = page.items[i] as { deleted?: boolean } | undefined
    if (it?.deleted) {
      page.items[i] = resetProductSlot(it, sub, { composite: false })
      return
    }
  }
  for (let i = 0; i < MAX_PRODUCT_GRID; i++) {
    if (!isProductSlotFilled(page.items[i] as Record<string, unknown>)) {
      const prev = page.items[i]
      page.items[i] = resetProductSlot(prev || {}, sub, { composite: false })
      return
    }
  }
}

function removeProductCell(index: number) {
  const page = store.pages[props.pageIndex] as Record<string, unknown> | undefined
  if (!page?.items || !Array.isArray(page.items)) return
  if (index < 0 || index >= MAX_PRODUCT_GRID) return
  const prev = page.items[index]
  if (!prev) return
  const sub = (page.subType as string) || 'lock'
  page.items[index] = clearedProductSlot(prev, sub, { composite: false })
}
</script>

<template>
  <A4Page
    :page-index="props.pageIndex"
    :page-title="displayTitle"
    :page-number="props.pageIndex + 1"
    :total-pages="totalPages"
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
        :key="'product-slot-' + idx"
        :data="product as any"
        :page-index="props.pageIndex"
        :product-index="idx"
        :request-remove="() => removeProductCell(idx)"
      />
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">🔒</div>
      <p class="empty-text">暂无产品数据</p>
      <p class="empty-hint">您可以从侧边栏导入 Excel 或手动添加产品</p>
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
