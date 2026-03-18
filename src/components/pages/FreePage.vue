<script setup>
import { computed, ref } from 'vue'
import { nanoid } from 'nanoid'
import A4Page from '../layout/A4Page.vue'
import ImageUploader from '../ui/ImageUploader.vue'
import { useCatalogStore } from '../../stores/index'
import { readImageFileAsDataURL } from '../../composables/useImageFileReader'

const props = defineProps({
  pageIndex: {
    type: Number,
    required: true
  }
})

const store = useCatalogStore()
const canvasDragOver = ref(false)

const pageData = computed(() => {
  return store.pages[props.pageIndex] || {}
})

const hasData = computed(() => {
  return (pageData.value.blocks && pageData.value.blocks.length > 0) || pageData.value.title
})

function ensurePage() {
  return store.pages[props.pageIndex]
}

function ensureBlocks() {
  const page = ensurePage()
  if (!page) return null
  if (!Array.isArray(page.blocks)) page.blocks = []
  return page
}

function updateBlockImage(blockIndex, src) {
  const page = ensurePage()
  if (!page?.blocks?.[blockIndex]) return
  page.blocks[blockIndex].val = src || ''
}

function blockImageStyle(block) {
  if (!block) return {}
  const scale = block.scale ?? 1
  const rotation = block.rotation ?? 0
  const opacity = block.opacity ?? 1
  const fit = block.fit || 'contain'
  const position = block.position || '50% 50%'
  return {
    transform: `scale(${scale}) rotate(${rotation}deg)`,
    opacity,
    objectFit: fit,
    objectPosition: position
  }
}

function ensureImgBlock(index) {
  const page = ensurePage()
  if (!page?.blocks?.[index]) return null
  const block = page.blocks[index]
  if (block.type !== 'img') return null
  if (block.scale == null) block.scale = 1
  if (block.opacity == null) block.opacity = 1
  if (block.rotation == null) block.rotation = 0
  if (block.fit == null) block.fit = 'contain'
  if (block.position == null) block.position = '50% 50%'
  return block
}

function updateBlockScale(index, delta) {
  const block = ensureImgBlock(index)
  if (!block) return
  const next = (block.scale ?? 1) + delta
  block.scale = Math.min(1.5, Math.max(0.5, next))
}

function updateBlockRotation(index, delta) {
  const block = ensureImgBlock(index)
  if (!block) return
  block.rotation = ((block.rotation ?? 0) + delta) % 360
}

function updateBlockOpacity(index, delta) {
  const block = ensureImgBlock(index)
  if (!block) return
  const next = (block.opacity ?? 1) + delta
  block.opacity = Math.min(1, Math.max(0.4, next))
}

function cycleBlockFit(index) {
  const block = ensureImgBlock(index)
  if (!block) return
  const cur = block.fit || 'contain'
  const next = cur === 'cover' ? 'contain' : cur === 'contain' ? 'fill' : 'cover'
  block.fit = next
}

async function addImageBlockFromFile(file) {
  const dataUrl = await readImageFileAsDataURL(file)
  if (!dataUrl) return
  const page = ensureBlocks()
  if (!page) return
  page.blocks.push({
    id: nanoid(),
    type: 'img',
    val: dataUrl,
    w: 240,
    h: 180,
    x: 80,
    y: 120
  })
}

function onCanvasDragOver(e) {
  if (store.printMode) return
  e.preventDefault()
  canvasDragOver.value = true
}

function onCanvasDragLeave() {
  canvasDragOver.value = false
}

async function onCanvasDrop(e) {
  canvasDragOver.value = false
  if (store.printMode) return
  e.preventDefault()
  const file = e.dataTransfer?.files?.[0]
  await addImageBlockFromFile(file)
}

async function onEmptyDrop(e) {
  if (store.printMode) return
  e.preventDefault()
  const file = e.dataTransfer?.files?.[0]
  const dataUrl = await readImageFileAsDataURL(file)
  if (!dataUrl) return
  const page = ensurePage()
  if (!page) return
  if (!page.title) page.title = '自由编辑页'
  if (!Array.isArray(page.blocks)) page.blocks = []
  page.blocks.push({
    id: nanoid(),
    type: 'img',
    val: dataUrl,
    w: 240,
    h: 180,
    x: 80,
    y: 120
  })
}
</script>

