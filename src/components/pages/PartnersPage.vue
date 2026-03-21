<script setup>
import { computed } from 'vue'
import { useCatalogStore } from '../../stores/index'
import { DEFAULT_CELL_CN } from '../../utils/pageTextDefaults'
import A4Page from '../layout/A4Page.vue'
import ImageUploader from '../ui/ImageUploader.vue'
import EditableText from '../ui/EditableText.vue'

const props = defineProps({
  pageIndex: {
    type: Number,
    required: true
  }
})

const store = useCatalogStore()

const pageData = computed(() => store.pages[props.pageIndex] || {})
const displayTitle = computed(() => pageData.value.title || '战略合作伙伴')
const displaySubtitle = computed(() => pageData.value.sub || pageData.value.subtitle || 'Global Partners')
// 设计为 3×5 网格
const MAX_PARTNERS = 15
const isPartnerFilled = (p) =>
  !!(p && !p.deleted && (p.image || (typeof p.name === 'string' && p.name.trim())))

const partnersList = computed(() => {
  const page = pageData.value
  if (!page) return []
  if (!Array.isArray(page.items)) page.items = []
  // 固定渲染数量，删除/新增不应改变格子位置
  while (page.items.length < MAX_PARTNERS) {
    const idx = page.items.length
    page.items.push({
      id: `partner-${idx}-${Date.now()}`,
      name: '',
      image: '',
      deleted: false,
      scale: 1,
      opacity: 1,
      rotation: 0,
      fit: 'contain',
      position: '50% 50%'
    })
  }
  return page.items.slice(0, MAX_PARTNERS)
})

const filledPartnerCount = computed(() => partnersList.value.filter(isPartnerFilled).length)
const hasData = computed(() => filledPartnerCount.value > 0)
const canAddPartner = computed(() => filledPartnerCount.value < MAX_PARTNERS)
const totalPages = computed(() => store.pages.length)

/** 与 HTML PAGE 04 一致 */
const headerTitle = '2026 工程产品手册 / 战略合作伙伴'

function updatePartnerImage(index, src) {
  if (!Array.isArray(pageData.value.items)) return
  if (!pageData.value.items[index]) return
  pageData.value.items[index].image = src || ''
}

function partnerImageStyle(partner) {
  if (!partner) return {}
  const scale = partner.scale ?? 1
  const rotation = partner.rotation ?? 0
  const opacity = partner.opacity ?? 1
  const fit = partner.fit || 'contain'
  const position = partner.position || '50% 50%'
  return {
    transform: `scale(${scale}) rotate(${rotation}deg)`,
    opacity,
    objectFit: fit,
    objectPosition: position
  }
}

function ensurePartner(index) {
  const items = pageData.value.items
  if (!Array.isArray(items) || !items[index]) return null
  const p = items[index]
  if (p.scale == null) p.scale = 1
  if (p.opacity == null) p.opacity = 1
  if (p.rotation == null) p.rotation = 0
  if (p.fit == null) p.fit = 'contain'
  if (p.position == null) p.position = '50% 50%'
  return p
}

function addPartnerCell() {
  const page = store.pages[props.pageIndex]
  if (!page) return
  if (store.printMode) return
  if (!Array.isArray(page.items)) page.items = []
  const resetPartner = (p, idx) => ({
    ...p,
    id: p?.id || `partner-${idx}-${Date.now()}`,
    name: '',
    image: '',
    deleted: false,
    scale: 1,
    opacity: 1,
    rotation: 0,
    fit: 'contain',
    position: '50% 50%'
  })
  for (let idx = 0; idx < MAX_PARTNERS; idx++) {
    const p = page.items[idx]
    if (p?.deleted) {
      page.items[idx] = resetPartner(p, idx)
      return
    }
  }
  for (let idx = 0; idx < MAX_PARTNERS; idx++) {
    const p = page.items[idx]
    if (!isPartnerFilled(p)) {
      if (!p) continue
      page.items[idx] = resetPartner(p, idx)
      return
    }
  }
}

