<script setup>
import { computed } from 'vue'
import { useCatalogStore } from '../../stores/index'
import A4Page from '../layout/A4Page.vue'
import EditableText from '../ui/EditableText.vue'
import ImageUploader from '../ui/ImageUploader.vue'

const GRID_COUNT = 9

const props = defineProps({
  pageIndex: { type: Number, required: true }
})

const store = useCatalogStore()

const pageData = computed(() => store.pages[props.pageIndex] || {})
const displayTitle = computed(() => pageData.value.title || '筑造地标')
const displaySubtitle = computed(() => pageData.value.sub || pageData.value.subtitle || 'Engineering Cases')
const casesList = computed(() => pageData.value.items || [])
const totalPages = computed(() => store.pages.length)

/** 页眉与《最新页面代码.html》PAGE 05 一致 */
const headerTitle = '2026 工程产品手册 / 经典工程案例'

function caseAt(index) {
  return casesList.value[index] || null
}

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
function ensureItem(index) {
  const page = store.pages[props.pageIndex]
  if (!page) return
  if (!Array.isArray(page.items)) page.items = []
  while (page.items.length <= index) {
    page.items.push({
      id: `case-${page.items.length}-${Date.now()}`,
      category: '',
      name: '',
      en: '',
      image: '',
      scale: 1,
      opacity: 1,
      rotation: 0,
      fit: 'cover',
      position: '50% 50%'
    })
  }
}

function imageStyle(item) {
  if (!item) return {}
  const scale = item.scale ?? 1
  const rotation = item.rotation ?? 0
  const opacity = item.opacity ?? 1
  const fit = item.fit || 'cover'
  const position = item.position || '50% 50%'
  return {
    transform: `scale(${scale}) rotate(${rotation}deg)`,
    opacity,
    objectFit: fit,
    objectPosition: position
  }
}
function updateCaseImage(index, src) {
  ensureItem(index)
  const page = store.pages[props.pageIndex]
  if (!page?.items?.[index]) return
  page.items[index].image = src || ''
}
function updateCaseCategory(index, val) {
  ensureItem(index)
  const page = store.pages[props.pageIndex]
  if (page?.items?.[index]) page.items[index].category = val
}
function updateCaseName(index, val) {
  ensureItem(index)
  const page = store.pages[props.pageIndex]
  if (page?.items?.[index]) {
    page.items[index].name = val
    page.items[index].title = val
  }
}
function updateCaseEn(index, val) {
  ensureItem(index)
  const page = store.pages[props.pageIndex]
  if (page?.items?.[index]) {
    page.items[index].en = val
    page.items[index].enTitle = val
  }
}

function updateCaseScale(index, delta) {
  ensureItem(index)
  const page = store.pages[props.pageIndex]
  const item = page?.items?.[index]
  if (!item) return
  const next = (item.scale ?? 1) + delta
  item.scale = Math.min(1.5, Math.max(0.5, next))
}

function updateCaseRotation(index, delta) {
  ensureItem(index)
  const page = store.pages[props.pageIndex]
  const item = page?.items?.[index]
  if (!item) return
  item.rotation = ((item.rotation ?? 0) + delta) % 360
}

function updateCaseOpacity(index, delta) {
  ensureItem(index)
  const page = store.pages[props.pageIndex]
  const item = page?.items?.[index]
  if (!item) return
  const next = (item.opacity ?? 1) + delta
  item.opacity = Math.min(1, Math.max(0.4, next))
}

function cycleCaseFit(index) {
  ensureItem(index)
  const page = store.pages[props.pageIndex]
  const item = page?.items?.[index]
  if (!item) return
  const cur = item.fit || 'cover'
  const next = cur === 'cover' ? 'contain' : cur === 'contain' ? 'fill' : 'cover'
  item.fit = next
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

    <div class="grid-cases-3x3">
      <div
        v-for="idx in GRID_COUNT"
        :key="idx - 1"
        class="case-grid-cell"
      >
        <div class="case-grid-photo">
          <img
            v-if="caseAt(idx - 1)?.image"
            :src="caseAt(idx - 1).image"
            alt=""
            class="case-grid-img"
            :style="imageStyle(caseAt(idx - 1))"
          />
          <div v-else class="case-grid-placeholder">
            <span>上传案例图</span>
          </div>
          <ImageUploader
            :has-image="!!caseAt(idx - 1)?.image"
            @update:src="(src) => updateCaseImage(idx - 1, src)"
          />
          <div class="img-tools">
            <button type="button" @click.stop="updateCaseScale(idx - 1, 0.1)">＋</button>
            <button type="button" @click.stop="updateCaseScale(idx - 1, -0.1)">－</button>
            <button type="button" @click.stop="updateCaseRotation(idx - 1, -5)">↺</button>
            <button type="button" @click.stop="updateCaseRotation(idx - 1, 5)">↻</button>
            <button type="button" @click.stop="updateCaseOpacity(idx - 1, -0.1)">淡</button>
            <button type="button" @click.stop="updateCaseOpacity(idx - 1, 0.1)">浓</button>
            <button type="button" @click.stop="cycleCaseFit(idx - 1)">适配</button>
          </div>
        </div>
        <EditableText
          tag="h3"
          class-name="case-grid-title-cn"
          :value="caseAt(idx - 1)?.name || ''"
          @update:value="(v) => updateCaseName(idx - 1, v)"
        />
        <EditableText
          tag="p"
          class-name="case-grid-title-en"
          :value="caseAt(idx - 1)?.en || caseAt(idx - 1)?.enTitle || ''"
          @update:value="(v) => updateCaseEn(idx - 1, v)"
        />
      </div>
    </div>
  </A4Page>
</template>

<style scoped>
/* 收紧标题与网格的垂直间距，减少红框留白 */
:deep(.section-title) {
  margin-bottom: 3mm;
}

:deep(.section-subtitle) {
  margin-bottom: 5mm;
}

/* 与 HTML PAGE 05：3×3，gap 6mm 5mm，图高 60mm */
.grid-cases-3x3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 6mm 5mm;
  margin-top: 0;
  flex: 1;
  padding-bottom: 10mm;
  min-height: 0;
}

.case-grid-cell {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.case-grid-photo {
  width: 100%;
  height: 60mm;
  position: relative;
  overflow: hidden;
  /* 统一使用全局浅灰底色，而不是纯黑块 */
  background: var(--color-image-bg, #f5f5f7);
  margin-bottom: 6px;
}

.case-grid-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
}

.img-tools {
  position: absolute;
  right: 4px;
  bottom: 4px;
  display: flex;
  gap: 2px;
  z-index: 20;
}

.img-tools button {
  border: none;
  padding: 0 4px;
  font-size: 9px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  cursor: pointer;
}

.case-grid-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #86868b;
  background: transparent;
}

/* 取消左上角分类角标（COMMERCIAL/HOTEL/OFFICE） */

:deep(.case-grid-title-cn) {
  font-size: 12px;
  margin: 0 0 2px 0;
  color: var(--text-dark, #1d1d1f);
  font-family: 'Noto Serif SC', serif;
  font-weight: 700;
}

:deep(.case-grid-title-en) {
  font-size: 8px;
  color: var(--text-gray, #86868b);
  margin: 0;
  font-family: 'Inter', sans-serif;
}

@media print {
  .case-grid-photo {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
