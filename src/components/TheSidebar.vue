<script setup>
import { ref } from 'vue'
import { useCatalogStore } from '../stores/index'
import * as XLSX from 'xlsx'
import ConfirmModal from './ConfirmModal.vue'

const store = useCatalogStore()
const excelInput = { click: () => document.getElementById('xls-in').click() }
const jsonInput = { click: () => document.getElementById('json-in').click() }

// 本地 UI 开关：编辑模式下可手动隐藏/显示该面板
const showControls = ref(true)

// 清空确认对话框状态
const showResetConfirm = ref(false)

// 页面创建确认对话框状态
const showPageConfirm = ref(false)
const pendingPageType = ref('')
const pendingPageSubtype = ref('')

// 页面类型映射表
const pageTypeNames = {
  'cover': '封面页 (PAGE 01)',
  'companyIntro': '公司简介页 (PAGE 02)',
  'certificates': '荣誉资质页 (PAGE 03)',
  'partners': '战略合作伙伴页 (PAGE 04)',
  'projectCases': '工程案例页 (PAGE 05)',
  'surfaceFinishes': '表面处理页 (PAGE 06)',
  'tableOfContents': '目录页 (PAGE 07)',
  'divider': '过渡页 (PAGE 08)',
  'productGrid': '产品实拍页 (PAGE 09/10)',
  'compositeProduct': '复合产品页 (PAGE 11/12)',
  'backCover': '封底页 (PAGE 13)',
  'free': '自由编辑页'
}

// 子类型映射表
const pageSubtypeNames = {
  'lock': '门锁五金',
  'hardware': '工程小五金',
  'smartLock': '智能门锁'
}

// 简单的 Toast 提示
const showToast = ref(false)
const toastMessage = ref('')

function showToastMessage(message) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

function downloadTemplate() {
  // 第一行即为表头（勿在表头之上再加大标题行，便于程序识别列名）
  // 品类填：智能门锁 | 门锁 | 其他五金（与后续导入分三类一致）
  const ws = XLSX.utils.aoa_to_sheet([
    [
      '序号',
      '品类',
      '产品名称',
      '型号',
      '材质',
      '规格',
      '表面处理',
      '可选锁体',
      '安装中心距',
      '锁体中心距离',
      '使用范围',
      '价格',
      '图片文件名'
    ],
    [
      '1',
      '智能门锁',
      '指纹智能锁示例',
      'AJ-SL-001',
      '锌合金',
      '指纹、密码、机械钥匙',
      '铂金灰',
      '',
      '',
      '',
      '智能门 / 公寓门',
      '',
      'AJ-SL-001.jpg'
    ],
    [
      '2',
      '门锁',
      '入户机械锁示例',
      'AJ-MODEL-001',
      '不锈钢',
      '锁体60×85mm',
      '拉丝',
      '',
      '',
      '',
      '工程门',
      '',
      'AJ-MODEL-001.jpg'
    ],
    [
      '3',
      '其他五金',
      '防盗锁体示例',
      'S6030E',
      '钢、铁',
      '安装中心距60mm，锁体中心距85mm',
      '',
      '',
      '',
      '',
      '',
      '',
      'S6030E.jpg'
    ]
  ])
  ws['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 22 },
    { wch: 18 },
    { wch: 10 },
    { wch: 32 },
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 24 },
    { wch: 8 },
    { wch: 24 }
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, '雅洁产品导入模板.xlsx')
}

// 处理清空确认
function handleResetConfirm() {
  showResetConfirm.value = true
}

// 确认清空
function handleResetConfirmed() {
  store.resetData()
  showToastMessage('数据已安全清除')
}

// 取消清空
function handleResetCancelled() {
  // 什么都不做，只是关闭对话框
}

// 页面创建确认功能
function addPageWithConfirm(pageType, subtype = null) {
  pendingPageType.value = pageType
  pendingPageSubtype.value = subtype
  showPageConfirm.value = true
}

