<script setup>
/**
 * PageFooter.vue - 页脚组件
 *
 * 基于 页面代码.txt 的设计规范：
 * - 高度：15mm (var(--size-footer-height))
 * - 居中页码显示
 * - 格式：- PAGE XX -
 * - 字体：9px, 2px 字间距, Inter monospace
 */
import { computed, inject, ref } from 'vue'

const props = defineProps({
  /** 页码（支持数字或字符串） */
  pageNumber: {
    type: [String, Number],
    default: ''
  },

  /** 总页数（可选，用于显示 "PAGE X / Y" 格式） */
  totalPages: {
    type: [String, Number],
    default: ''
  },

  /** 自定义高度（单位mm） */
  height: {
    type: [Number, String],
    default: 15
  },

  /** 是否使用两位数格式（如 01, 02...） */
  padZero: {
    type: Boolean,
    default: true
  }
})

// 尝试从全局注入获取页码（用于与路由/目录自动关联）
const injectedPageNumber = inject('currentPageNumber', null)
const injectedTotalPages = inject('totalPages', null)

// 响应式页码 - 优先使用 props，其次使用注入值
const currentPage = computed(() => {
  if (props.pageNumber !== '' && props.pageNumber !== null && props.pageNumber !== undefined) {
    return props.pageNumber
  }
  if (injectedPageNumber && injectedPageNumber.value !== undefined) {
    return injectedPageNumber.value
  }
  return ''
})

// 响应式总页数
const totalPagesValue = computed(() => {
  if (props.totalPages !== '' && props.totalPages !== null && props.totalPages !== undefined) {
    return props.totalPages
  }
  if (injectedTotalPages && injectedTotalPages.value !== undefined) {
    return injectedTotalPages.value
  }
  return ''
})

// 格式化页码数字（可选补零）
const formatPageNumber = (num) => {
  if (num === '' || num === null || num === undefined) return ''
  const n = Number(num)
  if (isNaN(n)) return String(num)
  if (props.padZero && n < 10) {
    return `0${n}`
  }
  return String(n)
}

// 显示页码文本 - 精确匹配页面代码.txt格式：- PAGE XX -
const displayPageNumber = computed(() => {
  const page = currentPage.value
  const total = totalPagesValue.value

  // 无页码时返回空
  if (page === '' || page === null || page === undefined) {
    return ''
  }

  const formattedPage = formatPageNumber(page)

  // 有总页数时显示 "- PAGE X / Y -"
  if (total !== '' && total !== null && total !== undefined) {
    const formattedTotal = formatPageNumber(total)
    return `- PAGE ${formattedPage} / ${formattedTotal} -`
  }

  // 默认格式 "- PAGE XX -"
  return `- PAGE ${formattedPage} -`
})

// 计算样式 - 精确匹配页面代码.txt规范
const footerStyle = computed(() => ({
  height: typeof props.height === 'number' ? `${props.height}mm` : props.height
}))
</script>

<template>
  <footer class="page-footer" :style="footerStyle">
    <!-- 居中页码 -->
    <div v-if="displayPageNumber" class="page-number">
      {{ displayPageNumber }}
    </div>
  </footer>
</template>

<style scoped>
/* 页脚容器 - 精确匹配页面代码.txt规范 */
.page-footer {
  /* 布局：水平垂直居中 */
  display: flex;
  justify-content: center;
  align-items: center;

  /* 字体：9px */
  font-size: 9px;

  /* 颜色：使用 design-tokens 变量 */
  color: var(--color-text-gray, #86868B);

  /* 字间距：2px */
  letter-spacing: 2px;

  /* 字体族：Inter monospace */
  font-family: var(--font-mono, 'Inter', monospace);

  /* 高度由 :style 控制 */
}

/* 页码文本 */
.page-number {
  /* 继承父级字体设置 */
  font-family: inherit;
  letter-spacing: inherit;

  /* 防止选中 */
  user-select: none;
}

/* 打印适配 */
@media print {
  .page-footer {
    color: var(--color-text-gray, #86868B);
  }
}
</style>
