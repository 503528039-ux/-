<script setup>
import { computed, ref, watch } from 'vue'
import { useCatalogStore } from '../../stores/index'
import A4Page from '../layout/A4Page.vue'
import ImageUploader from '../ui/ImageUploader.vue'
import EditableText from '../ui/EditableText.vue'

const store = useCatalogStore()
const props = defineProps({
  /** 年份 */
  year: {
    type: String,
    default: '2026'
  },
  
  /** 主标题 */
  mainTitle: {
    type: String,
    default: '雅洁五金'
  },
  
  /** 英文品牌名 */
  englishBrand: {
    type: String,
    default: 'ARCHIE'
  },
  
  /** 副标题 */
  subtitle: {
    type: String,
    default: '工程产品手册'
  },
  
  /** 英文副标题 */
  englishSubtitle: {
    type: String,
    default: 'ENGINEERING SOLUTIONS'
  },
  
  /** 背景渐变颜色 */
  backgroundGradient: {
    type: String,
    default: 'radial-gradient(circle at 50% 30%, #644B8E 0%, #2A1A40 100%)'
  },
  
  /** 水印文本 */
  watermarkText: {
    type: String,
    default: 'ARCHIE'
  },
  
  /** 是否显示裁切线 */
  showCropMarks: {
    type: Boolean,
    default: true
  },
  
  /** 是否显示装饰背景 */
  showDecoration: {
    type: Boolean,
    default: true
  },
  
  /** 页面索引（用于更新store） */
  pageIndex: {
    type: Number,
    default: -1
  }
})

// 本地编辑状态
const localProps = ref({
  year: props.year,
  mainTitle: props.mainTitle,
  englishBrand: props.englishBrand,
  subtitle: props.subtitle,
  englishSubtitle: props.englishSubtitle,
  watermarkText: props.watermarkText,
  companyCn: '广东雅洁五金有限公司',
  companyEn: 'Guangdong Archie Hardware Co., Ltd.',
  slogan: '专注五金领域的创想家 / Since 1990',
  website: 'www.archie.com.cn'
})

function ensurePageProps() {
  if (props.pageIndex < 0) return null
  const page = store.pages[props.pageIndex]
  if (!page) return null
  if (!page.props || typeof page.props !== 'object') page.props = {}
  return page
}

function updateCoverProp(key, val) {
  const page = ensurePageProps()
  if (!page) return
  store.recordSnapshot?.()
  page.props[key] = val
}

const coverProps = computed(() => {
  const page = props.pageIndex >= 0 ? store.pages[props.pageIndex] : null
  const p = page?.props || {}
  return {
    year: p.year ?? props.year,
    mainTitle: p.mainTitle ?? props.mainTitle,
    englishBrand: p.englishBrand ?? props.englishBrand,
    subtitle: p.subtitle ?? props.subtitle,
    englishSubtitle: p.englishSubtitle ?? props.englishSubtitle,
    watermarkText: p.watermarkText ?? props.watermarkText,
    companyCn: p.companyCn ?? '广东雅洁五金有限公司',
    companyEn: p.companyEn ?? 'Guangdong Archie Hardware Co., Ltd.',
    slogan: p.slogan ?? '专注五金领域的创想家 / Since 1990',
    website: p.website ?? 'www.archie.com.cn',
    // 默认就视为“已插入图片”
    heroImage: p.heroImage ?? '/salo-handles-cutout.png'
  }
})

function ensureCoverHero() {
  const page = ensurePageProps()
  if (!page) return null
  const p = page.props
  if (p.heroImage == null || p.heroImage === '') p.heroImage = '/salo-handles-cutout.png'
  if (p.heroScale == null) p.heroScale = 1
  if (p.heroRotation == null) p.heroRotation = 0
  // 默认透明度：作为暗纹但可见
  if (p.heroOpacity == null) p.heroOpacity = 0.65
  if (p.heroFit == null) p.heroFit = 'contain'
  if (p.heroPosition == null) p.heroPosition = '50% 50%'
  return p
}

function coverHeroStyle() {
  const page = store.pages[props.pageIndex] || {}
  const p = page.props || {}
  const scale = p.heroScale ?? 1
  const rotation = p.heroRotation ?? 0
  const opacity = p.heroOpacity ?? 0.65
  const fit = p.heroFit || 'contain'
  const position = p.heroPosition || '50% 50%'
  return {
    transform: `scale(${scale}) rotate(${rotation}deg)`,
    opacity,
    objectFit: fit,
    objectPosition: position
  }
}

function updateHeroScale(delta) {
  const p = ensureCoverHero()
  if (!p) return
  const next = (p.heroScale ?? 1) + delta
  p.heroScale = Math.min(1.8, Math.max(0.4, next))
}