// 确认创建页面
function handlePageConfirmed() {
  // 使用 addPage 支持子类型（门锁/小五金）
  if (pendingPageSubtype.value) {
    store.addPage(pendingPageType.value, pendingPageSubtype.value)
  } else {
    // 兼容无子类型页面
    store.insertPage(pendingPageType.value)
  }
  
  // 显示创建成功提示
  let pageName = pageTypeNames[pendingPageType.value] || pendingPageType.value
  if (pendingPageSubtype.value && pageSubtypeNames[pendingPageSubtype.value]) {
    pageName += ` - ${pageSubtypeNames[pendingPageSubtype.value]}`
  }
  showToastMessage(`已创建: ${pageName}`)
  
  // 重置状态
  pendingPageType.value = ''
  pendingPageSubtype.value = ''
}

// 取消创建页面
function handlePageCancelled() {
  pendingPageType.value = ''
  pendingPageSubtype.value = ''
}

/** 页眉标题颜色快捷选择（与全局 store 同步） */
const headerTitlePresets = ['#1d1d1f', '#5e4585', '#86868b', '#0f172a', '#1d4ed8', '#9a805e']

/** 页眉标题色块背景（默认淡薰衣草灰，与品牌紫协调） */
const headerTitleBlockPresets = [
  '#EDE9F5',
  '#F5F3FA',
  '#E8E4F0',
  '#F5F5F7',
  '#EEF6FF',
  '#FFF4E6'
]
</script>

