<script setup>
import { computed } from 'vue'
import { useCatalogStore } from '../../stores/index'
import A4Page from '../layout/A4Page.vue'

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
  return pageData.value.title || '权威认证与资质'
})

/** 页面副标题 */
const displaySubtitle = computed(() => {
  return pageData.value.sub || pageData.value.subtitle || 'Certificates & Honors'
})

/** 证书数据 */
const certificatesList = computed(() => {
  return pageData.value.items || []
})

/** 页眉标题 */
const headerTitle = computed(() => {
  return `2026 工程产品手册 / ${displayTitle.value}`
})

/** 是否有数据 */
const hasData = computed(() => {
  return certificatesList.value.length > 0
})
</script>

<template>
  <A4Page
    :customClass="'certificates-page'"
    :showHeader="true"
    :showFooter="true"
  >
    <!-- 页眉插槽 -->
    <template #header>
      <header class="page-header">
        <div class="header-title">{{ headerTitle }}</div>
      </header>
    </template>
    
    <!-- 主内容 -->
    <div class="page-content">
      <h2 class="section-title">{{ displayTitle }}</h2>
      <div class="section-subtitle">{{ displaySubtitle }}</div>
      
      <!-- 4x2 证书网格 -->
      <div v-if="hasData" class="grid-cert">
        <div 
          v-for="cert in certificatesList" 
          :key="cert.id || Math.random()"
          class="cert-box"
        >
          <img v-if="cert.image" :src="cert.image" :alt="cert.text || cert.name" />
          <div v-else class="cert-placeholder">
            <span>{{ cert.text || cert.name || '未上传证书' }}</span>
          </div>
          <div class="cert-text">{{ cert.text || cert.name }}</div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">🏆</div>
        <p class="empty-text">暂无荣誉资质数据</p>
        <p class="empty-hint">请在侧边栏添加证书项或从 Excel 导入</p>
      </div>
    </div>
    
    <!-- 页脚插槽 -->
    <template #footer>
      <div class="page-footer">- PAGE {{ String(props.pageIndex + 1).padStart(2, '0') }} -</div>
    </template>
  </A4Page>
</template>

<style scoped>
/* 
  荣誉资质页样式 - 主要样式已在 src/assets/main.css 中定义
*/

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

/* 响应式调整 - 小屏设备 */
@media screen and (max-width: 768px) {
  .grid-cert {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 8mm !important;
  }
  
  .cert-box {
    height: 60mm !important;
  }
}

/* 打印优化 */
@media print {
  .cert-box {
    border: 1px solid var(--divider) !important;
    box-shadow: none !important;
  }
  
  .cert-box img {
    opacity: 0.8 !important;
  }
  
  .empty-state {
    display: none;
  }
}
</style>
