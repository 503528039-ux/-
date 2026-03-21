<script setup>
import { computed } from 'vue'
import { useCatalogStore } from '../../stores/index'
import { DEFAULT_CELL_CN, DEFAULT_CELL_EN } from '../../utils/pageTextDefaults'
import { DEFAULT_IMAGE_OBJECT_FIT } from '../../utils/imageContainerDefaults.js'
import A4Page from '../layout/A4Page.vue'
import EditableText from '../ui/EditableText.vue'
import ImageUploader from '../ui/ImageUploader.vue'

const MAX_CASES = 9

const props = defineProps({
  pageIndex: { type: Number, required: true }
})

const store = useCatalogStore()

const pageData = computed(() => store.pages[props.pageIndex] || {})
const displayTitle = computed(() => pageData.value.title || '筑造地标')
const displaySubtitle = computed(() => pageData.value.sub || pageData.value.subtitle || 'Engineering Cases')

const isCaseFilled = (it) =>
  !!(
    it &&
    !it.deleted &&
    (it.image ||
      (typeof it.name === 'string' && it.name.trim()) ||
      (typeof it.en === 'string' && it.en.trim()) ||
      (typeof it.enTitle === 'string' && it.enTitle.trim()) ||
      (typeof it.category === 'string' && it.category.trim()))
  )

const casesList = computed(() => {
  const page = pageData.value
  if (!page) return []
  if (!Array.isArray(page.items)) page.items = []
  // 固定渲染数量，删除/新增不应改变格子位置
  while (page.items.length < MAX_CASES) {
    const idx = page.items.length
    page.items.push({
      id: `case-${idx}-${Date.now()}`,
      category: '',
      name: '',
      en: '',
      enTitle: '',
      image: '',
      deleted: false,
      scale: 1,
      opacity: 1,
      rotation: 0,
      fit: DEFAULT_IMAGE_OBJECT_FIT,
      position: '50% 50%'
    })
  }
  return page.items.slice(0, MAX_CASES)
})

const filledCaseCount = computed(() => casesList.value.filter(isCaseFilled).length)
const hasData = computed(() => filledCaseCount.value > 0)
const canAddCase = computed(() => filledCaseCount.value < MAX_CASES)
const totalPages = computed(() => store.pages.length)

/** 页眉与《最新页面代码.html》PAGE 05 一致 */
const headerTitle = '经典工程案例'

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
      deleted: false,
      scale: 1,
      opacity: 1,
      rotation: 0,
      fit: DEFAULT_IMAGE_OBJECT_FIT,
      position: '50% 50%'
    })
  }
}

function addCaseCell() {
  const page = store.pages[props.pageIndex]
  if (!page) return
  if (store.printMode) return
  if (!Array.isArray(page.items)) page.items = []
  const resetCase = (it, idx) => ({
    ...it,
    id: it?.id || `case-${idx}-${Date.now()}`,
    category: '',
    name: '',
    en: '',
    enTitle: '',
    image: '',
    deleted: false,
    scale: 1,
    opacity: 1,
    rotation: 0,
    fit: DEFAULT_IMAGE_OBJECT_FIT,
    position: '50% 50%'
  })
  // 优先恢复用户点 × 删除的格子，避免前面还有“从未用过”的空位时误激活第一格
  for (let idx = 0; idx < MAX_CASES; idx++) {
    const it = page.items[idx]
    if (it?.deleted) {
      page.items[idx] = resetCase(it, idx)
      return
    }
  }
  for (let idx = 0; idx < MAX_CASES; idx++) {
    const it = page.items[idx]
    if (!isCaseFilled(it)) {
      if (!it) continue
      page.items[idx] = resetCase(it, idx)
      return
    }
  }
}

function removeCaseCell(index) {
  const page = store.pages[props.pageIndex]
  if (!page?.items || !Array.isArray(page.items)) return
  if (index < 0 || index >= MAX_CASES) return

  const it = page.items[index]
  if (!it) return
  // 不 splice：占位不变；deleted 隐藏整格视觉（与资质页一致）
  page.items[index] = {
    ...it,
    category: '',
    name: '',
    en: '',
    enTitle: '',
    image: '',
    deleted: true,
    scale: 1,
    opacity: 1,
    rotation: 0,
    fit: DEFAULT_IMAGE_OBJECT_FIT,
    position: '50% 50%'
  }
}

function imageStyle(item) {
  if (!item) return {}
  const scale = item.scale ?? 1
  const rotation = item.rotation ?? 0
  const opacity = item.opacity ?? 1
  const fit = item.fit || DEFAULT_IMAGE_OBJECT_FIT
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
  const cur = item.fit || DEFAULT_IMAGE_OBJECT_FIT
  const next = cur === 'cover' ? 'contain' : cur === 'contain' ? 'fill' : 'cover'
  item.fit = next
}
</script>

