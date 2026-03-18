<script setup lang="ts">
/**
 * TableOfContentsPage.vue - 总目录页组件
 *
 * 基于 最新页面代码.html 目录样式与结构
 *
 * 功能：
 * - 从 store.pages 派生目录项与页码，与当前图册顺序一致
 * - 按「章节类型」匹配首次出现的页面作为该章节页码
 * - 复合产品页分两条：第 1 个 compositeProduct -> 门锁，第 2 个 -> 小五金
 */
import { computed } from 'vue'
import A4Page from '../layout/A4Page.vue'
import { useCatalogStore } from '../../stores/index'

/** 目录项（与 HTML 一致） */
interface TocItem {
  index: string
  title: string
  titleEn: string
  pageNumber: number
  highlight?: boolean
}

/** 章节配置：类型 + 显示文案，用于在 store.pages 中查找页码 */
const TOC_SECTION_CONFIG: Array<{
  type: string
  subType?: string
  /** 仅对 compositeProduct 有效：取第 occurrence 个该类型页面 */
  occurrence?: number
  title: string
  titleEn: string
  highlight: boolean
}> = [
  { type: 'companyIntro', title: '品牌故事', titleEn: 'Profile', highlight: false },
  { type: 'certificates', title: '荣誉资质', titleEn: 'Certificates', highlight: false },
  { type: 'partners', title: '战略合作', titleEn: 'Partners', highlight: false },
  { type: 'projectCases', title: '工程案例', titleEn: 'Cases', highlight: false },
  { type: 'surfaceFinishes', title: '表面工艺', titleEn: 'Finishes', highlight: false },
  { type: 'product', title: '门锁五金系列 (实拍版)', titleEn: 'Locks Photo', highlight: false },
  { type: 'productGrid', title: '工程小五金系列 (实拍版)', titleEn: 'Hardware Photo', highlight: false },
  { type: 'compositeProduct', occurrence: 1, title: '门锁五金 (实拍+线图)', titleEn: 'Locks Tech', highlight: true },
  { type: 'compositeProduct', occurrence: 2, title: '工程小五金 (实拍+线图)', titleEn: 'Hardware Tech', highlight: true }
]

const store = useCatalogStore()

const props = withDefaults(
  defineProps<{ pageIndex?: number }>(),
  { pageIndex: 6 }
)

/** 根据章节配置从 store.pages 计算目录项（含页码） */
const tocItems = computed<TocItem[]>(() => {
  const pages = store.pages
  return TOC_SECTION_CONFIG.map((cfg, i) => {
    const indexStr = String(i + 1).padStart(2, '0')
    let pageNumber = 0
    if (cfg.occurrence !== undefined) {
      const indices = pages
        .map((p, idx) => (p.type === cfg.type ? idx + 1 : 0))
        .filter((n) => n > 0)
      pageNumber = indices[cfg.occurrence - 1] ?? 0
    } else {
      const found = pages.findIndex((p) => p.type === cfg.type && (cfg.subType == null || (p as { subType?: string }).subType === cfg.subType))
      pageNumber = found >= 0 ? found + 1 : 0
    }
    return {
      index: indexStr,
      title: cfg.title,
      titleEn: cfg.titleEn,
      pageNumber,
      highlight: cfg.highlight
    }
  })
})

/** 总页数（当前图册页数） */
const totalPages = computed(() => store.pages.length)

/** 格式化页码（补零） */
function formatPageNumber(num: number): string {
  if (num <= 0) return '—'
  return num < 10 ? `0${num}` : String(num)
}

/** 判断是否需要高亮显示 */
function shouldHighlight(item: TocItem): boolean {
  return item.highlight === true || item.pageNumber > 7
}
</script>

