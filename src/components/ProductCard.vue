<script setup lang="ts">
/**
 * ProductCard.vue - 产品卡片组件
 *
 * 基于 页面代码.txt 样式规范和 catalog.ts 类型定义
 *
 * 智能模式切换：
 * - lineImage 存在 → composite-mode（实拍图58% + 线图38%）
 * - lineImage 不存在 → standard-mode（单张实拍图）
 */
import { computed } from 'vue'
import { useCatalogStore } from '../stores/index'
import ImageUploader from './ui/ImageUploader.vue'
import type { Product, SpecItem } from '../data/catalog'

const store = useCatalogStore()

// ===== Props 定义 =====
const props = defineProps<{
  /** 产品数据对象（来自 catalog.ts） */
  data: Product
  /** 是否为只读模式（打印时自动启用） */
  readonly?: boolean
  /** 图册页索引，与 productIndex 同时传入时可在卡片内上传/拖拽换图 */
  pageIndex?: number
  /** 当前页 items 中的产品下标 */
  productIndex?: number
}>()

// ===== Emits 定义 =====
const emit = defineEmits<{
  (e: 'click', product: Product): void
}>()

// ===== 计算属性 =====

/** 智能模式判断：lineImage 存在则为复合模式 */
const isCompositeMode = computed(() => {
  return !!props.data.lineImage
})

/** 是否有实拍图 */
const hasImage = computed(() => {
  return !!props.data.image
})

/** 是否有线图 */
const hasLineImage = computed(() => {
  return !!props.data.lineImage
})

/** 技术标签（仅复合模式显示） */
const techTag = computed(() => {
  return props.data.techTag || 'SCALE 1:1'
})

/** 规格参数列表 */
const specsList = computed<SpecItem[]>(() => {
  return props.data.specs || []
})

const canEditImages = computed(() => {
  if (props.readonly) return false
  const pi = props.pageIndex
  const idx = props.productIndex
  return (
    typeof pi === 'number' &&
    pi >= 0 &&
    typeof idx === 'number' &&
    idx >= 0 &&
    !store.printMode
  )
})

function setProductField(field: 'image' | 'lineImage', src: string | null) {
  const pi = props.pageIndex
  const idx = props.productIndex
  if (typeof pi !== 'number' || typeof idx !== 'number') return
  const page = store.pages[pi] as { items?: Product[] } | undefined
  if (page?.items?.[idx]) {
    ;(page.items[idx] as Record<string, string>)[field] = src || ''
  }
}

function getProductItem(): any | null {
  const pi = props.pageIndex
  const idx = props.productIndex
  if (typeof pi !== 'number' || typeof idx !== 'number') return null
  const page = store.pages[pi] as any
  const item = page?.items?.[idx]
  return item || null
}

type FitMode = 'contain' | 'cover' | 'fill'
type ImageKind = 'image' | 'line'

function ensureImageTransforms(kind: ImageKind, fallbackFit: FitMode) {
  const item = getProductItem()
  if (!item) return
  const p = kind === 'image' ? 'image' : 'line'
  const scaleKey = `${p}Scale`
  const rotKey = `${p}Rotation`
  const opKey = `${p}Opacity`
  const fitKey = `${p}Fit`
  const posKey = `${p}Pos`

  if (item[scaleKey] == null) item[scaleKey] = 1
  if (item[rotKey] == null) item[rotKey] = 0
  if (item[opKey] == null) item[opKey] = 1
  if (item[fitKey] == null) item[fitKey] = fallbackFit
  if (item[posKey] == null) item[posKey] = '50% 50%'
}

function getImageTransform(kind: ImageKind, fallbackFit: FitMode) {
  const item = getProductItem()
  if (!item) {
    return {
      scale: 1,
      rotation: 0,
      opacity: 1,
      fit: fallbackFit,
      position: '50% 50%'
    }
  }
  ensureImageTransforms(kind, fallbackFit)
  const p = kind === 'image' ? 'image' : 'line'
  return {
    scale: item[`${p}Scale`] ?? 1,
    rotation: item[`${p}Rotation`] ?? 0,
    opacity: item[`${p}Opacity`] ?? 1,
    fit: (item[`${p}Fit`] as FitMode) ?? fallbackFit,
    position: item[`${p}Pos`] ?? '50% 50%'
  }
}