<template>
  <button
    v-if="!store.printMode && !showControls"
    type="button"
    class="sidebar-toggle fixed top-5 right-5 z-50 px-3 py-2 no-print"
    @click="showControls = true"
  >
    显示面板
  </button>

  <div class="fixed top-5 right-5 z-50 flex flex-col gap-3 no-print" v-if="!store.printMode">
    <div
      class="sidebar-panel p-4 rounded-2xl flex flex-col gap-2 w-48 max-h-[85vh] overflow-y-auto"
      v-if="showControls"
    >
      <div
        class="sidebar-brand text-[color:var(--brand-purple)] font-black sticky top-0 z-10 flex items-center justify-between px-1"
      >
        <span>ARCHIE STUDIO</span>
        <button
          type="button"
          class="w-7 h-7 rounded-full hover:bg-gray-100 text-gray-500"
          @click="showControls = false"
        >
          ×
        </button>
      </div>
      
      <div class="flex gap-2 mb-2">
          <button @click="store.undo()" :disabled="!store.canUndo" class="btn-undo flex items-center justify-center flex-1">↩</button>
          <button @click="store.redo()" :disabled="!store.canRedo" class="btn-undo flex items-center justify-center flex-1">↪</button>
          <button @click="handleResetConfirm" class="btn-undo bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center flex-1" title="清空">🗑️</button>
      </div>

      <div class="text-[10px] text-gray-400 font-bold uppercase px-1 mb-1">页眉（全页）</div>
      <div class="flex flex-col gap-2 mb-2 text-[10px]">
        <label class="flex items-center gap-2 text-gray-600">
          <span class="w-8 shrink-0">颜色</span>
          <input
            type="color"
            class="h-8 flex-1 min-w-0 rounded border border-gray-200 cursor-pointer bg-white"
            :value="store.headerTitleColor"
            @input="store.headerTitleColor = $event.target.value"
          >
        </label>
        <div class="flex flex-wrap gap-1 justify-end">
          <button
            v-for="c in headerTitlePresets"
            :key="c"
            type="button"
            class="w-7 h-7 rounded border border-gray-200 shrink-0 shadow-sm"
            :title="c"
            :style="{ backgroundColor: c }"
            @click="store.headerTitleColor = c"
          />
        </div>
        <label class="flex items-center gap-2 text-gray-600">
          <span class="w-8 shrink-0">字号</span>
          <select
            v-model.number="store.headerTitleFontSizePx"
            class="flex-1 rounded border border-gray-200 px-1 py-1.5 text-xs bg-white"
          >
            <option v-for="n in [12, 13, 14, 15, 16, 17, 18, 19, 20]" :key="n" :value="n">{{ n }}px</option>
          </select>
        </label>
        <label class="flex items-center gap-2 text-gray-600">
          <span class="w-14 shrink-0">色块背景</span>
          <input
            type="color"
            class="h-8 flex-1 min-w-0 rounded border border-gray-200 cursor-pointer bg-white"
            :value="store.headerTitleBlockColor"
            @input="store.headerTitleBlockColor = $event.target.value"
          >
        </label>
        <div class="flex flex-wrap gap-1 justify-end">
          <button
            v-for="c in headerTitleBlockPresets"
            :key="'blk-' + c"
            type="button"
            class="w-7 h-7 rounded border border-gray-200 shrink-0 shadow-sm"
            :title="c"
            :style="{ backgroundColor: c }"
            @click="store.headerTitleBlockColor = c"
          />
        </div>
      </div>
      
       <div class="text-[10px] text-gray-400 font-bold uppercase px-1 mb-1">📋 标准页面模板</div>
       <div class="grid grid-cols-2 gap-2 text-[10px]">
           <!-- 第1组: 封面和公司介绍 -->
           <button @click="addPageWithConfirm('cover')" class="btn-primary" title="PAGE 01: 封面页">📘 封面</button>
           <button @click="addPageWithConfirm('companyIntro')" class="btn-tool" title="PAGE 02: 公司简介页">🏢 公司简介</button>
           
           <!-- 第2组: 荣誉和合作伙伴 -->
           <button @click="addPageWithConfirm('certificates')" class="btn-tool" title="PAGE 03: 荣誉资质页 (4×2网格)">🏆 荣誉资质</button>
           <button @click="addPageWithConfirm('partners')" class="btn-tool" title="PAGE 04: 战略合作伙伴页 (3×5网格)">🤝 合作伙伴</button>
           
           <!-- 第3组: 工程案例和表面处理 -->
           <button @click="addPageWithConfirm('projectCases')" class="btn-tool" title="PAGE 05: 工程案例页 (3×3网格)">🏗️ 工程案例</button>
           <button @click="addPageWithConfirm('surfaceFinishes')" class="btn-tool" title="PAGE 06: 表面处理页 (6×6网格)">🌈 表面处理</button>
           
           <!-- 第4组: 目录和过渡页 -->
           <button @click="addPageWithConfirm('tableOfContents')" class="btn-tool" title="PAGE 07: 目录页">📑 目录</button>
           <button @click="addPageWithConfirm('divider')" class="btn-tool" title="PAGE 08: 过渡页">➖ 过渡页</button>
           
          <!-- 第5组: 智能门锁（第一行） -->
          <button @click="addPageWithConfirm('productGrid', 'smartLock')" class="btn-success" title="PAGE 09/10: 智能门锁（无线图）(2×3网格)">🤖 智能门锁（无线图）</button>
          <button @click="addPageWithConfirm('compositeProduct', 'smartLock')" class="btn-purple" title="PAGE 11/12: 智能门锁（有线图）(复合模式)">🤖 智能门锁（有线图）</button>
          
          <!-- 第6组: 门锁（第二行） -->
          <button @click="addPageWithConfirm('productGrid', 'lock')" class="btn-success" title="PAGE 09/10: 门锁产品（无线图）(2×3网格)">🔒 门锁产品（无线图）</button>
          <button @click="addPageWithConfirm('compositeProduct', 'lock')" class="btn-purple" title="PAGE 11/12: 门锁产品（有线图）(复合模式)">🔄 门锁产品（有线图）</button>
          
          <!-- 第7组: 其他五金（第三行） -->
          <button @click="addPageWithConfirm('productGrid', 'hardware')" class="btn-success" title="PAGE 09/10: 其他五金产品（无线图）(2×3网格)">🛠 其他五金产品（无线图）</button>
          <button @click="addPageWithConfirm('compositeProduct', 'hardware')" class="btn-purple" title="PAGE 11/12: 其他五金产品（有线图）(复合模式)">🛠 其他五金产品（有线图）</button>
           
           <!-- 第7组: 封底页 -->
           <button @click="addPageWithConfirm('backCover')" class="btn-dark col-span-2" title="PAGE 13: 封底页">📕 封底</button>
       </div>
       
       <div class="h-px bg-gray-200 my-1"></div>
       
       <div class="text-[10px] text-gray-400 font-bold uppercase px-1 mb-1">🎨 自由编辑</div>
       <div class="grid grid-cols-1 gap-2 text-[10px]">
           <button @click="addPageWithConfirm('free')" class="btn-tool" title="自由编辑页">🎨 自由编辑页</button>
       </div>
      
      <div class="h-px bg-gray-200 my-1"></div>
      
      <div class="flex gap-2">
          <button @click="store.showPrice = !store.showPrice" class="btn-toggle flex-1 text-xs" :class="store.showPrice?'active':''">{{ store.showPrice ? '✓ 报价' : '○ 报价' }}</button>
          <button @click="store.generatePageNumbers()" class="btn-orange-outline flex-1 text-[10px]"># 自动页码</button>
      </div>
      <div class="grid grid-cols-2 gap-2 mt-1">
          <button @click="store.triggerPrint()" class="btn-dark text-xs flex items-center justify-center gap-1">🖨 预览</button>
          <button @click="store.exportToPDF()" class="btn-success text-xs flex items-center justify-center gap-1" title="印刷级：系统打印到PDF（文字矢量，推荐）">📄 PDF</button>
      </div>
      <div class="grid grid-cols-1 gap-2 mt-1">
          <button @click="store.exportToPDFImage({ targetDpi: 300 })" class="btn-tool text-xs flex items-center justify-center gap-1" title="备选：高清图片PDF（300DPI，文件更大）">🖼 高清PDF</button>
      </div>
      
      <div class="sidebar-hint p-2 rounded-xl text-[10px] leading-tight">
          💡 提示：导入Excel后，直接将多张图片拖入屏幕即可自动匹配型号。
      </div>

      <div class="grid grid-cols-2 gap-2 mt-2">
          <button @click="store.exportProject()" class="btn-purple text-xs flex items-center justify-center gap-1">💾 存</button>
          <button @click="jsonInput.click()" class="btn-purple text-xs flex items-center justify-center gap-1">📂 读</button>
      </div>
      <div class="grid grid-cols-2 gap-2">
          <button @click="downloadTemplate" class="btn-tool text-xs flex items-center justify-center gap-1">⬇ 模板</button>
          <button @click="excelInput.click()" class="btn-success text-xs flex items-center justify-center gap-1">📊 导入</button>
      </div>
    </div>
    
    <input id="xls-in" type="file" class="fixed top-0 left-0 w-0 h-0 opacity-0 pointer-events-none" accept=".xlsx, .xls, .csv" @change="e=>store.importExcel(e.target.files[0])">
    <input id="json-in" type="file" class="fixed top-0 left-0 w-0 h-0 opacity-0 pointer-events-none" accept=".json" @change="e=>store.loadProject(e.target.files[0])">
  </div>

  <!-- 清空确认对话框 -->
  <ConfirmModal
    v-model:visible="showResetConfirm"
    title="确认清空"
    message="确定要清空所有内容吗？此操作将删除所有页面数据且不可撤销。"
    confirm-text="确认清空"
    cancel-text="取消"
    :confirm-delay="300"
    @confirm="handleResetConfirmed"
    @cancel="handleResetCancelled"
  />

  <!-- 页面创建确认对话框 -->
  <ConfirmModal
    v-model:visible="showPageConfirm"
    :title="`创建 ${pageTypeNames[pendingPageType] || pendingPageType}${pendingPageSubtype && pageSubtypeNames[pendingPageSubtype] ? ' - ' + pageSubtypeNames[pendingPageSubtype] : ''}`"
    :message="`确定要创建此页面吗？页面将添加到当前图册的末尾。`"
    confirm-text="确认创建"
    cancel-text="取消"
    :confirm-delay="200"
    @confirm="handlePageConfirmed"
    @cancel="handlePageCancelled"
  />

  <!-- 简单的 Toast 提示 -->
  <Transition name="toast-fade">
    <div
      v-if="showToast"
      class="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg z-[10000] flex items-center gap-2"
    >
      <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <span class="text-sm font-medium">{{ toastMessage }}</span>
    </div>
  </Transition>
