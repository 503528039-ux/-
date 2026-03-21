<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useCatalogStore } from '../../stores/index'
import { DEFAULT_CELL_CN, DEFAULT_CELL_EN } from '../../utils/pageTextDefaults'
import A4Page from '../layout/A4Page.vue'
import EditableText from '../ui/EditableText.vue'
import ImageUploader from '../ui/ImageUploader.vue'

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
    '雅洁五金拥有行业顶级无尘电镀与 PVD 真空镀膜产线，为五金赋予层次光影质感。'
)

// ===== 表面处理格子：新增/删除 =====
const MAX_FINISHES = 24

const isFinishFilled = (f) =>
  !!(
    f &&
    !f.deleted &&
    (f.image ||
      (typeof f.name === 'string' && f.name.trim()) ||
      (typeof f.en === 'string' && f.en.trim()) ||
      (typeof f.enName === 'string' && f.enName.trim()))
  )

const finishes = computed(() => {
  const page = pageData.value
  if (!page) return []
  if (!Array.isArray(page.items)) page.items = []
  // 固定渲染数量，删除/新增不应改变格子位置
  while (page.items.length < MAX_FINISHES) {
    const idx = page.items.length
    page.items.push({
      id: `finish-${idx}-${Date.now()}`,
      name: '',
      en: '',
      enName: '',
      image: '',
      deleted: false,
      scale: 1,
      opacity: 1,
      rotation: 0,
      fit: 'contain',
      position: '50% 50%'
    })
  }
  return page.items.slice(0, MAX_FINISHES)
})

const filledFinishCount = computed(() => finishes.value.filter(isFinishFilled).length)
const canAddFinish = computed(() => filledFinishCount.value < MAX_FINISHES)

function addFinishCell() {
  if (store.printMode) return
  const page = store.pages[props.pageIndex]
  const items = page?.items
  if (!Array.isArray(items)) return
  const resetFinish = (it, idx) => ({
    ...it,
    id: it?.id || `finish-${idx}-${Date.now()}`,
    name: '',
    en: '',
    enName: '',
    image: '',
    deleted: false,
    scale: 1,
    opacity: 1,
    rotation: 0,
    fit: 'contain',
    position: '50% 50%'
  })
  for (let idx = 0; idx < MAX_FINISHES; idx++) {
    const it = items[idx]
    if (it?.deleted) {
      items[idx] = resetFinish(it, idx)
      activeFinishIndex.value = idx
      return
    }
  }
  for (let idx = 0; idx < MAX_FINISHES; idx++) {
    const f = finishes.value[idx]
    if (!isFinishFilled(f)) {
      const it = items[idx]
      if (it) items[idx] = resetFinish(it, idx)
      activeFinishIndex.value = idx
      return
    }
  }
}

function removeFinishCell(index) {
  if (store.printMode) return
  const page = store.pages[props.pageIndex]
  const items = page?.items
  if (!Array.isArray(items)) return
  if (index < 0 || index >= MAX_FINISHES) return

  if (activeFinishIndex.value === index) activeFinishIndex.value = null

  const it = items[index]
  if (!it) return
  items[index] = {
    ...it,
    name: '',
    en: '',
    enName: '',
    image: '',
    deleted: true,
    scale: 1,
    opacity: 1,
    rotation: 0,
    fit: 'contain',
    position: '50% 50%'
  }
}

// ===== 表面处理卡片：点击进入可编辑态（仅在非打印态）=====
const activeFinishIndex = ref(null)
const finishItemRootRefs = ref({})

function setFinishItemRootRef(index, el) {
  finishItemRootRefs.value[index] = el
}

function disableFinishEditing() {
  activeFinishIndex.value = null
}

function handleFinishClick(index) {
  if (store.printMode) return
  const f = finishes.value[index]
  if (f?.deleted) return
  activeFinishIndex.value = index
}

function onDocPointerDown(e) {
  if (activeFinishIndex.value == null) return
  const idx = activeFinishIndex.value
  const el = finishItemRootRefs.value[idx]
  if (!el) return
  const t = e?.target
  if (t && typeof el.contains === 'function' && !el.contains(t)) {
    // 让 EditableText 先完成 blur/commit，再卸载编辑态
    setTimeout(disableFinishEditing, 0)
  }
}

