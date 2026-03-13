<script setup>
import A4Page from '../layout/A4Page.vue'
import ProductCard from '../ProductCard.vue'
import PageHeader from '../layout/PageHeader.vue'
import { useCatalogStore } from '../../stores/index'

const props = defineProps({
  pageData: {
    type: Object,
    required: true
  }
})

const store = useCatalogStore()

const removeProduct = (index) => {
  if (props.pageData.items) {
    props.pageData.items.splice(index, 1)
  }
}
</script>

<template>
  <A4Page :page-number="pageData.pageNumber">
    <PageHeader :title="pageData.title || '产品系列'" :subtitle="pageData.sub || 'COMPOSITE SERIES'" />
    
    <div class="product-grid">
      <ProductCard 
        v-for="(product, index) in pageData.items" 
        :key="product.id"
        :product="product"
        :item-index="index"
        :is-composite="true"
        @remove="removeProduct(index)"
      />
    </div>
  </A4Page>
</template>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(3, 1fr);
  gap: 8mm;
  flex-grow: 1;
  padding-bottom: 5mm;
}
</style>
