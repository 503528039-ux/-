import { ref, watch, computed, nextTick } from 'vue'
import { defineStore } from 'pinia'
import * as XLSX from 'xlsx'
import { nanoid } from 'nanoid'

// 导入命令模式相关类
import {
  CommandManager,
  AddPageCommand,
  MovePageCommand,
  RemovePageCommand,
  ResetDataCommand,
  createAddPageCommand,
  createMovePageCommand,
  createRemovePageCommand,
  createResetDataCommand
} from '../commands'

// 导入数据迁移工具
import { loadAndMigrateData, saveData } from '../utils/dataMigration'

// 导入页面模板工具
import { getInitialPageData } from '../config/pageTemplates'

// 环境变量，控制是否使用命令模式
const USE_COMMANDS = true

/**
 * 图册数据存储
 */
export const useCatalogStore = defineStore('catalog', () => {
  /**
   * 从 localStorage 安全地加载并迁移页面数据
   * @returns {Array} 页面数据数组，如果加载失败或没有数据则返回空数组
   */
  const _loadPagesFromStorage = () => {
    try {
      // 使用数据迁移工具加载和迁移数据
      const migratedData = loadAndMigrateData()
      
      // 确保返回的是页面数组
      if (migratedData && Array.isArray(migratedData.pages)) {
        console.log(`数据加载完成：版本 ${migratedData.version}，共 ${migratedData.pages.length} 个页面`)
        return migratedData.pages
      }
      
      console.log('没有找到有效数据，返回空数组')
      return []
    } catch (e) {
      console.error('加载存储数据失败:', e)
      return []
    }
  }

  // 页面数据 - 从 localStorage 加载并迁移，如果为空则初始化一个封面页
  const initialPages = _loadPagesFromStorage()
  const pages = ref(initialPages.length > 0 ? initialPages : [getInitialPageData('cover')])
  
  // 显示设置
  const showPrice = ref(false)
  const printMode = ref(false)
  
  // 历史记录（旧实现） - 保留但不再用于命令模式
  const history = ref([])
  const future = ref([])
  const MAX_HISTORY = 20
  
  // 剪贴板
  const clipboardBlock = ref(null)
  
  // 命令管理器
  const commandManager = new CommandManager()
  
  // 是否使用命令模式
  const useCommandMode = computed(() => USE_COMMANDS)
  
  // 撤销/重做状态 - 仅依赖命令管理器
  const canUndo = computed(() => commandManager.canUndo)
  const canRedo = computed(() => commandManager.canRedo)

  /**
   * 记录快照（旧实现）
   */
  function recordSnapshot() {
    if (useCommandMode.value) return // 命令模式下不使用快照
    
    history.value.push(JSON.stringify(pages.value))
    if (history.value.length > MAX_HISTORY) history.value.shift()
    future.value = []
  }
  
  /**
   * 撤销（旧实现 + 命令模式）
   */
  function undo() {
    if (useCommandMode.value) {
      const result = commandManager.undo()
      if (!result.success) {
        console.warn('撤销失败:', result.error)
      }
      return
    }
    
    // 旧实现
    if (!history.value.length) return
    future.value.push(JSON.stringify(pages.value))
    pages.value = JSON.parse(history.value.pop())
  }
  
  /**
   * 重做（旧实现 + 命令模式）
   */
  function redo() {
    if (useCommandMode.value) {
      const result = commandManager.redo()
      if (!result.success) {
        console.warn('重做失败:', result.error)
      }
      return
    }
    
    // 旧实现
    if (!future.value.length) return
    history.value.push(JSON.stringify(pages.value))
    pages.value = JSON.parse(future.value.pop())
  }

  /**
   * 创建项目
   * @param type 项目类型
   * @returns 项目数据
   */
  const createItem = (type) => {
    const base = { id: nanoid(), img: '' }
    if (type === 'cert') return { ...base, name: '荣誉证书 Title' }
    if (type === 'partner') return { ...base, name: '企业名称 Company', desc: '简短描述' }
    if (type === 'project') return { ...base, name: '项目名称 Project', loc: '地点 Location' }
    if (type === 'finish') return { ...base, name: '颜色 Color' }
    return base
  }
  
  /**
   * 创建产品
   * @param item 产品数据
   * @returns 产品数据
   */
  const createProduct = (item = {}) => ({
    id: nanoid(),
    subType: item.subType || 'lock',
    name: item.name || '',
    model: item.model || '',
    material: item.material || '',
    spec: item.spec || '',
    finish: item.finish || '',
    body: item.body || '',
    door: item.door || '',
    price: item.price || '',
    image: '', pScale: 1.0, 
    lineImage: '', lScale: 1.0
  })

  /**
   * 创建页面数据
   * @param type 页面类型
   * @param subType 页面子类型
   * @returns 页面数据
   */
  function createPageData(type, subType = 'lock') {
    const id = nanoid()
    const defaultSize = { width: 210, height: 297 } 
    let page = { 
      id, type, subType, bgImage: '', blocks: [], items: [], 
      pageNumber: '', 
      showPageNum: (type === 'product'), 
      resetNumbering: false, 
      stopNumbering: false,
      ...defaultSize 
    }

    if (['cover', 'back', 'custom', 'brand', 'intro'].includes(type)) {
      page.type = 'canvas'; page.canvasType = type;
      
      if (type === 'cover') {
        // V48: 极简瑞士风格封面
        page.blocks = [
          // 顶部品牌栏 (小而精致)
          { id: nanoid(), type: 'txt', val: '<div style="font-family: Helvetica, Arial, sans-serif; font-weight: 700; font-size: 14px; color: #1d1d1f; letter-spacing: 2px;">ARCHIE <span style="color:#86868b; font-weight:400;">HARDWARE</span></div>', w: 300, h: 30, x: 60, y: 60 },
          
          // 装饰线 (极细渐变，不再是乱色块)
          { id: nanoid(), type: 'txt', val: '<div style="width:100%; height:4px; background:linear-gradient(90deg, #4c1a79 0%, #ff6b00 100%); border-radius:2px;"></div>', w: 60, h: 4, x: 60, y: 100 },

          // 主标题 (巨大，左对齐)
          { id: nanoid(), type: 'txt', val: '<div style="font-family: Helvetica, sans-serif; font-size: 90px; font-weight: 900; line-height: 0.9; color: #1d1d1f; letter-spacing: -3px;">PRODUCT<br>CATALOG</div>', w: 600, h: 180, x: 55, y: 150 },
          
          // 年份 (空心字效果或灰色)
          { id: nanoid(), type: 'txt', val: '<div style="font-family: Helvetica; font-size: 90px; font-weight: 900; color: transparent; -webkit-text-stroke: 2px #e5e5e5; letter-spacing: -3px;">2026</div>', w: 400, h: 100, x: 55, y: 320 },

          // 副标题
          { id: nanoid(), type: 'txt', val: '<div style="font-size: 16px; color: #666; font-weight: 500;">Engineering & Architectural Solutions</div>', w: 400, h: 30, x: 60, y: 430 },

          // 主图占位 (留白更大)
          { id: nanoid(), type: 'img', val: '', w: 674, h: 550, x: 60, y: 500 }
        ];
      } 
      else if (type === 'back') {
        // V48: 极简封底
        page.blocks = [
          // 顶部呼应线条
          { id: nanoid(), type: 'txt', val: '<div style="width:100%; height:1px; background:#e5e5e5;"></div>', w: 674, h: 2, x: 60, y: 60 },
          
          // 底部信息区 (左对齐，层级分明)
          { id: nanoid(), type: 'txt', val: '<div style="font-family: Helvetica; font-weight:900; font-size:48px; color:#1d1d1f; letter-spacing:-2px; margin-bottom:20px;">ARCHIE</div><div style="font-size:12px; color:#444; line-height:1.8;"><b>广东雅洁五金有限公司</b><br>Guangdong Archie Hardware Co., Ltd.<br><br>Add: 中国·广东省佛山市南海区大沥镇长虹岭工业园<br>Tel: +86-757-8555-xxxx<br>Web: <span style="color:#ff6b00; font-weight:bold;">www.archie.com</span></div>', w: 400, h: 300, x: 60, y: 850 },
          
          // 底部装饰点
          { id: nanoid(), type: 'txt', val: '<div style="width:8px; height:8px; background:#4c1a79; border-radius:50%;"></div>', w: 20, h: 20, x: 720, y: 1050 }
        ]
      } 
      else if (type === 'brand') {
        page.blocks = [
          { id: nanoid(), type: 'txt', val: '<div style="font-size:12px; font-weight:700; color:#ff6b00; letter-spacing:1px;">品牌介绍 / ABOUT US</div>', w: 200, h: 20, x: 50, y: 50 },
          { id: nanoid(), type: 'txt', val: '<div style="font-size:48px; font-weight:700; color:#1d1d1f; line-height:1.1;">精工匠心<br>智造未来.</div>', w: 500, h: 120, x: 50, y: 80 },
          { id: nanoid(), type: 'txt', val: '<div style="font-size:14px; color:#444; line-height:1.8; text-align:justify;">雅洁五金始创于1990年...</div>', w: 300, h: 400, x: 50, y: 220 },
          { id: nanoid(), type: 'img', val: '', w: 350, h: 500, x: 380, y: 220 }
        ]
      } 
      else if (type === 'intro') {
        page.blocks = [
          { id: nanoid(), type: 'txt', val: '<div style="font-size:200px; font-weight:900; color:#f3f3f3; line-height:1;">01</div>', w: 300, h: 200, x: -20, y: 40 },
          { id: nanoid(), type: 'txt', val: '<div style="font-size:14px; letter-spacing:2px; color:#86868b; font-weight:600;">DOOR LOCK SYSTEMS</div>', w: 400, h: 30, x: 60, y: 100 },
          { id: nanoid(), type: 'txt', val: '<div style="font-size:56px; font-weight:700; color:#4c1a79;">门锁系统</div>', w: 400, h: 80, x: 56, y: 120 },
          { id: nanoid(), type: 'txt', val: '<div style="width:100%; height:4px; background:#ff6b00;"></div>', w: 60, h: 10, x: 60, y: 210 },
          { id: nanoid(), type: 'txt', val: '<div style="font-size:14px; color:#555; line-height:1.8;">汇集现代简约设计与精密机械工艺。</div>', w: 400, h: 100, x: 60, y: 240 },
          { id: nanoid(), type: 'img', val: '', w: 600, h: 500, x: 100, y: 400 } 
        ]
      }
      return page
    }
    
    if (type === 'product') {
      page.title = subType === 'lock' ? 'DOOR LOCK SYSTEM' : 'HARDWARE ACCESSORIES'
      page.sub = subType === 'lock' ? '门锁五金系统' : '小五金配件系列'
      const count = subType === 'lock' ? 6 : 8
      page.items = Array(count).fill(null).map(() => createProduct({subType}))
    }
    else if (type === 'toc') { page.title = 'CONTENTS / 目录'; page.items = Array(2).fill(null).map((_, i) => ({id: nanoid(), name: `0${i+1}. 章节名称`, page: i === 0 ? 'P.01' : 'P.05'})) }
    else if (type === 'cert') { 
      page.title = 'HONORS / 荣誉资质';
      page.sub = '资质证书展示';
      page.items = Array(8).fill(null).map(() => createItem('cert'))
    }
    else if (type === 'partner') { 
      page.title = 'STRATEGIC PARTNERS / 战略合作伙伴'; 
      page.sub = '品牌合作展示';
      page.items = Array(8).fill(null).map(() => createItem('partner'))
    }
    else if (type === 'project') { page.title = 'PROJECT CASES / 工程案例'; page.sub = '经典项目回顾'; page.items = Array(4).fill(null).map(() => createItem('project')) } 
    else if (type === 'finish') { page.title = 'FINISHES / 表面处理'; page.sub = '工艺及颜色选择'; page.items = Array(9).fill(null).map(() => createItem('finish')) }
    return page
  }

  /**
   * 生成页码
   */
  function generatePageNumbers() {
    if (useCommandMode.value) {
      recordSnapshot() // 兼容旧实现
    } else {
      recordSnapshot()
    }
    
    const globalStart = prompt(`请输入第一页的起始页码 (默认 1):`, '1')
    if (globalStart === null) return;
    let count = parseInt(globalStart) || 1
    let numberingActive = true;
    pages.value.forEach(page => {
      if (page.resetNumbering === true) {
        const startNumber = prompt(`页面 "${page.title || '当前页'}" 设置了重置。\n请输入新起始码 (默认 1):`, '1')
        if (startNumber !== null) { count = parseInt(startNumber) || 1; numberingActive = true; }
      }
      if (numberingActive && page.showPageNum) page.pageNumber = `P.${count.toString().padStart(2, '0')}`
      else page.pageNumber = ''
      if (numberingActive) count++
      if (page.stopNumbering) numberingActive = false; 
    })
    alert('页码已更新！')
  }

  /**
   * 批量匹配图片
   * @param files 图片文件列表
   */
  async function batchMatchImages(files) {
    if (!files || files.length === 0) return;
    
    if (useCommandMode.value) {
      recordSnapshot() // 兼容旧实现
    } else {
      recordSnapshot();
    }
    
    let matchedCount = 0;
    const fileMap = {};
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')).toLowerCase().trim();
        fileMap[baseName] = file;
      }
    }
    for (const page of pages.value) {
      if (page.type === 'product' && page.items) {
        for (const product of page.items) {
          const model = (product.model || '').toLowerCase().trim();
          if (model && fileMap[model]) {
            const file = fileMap[model];
            const reader = new FileReader();
            await new Promise((resolve) => {
              reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                  const c = document.createElement('canvas');
                  let w = img.width, h = img.height;
                  if (w > 2000) { h = Math.round(h * (2000 / w)); w = 2000; }
                  c.width = w; c.height = h;
                  c.getContext('2d').drawImage(img, 0, 0, w, h);
                  product.image = c.toDataURL('image/jpeg', 0.9);
                  product.pScale = 1.0;
                  matchedCount++;
                  resolve();
                };
                img.src = e.target.result;
              };
              reader.readAsDataURL(file);
            });
          }
        }
      }
    }
    if (matchedCount > 0) alert(`成功匹配 ${matchedCount} 张图片！`);
    else alert('未找到匹配的图片。请确保文件名与型号一致。');
  }

  /**
   * 重置数据
   * 系统级清扫：清空所有内容，不创建默认页面
   * 注意：此函数已被 ConfirmModal.vue 包装，用户确认后才会调用
   */
  function resetData() {
    // 注意：确认对话框已由 TheSidebar.vue 中的 ConfirmModal 组件处理
    // 这里直接执行清空操作
    
    if (useCommandMode.value) {
      // 系统级清扫操作（不通过命令模式，避免污染历史记录）
      // 1. 清空页面数据
      pages.value = []
      
      // 2. 清空命令管理器历史
      commandManager.clear()
      
      // 3. 使用数据迁移工具保存空数据（这会创建版本化的空数据结构）
      saveData({ pages: [] })
      
      // 4. 状态检查：canUndo 和 canRedo 会自动变为 false（因为 commandManager 已清空）
      console.log('系统级清扫完成：页面已清空，撤销/重做历史已清除，数据已保存')
    } else {
      // 旧实现（非命令模式）：清空并创建默认页面
      recordSnapshot();
      pages.value = [];
      // 创建完整的默认页面集合
      addPage('cover');      // 封面
      addPage('toc');        // 目录
      addPage('brand');      // 品牌介绍
      addPage('intro');      // 类别介绍
      addPage('cert');       // 荣誉证书
      addPage('partner');    // 合作伙伴
      addPage('project');    // 工程案例
      addPage('custom');     // 自由页面
      addPage('product', 'lock');    // 门锁产品页面
      addPage('product', 'hardware'); // 五金产品页面
      addPage('back');       // 封底
    }
  }

  /**
   * 移动页面
   * @param index 源索引
   * @param dir 移动方向
   */
  function movePage(index, dir) { 
    const newIdx = index + dir; 
    if (newIdx < 0 || newIdx >= pages.value.length) {
      return
    }
    
    if (useCommandMode.value) {
      // 使用命令模式
      const command = createMovePageCommand({
        getPages: () => pages.value,
        setPages: (newPages) => { pages.value = newPages },
        _addPage: _addPage,
        _removePage: _removePage,
        _movePage: _movePage,
        _updatePage: _updatePage
      }, index, newIdx)
      
      const result = commandManager.execute(command)
      if (!result.success) {
        console.error('移动页面失败:', result.error)
      }
    } else {
      // 旧实现
      recordSnapshot(); 
      const p = pages.value[index]; 
      pages.value.splice(index, 1); 
      pages.value.splice(newIdx, 0, p); 
    }
  }

  /**
   * 插入页面
   * @param type 页面类型
   * @param index 插入位置（可选，默认插入到末尾）
   */
  function insertPage(type, index = null) {
    const newPageData = getInitialPageData(type)
    const targetIndex = index === null ? pages.value.length : index

    if (useCommandMode.value) {
      const command = createAddPageCommand({
        getPages: () => pages.value,
        setPages: (newPages) => { pages.value = newPages },
        _addPage: (page) => {
          const insertIdx = index === null ? pages.value.length : index
          pages.value.splice(insertIdx, 0, page)
          return page.id
        },
        _removePage: _removePage,
        _movePage: _movePage,
        _updatePage: _updatePage
      }, type)
      
      // 注意：这里的 createAddPageCommand 内部可能直接调用了 createPageData
      // 我们需要确保命令模式也能使用 getInitialPageData
      // 或者直接手动处理 pages 数组并记录快照
      const result = commandManager.execute(command)
      if (!result.success) {
        console.error('插入页面失败:', result.error)
      }
    } else {
      recordSnapshot()
      pages.value.splice(targetIndex, 0, newPageData)
    }
  }

  /**
   * 添加页面
   * @param type 页面类型
   * @param subType 页面子类型
   */
  function addPage(type, subType) { 
    if (useCommandMode.value) {
      // 保持原有 addPage 逻辑，但内部可以优化为使用 getInitialPageData
      const command = createAddPageCommand({
        getPages: () => pages.value,
        setPages: (newPages) => { pages.value = newPages },
        _addPage: _addPage,
        _removePage: _removePage,
        _movePage: _movePage,
        _updatePage: _updatePage
      }, type, subType)
      
      const result = commandManager.execute(command)
      if (!result.success) {
        console.error('添加页面失败:', result.error)
      }
    } else {
      // 旧实现
      recordSnapshot(); 
      const p = getInitialPageData(type); 
      if (subType) p.subType = subType;
      if (p) pages.value.push(p); 
    }
  }

  /**
   * 删除页面
   * @param i 页面索引
   */
  function removePage(i) { 
    if (!confirm('删除此页面？')) {
      return
    }
    
    if (useCommandMode.value) {
      // 使用命令模式
      const pageId = pages.value[i].id
      const command = createRemovePageCommand({
        getPages: () => pages.value,
        setPages: (newPages) => { pages.value = newPages },
        _addPage: _addPage,
        _removePage: _removePage,
        _movePage: _movePage,
        _updatePage: _updatePage
      }, pageId)
      
      const result = commandManager.execute(command)
      if (!result.success) {
        console.error('删除页面失败:', result.error)
      }
    } else {
      // 旧实现
      recordSnapshot(); 
      pages.value.splice(i, 1); 
    }
  }

  /**
   * 添加块
   * @param page 页面
   * @param type 块类型
   */
  function addBlock(page, type) { 
    recordSnapshot(); 
    page.blocks.push({ 
      id: nanoid(), 
      type, 
      val: type === 'txt' ? '文本...' : '', 
      w: 200, 
      h: 40, 
      x: 100, 
      y: 100 
    }) 
  }

  /**
   * 删除块
   * @param page 页面
   * @param index 块索引
   */
  function removeBlock(page, index) { 
    recordSnapshot(); 
    page.blocks.splice(index, 1); 
  }

  /**
   * 复制块
   * @param page 页面
   * @param index 块索引
   */
  function duplicateBlock(page, index) { 
    recordSnapshot(); 
    const orig = page.blocks[index]; 
    const copy = JSON.parse(JSON.stringify(orig)); 
    copy.id = nanoid(); 
    copy.x = (parseFloat(copy.x) || 0) + 20; 
    copy.y = (parseFloat(copy.y) || 0) + 20; 
    page.blocks.push(copy) 
  }

  /**
   * 将块置于顶层
   * @param page 页面
   * @param i 块索引
   */
  function bringToFront(page, i) { 
    recordSnapshot(); 
    page.blocks.push(page.blocks.splice(i, 1)[0]) 
  }

  /**
   * 将块置于底层
   * @param page 页面
   * @param i 块索引
   */
  function sendToBack(page, i) { 
    recordSnapshot(); 
    page.blocks.unshift(page.blocks.splice(i, 1)[0]) 
  }

  /**
   * 记录拖拽结束
   */
  function recordDragEnd() { 
    recordSnapshot() 
  }

  /**
   * 设置页面大小
   * @param page 页面
   * @param w 宽度
   * @param h 高度
   */
  function setPageSize(page, w, h) { 
    recordSnapshot(); 
    page.width = w; 
    page.height = h; 
  }

  /**
   * 添加产品到页面
   * @param page 页面
   */
  function addProductToPage(page) { 
    recordSnapshot(); 
    page.items.push(createProduct({subType: page.subType})) 
  }

  /**
   * 从页面删除产品
   * @param page 页面
   * @param index 产品索引
   */
  function removeProductFromPage(page, index) { 
    if (!confirm('删除此产品？')) {
      return
    }
    
    recordSnapshot(); 
    page.items.splice(index, 1) 
  }

  /**
   * 添加项目
   * @param page 页面
   */
  function addItem(page) { 
    recordSnapshot(); 
    if (page.type === 'product') {
      page.items.push(createProduct({subType: page.subType})); 
    } else {
      page.items.push(createItem(page.type)); 
    }
  }

  /**
   * 删除项目
   * @param page 页面
   * @param index 项目索引
   */
  function removeItem(page, index) { 
    if (!confirm('删除此项?')) {
      return
    }
    
    recordSnapshot(); 
    page.items.splice(index, 1) 
  }

  /**
   * 导入Excel
   * @param file Excel文件
   */
  function importExcel(file) {
    if (!file) return; 
    
    recordSnapshot(); 
    
    const r = new FileReader();
    r.onload = (e) => {
      try {
        const d = new Uint8Array(e.target.result);
        const wb = XLSX.read(d, { type: 'array' });
        const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        
        let chunk = [];
        
        json.forEach(row => {
          // 兼容各种表头写法
          const name = row['名称'] || row['Name'] || row['产品名称'];
          const model = row['型号'] || row['Model'];
          const spec = row['参数'] || row['规格'] || row['Spec'];
          const price = row['价格'] || row['Price'];

          const p = createProduct({ name, model, spec, price });
          if (price) p.price = price;
          
          chunk.push(p);

          // 满6个生成一页
          if (chunk.length === 6) {
            pages.value.push({
              id: nanoid(),
              type: 'product',
              subType: 'lock',
              title: 'Imported Series',
              items: chunk
            });
            chunk = [];
          }
        });

        // 处理剩余未满6个的产品
        if (chunk.length > 0) {
          while (chunk.length < 6) chunk.push(createProduct());
          pages.value.push({
            id: nanoid(),
            type: 'product',
            subType: 'lock',
            title: 'Imported Series',
            items: chunk
          });
        }
        alert('导入成功！');
      } catch (err) {
        console.error('Excel导入失败:', err);
        alert('Excel导入失败，请检查文件格式');
      }
    };
    r.readAsArrayBuffer(file);
  }

  /**
   * 内部方法：添加页面
   * 供命令类使用
   * @param page 页面数据
   * @returns 页面ID
   */
  function _addPage(page) {
    // 深度拷贝页面数据，确保 blocks 和 items 数组是独立的
    const newPage = {
      ...page,
      blocks: page.blocks ? [...page.blocks.map(block => ({ ...block }))] : [],
      items: page.items ? [...page.items.map(item => ({ ...item }))] : []
    }
    
    if (!newPage.id) {
      newPage.id = nanoid()
    }
    
    // 确保 blocks 中的每个块都有独立的 ID
    newPage.blocks.forEach(block => {
      if (!block.id) {
        block.id = nanoid()
      }
    })
    
    pages.value.push(newPage)
    return newPage.id
  }

  /**
   * 内部方法：删除页面
   * 供命令类使用
   * @param pageId 页面ID
   */
  function _removePage(pageId) {
    const index = pages.value.findIndex(p => p.id === pageId)
    if (index !== -1) {
      pages.value.splice(index, 1)
    }
  }

  /**
   * 内部方法：移动页面
   * 供命令类使用
   * @param fromIndex 源索引
   * @param toIndex 目标索引
   */
  function _movePage(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= pages.value.length || 
        toIndex < 0 || toIndex >= pages.value.length) {
      return
    }
    
    const page = pages.value[fromIndex]
    pages.value.splice(fromIndex, 1)
    pages.value.splice(toIndex, 0, page)
  }

  /**
   * 内部方法：更新页面
   * 供命令类使用
   * @param pageId 页面ID
   * @param data 更新的数据
   */
  function _updatePage(pageId, data) {
    const index = pages.value.findIndex(p => p.id === pageId)
    if (index !== -1) {
      pages.value[index] = { ...pages.value[index], ...data }
    }
  }

  // 数据持久化：自动保存到localStorage（使用版本化管理）
  watch(pages, (newVal) => {
    try {
      // 使用数据迁移工具保存数据（会自动添加版本号）
      saveData({ pages: newVal })
    } catch (e) {
      console.warn('保存数据失败:', e)
    }
  }, { deep: true })


  // 导出所有方法和状态
  return {
    pages,
    showPrice,
    printMode,
    clipboardBlock,
    
    // 历史记录相关
    undo,
    redo,
    recordSnapshot,
    recordDragEnd,
    
    // 页面操作
    addPage,
    removePage,
    movePage,
    
    // 块操作
    addBlock,
    removeBlock,
    duplicateBlock,
    bringToFront,
    sendToBack,
    
    // 产品和项目操作
    addItem,
    removeItem,
    addProductToPage,
    removeProductFromPage,
    
    // 其他功能
    resetData,
    generatePageNumbers,
    batchMatchImages,
    importExcel,
    setPageSize,
    insertPage,
    
    // 命令模式相关
    useCommandMode,
    canUndo,
    canRedo
  }
})