function updateImageScale(kind: ImageKind, delta: number, fallbackFit: FitMode) {
  const item = getProductItem()
  if (!item) return
  ensureImageTransforms(kind, fallbackFit)
  const p = kind === 'image' ? 'image' : 'line'
  const key = `${p}Scale`
  const next = (item[key] ?? 1) + delta
  item[key] = Math.min(1.5, Math.max(0.5, next))
}

function updateImageRotation(kind: ImageKind, delta: number, fallbackFit: FitMode) {
  const item = getProductItem()
  if (!item) return
  ensureImageTransforms(kind, fallbackFit)
  const p = kind === 'image' ? 'image' : 'line'
  const key = `${p}Rotation`
  item[key] = ((item[key] ?? 0) + delta) % 360
}

function updateImageOpacity(kind: ImageKind, delta: number, fallbackFit: FitMode) {
  const item = getProductItem()
  if (!item) return
  ensureImageTransforms(kind, fallbackFit)
  const p = kind === 'image' ? 'image' : 'line'
  const key = `${p}Opacity`
  const next = (item[key] ?? 1) + delta
  item[key] = Math.min(1, Math.max(0.4, next))
}

function cycleFit(field: 'imageFit' | 'lineFit') {
  const item = getProductItem()
  if (!item) return
  const cur = item[field] || 'contain'
  const next = cur === 'cover' ? 'contain' : cur === 'contain' ? 'fill' : 'cover'
  item[field] = next
}

function imageStyle(img: { scale?: number; opacity?: number; rotation?: number; fit?: string; position?: string } | null | undefined, fallbackFit: FitMode = 'contain') {
  if (!img) return {}
  const scale = img.scale ?? 1
  const rotation = img.rotation ?? 0
  const opacity = img.opacity ?? 1
  const fit = (img.fit as any) || fallbackFit
  const position = img.position || '50% 50%'
  return {
    transform: `scale(${scale}) rotate(${rotation}deg)`,
    opacity,
    objectFit: fit,
    objectPosition: position
  }
}

// ===== 方法 =====
function handleClick() {
  emit('click', props.data)
}
</script>