function updateHeroRotation(delta) {
  const p = ensureCoverHero()
  if (!p) return
  p.heroRotation = ((p.heroRotation ?? 0) + delta) % 360
}

function updateHeroOpacity(delta) {
  const p = ensureCoverHero()
  if (!p) return
  const next = (p.heroOpacity ?? 0.65) + delta
  p.heroOpacity = Math.min(1, Math.max(0.08, next))
}

function cycleHeroFit() {
  const p = ensureCoverHero()
  if (!p) return
  const cur = p.heroFit || 'contain'
  const next = cur === 'cover' ? 'contain' : cur === 'contain' ? 'fill' : 'cover'
  p.heroFit = next
}

function clearHeroImage() {
  const p = ensureCoverHero()
  if (!p) return
  // 清空 = 回到默认图
  p.heroImage = '/salo-handles-cutout.png'
}

// 是否处于编辑模式
const isEditing = ref(false)

// 封面样式
const coverStyle = computed(() => ({
  background: props.backgroundGradient
}))

// 水印样式
const watermarkStyle = computed(() => ({
  opacity: 0.04
}))

// 监听props变化，更新本地状态
watch(() => props, (newProps) => {
  localProps.value = {
    year: newProps.year,
    mainTitle: newProps.mainTitle,
    englishBrand: newProps.englishBrand,
    subtitle: newProps.subtitle,
    englishSubtitle: newProps.englishSubtitle,
    watermarkText: newProps.watermarkText,
    companyCn: coverProps.value.companyCn,
    companyEn: coverProps.value.companyEn,
    slogan: coverProps.value.slogan,
    website: coverProps.value.website
  }
}, { deep: true, immediate: true })

// 保存编辑内容到store
function saveEdit() {
  const page = ensurePageProps()
  if (page) {
    store.recordSnapshot?.()
    page.props = { ...(page.props || {}), ...localProps.value }
  }
  isEditing.value = false
}

// 取消编辑
function cancelEdit() {
  localProps.value = {
    year: props.year,
    mainTitle: props.mainTitle,
    englishBrand: props.englishBrand,
    subtitle: props.subtitle,
    englishSubtitle: props.englishSubtitle,
    watermarkText: props.watermarkText,
    companyCn: coverProps.value.companyCn,
    companyEn: coverProps.value.companyEn,
    slogan: coverProps.value.slogan,
    website: coverProps.value.website
  }
  isEditing.value = false
}

// 开始编辑
function startEdit() {
  isEditing.value = true
}

// 封面产品图已改为 coverProps.heroImage（可直接上传/删除）
</script>