<template>
  <A4Page
    page-title="2026 工程产品手册 / 总目录"
    :page-number="props.pageIndex + 1"
    :total-pages="totalPages"
    :show-header="false"
  >
    <!-- ===== 目录内容区域 ===== -->
    <div class="toc-wrapper">
      <!-- 主标题 -->
      <h2 class="toc-main-title">总目录</h2>
      <p class="toc-main-subtitle">TABLE OF CONTENTS</p>

      <!-- 目录列表 -->
      <ul class="toc-list">
        <li
          v-for="item in tocItems"
          :key="item.index"
          class="toc-item"
        >
          <!-- 序号 + 标题 -->
          <span
            class="toc-title"
            :class="{ 'toc-title--highlight': shouldHighlight(item) }"
          >
            {{ item.index }} / {{ item.title }}
          </span>

          <!-- 英文标题 -->
          <span class="toc-en">{{ item.titleEn }}</span>

          <!-- 虚线连接符 -->
          <span class="toc-dots"></span>

          <!-- 页码 -->
          <span class="toc-page">{{ formatPageNumber(item.pageNumber) }}</span>
        </li>
      </ul>
    </div>
  </A4Page>
</template>

<style scoped>
/**
 * 样式规范 - 基于 页面代码.txt 第 203-209 行
 *
 * .toc-list { list-style: none; padding: 0; margin-top: 10mm; width: 85%; margin-left: auto; margin-right: auto; }
 * .toc-item { display: flex; align-items: baseline; margin-bottom: 8mm; }
 * .toc-title { font-size: 16px; font-weight: 600; color: var(--archie-purple); margin-right: 15px; }
 * .toc-en { font-size: 11px; color: var(--text-gray); letter-spacing: 1px; }
 * .toc-dots { flex-grow: 1; border-bottom: 1px dotted var(--text-gray); margin: 0 15px; opacity: 0.5; }
 * .toc-page { font-size: 14px; font-family: 'Inter'; font-weight: 600; color: var(--archie-gold); }
 */

/* ===== 目录容器 ===== */
.toc-wrapper {
  /* 顶部留白 30mm */
  padding-top: 30mm;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ===== 主标题 ===== */
.toc-main-title {
  font-size: 32px;
  color: var(--color-archie-purple, #5E4585);
  margin-bottom: 5px;
  font-family: 'Noto Serif SC', serif;
  font-weight: 700;
}

/* ===== 副标题 ===== */
.toc-main-subtitle {
  font-size: 12px;
  color: var(--color-archie-gold, #9A805E);
  letter-spacing: 2px;
  margin-bottom: 15mm;
  font-family: 'Inter', sans-serif;
}

/* ===== 目录列表 ===== */
.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  margin-top: 10mm;

  /* 宽度 85%，水平居中 */
  width: 85%;
  margin-left: auto;
  margin-right: auto;
}

/* ===== 目录项 ===== */
.toc-item {
  display: flex;
  align-items: baseline;

  /* 行间距 8mm */
  margin-bottom: 8mm;
}

/* ===== 目录标题（序号 + 中文名） ===== */
.toc-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-archie-purple, #5E4585);
  margin-right: 15px;

  /* 防止换行 */
  white-space: nowrap;
  font-family: 'Inter', 'Noto Serif SC', sans-serif;
}

/* 高亮样式：页码 > 07 的项目使用金色 */
.toc-title--highlight {
  color: var(--color-archie-gold, #9A805E);
}

/* ===== 英文标题 ===== */
.toc-en {
  font-size: 11px;
  color: var(--color-text-gray, #86868B);
  letter-spacing: 1px;

  /* 防止换行 */
  white-space: nowrap;
  font-family: 'Inter', sans-serif;
}

/* ===== 虚线连接符 ===== */
.toc-dots {
  /* 填充剩余空间 */
  flex-grow: 1;

  /* 点状边框 */
  border-bottom: 1px dotted var(--color-text-gray, #86868B);

  /* 左右间距 */
  margin: 0 15px;

  /* 透明度 */
  opacity: 0.5;

  /* 对齐调整 */
  align-self: flex-end;
  margin-bottom: 3px;
}

/* ===== 页码 ===== */
.toc-page {
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  color: var(--color-archie-gold, #9A805E);

  /* 防止换行 */
  white-space: nowrap;
}

/* ===== 打印适配 ===== */
@media print {
  .toc-wrapper {
    padding-top: 30mm;
  }

  .toc-dots {
    /* 确保虚线在打印时可见 */
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .toc-title--highlight {
    /* 确保高亮色在打印时正确显示 */
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