<template>
  <div
    class="product-card"
    @click="handleClick"
  >
    <!-- ===== 标准模式：单张实拍图 ===== -->
    <div
      v-if="!isCompositeMode"
      class="card-img-box standard-mode"
    >
      <img
        v-if="hasImage"
        :src="data.image"
        :alt="data.name"
        class="product-img"
        :style="imageStyle(getImageTransform('image', 'contain'), 'contain')"
      >
      <div v-else class="image-placeholder">
        <span class="placeholder-text">{{ data.model }}</span>
      </div>
      <ImageUploader
        v-if="canEditImages"
        :has-image="hasImage"
        @update:src="(src) => setProductField('image', src)"
      />
      <div v-if="canEditImages && hasImage" class="img-tools">
        <button type="button" @click.stop="updateImageScale('image', 0.1, 'contain')">＋</button>
        <button type="button" @click.stop="updateImageScale('image', -0.1, 'contain')">－</button>
        <button type="button" @click.stop="updateImageRotation('image', -5, 'contain')">↺</button>
        <button type="button" @click.stop="updateImageRotation('image', 5, 'contain')">↻</button>
        <button type="button" @click.stop="updateImageOpacity('image', -0.1, 'contain')">淡</button>
        <button type="button" @click.stop="updateImageOpacity('image', 0.1, 'contain')">浓</button>
        <button type="button" @click.stop="cycleFit('imageFit')">适配</button>
      </div>
    </div>

    <!-- ===== 复合模式：实拍图 + 线图 ===== -->
    <div
      v-else
      class="card-img-box composite-mode"
    >
      <!-- 左侧：实拍图区域 (58%) -->
      <div class="composite-photo">
        <img
          v-if="hasImage"
          :src="data.image"
          :alt="data.name"
          :style="imageStyle(getImageTransform('image', 'contain'), 'contain')"
        >
        <div v-else class="image-placeholder mini">
          <span class="placeholder-text">实拍图</span>
        </div>
        <ImageUploader
          v-if="canEditImages"
          :has-image="hasImage"
          @update:src="(src) => setProductField('image', src)"
        />
        <div v-if="canEditImages && hasImage" class="img-tools">
          <button type="button" @click.stop="updateImageScale('image', 0.1, 'contain')">＋</button>
          <button type="button" @click.stop="updateImageScale('image', -0.1, 'contain')">－</button>
          <button type="button" @click.stop="updateImageRotation('image', -5, 'contain')">↺</button>
          <button type="button" @click.stop="updateImageRotation('image', 5, 'contain')">↻</button>
          <button type="button" @click.stop="updateImageOpacity('image', -0.1, 'contain')">淡</button>
          <button type="button" @click.stop="updateImageOpacity('image', 0.1, 'contain')">浓</button>
          <button type="button" @click.stop="cycleFit('imageFit')">适配</button>
        </div>
      </div>

      <!-- 右侧：线图区域 (38%) -->
      <div class="composite-line">
        <!-- 技术标签 -->
        <div class="tech-tag">{{ techTag }}</div>

        <img
          v-if="hasLineImage"
          :src="data.lineImage"
          :alt="`${data.name} 线图`"
          :style="imageStyle(getImageTransform('line', 'contain'), 'contain')"
        >
        <div v-else class="image-placeholder mini">
          <span class="placeholder-text">线图</span>
        </div>
        <ImageUploader
          v-if="canEditImages"
          :has-image="hasLineImage"
          @update:src="(src) => setProductField('lineImage', src)"
        />
        <div v-if="canEditImages && hasLineImage" class="img-tools">
          <button type="button" @click.stop="updateImageScale('line', 0.1, 'contain')">＋</button>
          <button type="button" @click.stop="updateImageScale('line', -0.1, 'contain')">－</button>
          <button type="button" @click.stop="updateImageRotation('line', -5, 'contain')">↺</button>
          <button type="button" @click.stop="updateImageRotation('line', 5, 'contain')">↻</button>
          <button type="button" @click.stop="updateImageOpacity('line', -0.1, 'contain')">淡</button>
          <button type="button" @click.stop="updateImageOpacity('line', 0.1, 'contain')">浓</button>
          <button type="button" @click.stop="cycleFit('lineFit')">适配</button>
        </div>
      </div>
    </div>

    <!-- ===== 产品信息区域 ===== -->
    <div class="card-info">
      <!-- 标题行 -->
      <div class="card-title">{{ data.name }}</div>
      <div class="card-model">{{ data.model }}</div>

      <!-- 规格参数列表 -->
      <div class="card-specs-mini">
        <div
          v-for="(spec, index) in specsList"
          :key="index"
          class="mini-spec-row"
          :class="{ 'full-width': spec.fullWidth }"
        >
          <span class="mini-label">{{ spec.label }}</span>
          <span class="mini-value">{{ spec.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/**
 * 样式规范 - 基于 页面代码.txt 和 design-tokens.css
 *
 * 颜色变量：
 * - --color-archie-purple: #5E4585
 * - --color-archie-gold: #9A805E
 * - --color-text-dark: #1D1D1F
 * - --color-text-gray: #86868B
 * - --color-divider: #E5E5EA
 */

/* ===== 卡片容器 ===== */
.product-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

/* ===== 图片区域基础样式 ===== */
.card-img-box {
  height: 48mm;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.img-tools {
  position: absolute;
  right: 4px;
  bottom: 4px;
  z-index: 20;
  display: flex;
}

.img-tools button {
  border: none;
  padding: 0 4px;
  font-size: 9px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  cursor: pointer;
}

/* ===== 标准模式样式 ===== */
.card-img-box.standard-mode {
  /* 浅灰色背景 */
  background-color: var(--color-image-bg, #f5f5f7);
  padding: 10mm;
}

/* 产品图片 - 标准模式 */
.product-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  /* 混合模式：与背景融合 */
  mix-blend-mode: multiply;
}

/* ===== 复合模式样式 ===== */
.card-img-box.composite-mode {
  /* 白色背景 */
  background-color: #ffffff;
  /* 金色边框 */
  border: 0.5px solid rgba(154, 128, 94, 0.3);
  border-radius: 6px;
  /* 网格背景 - linear-gradient */
  background-image:
    linear-gradient(rgba(154, 128, 94, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(154, 128, 94, 0.05) 1px, transparent 1px);
  background-size: 5mm 5mm;
  /* 左右分布 */
  justify-content: space-between;
  padding: 5mm 3mm;
}

/* 实拍图区域 (58%) */
.composite-photo {
  width: 58%;
  height: 90%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.composite-photo img {
  max-width: 100%;
  max-height: 100%;
  /* 投影效果 */
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.08));
  mix-blend-mode: multiply;
}

/* 线图区域 (38%) */
.composite-line {
  width: 38%;
  height: 85%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 左侧虚线边框 */
  border-left: 1px dashed rgba(154, 128, 94, 0.4);
  position: relative;
  padding-left: 3mm;
}

.composite-line img {
  max-width: 100%;
  max-height: 100%;
  /* 线图滤镜效果：高对比度、灰度、降低亮度 */
  filter: contrast(200%) grayscale(100%) brightness(0.85);
  mix-blend-mode: multiply;
  opacity: 0.6;
}

/* 技术标签 - 仅复合模式 */
.tech-tag {
  position: absolute;
  top: -6px;
  right: 0;
  font-size: 7px;
  color: var(--color-text-gray, #86868B);
  font-family: var(--font-mono, 'Inter', monospace);
  background: #ffffff;
  padding: 0 4px;
  letter-spacing: 0.5px;
}

/* ===== 图片占位符 ===== */
.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: var(--color-luxury-cream, #F8F8FA);
  border-radius: 8px;
}

.image-placeholder.mini {
  font-size: 10px;
}

.placeholder-text {
  color: var(--color-text-gray, #86868B);
  font-size: 12px;
  font-family: var(--font-sans, 'Inter', sans-serif);
}

/* ===== 产品信息区域 ===== */
.card-info {
  padding-top: 12px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* 产品标题 */
.card-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-dark, #1D1D1F);
  margin-bottom: 2px;
  font-family: var(--font-sans, 'Inter', sans-serif);
}

/* 产品型号 */
.card-model {
  font-size: 11px;
  font-family: var(--font-sans, 'Inter', sans-serif);
  color: var(--color-archie-purple, #5E4585);
  font-weight: 600;
  margin-bottom: 10px;
}

/* ===== 规格参数列表 ===== */
.card-specs-mini {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 规格行 - 虚线边框分隔 */
.mini-spec-row {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  /* 虚线底部边框 */
  border-bottom: 0.5px dashed var(--color-divider, #E5E5EA);
  padding-bottom: 3px;
}

/* 全宽规格行 */
.mini-spec-row.full-width {
  /* 用于需要独占一行的规格 */
}

/* 规格标签 */
.mini-label {
  color: var(--color-text-gray, #86868B);
  font-family: var(--font-sans, 'Inter', sans-serif);
}

/* 规格值 */
.mini-value {
  color: var(--color-text-dark, #1D1D1F);
  font-weight: 500;
  font-family: var(--font-sans, 'Inter', sans-serif);
}

/* ===== 打印适配 ===== */
@media print {
  .product-card {
    cursor: default;
  }

  .image-placeholder {
    border: 1px solid var(--color-divider, #E5E5EA);
  }
}
</style>
