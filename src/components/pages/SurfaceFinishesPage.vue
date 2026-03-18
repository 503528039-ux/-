<script setup>
import { computed } from 'vue'
import { useCatalogStore } from '../../stores/index'
import A4Page from '../layout/A4Page.vue'
import EditableText from '../ui/EditableText.vue'

const props = defineProps({
  pageIndex: { type: Number, required: true }
})

const store = useCatalogStore()
const pageData = computed(() => store.pages[props.pageIndex] || {})

const displayTitle = computed(() => pageData.value.title || '质感美学')
const displaySubtitle = computed(() => pageData.value.sub || pageData.value.subtitle || 'Surface Finishes')
const headerTitle = '2026 工程产品手册 / 表面处理工艺'
const totalPages = computed(() => store.pages.length)

const intro = computed(
  () =>
    pageData.value.intro ||
    '雅洁五金拥有行业顶级的无尘电镀及 PVD 真空镀膜生产线。通过数十道严苛的表面处理工艺，为五金产品赋予极具层次感的光影美学。'
)

const finishes = computed(() => pageData.value.items || [])

function updateTitle(val) {
  const page = store.pages[props.pageIndex]
  if (page) page.title = val
}

function updateSubtitle(val) {
  const page = store.pages[props.pageIndex]
  if (page) {
    page.sub = val
    page.subtitle = val
  }
}
</script>

<template>
  <A4Page
    :page-title="headerTitle"
    :page-number="props.pageIndex + 1"
    :total-pages="totalPages"
    :show-header="true"
    :show-footer="true"
  >
    <EditableText tag="h2" class="section-title" :value="displayTitle" @update:value="updateTitle" />
    <EditableText tag="div" class="section-subtitle" :value="displaySubtitle" @update:value="updateSubtitle" />

    <p class="finishes-intro-p">{{ intro }}</p>

    <div v-if="finishes.length" class="grid-finishes">
      <div v-for="finish in finishes" :key="finish.id" class="finish-item">
        <div
          class="finish-swatch"
          :class="finish.colorClass || 'swatch-pvd'"
        />
        <div class="finish-name">{{ finish.name }}</div>
        <div class="finish-en">{{ finish.en || finish.enName }}</div>
      </div>
    </div>

    <div v-else class="empty-finishes">暂无表面处理数据，请重新插入该页或从模板恢复。</div>
  </A4Page>
</template>

<style scoped>
.finishes-intro-p {
  font-size: 12px;
  line-height: 1.8;
  margin: 0 0 8mm 0;
  max-width: 90%;
  color: var(--text-dark, #1d1d1f);
}

.empty-finishes {
  margin-top: 20mm;
  padding: 16px;
  text-align: center;
  color: var(--text-gray, #86868b);
  font-size: 13px;
}

/* grid-finishes / finish-swatch / swatch-* 定义在 main.css，与 HTML PAGE 06 一致 */
</style>
