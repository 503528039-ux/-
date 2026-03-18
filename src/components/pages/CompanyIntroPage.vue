<script setup>
import { computed } from 'vue'
import { useCatalogStore } from '../../stores/index'
import A4Page from '../layout/A4Page.vue'
import ImageUploader from '../ui/ImageUploader.vue'

const props = defineProps({
  pageIndex: {
    type: Number,
    required: true
  }
})

const store = useCatalogStore()

const pageData = computed(() => {
  return store.pages[props.pageIndex] || {}
})

const headerTitle = '2026 工程产品手册 / 公司概况'

function updateField(key, val) {
  if (!store.pages[props.pageIndex]) return
  store.pages[props.pageIndex][key] = val
}

function onHeroImage(src) {
  // null 表示删除图片
  updateField('heroImage', src || '')
}

function heroImageStyle() {
  const page = store.pages[props.pageIndex] || {}
  const scale = page.heroScale ?? 1
  const rotation = page.heroRotation ?? 0
  const opacity = page.heroOpacity ?? 1
  const fit = page.heroFit || 'contain'
  const position = page.heroPosition || '50% 50%'
  return {
    transform: `scale(${scale}) rotate(${rotation}deg)`,
    opacity,
    objectFit: fit,
    objectPosition: position
  }
}

function updateHeroScale(delta) {
  const page = store.pages[props.pageIndex]
  if (!page) return
  const next = (page.heroScale ?? 1) + delta
  page.heroScale = Math.min(1.5, Math.max(0.5, next))
}

function updateHeroRotation(delta) {
  const page = store.pages[props.pageIndex]
  if (!page) return
  page.heroRotation = ((page.heroRotation ?? 0) + delta) % 360
}

function updateHeroOpacity(delta) {
  const page = store.pages[props.pageIndex]
  if (!page) return
  const next = (page.heroOpacity ?? 1) + delta
  page.heroOpacity = Math.min(1, Math.max(0.4, next))
}

function cycleHeroFit() {
  const page = store.pages[props.pageIndex]
  if (!page) return
  const cur = page.heroFit || 'contain'
  const next = cur === 'cover' ? 'contain' : cur === 'contain' ? 'fill' : 'cover'
  page.heroFit = next
}
</script>

<template>
  <A4Page
    :page-title="headerTitle"
    :page-number="props.pageIndex + 1"
    :show-header="true"
    :show-footer="true"
  >
    <h2 class="section-title">{{ pageData.title || '品牌故事' }}</h2>
    <div class="section-subtitle">{{ pageData.sub || 'Company Profile' }}</div>

    <div class="hero-img">
      <img
        v-if="pageData.heroImage"
        :src="pageData.heroImage"
        alt=""
        :style="heroImageStyle()"
      />
      <div v-else class="hero-empty">
        <span>点击或拖拽上传品牌图片</span>
      </div>
      <ImageUploader
        v-if="!store.printMode"
        :has-image="!!pageData.heroImage"
        @update:src="onHeroImage"
      />
      <div
        v-if="!store.printMode && pageData.heroImage"
        class="img-tools"
      >
        <button type="button" @click.stop="updateHeroScale(0.1)">＋</button>
        <button type="button" @click.stop="updateHeroScale(-0.1)">－</button>
        <button type="button" @click.stop="updateHeroRotation(-5)">↺</button>
        <button type="button" @click.stop="updateHeroRotation(5)">↻</button>
        <button type="button" @click.stop="updateHeroOpacity(-0.1)">淡</button>
        <button type="button" @click.stop="updateHeroOpacity(0.1)">浓</button>
        <button type="button" @click.stop="cycleHeroFit">适配</button>
      </div>
    </div>

    <!-- 与 HTML：双栏正文，无额外描边卡片 -->
    <div class="text-cols" style="white-space: pre-line">
      {{ pageData.story || '' }}
    </div>
  </A4Page>
</template>

<style scoped>
.hero-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e5ea;
  color: #86868b;
  font-size: 13px;
}

.img-tools {
  position: absolute;
  right: 6mm;
  bottom: 4mm;
  display: flex;
  gap: 3px;
  z-index: 20;
}

.img-tools button {
  border: none;
  padding: 0 6px;
  font-size: 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  cursor: pointer;
}
</style>
