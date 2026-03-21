<script setup>
/**
 * PageHeader.vue - 页眉组件
 *
 * 基于 页面代码.txt 的设计规范：
 * - 高度：20mm (var(--size-header-height))
 * - 右对齐标题
 * - 字体：14px, 600 weight, 3px 字间距（与 main.css 页眉默认一致）
 * - 底部边框：0.5px solid
 * - 底部外边距：8mm
 */
import { computed } from 'vue'

const props = defineProps({
  /** 页面标题（右对齐显示） */
  title: {
    type: String,
    default: '2026 工程产品手册'
  },

  /** 页面副标题/分类（可选，用于显示如 "/ 门锁五金系列"） */
  subtitle: {
    type: String,
    default: ''
  },

  /** 是否显示底部边框 */
  showBorder: {
    type: Boolean,
    default: true
  },

  /** 自定义高度（单位mm） */
  height: {
    type: [Number, String],
    default: 20
  }
})

// 完整标题文本
const fullTitle = computed(() => {
  if (props.subtitle) {
    return `${props.title} / ${props.subtitle}`
  }
  return props.title
})

// 计算样式 - 精确匹配页面代码.txt规范
const headerStyle = computed(() => ({
  height: typeof props.height === 'number' ? `${props.height}mm` : props.height,
  borderBottom: props.showBorder ? '0.5px solid var(--color-divider, #E5E5EA)' : 'none'
}))
</script>

<template>
  <header class="page-header" :style="headerStyle">
    <!-- 右对齐标题 -->
    <div class="header-title">{{ fullTitle }}</div>
  </header>
</template>

<style scoped>
/* 页眉容器 - 精确匹配页面代码.txt规范 */
.page-header {
  /* 布局：右对齐、垂直居中（略上移观感） */
  display: flex;
  justify-content: flex-end;
  align-items: center;

  /* 内边距：左右 15mm，上下均衡 */
  padding: 2mm var(--size-page-padding, 15mm) 2mm var(--size-page-padding, 15mm);

  /* 底部外边距 */
  margin-bottom: 8mm;

  /* 高度由 :style 控制 */
}

/* 标题文本 */
.header-title {
  font-size: 14px;
  font-weight: 600;

  color: var(--color-text-dark, #1D1D1F);

  /* 字间距：3px */
  letter-spacing: 3px;

  /* 大写转换 */
  text-transform: uppercase;

  /* 字体族 */
  font-family: var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);

  /* 防止换行 */
  white-space: nowrap;
}

/* 打印适配 */
@media print {
  .page-header {
    border-bottom-color: var(--color-divider, #E5E5EA);
  }

  .header-title {
    color: var(--color-text-dark, #1D1D1F);
  }
}
</style>