</template>

<style scoped>
/* —— Apple 风：毛玻璃面板 + 品牌金紫渐变条 —— */
.sidebar-panel {
  background: linear-gradient(
    165deg,
    rgba(255, 255, 255, 0.97) 0%,
    rgba(248, 245, 255, 0.94) 45%,
    rgba(255, 252, 248, 0.96) 100%
  );
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow:
    0 16px 48px rgba(94, 69, 133, 0.12),
    0 4px 16px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

.sidebar-brand {
  position: relative;
  padding-bottom: 10px;
  margin-bottom: 4px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(248, 245, 255, 0.55) 70%, transparent 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 10px;
}

.sidebar-brand::after {
  content: "";
  position: absolute;
  left: 6px;
  right: 6px;
  bottom: 4px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, #9a805e, rgba(154, 128, 94, 0.35), #5e4585);
  opacity: 0.9;
}

.sidebar-toggle {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 245, 255, 0.9) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 14px;
  border: 1px solid rgba(94, 69, 133, 0.14);
  box-shadow: 0 8px 24px rgba(94, 69, 133, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05);
  color: #5e4585;
  font-weight: 600;
  font-size: 12px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.sidebar-toggle:hover {
  box-shadow: 0 12px 32px rgba(94, 69, 133, 0.14);
  transform: translateY(-1px);
}

.sidebar-hint {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(94, 69, 133, 0.06) 100%);
  border: 1px solid rgba(0, 122, 255, 0.15);
  color: #1d4ed8;
  font-weight: 500;
}

