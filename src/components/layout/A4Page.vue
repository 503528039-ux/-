<template>
  <div class="a4-page shadow-xl mx-auto print:shadow-none print:m-0" :class="customClass">
    <!-- 页眉 (可选) -->
    <header v-if="showHeader" class="page-header">
      <slot name="header">
        <div class="header-title">{{ pageTitle || '2026 工程产品手册' }}</div>
      </slot>
    </header>

    <!-- 主内容区 -->
    <main class="page-content">
      <slot></slot>
    </main>

    <!-- 页脚 (可选) -->
    <footer v-if="showFooter" class="page-footer">
      <slot name="footer">
        <div class="footer-text">- PAGE {{ String(pageNumber).padStart(2, '0') }} -</div>
      </slot>
    </footer>
  </div>
</template>

<script setup>
defineProps({
  pageTitle: String,
  pageNumber: [Number, String],
  totalPages: [Number, String],
  showHeader: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true },
  customClass: String
})
</script>

<style scoped>
/**
 * 样式规范 - 引用 design-tokens.css 变量
 *
 * 尺寸变量：
 * - --size-a4-width: 210mm
 * - --size-a4-height: 297mm
 * - --size-page-padding: 15mm
 *
 * 阴影变量：
 * - --shadow-page: 0 20px 50px rgba(0, 0, 0, 0.15)
 */

/* ===== 页面容器 - 模拟桌面环境 ===== */
.a4-page-container {
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl, 15mm) 0;
  background-color: #d1d5db;
}

/* ===== A4 页面 - 严格遵循 ISO 216 标准 ===== */
.a4-page {
  /* 严格 A4 尺寸：210mm x 297mm */
  width: var(--size-a4-width, 210mm);
  height: var(--size-a4-height, 297mm);

  /* 页面基础样式 */
  background-color: #ffffff;
  position: relative;
  display: flex;
  flex-direction: column;

  /* 页面阴影效果 */
  box-shadow: var(--shadow-page, 0 20px 50px rgba(0, 0, 0, 0.15));

  /* 防止内容溢出 */
  overflow: hidden;
}

/* ===== 页面内容区域 ===== */
/* 仅左右 15mm 边距，上下由页眉页脚控制 */
.page-content {
  flex-grow: 1;
  padding: 0 var(--size-page-padding, 15mm);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* ===== 打印样式适配 ===== */
@media print {
  /* 移除桌面模拟背景 */
  .a4-page-container {
    padding: 0;
    background: none;
  }

  /* A4 页面打印样式 */
  .a4-page {
    /* 严格 A4 尺寸 */
    width: var(--size-a4-width, 210mm);
    height: var(--size-a4-height, 297mm);

    /* 移除装饰效果 */
    box-shadow: none;
    margin: 0;

    /* 分页控制 - 每页后强制分页 */
    page-break-after: always;
    page-break-inside: avoid;
  }

  /* 最后一页不需要分页符 */
  .a4-page-container:last-child .a4-page {
    page-break-after: auto;
  }

  /* 内容区域打印优化 */
  .page-content {
    overflow: visible;
  }
}
</style>
