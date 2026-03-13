<script setup>
import { ref } from 'vue'
import { useCatalogStore } from '../stores/index'
import * as XLSX from 'xlsx'
import ConfirmModal from './ConfirmModal.vue'

const store = useCatalogStore()
const excelInput = { click: () => document.getElementById('xls-in').click() }
const jsonInput = { click: () => document.getElementById('json-in').click() }

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
  'hardware': '工程小五金'
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
    // V47: 更新模板提示，强调型号和图片匹配
    const ws=XLSX.utils.aoa_to_sheet([
        ["产品名称","型号(重要:用于匹配图片)","材质","规格","表面处理","可选锁体","适配门厚","价格"],
        ["磁吸锁示例","A88","铝合金","大号","哑黑","5058磁吸","38-50mm","200"],
        ["合页示例","H01","不锈钢","4x3x3","拉丝金","","","50"]
    ]);
    ws['!cols'] = [{wch:20}, {wch:25}, {wch:10}, {wch:10}, {wch:10}, {wch:15}, {wch:15}, {wch:10}];
    const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"Sheet1"); XLSX.writeFile(wb,"雅洁产品导入模板.xlsx")
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
  // 使用新的 insertPage 方法，在当前图册末尾插入
  store.insertPage(pendingPageType.value)
  
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
</script>

<template>
  <div class="fixed top-5 right-5 z-50 flex flex-col gap-3 no-print" v-if="!store.printMode">
    <div class="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/50 flex flex-col gap-2 w-48 max-h-[85vh] overflow-y-auto">
      <div class="text-[color:var(--brand-purple)] font-black text-center mb-1 border-b pb-1 sticky top-0 bg-white z-10">ARCHIE STUDIO</div>
      
      <div class="flex gap-2 mb-2">
          <button @click="store.undo()" :disabled="!store.canUndo" class="btn-undo flex items-center justify-center flex-1">↩</button>
          <button @click="store.redo()" :disabled="!store.canRedo" class="btn-undo flex items-center justify-center flex-1">↪</button>
          <button @click="handleResetConfirm" class="btn-undo bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center flex-1" title="清空">🗑️</button>
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
           
           <!-- 第5组: 产品实拍页 -->
           <button @click="addPageWithConfirm('productGrid')" class="btn-success" title="PAGE 09/10: 产品实拍页 (2×3网格)">🔒 产品实拍</button>
           
           <!-- 第6组: 复合产品页 -->
           <button @click="addPageWithConfirm('compositeProduct')" class="btn-purple" title="PAGE 11/12: 产品复合图解页 (复合模式)">🔄 产品复合</button>
           
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
          <button @click="store.exportToPDF()" class="btn-success text-xs flex items-center justify-center gap-1">📄 PDF</button>
      </div>
      
      <div class="bg-blue-50 p-2 rounded text-[10px] text-blue-600 leading-tight">
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
.btn-tool { @apply bg-white border border-gray-200 text-gray-600 rounded px-2 py-1 hover:bg-gray-50 hover:text-blue-600 transition; }
.btn-primary { @apply bg-blue-600 text-white rounded px-3 py-2 hover:bg-blue-700 transition shadow-lg; }
.btn-success { @apply bg-green-600 text-white rounded px-3 py-2 hover:bg-green-700 transition; }
.btn-orange-outline { @apply border border-orange-500 text-orange-500 rounded px-3 py-2 hover:bg-orange-50 transition; }
.btn-dark { @apply bg-gray-800 text-white rounded px-3 py-2 hover:bg-black transition shadow-lg; }
.btn-toggle { @apply border px-3 py-2 rounded transition font-bold; }
.btn-toggle.active { @apply bg-[color:var(--brand-orange)] text-white border-orange-600; }
.btn-toggle:not(.active) { @apply bg-gray-100 text-gray-600 border-gray-200; }
.btn-undo { @apply bg-gray-100 text-gray-600 rounded px-2 py-1 hover:bg-gray-200 transition font-bold; }
.btn-purple { @apply bg-purple-600 text-white rounded px-3 py-2 hover:bg-purple-700 transition; }

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