function removePartnerCell(index) {
  const page = store.pages[props.pageIndex]
  if (!page?.items || !Array.isArray(page.items)) return
  if (index < 0 || index >= MAX_PARTNERS) return

  const p = page.items[index]
  if (!p) return
  page.items[index] = {
    ...p,
    name: '',
    image: '',
    deleted: true,
    scale: 1,
    opacity: 1,
    rotation: 0,
    fit: 'contain',
    position: '50% 50%'
  }
}

function updatePartnerScale(index, delta) {
  const p = ensurePartner(index)
  if (!p) return
  const next = (p.scale ?? 1) + delta
  p.scale = Math.min(1.5, Math.max(0.5, next))
}

function updatePartnerRotation(index, delta) {
  const p = ensurePartner(index)
  if (!p) return
  p.rotation = ((p.rotation ?? 0) + delta) % 360
}

function updatePartnerOpacity(index, delta) {
  const p = ensurePartner(index)
  if (!p) return
  const next = (p.opacity ?? 1) + delta
  p.opacity = Math.min(1, Math.max(0.4, next))
}

function cyclePartnerFit(index) {
  const p = ensurePartner(index)
  if (!p) return
  const cur = p.fit || 'contain'
  const next = cur === 'cover' ? 'contain' : cur === 'contain' ? 'fill' : 'cover'
  p.fit = next
}

function updateTitle(val) {
  if (!pageData.value) return
  pageData.value.title = val
}

function updateSubtitle(val) {
  if (!pageData.value) return
  pageData.value.sub = val
  pageData.value.subtitle = val
}

function updatePartnerName(index, val) {
  if (!Array.isArray(pageData.value.items)) return
  if (!pageData.value.items[index]) return
  pageData.value.items[index].name = val
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
    <div class="partners-page-head">
      <div class="partners-titles">
        <EditableText tag="h2" class-name="section-title" :value="displayTitle" @update:value="updateTitle" />
        <EditableText tag="div" class-name="section-subtitle" :value="displaySubtitle" @update:value="updateSubtitle" />
      </div>
      <button
        v-if="!store.printMode && canAddPartner"
        type="button"
        class="partners-add-btn"
        @click.stop="addPartnerCell"
      >
        新增一格
      </button>
    </div>

    <div v-if="!store.printMode || hasData" class="grid-partner">
      <div
        v-for="(partner, idx) in partnersList"
        :key="'partner-slot-' + idx"
        class="partner-box"
        :class="{ 'partner-box--deleted': partner?.deleted }"
      >
        <div class="partner-media">
          <button
            v-if="!store.printMode && !partner?.deleted"
            type="button"
            class="cell-remove-btn"
            @click.stop="removePartnerCell(idx)"
          >
            ×
          </button>
          <img
            v-if="partner.image && !partner?.deleted"
            :src="partner.image"
            alt=""
            class="partner-img"
            :style="partnerImageStyle(partner)"
          />
          <div v-else-if="!store.printMode && !partner?.deleted" class="partner-placeholder">上传 Logo</div>

          <ImageUploader
            v-if="!store.printMode && !partner?.deleted"
            :has-image="!!partner.image"
            @update:src="(src) => updatePartnerImage(idx, src)"
          />

          <div v-if="!store.printMode && partner.image && !partner?.deleted" class="img-tools">
            <button type="button" @click.stop="updatePartnerScale(idx, 0.1)">＋</button>
            <button type="button" @click.stop="updatePartnerScale(idx, -0.1)">－</button>
            <button type="button" @click.stop="updatePartnerRotation(idx, -5)">↺</button>
            <button type="button" @click.stop="updatePartnerRotation(idx, 5)">↻</button>
            <button type="button" @click.stop="updatePartnerOpacity(idx, -0.1)">淡</button>
            <button type="button" @click.stop="updatePartnerOpacity(idx, 0.1)">浓</button>
            <button type="button" @click.stop="cyclePartnerFit(idx)">适配</button>
          </div>
        </div>

        <EditableText
          v-if="
            !partner?.deleted &&
            (!store.printMode || (store.printMode && partner.name && String(partner.name).trim()))
          "
          tag="div"
          class-name="partner-name-text"
          :value="partner.name || DEFAULT_CELL_CN"
          @update:value="(v) => updatePartnerName(idx, v)"
        />
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">🤝</div>
      <p class="empty-text">暂无合作伙伴数据</p>
      <p class="empty-hint">请在侧边栏插入「战略合作伙伴」页</p>
    </div>
  </A4Page>
</template>

<style scoped>
/* 与 HTML：3×5，35mm 高，奶油底，文案居中 */
.partner-logo-wrap {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 28%;
  max-height: 12mm;
  z-index: 1;
}

.partner-logo-img {
  width: 100%;
  height: 100%;
  max-height: 12mm;
  object-fit: contain;
}

.partner-upload-slot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 24px;
  height: 24px;
  opacity: 0.35;
  z-index: 1;
}

