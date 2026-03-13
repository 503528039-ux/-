<script setup>
import { ref, computed } from 'vue'
import { useCatalogStore } from '../../stores/index'

const emit = defineEmits(['update:src'])
const store = useCatalogStore()

const isPrint = computed(() => store.printMode)
const fileInputRef = ref(null)
const dragOver = ref(false)

function readFile(file) {
  if (!file || !file.type?.startsWith?.('image/')) return
  const reader = new FileReader()
  reader.onload = () => {
    emit('update:src', reader.result)
  }
  reader.readAsDataURL(file)
}

function triggerSelect() {
  fileInputRef.value?.click?.()
}

function onInputChange(event) {
  const file = event.target.files?.[0]
  readFile(file)
  event.target.value = ''
}

function onDragOver() {
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

function onDrop(event) {
  dragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  readFile(file)
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
      <div class="text">上传图片</div>
    </div>
  </div>
</template>

<style scoped>
.uploader {
  position: absolute;
  inset: 0;
  z-index: 12;
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
</style>
