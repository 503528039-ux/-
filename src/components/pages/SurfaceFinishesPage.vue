<script setup>
import { computed } from 'vue'
import { useCatalogStore } from '../../stores/index'
import A4Page from '../layout/A4Page.vue'
import EditableText from '../ui/EditableText.vue'

const props = defineProps({
  pageIndex: { type: Number, required: true }
})

const store = useCatalogStore()
const pageData = computed(() => store.pages[props.pageIndex] || {})

const displayTitle = computed(() => pageData.value.title || '质感美学')
const displaySubtitle = computed(() => pageData.value.sub || pageData.value.subtitle || 'Surface Finishes')
const headerTitle = computed(() => `2026 工程产品手册 / ${displayTitle.value}`)
const totalPages = computed(() => store.pages.length)

const finishes = computed(() => pageData.value.items || [])

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
</script>

<template>
  <A4Page
    :page-title="headerTitle"
    :page-number="props.pageIndex + 1"
    :total-pages="totalPages"
    :showHeader="true"
    :showFooter="true"
  >
    <div class="content-section">
      <EditableText tag="h2" className="section-title" :value="displayTitle" @update:value="updateTitle" />
      <EditableText tag="p" className="section-subtitle" :value="displaySubtitle" @update:value="updateSubtitle" />
      
      <!-- 表面处理介绍 -->
      <div 
        class="finishes-intro"
        :style="{
          fontSize: '12px',
          color: 'var(--color-text-dark)',
          lineHeight: '1.8',
          marginBottom: 'var(--spacing-xl)',
          textAlign: 'justify'
        }"
      >
        <p>雅洁五金提供六种高端表面处理工艺，每种工艺都经过严格测试，确保色彩持久、质感卓越。我们的表面处理不仅美观，更具备优异的耐磨、耐腐蚀性能。</p>
      </div>
      
      <!-- 一行6个的表面处理网格 -->
      <div 
        class="finishes-grid"
        :style="{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '10mm 4mm',
          marginTop: 'var(--spacing-lg)'
        }"
      >
        <div 
          v-for="finish in finishes" 
          :key="finish.id"
          class="finish-item"
          :style="{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }"
        >
          <!-- 表面处理色板圆环 -->
          <div 
            class="finish-swatch"
            :style="{
              width: '22mm',
              height: '22mm',
              borderRadius: '50%',
              marginBottom: '12px',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.08)',
              background: finish.gradient,
              border: finish.colorClass === 'swatch-white' ? '1px solid var(--color-divider)' : 'none'
            }"
          >
            <!-- 内部装饰圆环 -->
            <div 
              class="swatch-inner-ring"
              :style="{
                width: '16mm',
                height: '16mm',
                borderRadius: '50%',
                position: 'relative',
                top: '3mm',
                left: '3mm',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }"
            />
          </div>
          
          <!-- 表面处理名称 -->
          <h3 
            class="finish-name"
            :style="{
              fontSize: '11px',
              fontWeight: '700',
              color: 'var(--color-text-dark)',
              marginBottom: '3px',
              lineHeight: '1.2'
            }"
          >
            {{ finish.name }}
          </h3>
          
          <!-- 英文名称 -->
          <div
            class="finish-en"
            :style="{
              fontSize: '8px',
              color: 'var(--color-text-gray)',
              fontFamily: 'Inter, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.2px',
              lineHeight: '1.1',
              marginBottom: 'var(--spacing-xs)'
            }"
          >
            {{ finish.en || finish.enName }}
          </div>
          
          <!-- 工艺描述 -->
          <div 
            class="finish-description"
            :style="{
              fontSize: '7px',
              color: 'var(--color-text-gray)',
              lineHeight: '1.3',
              marginTop: 'var(--spacing-xs)',
              maxWidth: '20mm'
            }"
          >
            {{ finish.description }}
          </div>
        </div>
      </div>
      
    </div>

    <!-- 页脚插槽内容 -->
    <template #footer>
      <PageFooter
        :pageNumber="pageNumber"
        :totalPages="totalPages"
        align="center"
        :showBorder="false"
      />
    </template>
  </A4Page>
</template>

<style scoped>
.content-section {
  padding: 0 var(--size-page-padding);
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

/* 响应式调整 */
@media (max-width: 768px) {
  .finishes-grid {
    grid-template-columns: repeat(3, 1fr) !important;
    gap: var(--spacing-md) !important;
  }
  
  .finishes-features {
    grid-template-columns: repeat(1, 1fr) !important;
  }
}

/* 打印优化 */
@media print {
  .finish-swatch {
    box-shadow: inset 0 1px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05) !important;
  }
  
  .finishes-footer {
    border: 1px solid var(--color-divider) !important;
  }
}
</style>
