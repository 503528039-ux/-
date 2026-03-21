<script setup>
import { ref, computed } from 'vue'
import { useCatalogStore } from '../../stores/index'
import { readImageFileAsDataURL } from '../../composables/useImageFileReader'

const props = defineProps({
  /** 外部可告知当前是否已有图片，用于决定是否显示删除按钮 */
  hasImage: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:src'])
const store = useCatalogStore()

const isPrint = computed(() => store.printMode)
const fileInputRef = ref(null)
const dragOver = ref(false)
const replaceArmed = ref(false)

async function readFile(file) {
  const dataUrl = await readImageFileAsDataURL(file)
  if (dataUrl) emit('update:src', dataUrl)
}

function clearImage(e) {
  if (e && typeof e.stopPropagation === 'function') {
    e.stopPropagation()
  }
  // 约定：null 表示删除当前图片
  emit('update:src', null)
}

function triggerSelect() {
  // 已有图片时，不允许直接点击替换，避免误覆盖
  if (props.hasImage && !replaceArmed.value) return
  fileInputRef.value?.click?.()
}

function armReplace(e) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation()
  replaceArmed.value = true
  triggerSelect()
}

async function onInputChange(event) {
  const file = event.target.files?.[0]
  await readFile(file)
  event.target.value = ''
  replaceArmed.value = false
}

function onDragOver() {
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

async function onDrop(event) {
  dragOver.value = false
  // 已有图片时，不允许直接拖拽替换，避免误覆盖
  if (props.hasImage && !replaceArmed.value) return
  const file = event.dataTransfer?.files?.[0]
  await readFile(file)
  replaceArmed.value = false
}
</script>

<template>
  <div
    v-if="!isPrint"
    class="uploader"
    :class="{ 'is-over': dragOver }"
    @click.stop="triggerSelect"
    @dragover.prevent.stop="onDragOver"
    @dragleave.prevent.stop="onDragLeave"
    @drop.prevent.stop="onDrop"
  >
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onInputChange"
    />
    <div class="overlay">
      <div class="icon">⬆</div>
      <div class="text">点击或拖拽上传</div>
      <button
        v-if="hasImage"
        class="replace-btn"
        type="button"
        @click.stop="armReplace"
      >
        替换图片
      </button>
      <button
        v-if="hasImage"
        class="clear-btn"
        type="button"
        @click.stop="clearImage"
      >
        删除图片
      </button>
    </div>
  </div>
</template>

<style scoped>
.uploader {
  position: absolute;
  inset: 0;
  /* 上传层不要盖住图片编辑工具条 */
  z-index: 10;
  cursor: pointer;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.28);
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.uploader:hover .overlay,
.uploader.is-over .overlay {
  opacity: 1;
}

.icon {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.18);
  font-size: 14px;
}

.text {
  font-size: 11px;
  letter-spacing: 1px;
}

.clear-btn {
  margin-top: 6px;
  padding: 2px 8px;
  font-size: 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
}

.replace-btn {
  margin-top: 6px;
  padding: 2px 8px;
  font-size: 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}
</style>