watch(activeFinishIndex, (val) => {
  if (val == null) {
    document.removeEventListener('pointerdown', onDocPointerDown, true)
    return
  }
  document.addEventListener('pointerdown', onDocPointerDown, true)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocPointerDown, true)
})

const features = computed(() => {
  const list = pageData.value.features
  if (Array.isArray(list) && list.length) return list
  return [
    { id: 'f1', title: '耐腐蚀', sub: '抗汗渍 / 抗盐雾' },
    { id: 'f2', title: '耐磨耐刮', sub: '日常高频使用' },
    { id: 'f3', title: '易清洁', sub: '不易留指纹' },
    { id: 'f4', title: '工艺多样', sub: 'PVD / 电镀 / 喷涂' }
  ]
})

function ensureFeatures() {
  const page = store.pages[props.pageIndex]
  if (!page) return null
  if (!Array.isArray(page.features)) page.features = features.value.map((x) => ({ ...x }))
  return page.features
}

function updateIntro(val) {
  const page = store.pages[props.pageIndex]
  if (page) page.intro = val
}

function updateFeatureTitle(index, val) {
  const list = ensureFeatures()
  if (!list || !list[index]) return
  list[index].title = val
}

function updateFeatureSub(index, val) {
  const list = ensureFeatures()
  if (!list || !list[index]) return
  list[index].sub = val
}

function ensureFinish(index) {
  const page = store.pages[props.pageIndex]
  if (!page) return null
  if (!Array.isArray(page.items)) page.items = []

  // 兜底：确保该索引存在（固定布局）
  while (page.items.length < MAX_FINISHES) {
    const idx = page.items.length
    page.items.push({
      id: `finish-${idx}-${Date.now()}`,
      name: '',
      en: '',
      enName: '',
      image: '',
      deleted: false,
      scale: 1,
      opacity: 1,
      rotation: 0,
      fit: 'contain',
      position: '50% 50%'
    })
  }

  if (!page.items[index]) return null
  const it = page.items[index]
  if (it.scale == null) it.scale = 1
  if (it.rotation == null) it.rotation = 0
  if (it.opacity == null) it.opacity = 1
  if (it.fit == null) it.fit = 'contain'
  if (it.position == null) it.position = '50% 50%'
  if (it.image == null) it.image = ''
  return it
}

function finishImageStyle(finish) {
  if (!finish) return {}
  const scale = finish.scale ?? 1
  const rotation = finish.rotation ?? 0
  const opacity = finish.opacity ?? 1
  const fit = finish.fit || 'contain'
  const position = finish.position || '50% 50%'
  return {
    transform: `scale(${scale}) rotate(${rotation}deg)`,
    opacity,
    objectFit: fit,
    objectPosition: position
  }
}

function updateFinishImage(index, src) {
  const it = ensureFinish(index)
  if (!it) return
  it.image = src || ''
}

function updateFinishScale(index, delta) {
  const it = ensureFinish(index)
  if (!it) return
  const next = (it.scale ?? 1) + delta
  it.scale = Math.min(1.5, Math.max(0.5, next))
}

function updateFinishRotation(index, delta) {
  const it = ensureFinish(index)
  if (!it) return
  it.rotation = ((it.rotation ?? 0) + delta) % 360
}

function updateFinishOpacity(index, delta) {
  const it = ensureFinish(index)
  if (!it) return
  const next = (it.opacity ?? 1) + delta
  it.opacity = Math.min(1, Math.max(0.4, next))
}

