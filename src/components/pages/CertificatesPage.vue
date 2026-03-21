<script setup>
import { computed } from 'vue'
import { useCatalogStore } from '../../stores/index'
import { DEFAULT_CELL_CN } from '../../utils/pageTextDefaults'
import A4Page from '../layout/A4Page.vue'
import EditableText from '../ui/EditableText.vue'
import ImageUploader from '../ui/ImageUploader.vue'

const props = defineProps({
  pageIndex: { type: Number, required: true }
})

const store = useCatalogStore()

const pageData = computed(() => store.pages[props.pageIndex] || {})
const displayTitle = computed(() => pageData.value.title || '权威认证与资质')
const displaySubtitle = computed(() => pageData.value.sub || pageData.value.subtitle || 'Certificates & Honors')
const MAX_CERTS = 6

/**
 * 固定格子布局：始终渲染 MAX_CERTS 个格子，删除时只清空内容不 splice，
 * 从而保证“删除后剩余格子位置不变”。
 */
const certificatesList = computed(() => {
  const items = Array.isArray(pageData.value.items) ? pageData.value.items : []
  return Array.from({ length: MAX_CERTS }, (_, idx) => items[idx] || null)
})

const canAddCert = computed(() => {
  const items = Array.isArray(pageData.value.items) ? pageData.value.items : []
  const filled = Array.from({ length: MAX_CERTS }, (_, idx) => items[idx]).filter(
    (c) => c && (c.image || c.name || c.text)
  ).length
  return filled < MAX_CERTS
})

/** 与 HTML PAGE 03 页眉一致 */
const headerTitle = '2026 工程产品手册 / 荣誉与资质'

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
function updateCertName(index, val) {
  const page = store.pages[props.pageIndex]
  const cert = ensureCert(index)
  if (!page || !cert) return
  cert.name = val
  cert.text = val
}
function updateCertImage(index, src) {
  const page = store.pages[props.pageIndex]
  const cert = ensureCert(index)
  if (!page || !cert) return
  cert.image = src || ''
}

function ensureCert(index) {
  const page = store.pages[props.pageIndex]
  if (!page) return null
  if (!Array.isArray(page.items)) page.items = []
  while (page.items.length <= index) {
    page.items.push({
      id: `cert-${page.items.length}-${Date.now()}`,
      name: '',
      image: '',
      // deleted=true：用户点击 × 删除后，该格不再显示上传/标题等可见内容
      deleted: false,
      scale: 1,
      opacity: 1,
      rotation: 0,
      fit: 'contain',
      position: '50% 50%'
    })
  }
  return page.items[index]
}

function addCertCell() {
  const page = store.pages[props.pageIndex]
  if (!page) return
  if (!Array.isArray(page.items)) page.items = []
  // 优先恢复点 × 删除的格，再找首个无内容格（避免前面未使用空位抢走“新增”）
  for (let idx = 0; idx < MAX_CERTS; idx++) {
    const c = page.items[idx]
    if (c?.deleted) {
      const base = ensureCert(idx)
      if (base) {
        page.items[idx] = {
          ...base,
          name: '',
          text: '',
          image: '',
          deleted: false,
          scale: 1,
          opacity: 1,
          rotation: 0,
          fit: 'contain',
          position: '50% 50%'
        }
      }
      return
    }
  }
  for (let idx = 0; idx < MAX_CERTS; idx++) {
    const c = page.items[idx]
    const isEmpty = !c || !(c.image || c.name || c.text)
    if (isEmpty) {
      const target = ensureCert(idx)
      if (target) target.deleted = false
      return
    }
  }
}

function removeCertCell(index) {
  const page = store.pages[props.pageIndex]
  if (!page) return
  if (!Array.isArray(page.items)) page.items = []
  if (index < 0 || index >= MAX_CERTS) return

  // 仅清空内容，不 splice，避免格子重排（位置保持不变）
  const cert = ensureCert(index)
  if (cert) {
    const cleared = {
      ...cert,
      name: '',
      text: '',
      image: '',
      deleted: true,
      scale: 1,
      opacity: 1,
      rotation: 0,
      fit: 'contain',
      position: '50% 50%'
    }
    page.items[index] = cleared
  }
}