<template>
  <A4Page :page-number="props.pageIndex + 1">
    <div v-if="hasData" class="free-page-content">
      <h2 class="section-title">{{ pageData.title || '自由编辑页' }}</h2>
      <p class="section-subtitle">{{ pageData.sub || 'FREE LAYOUT' }}</p>

      <div
        class="canvas-area"
        :class="{ 'canvas-drag-over': canvasDragOver && !store.printMode }"
        @dragover.prevent="onCanvasDragOver"
        @dragleave.prevent="onCanvasDragLeave"
        @drop.prevent="onCanvasDrop"
      >
        <p v-if="!store.printMode" class="canvas-hint">可将图片拖拽到空白处添加</p>
        <div
          v-for="(block, index) in pageData.blocks"
          :key="block.id || index"
          class="absolute border border-dashed border-gray-200 p-2 block-wrap"
        >
          <div v-if="block.type === 'txt'" v-html="block.val"></div>
          <div v-else-if="block.type === 'img'" class="img-block">
            <img
              v-if="block.val"
              :src="block.val"
              class="max-w-full h-auto"
              :style="blockImageStyle(block)"
              alt=""
            >
            <div v-else class="img-placeholder">图片块</div>
            <ImageUploader
              v-if="!store.printMode"
              :has-image="!!block.val"
              @update:src="(src) => updateBlockImage(index, src)"
            />
            <div
              v-if="!store.printMode"
              class="img-tools"
            >
              <button type="button" @click.stop="updateBlockScale(index, 0.1)">＋</button>
              <button type="button" @click.stop="updateBlockScale(index, -0.1)">－</button>
              <button type="button" @click.stop="updateBlockRotation(index, -5)">↺</button>
              <button type="button" @click.stop="updateBlockRotation(index, 5)">↻</button>
              <button type="button" @click.stop="updateBlockOpacity(index, -0.1)">淡</button>
              <button type="button" @click.stop="updateBlockOpacity(index, 0.1)">浓</button>
              <button type="button" @click.stop="cycleBlockFit(index)">适配</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="empty-state"
      @dragover.prevent
      @drop.prevent="onEmptyDrop"
    >
      <div class="empty-icon">🎨</div>
      <p class="empty-text">空白编辑页</p>
      <p class="empty-hint">点击侧栏添加内容，或将图片拖拽到此处</p>
    </div>
  </A4Page>
</template>

<style scoped>
.free-page-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.section-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 28px;
  color: #5E4585;
  margin-bottom: 5px;
}

.section-subtitle {
  font-size: 11px;
  color: #9A805E;
  letter-spacing: 2px;
  margin-bottom: 15mm;
  text-transform: uppercase;
}

.canvas-area {
  flex-grow: 1;
  position: relative;
  border: 1px dashed #E5E5EA;
  border-radius: 8px;
  min-height: 120px;
}

.canvas-area.canvas-drag-over {
  border-color: #5E4585;
  background: rgba(94, 69, 133, 0.06);
}

.canvas-hint {
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 11px;
  color: #86868b;
  z-index: 1;
  pointer-events: none;
}

.block-wrap {
  position: relative;
}

.img-block {
  position: relative;
  display: inline-block;
  min-width: 120px;
  min-height: 80px;
}

.img-placeholder {
  min-width: 120px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-image-bg, #f5f5f7);
  color: #86868b;
  font-size: 12px;
}

.img-tools {
  position: absolute;
  right: 4px;
  bottom: 4px;
  display: flex;
  gap: 2px;
  z-index: 20;
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

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 16px;
  background-color: #f8f8fa;
  border-radius: 12px;
  margin: 20mm;
  border: 2px dashed #e5e5e7;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.empty-hint {
  font-size: 14px;
  color: #86868b;
  max-width: 280px;
  text-align: center;
}

@media print {
  .empty-state {
    display: none;
  }

  .canvas-hint {
    display: none;
  }
}
</style>
