<script setup>
import { computed } from 'vue'
import { useCatalogStore } from '../../stores/index'
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
const partnersList = computed(() => pageData.value.items || [])
const hasData = computed(() => partnersList.value.length > 0)
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
    :page-title="headerTitle"
    :page-number="props.pageIndex + 1"
    :total-pages="totalPages"
    :show-header="true"
    :show-footer="true"
  >
    <EditableText tag="h2" class-name="section-title" :value="displayTitle" @update:value="updateTitle" />
    <EditableText tag="div" class-name="section-subtitle" :value="displaySubtitle" @update:value="updateSubtitle" />

    <div v-if="hasData" class="grid-partner">
      <div
        v-for="(partner, idx) in partnersList"
        :key="partner.id || idx"
        class="partner-box"
      >
        <div v-if="partner.image" class="partner-logo-wrap">
          <img
            :src="partner.image"
            alt=""
            class="partner-logo-img"
            :style="partnerImageStyle(partner)"
          />
          <ImageUploader
            :has-image="true"
            @update:src="(src) => updatePartnerImage(idx, src)"
          />
          <div class="img-tools">
            <button type="button" @click.stop="updatePartnerScale(idx, 0.1)">＋</button>
            <button type="button" @click.stop="updatePartnerScale(idx, -0.1)">－</button>
            <button type="button" @click.stop="updatePartnerRotation(idx, -5)">↺</button>
            <button type="button" @click.stop="updatePartnerRotation(idx, 5)">↻</button>
            <button type="button" @click.stop="updatePartnerOpacity(idx, -0.1)">淡</button>
            <button type="button" @click.stop="updatePartnerOpacity(idx, 0.1)">浓</button>
            <button type="button" @click.stop="cyclePartnerFit(idx)">适配</button>
          </div>
        </div>
        <div v-else class="partner-upload-slot">
          <ImageUploader
            :has-image="false"
            @update:src="(src) => updatePartnerImage(idx, src)"
          />
        </div>
        <EditableText
          tag="div"
          class-name="partner-name-text"
          :value="partner.name || ''"
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

:deep(.partner-name-text) {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-gray, #86868b);
  text-align: center;
  padding: 0 6px;
  line-height: 1.25;
  max-width: 100%;
  word-break: break-all;
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

@media print {
  .empty-state {
    display: none;
  }
  .partner-upload-slot {
    display: none;
  }
}
</style>
