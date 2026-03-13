<script setup>
import { computed } from 'vue'
import { useCatalogStore } from '../../stores/index'
import A4Page from '../layout/A4Page.vue'
import ImageUploader from '../ui/ImageUploader.vue'
import EditableText from '../ui/EditableText.vue'

const props = defineProps({
  /** 页面在 store.pages 中的索引 */
  pageIndex: {
    type: Number,
    required: true
  }
})

// ===== Store 初始化 =====
const store = useCatalogStore()

// ===== 计算属性 =====

/** 当前页面数据 */
const pageData = computed(() => {
  return store.pages[props.pageIndex] || {}
})

/** 页面标题 */
const displayTitle = computed(() => {
  return pageData.value.title || '战略合作伙伴'
})

/** 页面副标题 */
const displaySubtitle = computed(() => {
  return pageData.value.sub || pageData.value.subtitle || 'Global Partners'
})

/** 合作伙伴数据 */
const partnersList = computed(() => {
  return pageData.value.items || []
})

/** 是否有数据 */
const hasData = computed(() => {
  return partnersList.value.length > 0
})

/** 总页数 */
const totalPages = computed(() => {
  return store.pages.length
})

function getPartnerLogo(partner) {
  const text = partner?.name ? String(partner.name) : 'LOGO'
  return `https://placehold.co/240x120/F8F8FA/86868B?text=${encodeURIComponent(text)}`
}

function updatePartnerImage(index, src) {
  if (!Array.isArray(pageData.value.items)) return
  if (!pageData.value.items[index]) return
  pageData.value.items[index].image = src
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
    :title="displayTitle"
    :pageNumber="props.pageIndex + 1"
    :totalPages="totalPages"
    :showHeader="true"
    :showFooter="true"
  >
    <div class="content-section">
      <EditableText tag="h2" className="section-title" :value="displayTitle" @update:value="updateTitle" />
      <EditableText tag="p" className="section-subtitle" :value="displaySubtitle" @update:value="updateSubtitle" />
      
      <!-- 合作伙伴介绍 -->
      <div 
        class="partners-intro"
        :style="{
          fontSize: '12px',
          color: 'var(--color-text-dark)',
          lineHeight: '1.8',
          marginBottom: 'var(--spacing-xl)',
          textAlign: 'justify'
        }"
      >
        <p>雅洁五金与全球顶尖房地产开发商、酒店集团、设计机构建立了长期战略合作关系。我们为合作伙伴提供定制化的五金解决方案，从产品设计到安装维护，全程提供专业支持。</p>
      </div>
      
      <!-- 3x5 合作伙伴网格 -->
      <div 
        v-if="hasData"
        class="grid-partner"
      >
        <div 
          v-for="(partner, idx) in partnersList" 
          :key="partner.id || idx"
          class="partner-box"
        >
           <div class="partner-logo-wrap">
            <img :src="partner.image || getPartnerLogo(partner)" alt="合作伙伴logo" class="partner-logo-img" />
            <ImageUploader @update:src="(src) => updatePartnerImage(idx, src)" />
           </div>
           <EditableText tag="div" className="partner-name" style="font-weight: 700; color: #1d1d1f; text-align: center;" :value="partner.name || ''" @update:value="(v) => updatePartnerName(idx, v)" />
           <div v-if="partner.desc" class="partner-desc" style="font-size: 10px; color: #86868b; margin-top: 4px;">{{ partner.desc }}</div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">🤝</div>
        <p class="empty-text">暂无合作伙伴数据</p>
        <p class="empty-hint">请在侧边栏添加合作伙伴或从 Excel 导入</p>
      </div>
    </div>
  </A4Page>
</template>

<style scoped>
.content-section {
  padding: 0 var(--page-padding);
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-archie-purple);
  margin-bottom: var(--spacing-xs);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.section-subtitle {
  font-size: 14px;
  color: var(--color-archie-gold);
  margin-bottom: var(--spacing-lg);
  letter-spacing: 1px;
  font-weight: 500;
}

/* 空状态 */
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

.partner-logo-wrap {
  position: relative;
  width: 100%;
  height: 14mm;
  margin-bottom: 6px;
  border-radius: 5px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.7);
}

.partner-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.9;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .grid-partner {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media print {
  .empty-state {
    display: none;
  }
}
</style>