function certImageStyle(cert) {
  if (!cert) return {}
  const scale = cert.scale ?? 1
  const rotation = cert.rotation ?? 0
  const opacity = cert.opacity ?? 1
  const fit = cert.fit || 'contain'
  const position = cert.position || '50% 50%'
  return {
    transform: `scale(${scale}) rotate(${rotation}deg)`,
    opacity,
    objectFit: fit,
    objectPosition: position
  }
}

function updateCertScale(index, delta) {
  const cert = ensureCert(index)
  if (!cert) return
  const next = (cert.scale ?? 1) + delta
  cert.scale = Math.min(1.5, Math.max(0.5, next))
}

function updateCertRotation(index, delta) {
  const cert = ensureCert(index)
  if (!cert) return
  cert.rotation = ((cert.rotation ?? 0) + delta) % 360
}

function updateCertOpacity(index, delta) {
  const cert = ensureCert(index)
  if (!cert) return
  const next = (cert.opacity ?? 1) + delta
  cert.opacity = Math.min(1, Math.max(0.4, next))
}

function cycleCertFit(index) {
  const cert = ensureCert(index)
  if (!cert) return
  const cur = cert.fit || 'contain'
  const next = cur === 'cover' ? 'contain' : cur === 'contain' ? 'fill' : 'cover'
  cert.fit = next
}
</script>

<template>
  <A4Page
    :custom-class="'certificates-page'"
    :page-index="props.pageIndex"
    :page-title="headerTitle"
    :page-number="props.pageIndex + 1"
    :total-pages="store.pages.length"
    :show-header="true"
    :show-footer="true"
  >
    <EditableText tag="h2" class-name="section-title" :value="displayTitle" @update:value="updateTitle" />
    <EditableText tag="div" class-name="section-subtitle" :value="displaySubtitle" @update:value="updateSubtitle" />

    <div
      v-if="!store.printMode"
      class="certs-add-row"
      :class="{ 'certs-add-row--hidden': !canAddCert }"
    >
      <button type="button" class="certs-add-btn" @click.stop="addCertCell">新增一格</button>
    </div>

    <!-- 2 列 × 4 行：单格更宽，证书图可用接近半页宽度展示 -->
    <div class="certificates-grid">
      <div
        v-for="(cert, idx) in certificatesList"
        :key="'cert-slot-' + idx"
        class="cert-cell"
        :class="{ 'cert-cell--deleted': cert?.deleted }"
      >
        <div class="cert-cell__media">
          <button
            v-if="!store.printMode && !cert?.deleted"
            type="button"
            class="cell-remove-btn"
            @click.stop="removeCertCell(idx)"
          >
            ×
          </button>
          <img
            v-if="cert?.image"
            :src="cert?.image"
            :alt="cert?.text || cert?.name"
            class="cert-cell__img"
            :style="certImageStyle(cert)"
          />
          <div v-else-if="!store.printMode && !cert?.deleted" class="cert-cell__placeholder">
            点击上传证书图
          </div>
          <ImageUploader
            v-if="!store.printMode && !cert?.deleted"
            :has-image="!!cert?.image"
            @update:src="(src) => updateCertImage(idx, src)"
          />
          <div v-if="!store.printMode && cert?.image" class="img-tools">
            <button type="button" @click.stop="updateCertScale(idx, 0.1)">＋</button>
            <button type="button" @click.stop="updateCertScale(idx, -0.1)">－</button>
            <button type="button" @click.stop="updateCertRotation(idx, -5)">↺</button>
            <button type="button" @click.stop="updateCertRotation(idx, 5)">↻</button>
            <button type="button" @click.stop="updateCertOpacity(idx, -0.1)">淡</button>
            <button type="button" @click.stop="updateCertOpacity(idx, 0.1)">浓</button>
            <button type="button" @click.stop="cycleCertFit(idx)">适配</button>
          </div>
        </div>
        <div
          class="cert-cell__caption"
          :class="{ 'cert-cell__caption--deleted': cert?.deleted }"
        >
          <EditableText
            tag="div"
            class-name="cert-cell__title"
            :value="cert?.deleted ? '' : (cert?.text || cert?.name) || DEFAULT_CELL_CN"
            @update:value="(v) => updateCertName(idx, v)"
          />
        </div>
      </div>
    </div>

    <!-- 使用 A4Page 默认页脚渲染（EditableText + renderedFooter） -->
  </A4Page>