<template>
  <A4Page
    :page-index="props.pageIndex"
    :page-title="headerTitle"
    :page-number="props.pageIndex + 1"
    :total-pages="totalPages"
    :show-header="true"
    :show-footer="true"
  >
    <EditableText tag="h2" class="section-title" :value="displayTitle" @update:value="updateTitle" />
    <EditableText tag="div" class="section-subtitle" :value="displaySubtitle" @update:value="updateSubtitle" />

    <div
      v-if="!store.printMode"
      class="cases-add-row"
      :class="{ 'cases-add-row--hidden': !canAddCase }"
    >
      <button type="button" class="cases-add-btn" @click.stop="addCaseCell">新增一格</button>
    </div>

    <div v-if="!store.printMode || hasData" class="grid-cases-3x3">
      <div
        v-for="(item, idx) in casesList"
        :key="'case-slot-' + idx"
        class="case-grid-cell"
        :class="{ 'case-grid-cell--deleted': item?.deleted }"
      >
        <div class="case-grid-photo">
          <button
            v-if="!store.printMode && !item?.deleted"
            type="button"
            class="cell-remove-btn"
            @click.stop="removeCaseCell(idx)"
          >
            ×
          </button>

          <img
            v-if="item.image && !item?.deleted"
            :src="item.image"
            alt=""
            class="case-grid-img"
            :style="imageStyle(item)"
          />
          <div v-else-if="!store.printMode && !item?.deleted" class="case-grid-placeholder">
            <span>上传案例图</span>
          </div>

          <ImageUploader
            v-if="!store.printMode && !item?.deleted"
            :has-image="!!item.image"
            @update:src="(src) => updateCaseImage(idx, src)"
          />

          <div v-if="!store.printMode && item.image && !item?.deleted" class="img-tools">
            <button type="button" @click.stop="updateCaseScale(idx, 0.1)">＋</button>
            <button type="button" @click.stop="updateCaseScale(idx, -0.1)">－</button>
            <button type="button" @click.stop="updateCaseRotation(idx, -5)">↺</button>
            <button type="button" @click.stop="updateCaseRotation(idx, 5)">↻</button>
            <button type="button" @click.stop="updateCaseOpacity(idx, -0.1)">淡</button>
            <button type="button" @click.stop="updateCaseOpacity(idx, 0.1)">浓</button>
            <button type="button" @click.stop="cycleCaseFit(idx)">适配</button>
          </div>
        </div>

        <div class="case-grid-titles" :class="{ 'case-grid-titles--deleted': item?.deleted }">
          <EditableText
            tag="h3"
            class-name="case-grid-title-cn"
            :value="item?.deleted ? '' : item.name || DEFAULT_CELL_CN"
            @update:value="(v) => updateCaseName(idx, v)"
          />
          <EditableText
            tag="p"
            class-name="case-grid-title-en"
            :value="item?.deleted ? '' : item.en || item.enTitle || DEFAULT_CELL_EN"
            @update:value="(v) => updateCaseEn(idx, v)"
          />
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">🖼️</div>
      <p class="empty-text">暂无工程案例</p>
      <p class="empty-hint">点击上方“新增一格”添加案例</p>
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
  grid-auto-rows: min-content;
  /* 收紧垂直间距，减少红框区域的上下留白 */
  gap: 5mm 5mm;
  margin-top: -5mm;
  flex: 1;
  padding-bottom: 8mm;
  min-height: 0;
}

.case-grid-cell {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.case-grid-cell--deleted .case-grid-photo {
  background: transparent;
}

.case-grid-cell--deleted .case-grid-placeholder {
  display: none;
}

.case-grid-titles--deleted {
  visibility: hidden;
}

.case-grid-photo {
  width: 100%;
  /* 收紧图片容器高度：避免过多留白，同时保持标题区仍可完整展示 */
  height: 56mm;
  position: relative;
  overflow: hidden;
  /* 统一使用全局浅灰底色，而不是纯黑块 */
  background: var(--color-image-bg, #f5f5f7);
  margin-bottom: 4px;
}

.cases-add-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 6mm;
}

.cases-add-btn {
  border: none;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(94, 69, 133, 0.12);
  color: var(--archie-purple, #5e4585);
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

/* 满格时仍保留行高，避免删格后出现「新增」行导致整网格外跳 */
.cases-add-row--hidden {
  visibility: hidden;
  pointer-events: none;
}

.cell-remove-btn {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 12px;
  line-height: 16px;
  z-index: 30;
  cursor: pointer;
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

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background: transparent;
  padding: 30mm 10mm;
  text-align: center;
}

.empty-icon {
  font-size: 36px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-dark, #1d1d1f);
}

.empty-hint {
  font-size: 12px;
  color: var(--text-gray, #86868b);
}
</style>