<template>
   <A4Page
    :isCover="true"
    :showHeader="false"
    :showFooter="false"
    :customClass="'cover-page'"
    :page-index="props.pageIndex"
  >
      <!-- 编辑工具栏（仅在非打印模式且非编辑状态时显示） -->
      <div
        v-if="!store.printMode && !isEditing"
        class="absolute top-4 left-4 z-50 flex gap-2 no-print"
      >
        <button
          @click="startEdit"
          class="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-lg shadow-md text-xs font-medium hover:bg-white transition-all flex items-center gap-1.5 border border-gray-200"
          title="编辑封面内容"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          编辑
        </button>
      </div>

      <!-- 编辑模态框（编辑状态时显示） -->
      <div
        v-if="isEditing"
        class="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800">编辑封面内容</h3>
            <button @click="cancelEdit" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">中文品牌</label>
              <input
                v-model="localProps.mainTitle"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-archie-purple focus:border-transparent"
                placeholder="输入中文品牌名"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">英文品牌</label>
              <input
                v-model="localProps.englishBrand"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-archie-purple focus:border-transparent"
                placeholder="输入英文品牌名"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">年份</label>
              <input
                v-model="localProps.year"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-archie-purple focus:border-transparent"
                placeholder="输入年份"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">副标题</label>
              <input
                v-model="localProps.subtitle"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-archie-purple focus:border-transparent"
                placeholder="输入副标题"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">英文副标题</label>
              <input
                v-model="localProps.englishSubtitle"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-archie-purple focus:border-transparent"
                placeholder="输入英文副标题"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">水印文本</label>
              <input
                v-model="localProps.watermarkText"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-archie-purple focus:border-transparent"
                placeholder="输入水印文本"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">公司中文名</label>
              <input
                v-model="localProps.companyCn"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-archie-purple focus:border-transparent"
                placeholder="输入公司中文名"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">公司英文名</label>
              <input
                v-model="localProps.companyEn"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-archie-purple focus:border-transparent"
                placeholder="输入公司英文名"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">口号 / 标语</label>
              <input
                v-model="localProps.slogan"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-archie-purple focus:border-transparent"
                placeholder="输入口号"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">官网</label>
              <input
                v-model="localProps.website"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-archie-purple focus:border-transparent"
                placeholder="输入官网"
              />
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button
              @click="cancelEdit"
              class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              取消
            </button>
            <button
              @click="saveEdit"
              class="flex-1 px-4 py-2.5 bg-brand-archie-purple text-white rounded-lg hover:bg-purple-700 transition font-medium"
            >
              保存更改
            </button>
          </div>
        </div>
      </div>

      <!-- 水印背景：用 SVG textLength 强制文字精确填满 viewBox 宽度，两边固定 5% 留白 -->
      <!-- viewBox 宽 1000，textLength=900 → 两边各留 50 单位(5%)，绝不截断 -->
      <svg v-if="coverProps.watermarkText"
        class="cover-watermark-svg"
        viewBox="0 0 1000 260"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <text
          x="500" y="210"
          text-anchor="middle"
          textLength="880"
          lengthAdjust="spacingAndGlyphs"
          font-family="'Inter', -apple-system, sans-serif"
          font-weight="900"
          font-size="210"
          fill="white"
          opacity="0.07"
        >{{ coverProps.watermarkText }}</text>
      </svg>

      <!-- 裁切线 (使用 main.css 中的 .cover-crop-marks) -->
      <div v-if="showCropMarks" class="cover-crop-marks">
        <div class="crop-tl"></div>
        <div class="crop-tr"></div>
        <div class="crop-bl"></div>
        <div class="crop-br"></div>
      </div>

      <!-- 装饰背景已移除把手图形，保留节点供将来扩展 -->

      <!-- 封面主内容 (使用 main.css 中的样式类) -->
      <img src="/archie-logo-white.png" alt="ARCHIE Logo" class="cover-logo" />
      
      <div class="title-group">
        <EditableText
          tag="h2"
          class-name="en-brand"
          style="margin-bottom: 5mm; margin-left: 24px;"
          :value="coverProps.englishBrand"
          @update:value="(v) => updateCoverProp('englishBrand', v)"
        />
        <EditableText
          tag="h1"
          class-name="cn-brand"
          :value="coverProps.mainTitle"
          @update:value="(v) => updateCoverProp('mainTitle', v)"
        />
      </div>

      <div class="middle-group">
        <!-- 年份标题 -->
        <div class="year">
          <EditableText
            tag="span"
            :value="coverProps.year"
            @update:value="(v) => updateCoverProp('year', v)"
          />
          <span>&nbsp;</span>
          <EditableText
            tag="span"
            :value="coverProps.subtitle"
            @update:value="(v) => updateCoverProp('subtitle', v)"
          />
        </div>
        
        <!-- 英文副标题 -->
        <div style="font-size: 10px; letter-spacing: 5px; color: var(--archie-gold); margin-top: 10px; margin-left: 18px; opacity: 0.8; white-space: nowrap;">
          <EditableText
            tag="span"
            :value="coverProps.englishSubtitle"
            @update:value="(v) => updateCoverProp('englishSubtitle', v)"
          />
        </div>
      </div>

      <!-- 悬浮高级产品图填充 -->
      <div class="cover-hero-product">
        <img :src="coverProps.heroImage" alt="" :style="coverHeroStyle()" />
        <ImageUploader
          v-if="!store.printMode"
          :has-image="true"
          @update:src="(src) => updateCoverProp('heroImage', src || '')"
        />
        <div v-if="!store.printMode" class="img-tools img-tools--cover-hero">
          <button type="button" @click.stop="updateHeroScale(0.1)">＋</button>
          <button type="button" @click.stop="updateHeroScale(-0.1)">－</button>
          <button type="button" @click.stop="updateHeroRotation(-5)">↺</button>
          <button type="button" @click.stop="updateHeroRotation(5)">↻</button>
          <button type="button" @click.stop="updateHeroOpacity(-0.08)">淡</button>
          <button type="button" @click.stop="updateHeroOpacity(0.08)">浓</button>
          <button type="button" @click.stop="cycleHeroFit">适配</button>
          <button type="button" @click.stop="clearHeroImage">重置</button>
        </div>
      </div>

      <!-- 底部品牌信息块 (左右非对称平衡) -->
      <div class="cover-bottom-info">
        <div class="bottom-left">
          <EditableText
            tag="div"
            class-name="company-name"
            :value="coverProps.companyCn"
            @update:value="(v) => updateCoverProp('companyCn', v)"
          />
          <EditableText
            tag="div"
            class-name="company-en"
            :value="coverProps.companyEn"
            @update:value="(v) => updateCoverProp('companyEn', v)"
          />
        </div>
        <div class="bottom-right">
          <EditableText
            tag="div"
            class-name="brand-slogan"
            :value="coverProps.slogan"
            @update:value="(v) => updateCoverProp('slogan', v)"
          />
          <EditableText
            tag="div"
            class-name="company-url"
            :value="coverProps.website"
            @update:value="(v) => updateCoverProp('website', v)"
          />
        </div>
      </div>
  </A4Page>
