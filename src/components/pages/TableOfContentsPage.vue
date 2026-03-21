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
import { DEFAULT_CELL_CN, DEFAULT_CELL_EN } from '../../utils/pageTextDefaults'
import EditableText from '../ui/EditableText.vue'

/** 目录项（与 HTML 一致） */
interface TocItem {
  index: string
  title: string
  titleEn: string
  pageNumber: number
  highlight?: boolean
  /** 可选：手动页码（新增条目/特殊条目用） */
  pageNumberOverride?: number
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
function ensureTocData() {
  const page = store.pages[props.pageIndex || 0] as any
  if (!page) return null
  if (!Array.isArray(page.tocItems)) {
    page.tocItems = TOC_SECTION_CONFIG.map((cfg) => ({
      type: cfg.type,
      subType: cfg.subType,
      occurrence: cfg.occurrence,
      title: cfg.title,
      titleEn: cfg.titleEn,
      highlight: cfg.highlight
    }))
  }
  return page.tocItems as any[]
}

function resolvePageNumber(cfg: any): number {
  const pages = store.pages
  if (cfg?.occurrence !== undefined) {
    const indices = pages
      .map((p, idx) => (p.type === cfg.type ? idx + 1 : 0))
      .filter((n) => n > 0)
    return indices[cfg.occurrence - 1] ?? 0
  }
  const found = pages.findIndex(
    (p) => p.type === cfg.type && (cfg.subType == null || (p as { subType?: string }).subType === cfg.subType)
  )
  return found >= 0 ? found + 1 : 0
}

const tocItems = computed<TocItem[]>(() => {
  const list = ensureTocData() || []
  return list.map((cfg, i) => {
    const indexStr = String(i + 1).padStart(2, '0')
    const computedPage = cfg.type ? resolvePageNumber(cfg) : 0
    const pageNumber = typeof cfg.pageNumberOverride === 'number' ? cfg.pageNumberOverride : computedPage
    return {
      index: indexStr,
      title: cfg.title || '',
      titleEn: cfg.titleEn || '',
      pageNumber,
      highlight: cfg.highlight === true,
      pageNumberOverride: cfg.pageNumberOverride
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

function updateTocField(index: number, key: string, val: any) {
  const list = ensureTocData()
  if (!list || !list[index]) return
  ;(list[index] as any)[key] = val
}

function addTocItem() {
  const list = ensureTocData()
  if (!list) return
  list.push({
    type: '',
    title: '新增条目',
    titleEn: 'NEW ITEM',
    pageNumberOverride: 0,
    highlight: false
  })
}

function removeTocItem(index: number) {
  const list = ensureTocData()
  if (!list) return
  list.splice(index, 1)
}
</script>

<template>
  <A4Page
    :page-index="props.pageIndex"
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
          v-for="(item, idx) in tocItems"
          :key="item.index"
          class="toc-item"
        >
          <!-- 序号 + 标题 -->
          <span
            class="toc-title"
          >
            <span class="toc-index">{{ item.index }}</span>
            <span class="toc-sep">·</span>
            <EditableText
              tag="span"
              class-name="toc-title-txt"
              :value="item.title || DEFAULT_CELL_CN"
              @update:value="(v) => updateTocField(idx, 'title', v)"
            />
          </span>

          <!-- 英文标题 -->
          <EditableText
            tag="span"
            class-name="toc-en"
            :value="item.titleEn || DEFAULT_CELL_EN"
            @update:value="(v) => updateTocField(idx, 'titleEn', v)"
          />

          <!-- 虚线连接符 -->
          <span class="toc-dots"></span>

          <!-- 页码 -->
          <span class="toc-page">{{ formatPageNumber(item.pageNumber) }}</span>

          <button
            v-if="!store.printMode"
            type="button"
            class="toc-del no-print"
            title="删除该行"
            @click.stop="removeTocItem(idx)"
          >
            ×
          </button>
        </li>
      </ul>

      <div v-if="!store.printMode" class="toc-actions no-print">
        <button type="button" class="toc-add" @click="addTocItem">＋ 新增一行</button>
      </div>
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
  color: var(--color-text-gray, #86868B);
  margin-right: 15px;

  /* 防止换行 */
  white-space: nowrap;
  font-family: 'Inter', 'Noto Serif SC', sans-serif;
}

.toc-index {
  color: var(--color-text-gray, #86868B);
  font-variant-numeric: tabular-nums;
}

.toc-sep {
  margin: 0 6px;
  color: rgba(134, 134, 139, 0.55);
}

:deep(.toc-title-txt) {
  color: var(--color-text-gray, #86868B);
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

.toc-item {
  position: relative;
}

.toc-del {
  margin-left: 8px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: none;
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.55);
  cursor: pointer;
  line-height: 18px;
  text-align: center;
  padding: 0;
}

.toc-del:hover {
  background: rgba(0, 0, 0, 0.1);
}

.toc-actions {
  width: 85%;
  margin: 6mm auto 0 auto;
  display: flex;
  justify-content: flex-end;
}

.toc-add {
  border: none;
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(94, 69, 133, 0.10);
  color: rgba(94, 69, 133, 0.95);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.toc-add:hover {
  background: rgba(94, 69, 133, 0.16);
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
