<script setup lang="ts">
/**
 * TableOfContentsPage.vue - 总目录页组件
 *
 * 基于 页面代码.txt 第 203-209 行样式和 434-453 行 HTML
 *
 * 功能：
 * - 从 catalog.ts 导入目录数据，确保页码严格对齐
 * - 使用 A4Page 作为容器
 * - v-for 渲染目录列表
 * - 页码 > 07 的项目使用 archie-gold 强调色
 */
import { computed } from 'vue'
import A4Page from '../layout/A4Page.vue'
import { tableOfContents, getTotalPages } from '../../data/catalog'
import type { TocItem } from '../../data/catalog'

// ===== 计算属性 =====

/** 目录项列表（直接从 catalog.ts 导入） */
const tocItems = computed<TocItem[]>(() => {
  return tableOfContents
})

/** 总页数 */
const totalPages = computed(() => {
  return getTotalPages()
})

/** 格式化页码（补零） */
function formatPageNumber(num: number): string {
  return num < 10 ? `0${num}` : String(num)
}

/** 判断是否需要高亮显示（页码 > 7 或 highlight 为 true） */
function shouldHighlight(item: TocItem): boolean {
  return item.highlight === true || item.pageNumber > 7
}
</script>

<template>
  <A4Page
    page-title="2026 工程产品手册 / 总目录"
    :page-number="7"
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