.img-tools {
  position: absolute;
  left: 4px;
  bottom: 4px;
  display: flex;
  gap: 2px;
  z-index: 20;
}

.img-tools button {
  border: none;
  padding: 0 3px;
  font-size: 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  cursor: pointer;
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  gap: 16px;
  background-color: #f8f8fa;
  border-radius: 12px;
  border: 2px dashed #e5e5e7;
  margin-top: 40px;
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
}

/* 标题与「新增一格」同一行，避免单独一行 + 大段空白 */
.partners-page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.partners-titles {
  flex: 1 1 auto;
  min-width: min(100%, 12rem);
}

.partners-add-btn {
  flex: 0 0 auto;
  border: none;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(94, 69, 133, 0.12);
  color: var(--archie-purple, #5e4585);
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
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

@media print {
  .empty-state {
    display: none;
  }
  .partner-upload-slot {
    display: none;
  }
}

/* ===== v2026-03：伙伴页紧凑 + 每项全尺寸图片容器 ===== */
:deep(.partners-page-head .section-subtitle) {
  margin-bottom: 0;
}

/* 版心内放大单元格：略增高、缩间距，减少两侧与上方的“空位”感 */
:deep(.grid-partner) {
  margin-top: 8mm;
  gap: 5mm;
}

:deep(.partner-box) {
  height: 40mm;
  min-height: 40mm;
}

.partner-media {
  position: relative;
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: transparent;
}

.partner-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-width: none;
  max-height: none;
}

.partner-placeholder {
  font-size: 11px;
  font-weight: 600;
  color: rgba(134, 134, 139, 0.7);
  letter-spacing: 0.8px;
}

/* 名称在 Logo 下方独立一行，避免绝对定位 + 空 contenteditable 高度塌陷成细线 */
:deep(.partner-name-text) {
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  min-height: 24px;
  padding: 4px 6px 5px;
  font-size: 9px;
  font-weight: 600;
  color: rgba(134, 134, 139, 0.92);
  text-align: center;
  line-height: 1.25;
  word-break: break-all;
}

:deep(.partner-name-text .editable-core) {
  display: block;
  width: 100%;
  min-height: 18px;
  box-sizing: border-box;
  padding: 3px 5px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.65);
}

@media print {
  :deep(.partner-name-text .editable-core) {
    border: none;
    padding: 0;
    background: transparent;
    min-height: 0;
  }
}

@media print {
  .img-tools {
    display: none;
  }
}

.partner-box--deleted {
  background: transparent !important;
  box-shadow: none;
}

.partner-box--deleted .partner-media {
  background: transparent;
}

.partner-box--deleted .partner-placeholder {
  display: none;
}
</style>
