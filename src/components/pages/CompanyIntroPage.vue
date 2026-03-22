<script setup>
import { ref, computed } from 'vue'
import { useCatalogStore } from '../../stores/index'
import A4Page from '../layout/A4Page.vue'
import ImageUploader from '../ui/ImageUploader.vue'
import EditableText from '../ui/EditableText.vue'

const props = defineProps({
  pageIndex: {
    type: Number,
    required: true
  }
})

const store = useCatalogStore()

const pageData = computed(() => {
  return store.pages[props.pageIndex] || {}
})

const headerTitle = '公司概况'

const storyShellRef = ref(null)

function updateField(key, val) {
  if (!store.pages[props.pageIndex]) return
  store.pages[props.pageIndex][key] = val
}

function updateTitle(val) {
  updateField('title', val)
}

function updateSubtitle(val) {
  updateField('sub', val)
}

function onHeroImage(src) {
  updateField('heroImage', src || '')
}

function heroImageStyle() {
  const page = store.pages[props.pageIndex] || {}
  const scale = page.heroScale ?? 1
  const rotation = page.heroRotation ?? 0
  const opacity = page.heroOpacity ?? 1
  const fit = page.heroFit || 'contain'
  const position = page.heroPosition || '50% 50%'
  return {
    transform: `scale(${scale}) rotate(${rotation}deg)`,
    opacity,
    objectFit: fit,
    objectPosition: position
  }
}

function updateHeroScale(delta) {
  const page = store.pages[props.pageIndex]
  if (!page) return
  const next = (page.heroScale ?? 1) + delta
  page.heroScale = Math.min(1.5, Math.max(0.5, next))
}

function updateHeroRotation(delta) {
  const page = store.pages[props.pageIndex]
  if (!page) return
  page.heroRotation = ((page.heroRotation ?? 0) + delta) % 360
}

function updateHeroOpacity(delta) {
  const page = store.pages[props.pageIndex]
  if (!page) return
  const next = (page.heroOpacity ?? 1) + delta
  page.heroOpacity = Math.min(1, Math.max(0.4, next))
}

function cycleHeroFit() {
  const page = store.pages[props.pageIndex]
  if (!page) return
  const cur = page.heroFit || 'contain'
  const next = cur === 'cover' ? 'contain' : cur === 'contain' ? 'fill' : 'cover'
  page.heroFit = next
}

/** 打印时忽略固定宽高，由内容撑开；编辑态可恢复已保存尺寸 */
const storyShellStyle = computed(() => {
  if (store.printMode) return {}
  const page = store.pages[props.pageIndex] || {}
  const w = page.storyBoxWidth
  const h = page.storyBoxHeight
  const style = {}
  if (Number.isFinite(w) && w > 0) style.width = `${Math.round(w)}px`
  if (Number.isFinite(h) && h > 0) style.height = `${Math.round(h)}px`
  return style
})

/**
 * 拖拽调整正文框尺寸
 * @param {'both'|'x'|'y'} axis — both 右下；x 仅宽度（右边条）；y 仅高度（底边条）
 */
function onStoryShellResizeStart(e, axis = 'both') {
  if (store.printMode) return
  e.preventDefault()
  e.stopPropagation()
  const page = store.pages[props.pageIndex]
  const shell = storyShellRef.value
  if (!page || !shell) return

  const rect = shell.getBoundingClientRect()
  const startW = rect.width
  const startH = rect.height
  const startX = e.clientX
  const startY = e.clientY
  const parent = shell.parentElement
  const maxW = parent ? parent.getBoundingClientRect().width : 800
  const minW = 200
  const minH = 120

  function onMove(ev) {
    const dw = ev.clientX - startX
    const dh = ev.clientY - startY
    let w = startW
    let h = startH
    if (axis === 'both' || axis === 'x') {
      w = Math.round(startW + dw)
    }
    if (axis === 'both' || axis === 'y') {
      h = Math.round(startH + dh)
    }
    w = Math.max(minW, Math.min(Math.floor(maxW), w))
    h = Math.max(minH, h)
    page.storyBoxWidth = w
    page.storyBoxHeight = h
  }

  function onUp() {
    document.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerup', onUp)
    document.removeEventListener('pointercancel', onUp)
    document.body.style.removeProperty('user-select')
    try {
      store.recordSnapshot?.()
    } catch {
      // ignore
    }
  }

  document.body.style.userSelect = 'none'
  document.addEventListener('pointermove', onMove)
  document.addEventListener('pointerup', onUp)
  document.addEventListener('pointercancel', onUp)
}
</script>

