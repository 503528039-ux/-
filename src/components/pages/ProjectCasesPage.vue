<script setup>
import { computed } from 'vue'
import { useCatalogStore } from '../../stores/index'
import A4Page from '../layout/A4Page.vue'
import EditableText from '../ui/EditableText.vue'
import ImageUploader from '../ui/ImageUploader.vue'

const props = defineProps({
  pageIndex: { type: Number, required: true }
})

const store = useCatalogStore()

const pageData = computed(() => store.pages[props.pageIndex] || {})
const displayTitle = computed(() => pageData.value.title || '筑造地标')
const displaySubtitle = computed(() => pageData.value.sub || pageData.value.subtitle || 'Engineering Cases')
const casesList = computed(() => pageData.value.items || [])
const hasData = computed(() => casesList.value.length > 0)
const totalPages = computed(() => store.pages.length)

// 页眉右上角统一标题
const headerTitle = computed(() => `2026 工程产品手册 / ${displayTitle.value}`)

const topCase = computed(() => casesList.value[0] || { image: '', category: 'COMMERCIAL COMPLEX', name: '上海中心大厦', en: 'Shanghai Tower' })
const bottomCase = computed(() => casesList.value[1] || { image: '', category: 'RESORT HOTEL', name: '三亚海棠湾洲际度假酒店', en: 'IHG Resort' })

function updateTitle(val) {
  const page = store.pages[props.pageIndex]
  if (page) page.title = val
}
function updateSubtitle(val) {
  const page = store.pages[props.pageIndex]
  if (page) { page.sub = val; page.subtitle = val }
}
function ensureItem(index) {
  const page = store.pages[props.pageIndex]
  if (!page) return
  if (!Array.isArray(page.items)) page.items = []
  while (page.items.length <= index) {
    page.items.push({ id: `auto-${page.items.length}`, category: '', name: '', en: '', image: '' })
  }
}
function updateCaseImage(index, src) {
  ensureItem(index)
  const page = store.pages[props.pageIndex]
  if (page?.items?.[index]) page.items[index].image = src
}
function updateCaseCategory(index, val) {
  ensureItem(index)
  const page = store.pages[props.pageIndex]
  if (page?.items?.[index]) page.items[index].category = val
}
function updateCaseName(index, val) {
  ensureItem(index)
  const page = store.pages[props.pageIndex]
  if (page?.items?.[index]) { page.items[index].name = val; page.items[index].title = val }
}
function updateCaseEn(index, val) {
  ensureItem(index)
  const page = store.pages[props.pageIndex]
  if (page?.items?.[index]) { page.items[index].en = val; page.items[index].enTitle = val }
}
</script>

<template>
  <A4Page
    :page-title="headerTitle"
    :page-number="props.pageIndex + 1"
    :total-pages="totalPages"
    :showHeader="true"
    :showFooter="true"
  >
    <div class="content-section-header">
      <EditableText tag="h2" className="section-title" :value="displayTitle" @update:value="updateTitle" />
      <EditableText tag="p" className="section-subtitle" :value="displaySubtitle" @update:value="updateSubtitle" />
    </div>

    <div v-if="hasData" class="cases-container">
      <!-- 上半案例 -->
      <div class="case-item">
        <div class="case-image-box">
          <img v-if="topCase.image" :src="topCase.image" class="case-img" alt="工程案例图片" />
          <div v-else class="case-placeholder">
            <div class="placeholder-icon">🏗️</div>
            <div class="placeholder-text">案例图待上传</div>
          </div>
          <ImageUploader @update:src="(src) => updateCaseImage(0, src)" />
          <div class="case-overlay"></div>
        </div>
        <div class="case-caption">
          <EditableText tag="span" className="case-category" :value="topCase.category || ''" @update:value="(v) => updateCaseCategory(0, v)" />
          <EditableText tag="h3" className="case-title-cn" :value="topCase.name || ''" @update:value="(v) => updateCaseName(0, v)" />
          <EditableText tag="p" className="case-title-en" :value="topCase.en || topCase.enTitle || ''" @update:value="(v) => updateCaseEn(0, v)" />
        </div>
      </div>

      <!-- 下半案例 -->
      <div class="case-item">
        <div class="case-image-box">
          <img v-if="bottomCase.image" :src="bottomCase.image" class="case-img" alt="工程案例图片" />
          <div v-else class="case-placeholder">
            <div class="placeholder-icon">🏨</div>
            <div class="placeholder-text">案例图待上传</div>
          </div>
          <ImageUploader @update:src="(src) => updateCaseImage(1, src)" />
          <div class="case-overlay"></div>
        </div>
        <div class="case-caption">
          <EditableText tag="span" className="case-category" :value="bottomCase.category || ''" @update:value="(v) => updateCaseCategory(1, v)" />
          <EditableText tag="h3" className="case-title-cn" :value="bottomCase.name || ''" @update:value="(v) => updateCaseName(1, v)" />
          <EditableText tag="p" className="case-title-en" :value="bottomCase.en || bottomCase.enTitle || ''" @update:value="(v) => updateCaseEn(1, v)" />
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">🏗️</div>
      <p class="empty-text">暂无工程案例数据</p>
      <p class="empty-hint">请在侧边栏添加工程案例项或从 Excel 导入</p>
    </div>
  </A4Page>
</template>

<style scoped>
.content-section-header {
  padding: 0 var(--size-page-padding);
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-archie-purple);
  margin-bottom: var(--spacing-xs);
  letter-spacing: 2px;
}

.section-subtitle {
  font-size: 14px;
  color: var(--color-archie-gold);
  margin-bottom: 0;
  letter-spacing: 1px;
  font-weight: 500;
}

.cases-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: calc(var(--size-page-padding) * -1);
  margin-right: calc(var(--size-page-padding) * -1);
  gap: 0;
}

.case-item {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.case-image-box {
  width: 100%;
  height: 100%;
  position: relative;
}

.case-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.case-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
  pointer-events: none;
}

.case-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15mm;
  z-index: 2;
}

.case-category {
  display: block;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 2px;
  color: var(--color-archie-gold);
  text-transform: uppercase;
  margin-bottom: 6px;
}

.case-title-cn {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.case-title-en {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-family: 'Inter', sans-serif;
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px;
  gap: 16px;
  background-color: #f8f8fa;
  border-radius: 12px;
  border: 2px dashed #e5e5e7;
  margin: 40px;
  flex: 1;
}

.empty-icon { font-size: 64px; opacity: 0.5; }
.empty-text { font-size: 20px; font-weight: 600; color: #1d1d1f; }
.empty-hint { font-size: 14px; color: #86868b; }

.case-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #E8E8EA 0%, #2C2C2C 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.placeholder-icon { font-size: 40px; opacity: 0.3; }
.placeholder-text { font-size: 12px; color: #86868b; }

@media print {
  .cases-container { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .empty-state { display: none; }
}
</style>
