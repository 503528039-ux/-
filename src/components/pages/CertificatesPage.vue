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
const displayTitle = computed(() => pageData.value.title || '权威认证与资质')
const displaySubtitle = computed(() => pageData.value.sub || pageData.value.subtitle || 'Certificates & Honors')
// 当前页仅显示前 6 个证书（2 列 × 3 行）；如需更多可新增一页资质页
const certificatesList = computed(() => (pageData.value.items || []).slice(0, 6))
const hasData = computed(() => certificatesList.value.length > 0)

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
  if (page?.items?.[index]) {
    page.items[index].name = val
    page.items[index].text = val
  }
}
function updateCertImage(index, src) {
  const page = store.pages[props.pageIndex]
  if (!page?.items?.[index]) return
  page.items[index].image = src || ''
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
      scale: 1,
      opacity: 1,
      rotation: 0,
      fit: 'contain',
      position: '50% 50%'
    })
  }
  return page.items[index]
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
    :page-title="headerTitle"
    :page-number="props.pageIndex + 1"
    :total-pages="store.pages.length"
    :show-header="true"
    :show-footer="true"
  >
    <EditableText tag="h2" class-name="section-title" :value="displayTitle" @update:value="updateTitle" />
    <EditableText tag="div" class-name="section-subtitle" :value="displaySubtitle" @update:value="updateSubtitle" />

    <!-- 2 列 × 4 行：单格更宽，证书图可用接近半页宽度展示 -->
    <div v-if="hasData" class="certificates-grid">
      <div
        v-for="(cert, idx) in certificatesList"
        :key="cert.id || idx"
        class="cert-cell"
      >
        <div class="cert-cell__media">
          <img
            v-if="cert.image"
            :src="cert.image"
            :alt="cert.text || cert.name"
            class="cert-cell__img"
            :style="certImageStyle(cert)"
          />
          <div v-else class="cert-cell__placeholder">
            点击上传证书图
          </div>
          <ImageUploader
            :has-image="!!cert.image"
            @update:src="(src) => updateCertImage(idx, src)"
          />
          <div class="img-tools">
            <button type="button" @click.stop="updateCertScale(idx, 0.1)">＋</button>
            <button type="button" @click.stop="updateCertScale(idx, -0.1)">－</button>
            <button type="button" @click.stop="updateCertRotation(idx, -5)">↺</button>
            <button type="button" @click.stop="updateCertRotation(idx, 5)">↻</button>
            <button type="button" @click.stop="updateCertOpacity(idx, -0.1)">淡</button>
            <button type="button" @click.stop="updateCertOpacity(idx, 0.1)">浓</button>
            <button type="button" @click.stop="cycleCertFit(idx)">适配</button>
          </div>
        </div>
        <div class="cert-cell__caption">
          <EditableText
            tag="div"
            class-name="cert-cell__title"
            :value="cert.text || cert.name || ''"
            @update:value="(v) => updateCertName(idx, v)"
          />
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">🏆</div>
      <p class="empty-text">暂无荣誉资质数据</p>
      <p class="empty-hint">请在侧边栏添加证书项或从 Excel 导入</p>
    </div>

    <template #footer>
      <div class="page-footer">- PAGE {{ String(props.pageIndex + 1).padStart(2, '0') }} -</div>
    </template>
  </A4Page>
</template>

<style scoped>
/* 调整本页标题与网格的上下间距，减小红框留白 */
:deep(.certificates-page .section-title) {
  margin-bottom: 3mm;
}

:deep(.certificates-page .section-subtitle) {
  margin-bottom: 6mm;
}

/* 每页 6 格：2 列 × 3 行（更高图片区，避免底部被页脚截断） */
.certificates-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 1fr;
  gap: 8mm 10mm;
  margin-top: 0;
  margin-bottom: 2mm;
}

.cert-cell {
  border: 1px solid var(--divider, #e5e5ea);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
  min-height: 0;
}

.cert-cell__media {
  position: relative;
  /* 更高的图片区，适配 2×3 布局 */
  height: 60mm;
  min-height: 60mm;
  background: var(--color-image-bg, #f5f5f7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3mm 4mm;
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
  font-size: 11px;
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
  padding: 5px 8px 7px;
  border-top: 1px solid var(--divider, #e5e5ea);
  background: #fff;
}

:deep(.cert-cell__title) {
  font-size: 10px;
  color: var(--text-gray, #86868b);
  text-align: center;
  font-weight: 500;
  line-height: 1.35;
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

@media screen and (max-width: 768px) {
  .certificates-grid {
    grid-template-columns: 1fr;
    gap: 6mm;
  }
  .cert-cell__media {
    height: 52mm;
    min-height: 52mm;
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
