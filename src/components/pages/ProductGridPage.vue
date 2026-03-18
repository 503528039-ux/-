<script setup lang="ts">
/**
 * ProductGridPage.vue - 六宫格产品展示页
 *
 * 基于 CLAUDE.md 规范和 页面代码.txt 样式
 *
 * 功能：
 * - 数据驱动：通过 pageId 自动获取产品和页面信息
 * - 布局：2 列 × 3 行网格，8mm 间距
 * - 健壮性：支持不足 6 个产品的情况
 */
import { computed } from 'vue'
import { useCatalogStore } from '../../stores/index'
import A4Page from '../layout/A4Page.vue'
import ProductCard from '../ProductCard.vue'

// ===== Props 定义 =====
const props = defineProps<{
  /** 页面在 store.pages 中的索引 */
  pageIndex: number
}>()

// ===== Store 初始化 =====
const store = useCatalogStore()

// ===== 计算属性 =====

/** 当前页面数据 */
const pageData = computed(() => {
  return store.pages[props.pageIndex] || {}
})

/** 产品列表 */
const productsList = computed(() => {
  return pageData.value.items || []
})

/** 页面标题（用于页眉） */
const displayTitle = computed(() => {
  const title = pageData.value.title || '门锁五金系列'
  const subtitle = pageData.value.sub || pageData.value.subtitle || ''
  
  return subtitle 
    ? `2026 工程产品手册 / ${title} (${subtitle})`
    : `2026 工程产品手册 / ${title}`
})

/** 总页数 */
const totalPages = computed(() => {
  return store.pages.length
})

/** 是否有产品数据 */
const hasProducts = computed(() => {
  return productsList.value.length > 0
})
</script>

<template>
  <A4Page
    :page-title="displayTitle"
    :page-number="props.pageIndex + 1"
    :total-pages="totalPages"
  >
    <!-- ===== 六宫格产品网格 ===== -->
    <div v-if="hasProducts" class="grid-6">
      <ProductCard
        v-for="(product, idx) in productsList"
        :key="product.id || idx"
        :data="product"
        :page-index="props.pageIndex"
        :product-index="idx"
      />
    </div>

    <!-- ===== 空状态 (优雅展示) ===== -->
    <div v-else class="empty-state">
      <div class="empty-icon">🔒</div>
      <p class="empty-text">暂无产品数据</p>
      <p class="empty-hint">您可以从侧边栏导入 Excel 或手动添加产品</p>
    </div>
  </A4Page>
</template>

<style scoped>
/* 
  产品网格页样式 - 主要样式已在 src/assets/main.css 中定义
*/

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
