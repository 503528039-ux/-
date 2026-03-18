<script setup>
import { computed } from 'vue'
import { useCatalogStore } from '../../stores/index'
import A4Page from '../layout/A4Page.vue'

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

const headerTitle = computed(() => {
  return `2026 工程产品手册 / 公司概况`
})

function updateField(key, val) {
  if (!store.pages[props.pageIndex]) return
  store.pages[props.pageIndex][key] = val
}

function onHeroUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => updateField('heroImage', ev.target.result)
  reader.readAsDataURL(file)
}
</script>

<template>
  <A4Page
    :page-title="headerTitle"
    :page-number="props.pageIndex + 1"
    :showHeader="true"
    :showFooter="true"
  >
    <h2 class="section-title">{{ pageData.title || '品牌故事' }}</h2>
    <div class="section-subtitle">{{ pageData.sub || 'Company Profile' }}</div>

    <div class="hero-img">
      <img v-if="pageData.heroImage"
           :src="pageData.heroImage"
           style="width:100%;height:100%;object-fit:cover;display:block;" />
      <div v-else class="hero-empty">
        <span>点击上传品牌图片</span>
      </div>
      <input v-if="!store.printMode" type="file" accept="image/*"
        style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;"
        @change="onHeroUpload" />
    </div>

    <div class="story-card">
      <div class="text-cols" style="white-space: pre-line;">
        {{ pageData.story || '' }}
      </div>
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
  background: #E5E5EA;
  color: #86868B;
  font-size: 13px;
}

.story-card {
  border: 1.5px solid #C8A97E;
  border-radius: 4px;
  padding: 8mm;
  margin-top: 8mm;
}
</style>