</template>

<style scoped>
/* 
  封面页样式 - 主要样式已在 src/assets/main.css 中定义
  此处仅保留组件特定的覆盖样式
*/

/* 封面产品图区域（如果有的话保留，logo样式在此添加） */
.cover-logo {
  position: absolute;
  top: 15mm;
  left: 20mm;
  height: 6mm; /* 缩小变为精致印记 */
  width: auto;
  max-width: 50mm;
  object-fit: contain;
  opacity: 0.95;
  z-index: 20;
}

/* 顶部标题组排版容器 */
.title-group {
  margin-top: 30mm;
  margin-left: 5mm; /* 配合 .cn-brand 本身的 margin-left */
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
}

/* 中部过渡排版容器 */
.middle-group {
  margin-top: 25mm;
  margin-left: 10mm; /* 减小左偏，防止文字右侧溢出 */
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: calc(100% - 10mm);
  box-sizing: border-box;
}

/* 底部品牌信息块拆分：不对称平衡 */
.cover-bottom-info {
  margin-top: auto; 
  margin-bottom: 20mm; 
  width: 100%;
  display: flex;
  flex-direction: row; /* 改为横向分布 */
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
  z-index: 10;
  box-sizing: border-box;
}

.bottom-left, .bottom-right {
  display: flex;
  flex-direction: column;
}

.bottom-left {
  align-items: flex-start;
  text-align: left;
  gap: 4px;
}

.bottom-right {
  align-items: flex-end;
  text-align: right;
  gap: 4px;
}

.brand-slogan {
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--archie-gold);
  opacity: 0.9;
  font-weight: 300;
  margin-bottom: 4px;
}

.company-name {
  font-size: 16px;
  letter-spacing: 2px;
  color: #ffffff;
  opacity: 0.85;
  font-weight: 300;
}

.company-en {
  font-size: 9px;
  letter-spacing: 1.5px;
  color: #ffffff;
  opacity: 0.6;
  font-family: 'Inter', -apple-system, sans-serif;
  text-transform: uppercase;
}

.company-url {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--archie-gold);
  opacity: 0.7;
  font-family: 'Inter', -apple-system, sans-serif;
}

.cover-divider-space {
  display: none; /* 使用排版容器间距替代这个粗暴的留白 */
}

/* 高级产品暗纹融入样式 */
.cover-hero-product {
  position: absolute;
  top: calc(45% + 5mm); /* 向下移动5mm */
  right: -15mm; /* 根据要求调整至 -15mm，找到最合适的边缘裁切点 */
  width: 165mm; /* 保持大尺寸 */
  z-index: 5; /* 放在文字层之下，作为背景元素 */
  /* 透明度/混合模式改由图片 style 控制，容器仅负责定位 */
  pointer-events: auto;
}
.cover-hero-product img {
  width: 100%;
  height: auto;
  object-fit: contain;
  filter: contrast(1.2); /* 稍微提升对比度让轮廓清晰 */
  pointer-events: none;
}

.img-tools--cover-hero {
  position: absolute;
  right: 6px;
  bottom: 6px;
  display: flex;
  gap: 3px;
  z-index: 30;
  pointer-events: auto;
}

.img-tools--cover-hero button {
  border: none;
  padding: 0 6px;
  font-size: 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  cursor: pointer;
}

/* 响应式调整 - 小屏设备 */
@media screen and (max-width: 768px) {
  :deep(.cn-brand) {
    font-size: 70px !important;
    letter-spacing: 16px !important;
    margin-left: 16px !important;
  }
  
  :deep(.en-brand) {
    font-size: 18px !important;
    letter-spacing: 12px !important;
  }
  
  :deep(.year) {
    font-size: 36px !important;
    letter-spacing: 10px !important;
  }
  
  :deep(.cover-watermark) {
    font-size: 120px !important;
    letter-spacing: 20px !important;
  }
}

@media screen and (max-width: 480px) {
  :deep(.cn-brand) {
    font-size: 50px !important;
    letter-spacing: 12px !important;
    margin-left: 12px !important;
  }
  
  :deep(.en-brand) {
    font-size: 14px !important;
    letter-spacing: 8px !important;
  }
  
  :deep(.year) {
    font-size: 28px !important;
    letter-spacing: 8px !important;
  }
  
  :deep(.cover-watermark) {
    font-size: 80px !important;
    letter-spacing: 15px !important;
  }
}
</style>