/* 次级按钮：白底雾面 */
.btn-tool {
  @apply rounded-xl px-2 py-1.5 text-gray-700 transition font-medium;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); 
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.btn-tool:hover {
  @apply text-blue-700;
  border-color: rgba(0, 122, 255, 0.22);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.1);
}

/* 主蓝：淡色玻璃 */
.btn-primary {
  @apply rounded-xl px-3 py-2 font-semibold transition;
  color: #0b4a9e;
  background: linear-gradient(180deg, rgba(0, 122, 255, 0.2) 0%, rgba(0, 122, 255, 0.08) 100%);
  border: 1px solid rgba(0, 122, 255, 0.28);
  box-shadow: 0 2px 10px rgba(0, 122, 255, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.btn-primary:hover {
  background: linear-gradient(180deg, rgba(0, 122, 255, 0.28) 0%, rgba(0, 122, 255, 0.1) 100%);
  border-color: rgba(0, 122, 255, 0.38);
}

/* 绿色：实拍 / 成功 —— 淡绿玻璃 */
.btn-success {
  @apply rounded-xl px-3 py-2 font-semibold transition;
  color: #0d4020;
  background: linear-gradient(180deg, rgba(52, 199, 89, 0.22) 0%, rgba(52, 199, 89, 0.07) 100%);
  border: 1px solid rgba(52, 199, 89, 0.32);
  box-shadow: 0 2px 10px rgba(52, 199, 89, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.btn-success:hover {
  background: linear-gradient(180deg, rgba(52, 199, 89, 0.3) 0%, rgba(52, 199, 89, 0.08) 100%);
  border-color: rgba(52, 199, 89, 0.42);
}

/* 紫色：复合 / 品牌 —— 淡紫玻璃 */
.btn-purple {
  @apply rounded-xl px-3 py-2 font-semibold transition;
  color: #3d1f5c;
  background: linear-gradient(180deg, rgba(94, 69, 133, 0.22) 0%, rgba(94, 69, 133, 0.08) 100%);
  border: 1px solid rgba(94, 69, 133, 0.32);
  box-shadow: 0 2px 10px rgba(94, 69, 133, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.btn-purple:hover {
  background: linear-gradient(180deg, rgba(94, 69, 133, 0.3) 0%, rgba(94, 69, 133, 0.1) 100%);
  border-color: rgba(94, 69, 133, 0.42);
}

.btn-orange-outline {
  @apply rounded-xl px-3 py-2 transition font-medium;
  color: #c2410c;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 149, 0, 0.45);
  backdrop-filter: blur(8px);
}
.btn-orange-outline:hover {
  background: rgba(255, 149, 0, 0.08);
}

.btn-dark {
  @apply rounded-xl px-3 py-2 font-semibold transition;
  color: #f5f5f7;
  background: linear-gradient(180deg, rgba(55, 55, 57, 0.95) 0%, rgba(29, 29, 31, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
.btn-dark:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.btn-toggle {
  @apply border px-3 py-2 rounded-xl transition font-bold;
}
.btn-toggle.active {
  @apply text-white border-orange-500/80;
  background: linear-gradient(180deg, rgba(255, 149, 0, 0.95) 0%, rgba(230, 120, 0, 0.98) 100%);
  box-shadow: 0 2px 8px rgba(255, 149, 0, 0.25);
}
.btn-toggle:not(.active) {
  @apply text-gray-600 border-gray-200/90;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(8px);
}

.btn-undo {
  @apply rounded-xl px-2 py-1.5 transition font-bold text-gray-600;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.btn-undo:hover {
  @apply bg-gray-100/90;
}

/* Toast 动画 */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translate(-50%, 20px);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