</template>

<style scoped>
/* 调整本页标题与网格的上下间距，减小红框留白 */
:deep(.certificates-page .section-title) {
  margin-bottom: 0mm;
}

:deep(.certificates-page .section-subtitle) {
  margin-bottom: 2mm;
}

/* 每页 6 格：2 列 × 3 行；加大单元格吃满版心，上下保留过渡留白 */
.certificates-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: min-content;
  gap: 6mm 6mm;
  margin-top: 4mm;
  margin-bottom: 6mm;
}

.certs-add-row {
  display: flex;
  justify-content: flex-end;
  /* 与下方网格同属一块版心：负 margin-top 整体上移「新增一格」+ 证书格 */
  margin-top: -15mm;
  margin-bottom: 2mm;
}

/* 不可新增时仍占位，避免 margin 变化带动网格上下跳动 */
.certs-add-row--hidden {
  visibility: hidden;
  pointer-events: none;
}

.certs-add-btn {
  border: none;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(94, 69, 133, 0.12);
  color: var(--archie-purple, #5e4585);
  font-size: 13px;
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

.cert-cell {
  border: 1px solid var(--divider, #e5e5ea);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
  min-height: 0;
  height: 68mm;
}

.cert-cell--deleted {
  /* 删除后：隐藏整格视觉（但格子占位仍保持，避免其它格子重排） */
  border-color: transparent;
  background: transparent;
}

.cert-cell--deleted .cert-cell__media {
  background: transparent;
}

.cert-cell--deleted .cert-cell__placeholder,
.cert-cell__caption--deleted {
  visibility: hidden;
}

.cert-cell--deleted .cert-cell__placeholder {
  display: none;
}

.cert-cell__media {
  position: relative;
  /* 与单元格总高 68mm 配套：标题栏约 7–8mm */
  height: 60mm;
  min-height: 60mm;
  background: var(--color-image-bg, #f5f5f7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5mm 4mm;
  box-sizing: border-box;
}

.cert-cell__img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}

.cert-cell__placeholder {
  font-size: 14.3px;
  color: #86868b;
  text-align: center;
  padding: 8px;
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

.cert-cell__caption {
  padding: 4px 8px 6px;
  border-top: 1px solid var(--divider, #e5e5ea);
  background: #fff;
  overflow: hidden;
  flex: 0 0 auto;
}

:deep(.cert-cell__title) {
  font-size: 10px;
  color: var(--text-gray, #86868b);
  text-align: center;
  font-weight: 500;
  line-height: 1.25;
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

/* 强制继续向上压副标题（避免删除格子后上方空旷） */
:deep(.cert-cell__title) {
  font-size: 15px !important;
  line-height: 1.15 !important;
}

.cert-cell__placeholder {
  font-size: 16.5px !important;
}

:deep(.certificates-page .section-subtitle) {
  margin-bottom: 0mm !important;
}

@media screen and (max-width: 768px) {
  .certificates-grid {
    grid-template-columns: 1fr;
    gap: 6mm;
    margin-top: 3mm;
    margin-bottom: 4mm;
  }
  .cert-cell {
    height: auto;
    min-height: 58mm;
  }
  .cert-cell__media {
    height: 50mm;
    min-height: 50mm;
  }
}

@media print {
  .cert-cell {
    border: 1px solid var(--divider) !important;
    break-inside: avoid;
  }
  .cert-cell__img {
    opacity: 0.95 !important;
  }
  .empty-state {
    display: none;
  }
}
</style>