function cycleFinishFit(index) {
  const it = ensureFinish(index)
  if (!it) return
  const cur = it.fit || 'contain'
  const next = cur === 'cover' ? 'contain' : cur === 'contain' ? 'fill' : 'cover'
  it.fit = next
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

function updateFinishName(index, val) {
  const it = ensureFinish(index)
  if (!it) return
  it.name = val
}

function updateFinishEn(index, val) {
  const it = ensureFinish(index)
  if (!it) return
  // 兼容数据里可能是 `en` 或 `enName` 两种字段来源
  it.en = val
  it.enName = val
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
    <div class="finishes-header-layout">
      <div class="header-left">
        <div class="title-group">
          <EditableText tag="h2" class="section-title" :value="displayTitle" @update:value="updateTitle" />
          <EditableText tag="div" class="section-subtitle" :value="displaySubtitle" @update:value="updateSubtitle" />
        </div>
        <EditableText tag="p" class-name="finishes-intro-p" :value="intro" @update:value="updateIntro" />
      </div>

      <div class="header-right finishes-features" aria-label="表面处理特点">
        <div class="feature">
        <span class="feature-icon" aria-hidden="true">
          <svg viewBox="0 0 32 32">
            <defs>
              <linearGradient id="sf_g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#38BDF8"/>
                <stop offset="1" stop-color="#3B82F6"/>
              </linearGradient>
              <filter id="sf_s1" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#3B82F6" flood-opacity="0.3"/>
              </filter>
            </defs>
            <g filter="url(#sf_s1)">
              <path d="M16 3 L28 7 V15 C28 24 16 30 16 30 C16 30 4 24 4 15 V7 Z" fill="url(#sf_g1)"/>
              <path d="M11 16 L15 20 L21 13" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
          </svg>
        </span>
        <div class="feature-txt">
          <EditableText tag="div" class-name="feature-title" :value="features[0]?.title || DEFAULT_CELL_CN" @update:value="(v) => updateFeatureTitle(0, v)" />
          <EditableText tag="div" class-name="feature-sub" :value="features[0]?.sub || DEFAULT_CELL_CN" @update:value="(v) => updateFeatureSub(0, v)" />
        </div>
      </div>
      <div class="feature">
        <span class="feature-icon" aria-hidden="true">
          <svg viewBox="0 0 32 32">
            <defs>
              <linearGradient id="sf_g2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#FCA5A5"/>
                <stop offset="1" stop-color="#EF4444"/>
              </linearGradient>
              <linearGradient id="sf_g2_bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#FDE047"/>
                <stop offset="1" stop-color="#F97316"/>
              </linearGradient>
              <filter id="sf_s2" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#EF4444" flood-opacity="0.3"/>
              </filter>
            </defs>
            <g filter="url(#sf_s2)">
              <path d="M16 2 L19 5 L23 4 L24 8 L28 10 L26 14 L28 18 L24 20 L23 24 L19 23 L16 26 L13 23 L9 24 L8 20 L4 18 L6 14 L4 10 L8 8 L9 4 L13 5 Z" fill="url(#sf_g2_bg)"/>
              <rect x="10" y="11" width="12" height="14" rx="3" fill="url(#sf_g2)"/>
              <path d="M13 15 H19 M13 18 H19 M13 21 H16" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
            </g>
          </svg>
        </span>
        <div class="feature-txt">
          <EditableText tag="div" class-name="feature-title" :value="features[1]?.title || DEFAULT_CELL_CN" @update:value="(v) => updateFeatureTitle(1, v)" />
          <EditableText tag="div" class-name="feature-sub" :value="features[1]?.sub || DEFAULT_CELL_CN" @update:value="(v) => updateFeatureSub(1, v)" />
        </div>
      </div>
      <div class="feature">
        <span class="feature-icon" aria-hidden="true">
          <svg viewBox="0 0 32 32">
            <defs>
              <linearGradient id="sf_g3" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#67E8F9"/>
                <stop offset="1" stop-color="#06B6D4"/>
              </linearGradient>
              <filter id="sf_s3" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#06B6D4" flood-opacity="0.3"/>
              </filter>
            </defs>
            <g filter="url(#sf_s3)">
              <path d="M16 3 C16 3 6 15 6 21 C6 26.523 10.477 31 16 31 C21.523 31 26 26.523 26 21 C26 15 16 3 16 3 Z" fill="url(#sf_g3)"/>
              <path d="M11 22 C11 18.5 13 16 15 15" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
              <circle cx="20" cy="24" r="1.5" fill="#ffffff"/>
            </g>
          </svg>
        </span>
        <div class="feature-txt">
          <EditableText tag="div" class-name="feature-title" :value="features[2]?.title || DEFAULT_CELL_CN" @update:value="(v) => updateFeatureTitle(2, v)" />
          <EditableText tag="div" class-name="feature-sub" :value="features[2]?.sub || DEFAULT_CELL_CN" @update:value="(v) => updateFeatureSub(2, v)" />
        </div>
      </div>
      <div class="feature">
        <span class="feature-icon" aria-hidden="true">
          <svg viewBox="0 0 32 32">
            <defs>
              <linearGradient id="sf_g4_1" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#FCA5A5"/>
                <stop offset="1" stop-color="#EC4899"/>
              </linearGradient>
              <linearGradient id="sf_g4_2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#E879F9"/>
                <stop offset="1" stop-color="#D946EF"/>
              </linearGradient>
              <linearGradient id="sf_g4_3" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#C084FC"/>
                <stop offset="1" stop-color="#A855F7"/>
              </linearGradient>
              <filter id="sf_s4" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#D946EF" flood-opacity="0.3"/>
              </filter>
            </defs>
            <g filter="url(#sf_s4)">
              <!-- Bottom plate -->
              <path d="M16 18 L28 23 L16 28 L4 23 Z" fill="url(#sf_g4_3)"/>
              <path d="M4 23 L16 28 L28 23 L28 26 L16 31 L4 26 Z" fill="#581C87" opacity="0.25"/>
              <!-- Middle plate -->
              <path d="M16 11 L28 16 L16 21 L4 16 Z" fill="url(#sf_g4_2)"/>
              <path d="M4 16 L16 21 L28 16 L28 19 L16 24 L4 19 Z" fill="#86198F" opacity="0.25"/>
              <!-- Top plate -->
              <path d="M16 4 L28 9 L16 14 L4 9 Z" fill="url(#sf_g4_1)"/>
              <path d="M4 9 L16 14 L28 9 L28 12 L16 17 L4 12 Z" fill="#BE185D" opacity="0.25"/>
            </g>
          </svg>
        </span>
        <div class="feature-txt">
          <EditableText tag="div" class-name="feature-title" :value="features[3]?.title || DEFAULT_CELL_CN" @update:value="(v) => updateFeatureTitle(3, v)" />
          <EditableText tag="div" class-name="feature-sub" :value="features[3]?.sub || DEFAULT_CELL_CN" @update:value="(v) => updateFeatureSub(3, v)" />
        </div>
      </div>
    </div>
    </div>

    <div
      v-if="!store.printMode"
      class="finishes-add-row"
      :class="{ 'finishes-add-row--hidden': !canAddFinish }"
    >
      <button type="button" class="finishes-add-btn" @click.stop="addFinishCell">
        新增一格
      </button>
    </div>

    <div v-if="!store.printMode || filledFinishCount > 0" class="grid-finishes">
      <div
        v-for="(finish, idx) in finishes"
        :key="'finish-slot-' + idx"
        class="finish-item"
        :class="{ 'finish-item--deleted': finish?.deleted }"
        @click="handleFinishClick(idx)"
        :ref="(el) => setFinishItemRootRef(idx, el)"
      >
        <button
          v-if="!store.printMode && !finish?.deleted"
          type="button"
          class="cell-remove-btn"
          @click.stop="removeFinishCell(idx)"
        >
          ×
        </button>

        <div class="finish-swatch finish-swatch--img" :class="finish.colorClass || 'swatch-pvd'">
          <img
            v-if="finish.image && !finish?.deleted"
            :src="finish.image"
            alt=""
            class="finish-swatch-img"
            :style="finishImageStyle(finish)"
          />
          <div v-else-if="!store.printMode && !finish?.deleted" class="finish-swatch-placeholder">
            <span>上传</span>
          </div>
          <ImageUploader
            v-if="!store.printMode && !finish?.deleted"
            :has-image="!!finish.image"
            @update:src="(src) => updateFinishImage(idx, src)"
          />
          <div v-if="!store.printMode && finish.image && !finish?.deleted" class="img-tools img-tools--swatch">
            <button type="button" @click.stop="updateFinishScale(idx, 0.1)">＋</button>
            <button type="button" @click.stop="updateFinishScale(idx, -0.1)">－</button>
            <button type="button" @click.stop="updateFinishRotation(idx, -5)">↺</button>
            <button type="button" @click.stop="updateFinishRotation(idx, 5)">↻</button>
            <button type="button" @click.stop="updateFinishOpacity(idx, -0.1)">淡</button>
            <button type="button" @click.stop="updateFinishOpacity(idx, 0.1)">浓</button>
            <button type="button" @click.stop="cycleFinishFit(idx)">适配</button>
          </div>
        </div>
        <div class="finish-name" :class="{ 'finish-text--deleted': finish?.deleted }">
          <EditableText
            v-if="activeFinishIndex === idx && !store.printMode && !finish?.deleted"
            tag="div"
            class-name="finish-name"
            :value="finish?.deleted ? '' : finish.name || DEFAULT_CELL_CN"
            @update:value="(v) => updateFinishName(idx, v)"
          />
          <template v-else>
            {{ finish?.deleted ? '' : finish.name || DEFAULT_CELL_CN }}
          </template>
        </div>
        <div class="finish-en" :class="{ 'finish-text--deleted': finish?.deleted }">
          <EditableText
            v-if="activeFinishIndex === idx && !store.printMode && !finish?.deleted"
            tag="div"
            class-name="finish-en"
            :value="finish?.deleted ? '' : (finish.en || finish.enName) || DEFAULT_CELL_EN"
            @update:value="(v) => updateFinishEn(idx, v)"
          />
          <template v-else>
            {{ finish?.deleted ? '' : (finish.en || finish.enName) || DEFAULT_CELL_EN }}
          </template>
        </div>
      </div>
    </div>

    <div v-else class="empty-finishes">暂无表面处理数据，请重新插入该页或从模板恢复。</div>
  </A4Page>
</template>

<style scoped>
.finish-item {
  position: relative;
}

.finish-item--deleted :deep(.finish-swatch) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.finish-item--deleted .finish-swatch-placeholder {
  display: none;
}

.finish-text--deleted {
  visibility: hidden;
}

.finishes-add-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 4mm;
  margin-bottom: 2mm;
}

.finishes-add-btn {
  border: none;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(94, 69, 133, 0.12);
  color: var(--archie-purple, #5e4585);
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.finishes-add-row--hidden {
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

.finishes-header-layout {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 20mm;
  margin-bottom: 12mm;
}

.header-left {
  flex: 1;
  max-width: 45%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.header-right {
  width: 50%;
}

:deep(.section-subtitle) {
  /* 上移导语：减少副标题与导语之间的间距（仅本页） */
  margin-bottom: 6mm;
}

.finishes-intro-p {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-dark, #1d1d1f);
  font-family: var(--font-serif, 'Noto Serif SC', serif);
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  white-space: normal;
  font-weight: 600;
  letter-spacing: 0.4px;
}

:deep(.grid-finishes) {
  /* 全部图片容器往下移动：拉开与上方图标区的距离 */
  margin-top: 3mm;
}

:deep(.finishes-intro-p .editable-core) {
  display: block;
  width: 100%;
  white-space: normal;
  min-width: 0;
}

.finishes-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6mm;
  align-content: end;
}

.feature {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.02);
  height: auto;
}

.feature-txt {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
  text-align: left;
  margin-top: 0;
}

.feature-icon {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: transparent;
  color: transparent;
  flex: 0 0 auto;
}

.feature-icon svg {
  width: 36px;
  height: 36px;
  /* 让渐变更鲜明（在 SVG 自带滤镜基础上再增强） */
  filter: saturate(1.6) contrast(1.15) brightness(1.08);
}

.feature-title {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-dark, #1d1d1f);
  line-height: 1.1;
}

.feature-sub {
  font-size: 8px;
  color: var(--text-gray, #86868b);
  line-height: 1.15;
  margin-top: 4px;
}

.empty-finishes {
  margin-top: 20mm;
  padding: 16px;
  text-align: center;
  color: var(--text-gray, #86868b);
  font-size: 13px;
}

/* grid-finishes / finish-swatch / swatch-* 定义在 main.css，与 HTML PAGE 06 一致 */

.finish-swatch--img {
  position: relative;
  overflow: hidden;
}

.finish-swatch-img {
  width: 100%;
  height: 100%;
  display: block;
}

.finish-swatch-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: rgba(0, 0, 0, 0.45);
  font-size: 10px;
  letter-spacing: 1px;
  backdrop-filter: none;
}

.img-tools--swatch {
  position: absolute;
  right: 3px;
  bottom: 3px;
  z-index: 20;
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  max-width: 92px;
}

.img-tools--swatch button {
  border: none;
  padding: 0 4px;
  font-size: 9px;
  line-height: 14px;
  height: 14px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  cursor: pointer;
}
</style>