<template>
  <A4Page
    :page-index="props.pageIndex"
    :page-title="headerTitle"
    :page-number="props.pageIndex + 1"
    :show-header="true"
    :show-footer="true"
  >
    <EditableText tag="h2" class-name="section-title" :value="pageData.title || '品牌故事'" @update:value="updateTitle" />
    <EditableText tag="div" class-name="section-subtitle" :value="pageData.sub || 'Company Profile'" @update:value="updateSubtitle" />

    <div class="hero-img">
      <img
        v-if="pageData.heroImage"
        :src="pageData.heroImage"
        alt=""
        :style="heroImageStyle()"
      />
      <div v-else class="hero-empty">
        <span>点击或拖拽上传品牌图片</span>
      </div>
      <ImageUploader
        v-if="!store.printMode"
        :has-image="!!pageData.heroImage"
        @update:src="onHeroImage"
      />
      <div
        v-if="!store.printMode && pageData.heroImage"
        class="img-tools"
      >
        <button type="button" @click.stop="updateHeroScale(0.1)">＋</button>
        <button type="button" @click.stop="updateHeroScale(-0.1)">－</button>
        <button type="button" @click.stop="updateHeroRotation(-5)">↺</button>
        <button type="button" @click.stop="updateHeroRotation(5)">↻</button>
        <button type="button" @click.stop="updateHeroOpacity(-0.1)">淡</button>
        <button type="button" @click.stop="updateHeroOpacity(0.1)">浓</button>
        <button type="button" @click.stop="cycleHeroFit">适配</button>
      </div>
    </div>

    <!-- 图一：竖条 + 可编辑小标题 -->
    <div class="company-intro-kicker-row">
      <span class="company-intro-kicker-bar" aria-hidden="true" />
      <EditableText
        tag="span"
        class-name="company-intro-kicker-text"
        :value="pageData.storyKicker || '公司优势'"
        @update:value="(v) => updateField('storyKicker', v)"
      />
    </div>

    <!-- 图二：浅紫描边圆角框；右侧调宽、底边调高、右下同时调 -->
    <div
      ref="storyShellRef"
      class="company-intro-story-shell"
      :class="{ 'company-intro-story-shell--print': store.printMode }"
      :style="storyShellStyle"
    >
      <EditableText
        tag="div"
        class-name="text-cols text-cols--in-shell"
        style="white-space: pre-line"
        :root-editable="true"
        :value="pageData.story || ''"
        @update:value="(v) => updateField('story', v)"
      />
      <button
        v-if="!store.printMode"
        type="button"
        class="company-intro-story-resize company-intro-story-resize--e"
        title="拖拽调整宽度"
        aria-label="拖拽调整正文框宽度"
        @pointerdown.stop="(ev) => onStoryShellResizeStart(ev, 'x')"
      />
      <button
        v-if="!store.printMode"
        type="button"
        class="company-intro-story-resize company-intro-story-resize--s"
        title="拖拽调整高度"
        aria-label="拖拽调整正文框高度"
        @pointerdown.stop="(ev) => onStoryShellResizeStart(ev, 'y')"
      />
      <button
        v-if="!store.printMode"
        type="button"
        class="company-intro-story-resize company-intro-story-resize--se"
        title="拖拽同时调整宽高"
        aria-label="拖拽同时调整正文框宽高"
        @pointerdown.stop="(ev) => onStoryShellResizeStart(ev, 'both')"
      />
    </div>
  </A4Page>
</template>

<style scoped>
.hero-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e5ea;
  color: #86868b;
  font-size: 13px;
}

.img-tools {
  position: absolute;
  right: 6mm;
  bottom: 4mm;
  display: flex;
  gap: 3px;
  z-index: 20;
}

.img-tools button {
  border: none;
  padding: 0 6px;
  font-size: 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  cursor: pointer;
}

.company-intro-kicker-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3mm;
}

.company-intro-kicker-bar {
  flex-shrink: 0;
  width: 3px;
  height: 1.15em;
  min-height: 14px;
  border-radius: 1px;
  background: #000;
}

.company-intro-kicker-row :deep(.company-intro-kicker-text) {
  display: inline-block;
  vertical-align: middle;
  font-family: "PingFang SC", "PingFang TC", "Heiti SC", "Microsoft YaHei", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #000;
  letter-spacing: 0.02em;
}

.company-intro-kicker-row :deep(.editable-core) {
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
  letter-spacing: inherit;
}

.company-intro-story-shell {
  position: relative;
  box-sizing: border-box;
  align-self: flex-start;
  flex-shrink: 0;
  max-width: 100%;
  min-width: calc(65% + 16mm);
  min-height: calc(48mm + 16mm);
  padding: 5mm;
  padding-right: calc(5mm + 10px);
  padding-bottom: calc(5mm + 12px);
  border: 1px solid rgba(94, 69, 133, 0.42);
  border-radius: 10px;
  background: #faf9fc;
  overflow: auto;
}

.company-intro-story-resize {
  position: absolute;
  padding: 0;
  border: none;
  touch-action: none;
  z-index: 6;
  box-sizing: border-box;
}

/* 右侧：仅改宽度 */
.company-intro-story-resize--e {
  right: 0;
  top: 10px;
  bottom: 26px;
  width: 12px;
  cursor: ew-resize;
  background: rgba(94, 69, 133, 0.18);
  border-radius: 0 8px 8px 0;
}

.company-intro-story-resize--e:hover {
  background: rgba(94, 69, 133, 0.32);
}

/* 底边：仅改高度 */
.company-intro-story-resize--s {
  bottom: 0;
  left: 10px;
  right: 26px;
  height: 12px;
  cursor: ns-resize;
  background: rgba(94, 69, 133, 0.18);
  border-radius: 0 0 8px 8px;
}

.company-intro-story-resize--s:hover {
  background: rgba(94, 69, 133, 0.32);
}

/* 右下：同时改宽高 */
.company-intro-story-resize--se {
  right: 0;
  bottom: 0;
  width: 22px;
  height: 22px;
  cursor: nwse-resize;
  background: linear-gradient(
    135deg,
    transparent 0%,
    transparent 50%,
    rgba(94, 69, 133, 0.35) 50%,
    rgba(94, 69, 133, 0.35) 100%
  );
  border-bottom-right-radius: 9px;
}

.company-intro-story-resize--se:hover {
  background: linear-gradient(
    135deg,
    transparent 0%,
    transparent 50%,
    rgba(94, 69, 133, 0.55) 50%,
    rgba(94, 69, 133, 0.55) 100%
  );
}

.company-intro-story-shell--print {
  overflow: visible !important;
  width: 100% !important;
  height: auto !important;
  min-height: 0 !important;
  padding: 5mm !important;
}

.company-intro-story-shell--print .company-intro-story-resize {
  display: none;
}
</style>
