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
const certificatesList = computed(() => pageData.value.items || [])
const headerTitle = computed(() => `2026 工程产品手册 / ${displayTitle.value}`)
const hasData = computed(() => certificatesList.value.length > 0)

function updateTitle(val) {
  const page = store.pages[props.pageIndex]
  if (page) page.title = val
}
function updateSubtitle(val) {
  const page = store.pages[props.pageIndex]
  if (page) { page.sub = val; page.subtitle = val }
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
  if (page?.items?.[index]) page.items[index].image = src
}
</script>

<template>
  <A4Page
    :customClass="'certificates-page'"
    :page-title="headerTitle"
    :page-number="props.pageIndex + 1"
    :total-pages="store.pages.length"
    :showHeader="true"
    :showFooter="true"
  >

    <div class="page-content">
      <EditableText tag="h2" className="section-title" :value="displayTitle" @update:value="updateTitle" />
      <EditableText tag="div" className="section-subtitle" :value="displaySubtitle" @update:value="updateSubtitle" />

      <div v-if="hasData" class="grid-cert">
        <div
          v-for="(cert, idx) in certificatesList"
          :key="cert.id || idx"
          class="cert-box"
        >
          <img v-if="cert.image" :src="cert.image" :alt="cert.text || cert.name" />
          <div v-else class="cert-placeholder">
            <span>{{ cert.text || cert.name || '未上传证书' }}</span>
          </div>
          <ImageUploader @update:src="(src) => updateCertImage(idx, src)" />
          <EditableText tag="div" className="cert-text" :value="cert.text || cert.name || ''" @update:value="(v) => updateCertName(idx, v)" />
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">🏆</div>
        <p class="empty-text">暂无荣誉资质数据</p>
        <p class="empty-hint">请在侧边栏添加证书项或从 Excel 导入</p>
      </div>
    </div>

    <template #footer>
      <div class="page-footer">- PAGE {{ String(props.pageIndex + 1).padStart(2, '0') }} -</div>
    </template>
  </A4Page>
</template>

<style scoped>
.cert-box {
  position: relative; /* ImageUploader 定位锚点 */
}

.cert-placeholder {
  width: 100%;
  height: 140px;
  background-color: #f0f0f2;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 10px;
  text-align: center;
  font-size: 12px;
  color: #86868b;
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

.empty-icon { font-size: 48px; opacity: 0.5; }
.empty-text { font-size: 18px; font-weight: 600; color: #1d1d1f; }
.empty-hint { font-size: 14px; color: #86868b; }

@media screen and (max-width: 768px) {
  .grid-cert { grid-template-columns: repeat(2, 1fr) !important; gap: 8mm !important; }
  .cert-box { height: 60mm !important; }
}

@media print {
  .cert-box { border: 1px solid var(--divider) !important; box-shadow: none !important; }
  .cert-box img { opacity: 0.8 !important; }
  .empty-state { display: none; }
}
</style>
