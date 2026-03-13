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
  return pageData.value.title || '筑造地标'
})

/** 页面副标题 */
const displaySubtitle = computed(() => {
  return pageData.value.sub || pageData.value.subtitle || 'Engineering Cases'
})

/** 案例数据 */
const casesList = computed(() => {
  return pageData.value.items || []
})

/** 上半部分案例 */
const topCase = computed(() => {
  return casesList.value[0] || {
    image: '',
    category: 'COMMERCIAL COMPLEX',
    name: '上海中心大厦',
    enTitle: 'Shanghai Tower'
  }
})

/** 下半部分案例 */
const bottomCase = computed(() => {
  return casesList.value[1] || {
    image: '',
    category: 'RESORT HOTEL',
    name: '三亚海棠湾洲际度假酒店',
    enTitle: 'IHG Resort'
  }
})

/** 是否有数据 */
const hasData = computed(() => {
  return casesList.value.length > 0
})

/** 总页数 */
const totalPages = computed(() => {
  return store.pages.length
})
</script>

<template>
  <A4Page
    :title="displayTitle"
    :pageNumber="props.pageIndex + 1"
    :totalPages="totalPages"
    :showHeader="true"
    :showFooter="true"
  >
    <!-- Section 标题区域 -->
    <div class="content-section-header">
      <h2 class="section-title">{{ displayTitle }}</h2>
      <p class="section-subtitle">{{ displaySubtitle }}</p>
    </div>

    <!-- 出血排版：两张图片各 flex:1，负边距出血 -->
    <div v-if="hasData" class="cases-container">
      <!-- 上半部分案例 -->
      <div class="case-item">
        <!-- 图片 -->
        <div class="case-image-box">
          <img
            v-if="topCase.image"
            :src="topCase.image"
            alt="工程案例图片"
            class="case-img"
          />
          <div v-else class="case-placeholder">
            <div class="placeholder-icon">🏗️</div>
            <div class="placeholder-text">案例图待上传</div>
          </div>
          <!-- 渐变遮罩 -->
          <div class="case-overlay"></div>
        </div>
        <!-- 文字叠加 -->
        <div class="case-caption">
          <span class="case-category">{{ topCase.category || topCase.loc }}</span>
          <h3 class="case-title-cn">{{ topCase.name || topCase.title }}</h3>
          <p class="case-title-en">{{ topCase.enTitle || topCase.desc }}</p>
        </div>
      </div>

      <!-- 下半部分案例 -->
      <div class="case-item">
        <!-- 图片 -->
        <div class="case-image-box">
          <img
            v-if="bottomCase.image"
            :src="bottomCase.image"
            alt="工程案例图片"
            class="case-img"
          />
          <div v-else class="case-placeholder">
            <div class="placeholder-icon">🏨</div>
            <div class="placeholder-text">案例图待上传</div>
          </div>
          <!-- 渐变遮罩 -->
          <div class="case-overlay"></div>
        </div>
        <!-- 文字叠加 -->
        <div class="case-caption">
          <span class="case-category">{{ bottomCase.category || bottomCase.loc }}</span>
          <h3 class="case-title-cn">{{ bottomCase.name || bottomCase.title }}</h3>
          <p class="case-title-en">{{ bottomCase.enTitle || bottomCase.desc }}</p>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">🏗️</div>
      <p class="empty-text">暂无工程案例数据</p>
      <p class="empty-hint">请在侧边栏添加工程案例项或从 Excel 导入</p>
    </div>
  </A4Page>
</template>

<style scoped>
.content-section-header {
  padding: 0 var(--size-page-padding);
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-archie-purple);
  margin-bottom: var(--spacing-xs);
  letter-spacing: 2px;
}

.section-subtitle {
  font-size: 14px;
  color: var(--color-archie-gold);
  margin-bottom: 0;
  letter-spacing: 1px;
  font-weight: 500;
}

/* 出血排版：负边距撑满页面宽度 */
.cases-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: calc(var(--size-page-padding) * -1);
  margin-right: calc(var(--size-page-padding) * -1);
  gap: 0;
}

.case-item {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.case-image-box {
  width: 100%;
  height: 100%;
  position: relative;
}

.case-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 渐变遮罩 */
.case-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
}

/* 文字叠加区域 */
.case-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15mm;
  z-index: 2;
}

.case-category {
  display: block;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 2px;
  color: var(--color-archie-gold);
  text-transform: uppercase;
  margin-bottom: 6px;
}

.case-title-cn {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.case-title-en {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-family: 'Inter', sans-serif;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px;
  gap: 16px;
  background-color: #f8f8fa;
  border-radius: 12px;
  border: 2px dashed #e5e5e7;
  margin: 40px;
  flex: 1;
}

.empty-icon {
  font-size: 64px;
  opacity: 0.5;
}

.empty-text {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
}

.empty-hint {
  font-size: 14px;
  color: #86868b;
}

/* 占位图样式 */
.case-placeholder {
  width: 100%;
  height: 100%;
  background-color: #f0f0f2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.placeholder-icon {
  font-size: 40px;
  opacity: 0.3;
}

.placeholder-text {
  font-size: 12px;
  color: #86868b;
}

/* 打印优化 */
@media print {
  .cases-container {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .empty-state {
    display: none;
  }
}
</style>
