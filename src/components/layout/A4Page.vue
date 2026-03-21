<template>
  <div class="a4-page shadow-xl mx-auto print:shadow-none print:m-0" :class="customClass">
    <!-- 页眉 (可选) -->
    <header v-if="showHeader" class="page-header">
      <slot name="header">
        <div class="header-title-block" :style="headerTitleBlockStyle">
          <EditableText
            tag="div"
            class-name="header-title"
            :style="headerTitleStyle"
            :value="headerText"
            @update:value="updateHeaderText"
          />
        </div>
      </slot>
    </header>

    <!-- 主内容区 -->
    <main class="page-content">
      <slot></slot>
    </main>

    <!-- 页脚 (可选) -->
    <footer v-if="showFooter" class="page-footer">
      <slot name="footer">
        <EditableText
          tag="div"
          class-name="footer-text"
          :value="footerTemplate"
          @update:value="updateFooterTemplate"
        />
        <div class="footer-rendered">{{ renderedFooter }}</div>
      </slot>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCatalogStore } from '../../stores/index'
import EditableText from '../ui/EditableText.vue'

const props = defineProps({
  pageTitle: String,
  pageNumber: [Number, String],
  totalPages: [Number, String],
  showHeader: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true },
  customClass: String,
  pageIndex: { type: Number, default: -1 }
})

const store = useCatalogStore()

const headerText = computed(() => {
  const idx = props.pageIndex
  const page = typeof idx === 'number' && idx >= 0 ? store.pages[idx] : null
  return page?.props?.headerText || props.pageTitle || '2026 工程产品手册'
})

const footerTemplate = computed(() => {
  const idx = props.pageIndex
  const page = typeof idx === 'number' && idx >= 0 ? store.pages[idx] : null
  return page?.props?.footerTemplate || '- PAGE {page} -'
})

const renderedFooter = computed(() => {
  const page = String(props.pageNumber ?? '').padStart(2, '0')
  return (footerTemplate.value || '').replace(/\{page\}/g, page)
})

/** 全页页眉：字号/颜色由侧栏「页眉」设置（catalog store） */
const headerTitleStyle = computed(() => ({
  color: store.headerTitleColor || '#1d1d1f',
  fontSize: `${store.headerTitleFontSizePx ?? 16}px`
}))

/** 标题色块背景（侧栏「色块背景」） */
const headerTitleBlockStyle = computed(() => ({
  backgroundColor: store.headerTitleBlockColor || '#EDE9F5'
}))

function ensurePageProps() {
  const idx = props.pageIndex
  if (typeof idx !== 'number' || idx < 0) return null
  const page = store.pages[idx]
  if (!page) return null
  if (!page.props || typeof page.props !== 'object') page.props = {}
  return page
}

function updateHeaderText(val) {
  const page = ensurePageProps()
  if (!page) return
  store.recordSnapshot?.()
  page.props.headerText = val
}

function updateFooterTemplate(val) {
  // 全局：同步所有页面的 footerTemplate
  store.recordSnapshot?.()
  store.pages.forEach((p) => {
    if (!p.props || typeof p.props !== 'object') p.props = {}
    p.props.footerTemplate = val
  })
}
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
  /* 保持裁切，避免内容重排后覆盖页脚 */
  overflow: hidden;
  /* 关键：允许 page-content 在 flex 布局中正确收缩，避免溢出时把页脚文字裁切 */
  min-height: 0;
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

.footer-rendered {
  display: none;
}

@media print {
  .footer-text {
    display: none;
  }
  .footer-rendered {
    display: block;
  }
}

/* 横向页眉：右侧色块包字（阴影见 main.css .header-title-block） */
.header-title-block {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  max-width: 100%;
  margin-top: 3mm;
  padding: 0.5em 1em;
  border-radius: 8px;
  box-sizing: border-box;
  transform: translate(2px, 0);
}
</style>
