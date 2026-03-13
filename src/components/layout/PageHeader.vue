<script setup>
/**
 * PageHeader.vue - 页眉组件
 *
 * 基于 页面代码.txt 的设计规范：
 * - 高度：20mm (var(--size-header-height))
 * - 右对齐标题
 * - 字体：11px, 500 weight, 3px 字间距
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
  /* 布局：右对齐、底部对齐 */
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;

  /* 内边距：左右15mm，底部4mm */
  padding: 0 var(--size-page-padding, 15mm) 4mm var(--size-page-padding, 15mm);

  /* 底部外边距 */
  margin-bottom: 8mm;

  /* 高度由 :style 控制 */
}

/* 标题文本 - 精确匹配页面代码.txt规范 */
.header-title {
  /* 字体：11px, 500 weight */
  font-size: 11px;
  font-weight: 500;

  /* 颜色：使用 design-tokens 变量 */
  color: var(--color-text-gray, #86868B);

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
    color: var(--color-text-gray, #86868B);
  }
}
</style>
