import { ref, watch, nextTick } from 'vue'
import { defineStore } from 'pinia'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { PageType, getComponentNameByPageType, createDefaultPageProps } from '../types/catalog'
import { normalizeCatalogPages } from '../utils/pageTextDefaults'

export const useCatalogStore = defineStore('catalog', () => {
  const pages = ref([])
  const showPrice = ref(false)
  const printMode = ref(false)
  const history = ref([])
  const future = ref([])
  const clipboardBlock = ref(null)
  const MAX_HISTORY = 20
  
  // 全局产品清单
  const globalProducts = ref([])

  function recordSnapshot() {
    history.value.push(JSON.stringify(pages.value))
    if (history.value.length > MAX_HISTORY) history.value.shift()
    future.value = []
  }
  function undo() {
    if (!history.value.length) return
    future.value.push(JSON.stringify(pages.value))
    pages.value = JSON.parse(history.value.pop())
  }
  function redo() {
    if (!future.value.length) return
    history.value.push(JSON.stringify(pages.value))
    pages.value = JSON.parse(future.value.pop())
  }

  const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

  const createItem = (type) => {
      const base = { id: uid(), img: '' }
      if (type === 'cert') return { ...base, name: '荣誉证书 Title' }
      if (type === 'partner') return { ...base, name: '企业名称 Company', desc: '简短描述' }
      if (type === 'project') return { ...base, name: '项目名称 Project', loc: '地点 Location' }
      if (type === 'finish') return { ...base, name: '颜色 Color' }
      return base
  }
  const createProduct = (item = {}) => ({
    id: uid(),
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

   // 页面工厂 - 基于最新页面代码设计规范
  function createPageData(type, subType = 'lock') {
    console.log('catalog.js - createPageData called with:', 'type:', type, 'subType:', subType)
    const id = uid()
    const defaultSize = { width: 210, height: 297 } 
    let page = { 
        id, type, subType, bgImage: '', blocks: [], items: [], 
        pageNumber: '', 
        showPageNum: (type === 'product'), 
        resetNumbering: false, 
        stopNumbering: false,
        ...defaultSize 
    }

    // 处理封面页 (PAGE 01) - 使用CatalogCover组件
    if (type === 'cover') {
      page.title = '封面页'
      page.props = {
        year: '2026',
        mainTitle: '雅洁五金',
        englishBrand: 'ARCHIE',
        subtitle: '工程产品手册',
        englishSubtitle: 'ENGINEERING SOLUTIONS',
        backgroundGradient: 'radial-gradient(circle at 50% 30%, #644B8E 0%, #2A1A40 100%)',
        watermarkText: 'ARCHIE',
        showCropMarks: true,
        showDecoration: true
      }
      return page
    }
    
    // 处理封底页 (PAGE 13) - 使用BackCoverPage组件
    if (type === 'backCover') {
      page.title = '封底页'
      page.props = {
        companyName: '广东雅洁五金有限公司',
        englishName: 'Guangdong Archie Hardware Co., Ltd.',
        address: '中国·广东省佛山市南海区大沥镇长虹岭工业园',
        phone: '+86-757-8555-xxxx',
        website: 'www.archie.com',
        showCropMarks: true
      }
      return page
    }
    
    // 处理公司简介页 (PAGE 02) - 使用CompanyIntroPage组件
    if (type === 'companyIntro') {
      page.title = '公司简介'
      page.props = {
        title: '关于雅洁五金',
        englishTitle: 'ABOUT ARCHIE',
        content: '雅洁五金始创于1990年，专注于高端建筑五金产品的研发、制造与销售。公司拥有现代化生产基地和研发中心，产品涵盖门锁系统、卫浴五金、家具五金等多个领域。',
        englishContent: 'Founded in 1990, Archie Hardware specializes in the R&D, manufacturing, and sales of high-end architectural hardware products. The company operates modern production facilities and R&D centers, offering products across door lock systems, bathroom hardware, furniture hardware, and more.'
      }
      return page
    }
    
    // 处理荣誉资质页 (PAGE 03) - 使用CertificatesPage组件 (完全匹配最新页面代码.html设计规范)
    if (type === 'certificates') {
      page.title = '荣誉资质'
      page.props = {
        title: '权威认证与资质',
        subtitle: 'Certificates & Honors',
        headerTitle: '2026 工程产品手册 / 荣誉与资质',
        footerText: '- PAGE 03 -',
        certificates: [
          {
            id: 1,
            image: 'https://placehold.co/100x140/F8F8FA/86868B?text=ISO9001',
            text: 'ISO9001 质量体系认证'
          },
          {
            id: 2,
            image: 'https://placehold.co/100x140/F8F8FA/86868B?text=CE',
            text: '欧盟 CE 安全认证'
          },
          {
            id: 3,
            image: 'https://placehold.co/100x140/F8F8FA/86868B?text=UL',
            text: '美国 UL 防火认证'
          },
          {
            id: 4,
            image: 'https://placehold.co/100x140/F8F8FA/86868B?text=RedDot',
            text: '德国红点设计大奖'
          },
          {
            id: 5,
            image: 'https://placehold.co/100x140/F8F8FA/86868B?text=Top10',
            text: '中国智能锁十大品牌'
          },
          {
            id: 6,
            image: 'https://placehold.co/100x140/F8F8FA/86868B?text=Patent',
            text: '静音锁体发明专利'
          },
          {
            id: 7,
            image: 'https://placehold.co/100x140/F8F8FA/86868B?text=HighTech',
            text: '国家高新技术企业'
          },
          {
            id: 8,
            image: 'https://placehold.co/100x140/F8F8FA/86868B?text=Green',
            text: '绿色建材产品认证'
          }
        ]
      }
      page.items = Array(8).fill(null).map(() => createItem('cert'))
      return page
    }
    
    // 处理战略合作伙伴页 (PAGE 04) - 使用PartnersPage组件
    if (type === 'partners') {
      page.title = '战略合作伙伴'
      page.props = {
        title: '战略合作伙伴',
        englishTitle: 'STRATEGIC PARTNERS',
        gridType: '3x5', // 3×5网格
        gap: '8mm', // 间距8mm
        itemHeight: '35mm', // 每个合作伙伴框高度35mm
        backgroundColor: 'var(--luxury-cream)' // 奢华奶油色背景
      }
      page.items = Array(15).fill(null).map(() => createItem('partner'))
      return page
    }
    
    // 处理工程案例页 (PAGE 05) - 使用ProjectCasesPage组件
    if (type === 'projectCases') {
      page.title = '工程案例'
      page.props = {
        title: '工程案例',
        englishTitle: 'PROJECT CASES',
        gridType: '3x3', // 3×3网格
        gap: '6mm 5mm', // 水平6mm，垂直5mm
        itemHeight: '60mm' // 每个案例图片高度60mm
      }
      page.items = Array(9).fill(null).map(() => createItem('project'))
      return page
    }
    
    // 处理表面处理页 (PAGE 06) - 使用SurfaceFinishesPage组件
    if (type === 'surfaceFinishes') {
      page.title = '表面处理'
      page.props = {
        title: '表面处理',
        englishTitle: 'SURFACE FINISHES',
        gridType: '6x6', // 6×6网格
        gap: '6mm 4mm', // 水平6mm，垂直4mm
        circleDiameter: '18mm' // 圆形色块直径18mm
      }
      page.items = Array(36).fill(null).map(() => createItem('finish'))
      return page
    }
    
    // 处理目录页 (PAGE 07) - 使用TableOfContentsPage组件
    if (type === 'tableOfContents') {
      page.title = '目录'
      page.props = {
        title: '目录',
        englishTitle: 'TABLE OF CONTENTS',
        showPageNumbers: true
      }
      return page
    }
    
    // 处理过渡页 (PAGE 08) - 使用DividerPage组件
    if (type === 'divider') {
      page.title = '过渡页'
      page.props = {
        title: '门锁五金系统',
        englishTitle: 'DOOR LOCK SYSTEMS',
        sectionNumber: '01'
      }
      return page
    }
    
    // 处理产品实拍页 (PAGE 09/PAGE 10) - 使用ProductGridPage组件
    if (type === 'productGrid') {
      page.title = subType === 'lock' ? '门锁五金实拍' : '工程小五金实拍'
      page.props = {
        title: subType === 'lock' ? '门锁五金实拍' : '工程小五金实拍',
        englishTitle: subType === 'lock' ? 'DOOR LOCK HARDWARE' : 'ENGINEERING HARDWARE',
        gridType: '2x3', // 2×3网格
        gap: '8mm', // 间距8mm
        cardHeight: '48mm' // 产品卡片高度48mm
      }
      const count = 6 // 2×3网格共6个产品
      page.items = Array(count).fill(null).map(() => createProduct({subType}))
      return page
    }
    
    // 处理复合产品页 (PAGE 11/PAGE 12) - 使用CompositeProductPage组件
    if (type === 'compositeProduct') {
      page.title = subType === 'lock' ? '门锁五金复合图解' : '工程小五金复合图解'
      page.props = {
        title: subType === 'lock' ? '门锁五金复合图解' : '工程小五金复合图解',
        englishTitle: subType === 'lock' ? 'DOOR LOCK COMPOSITE' : 'ENGINEERING HARDWARE COMPOSITE',
        compositeMode: true,
        ratio: '58% 38%' // 实拍图58%，线图38%
      }
      const count = 6 // 2×3网格共6个产品
      page.items = Array(count).fill(null).map(() => createProduct({subType}))
      return page
    }
    
    // 处理自由编辑页
    if (type === 'free') {
      page.title = '自由编辑页'
      page.props = {
        title: '自由编辑页',
        englishTitle: 'FREE LAYOUT'
      }
      page.blocks = [] // 确保blocks数组存在
      return page
    }
    
    // 默认返回空页面
    return page
  }

  function generatePageNumbers() {
      recordSnapshot()
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

  async function batchMatchImages(files) {
      if (!files || files.length === 0) return;
      recordSnapshot();
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

  function resetData() {
      if(confirm('警告：确定要清空所有内容并恢复默认吗？')) {
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

  function movePage(index, dir) { 
      const newIdx = index + dir; 
      if(newIdx >= 0 && newIdx < pages.value.length) { 
          recordSnapshot(); const p = pages.value[index]; pages.value.splice(index, 1); pages.value.splice(newIdx, 0, p); 
      } 
  }

  // 新版addPage：支持新页面类型和props
  function addPage(pageType, props = {}) {
    recordSnapshot();
    const page = createPageData(pageType, props);
    if(page) pages.value.push(page);
  }
  
  // 新版removePage：移除指定页面
  function removePage(index) {
    if(confirm('确定要删除这个页面吗？')) {
      recordSnapshot();
      pages.value.splice(index, 1);
    }
  }
  
  // 更新页面数据
  function updatePageData(index, data) {
    recordSnapshot();
    if (pages.value[index]) {
      pages.value[index] = { ...pages.value[index], ...data };
    }
  }
  
  // 获取组件类型
  function getComponentType(pageType) {
    console.log('catalog.js - getComponentType:', 'pageType:', pageType, 'calling getComponentNameByPageType');
    const componentName = getComponentNameByPageType(pageType);
    console.log('catalog.js - getComponentType:', 'componentName:', componentName);
    return componentName;
  }
  function addBlock(page, type) { recordSnapshot(); page.blocks.push({ id: uid(), type, val: type==='txt'?'文本...':'', w: 200, h: 40, x: 100, y: 100 }) }
  function removeBlock(page, index) { recordSnapshot(); page.blocks.splice(index, 1); }
  function duplicateBlock(page, index) { recordSnapshot(); const orig=page.blocks[index]; const copy=JSON.parse(JSON.stringify(orig)); copy.id=uid(); copy.x=(parseFloat(copy.x)||0)+20; copy.y=(parseFloat(copy.y)||0)+20; page.blocks.push(copy) }
  function bringToFront(page, i) { recordSnapshot(); page.blocks.push(page.blocks.splice(i,1)[0]) }
  function sendToBack(page, i) { recordSnapshot(); page.blocks.unshift(page.blocks.splice(i,1)[0]) }
  function recordDragEnd() { recordSnapshot() }
  function setPageSize(page, w, h) { recordSnapshot(); page.width = w; page.height = h; }
  function addProductToPage(page) { recordSnapshot(); page.items.push(createProduct({subType: page.subType})) }
  function removeProductFromPage(page, index) { if(confirm('删除此产品？')) { recordSnapshot(); page.items.splice(index, 1) } }
  function addItem(page) { recordSnapshot(); if (page.type === 'product') page.items.push(createProduct({subType: page.subType})); else page.items.push(createItem(page.type)); }
  function removeItem(page, index) { if(confirm('删除此项?')) { recordSnapshot(); page.items.splice(index, 1) } }
  function importExcel(file) {
    if (!file) return; recordSnapshot(); const r = new FileReader();
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
          if(price) p.price = price;
          
          chunk.push(p);

          // 满6个生成一页
          if (chunk.length === 6) {
            pages.value.push({
              id: uid(),
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
          while(chunk.length < 6) chunk.push(createProduct());
          pages.value.push({
            id: uid(),
            type: 'product',
            subType: 'lock',
            title: 'Imported Series',
            items: chunk
          });
        }
        alert('导入成功！');
      } catch(err) {
        console.error('Excel导入失败:', err);
        alert('Excel导入失败，请检查文件格式');
      }
    };
    r.readAsArrayBuffer(file);
  }

  // 导入Excel时同时更新全局产品清单
  function importExcelWithGlobalProducts(file) {
    const r = new FileReader()
    r.onload = (e) => {
      try {
        const d = new Uint8Array(e.target.result)
        const wb = XLSX.read(d, { type: 'array' })
        const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
        
        // 创建全局产品列表
        const newGlobalProducts = json.map((row, index) => {
          const name = row['名称'] || row['Name'] || row['产品名称'] || `产品${index + 1}`
          const model = row['型号'] || row['Model'] || `MODEL-${index + 1}`
          const category = row['类别'] || row['Category'] || '通用'
          const material = row['材质'] || row['Material'] || '不锈钢'
          const spec = row['规格'] || row['Spec'] || '标准'
          const finish = row['表面处理'] || row['Finish'] || '拉丝'
          const price = row['价格'] || row['Price'] || ''
          const image = row['图片'] || row['Image'] || ''
          
          return {
            id: `global-${model}-${index}`,
            name,
            model,
            category,
            material,
            spec,
            finish,
            price,
            image,
            imported: false
          }
        })
        
        // 更新全局产品清单
        globalProducts.value = [...globalProducts.value, ...newGlobalProducts]
        
        // 自动更新所有产品网格页面
        updateAllProductGridPagesWithGlobalProducts()
        
        alert(`成功导入${newGlobalProducts.length}个产品到全局清单，并已自动更新所有产品网格页面`)
      } catch(err) {
        console.error('Excel导入失败:', err)
        alert('Excel导入失败，请检查文件格式')
      }
    }
    r.readAsArrayBuffer(file)
  }
  
  // 更新所有产品网格页面使用全局产品清单
  function updateAllProductGridPagesWithGlobalProducts() {
    recordSnapshot()
    
    // 重置所有产品的imported状态
    globalProducts.value.forEach(p => p.imported = false)
    
    // 获取所有产品网格页面
    const productGridPages = pages.value.filter(page => page.type === 'productGrid')
    
    if (productGridPages.length === 0) {
      console.log('没有找到产品网格页面，跳过更新')
      return
    }
    
    let productIndex = 0
    const availableProducts = globalProducts.value
    
    // 更新每个产品网格页面
    pages.value = pages.value.map(page => {
      if (page.type === 'productGrid') {
        // 为当前页面分配6个产品
        const pageProducts = availableProducts.slice(productIndex, productIndex + 6)
        productIndex += 6
        
        // 标记为已导入
        pageProducts.forEach(p => p.imported = true)
        
        // 更新页面props
        const updatedProps = {
          ...page.props,
          products: pageProducts.map((product, idx) => ({
            id: product.id,
            name: product.name,
            model: product.model,
            category: product.category,
            image: product.image,
            // 保留原有数据或使用默认值
            material: product.material || '不锈钢',
            spec: product.spec || '标准',
            finish: product.finish || '拉丝',
            price: product.price || '',
            ...(page.props?.products?.[idx] || {})
          }))
        }
        
        return {
          ...page,
          props: updatedProps
        }
      }
      return page
    })
    
    console.log(`成功更新${productGridPages.length}个产品网格页面`)
  }
  
  // 手动触发产品网格页面更新
  function refreshProductGridPages() {
    updateAllProductGridPagesWithGlobalProducts()
    alert('产品网格页面已使用全局产品清单更新')
  }
  
  // 清空全局产品清单
  function clearGlobalProducts() {
    if (confirm('确定要清空全局产品清单吗？这将移除所有导入的产品数据。')) {
      globalProducts.value = []
      alert('全局产品清单已清空')
    }
  }
  
  // 导出全局产品清单为JSON
  function exportGlobalProducts() {
    const dataStr = JSON.stringify(globalProducts.value, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `雅洁五金全局产品清单_${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }
  
  // PDF导出函数 - 针对.a4-page容器进行1:1像素抓取
  async function exportToPDF() {
    try {
      // 显示加载提示
      const loadingEl = document.createElement('div')
      loadingEl.innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;font-family:sans-serif;">
          <div style="font-size:24px;margin-bottom:20px;">正在生成PDF...</div>
          <div style="font-size:16px;margin-bottom:30px;">请稍候，这可能需要几秒钟时间</div>
          <div style="width:200px;height:4px;background:#444;border-radius:2px;overflow:hidden;">
            <div id="pdf-progress" style="width:0%;height:100%;background:#4F46E5;transition:width 0.3s;"></div>
          </div>
        </div>
      `
      document.body.appendChild(loadingEl)
      
      // 临时隐藏UI元素
      const elementsToHide = document.querySelectorAll('.no-print, .drag-handle, [class*="absolute"][class*="top"][class*="right"], [class*="absolute"][class*="top"][class*="left"]')
      const originalDisplay = []
      elementsToHide.forEach(el => {
        originalDisplay.push(el.style.display)
        el.style.display = 'none'
      })
      
      // 临时设置打印模式
      const originalPrintMode = printMode.value
      printMode.value = true
      
      // 等待DOM更新
      await nextTick()
      
      // 获取所有A4页面容器
      const pageContainers = document.querySelectorAll('.a4-page')
      if (pageContainers.length === 0) {
        alert('没有找到可导出的页面')
        restoreUI()
        return
      }
      
      // 创建PDF文档 (A4尺寸: 210mm × 297mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      // 设置PDF属性
      pdf.setProperties({
        title: '雅洁五金2026工程图册',
        subject: '工程产品手册',
        author: '雅洁五金有限公司',
        keywords: '五金, 门锁, 工程, 图册',
        creator: 'ARCHIE STUDIO'
      })
      
      // 逐页处理
      for (let i = 0; i < pageContainers.length; i++) {
        // 更新进度条
        const progressEl = document.getElementById('pdf-progress')
        if (progressEl) {
          progressEl.style.width = `${((i + 1) / pageContainers.length) * 100}%`
        }
        
        const container = pageContainers[i]
        
        try {
          // 获取容器尺寸
          const rect = container.getBoundingClientRect()
          const width = rect.width
          const height = rect.height
          
          // 计算缩放比例 (A4尺寸: 210×297mm，DPI: 96)
          const targetWidth = 210 // mm
          const targetHeight = 297 // mm
          const dpi = 96
          const mmToPx = dpi / 25.4
          const targetWidthPx = targetWidth * mmToPx
          const targetHeightPx = targetHeight * mmToPx
          
          // 计算canvas缩放
          const scale = Math.min(targetWidthPx / width, targetHeightPx / height) * 0.95
          
          // 使用html2canvas捕获页面
          const canvas = await html2canvas(container, {
            scale: scale,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#FFFFFF',
            logging: false,
            onclone: (clonedDoc) => {
              // 确保克隆的文档中所有图片都加载完成
              const images = clonedDoc.querySelectorAll('img')
              images.forEach(img => {
                if (!img.complete) {
                  img.onload = () => {}
                  img.onerror = () => {
                    img.src = ''
                    img.alt = '图片加载失败'
                  }
                }
              })
            }
          })
          
          // 将canvas转换为图像数据
          const imgData = canvas.toDataURL('image/jpeg', 0.95)
          
          // 添加到PDF
          if (i > 0) {
            pdf.addPage()
          }
          
          // 计算图像在PDF中的位置和尺寸
          const imgWidth = canvas.width / mmToPx
          const imgHeight = canvas.height / mmToPx
          
          // 居中显示
          const x = (targetWidth - imgWidth) / 2
          const y = (targetHeight - imgHeight) / 2
          
          pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight)
          
          // 添加页码
          pdf.setFontSize(10)
          pdf.setTextColor(100, 100, 100)
          pdf.text(`第 ${i + 1} 页`, targetWidth / 2, targetHeight - 10, { align: 'center' })
          
        } catch (err) {
          console.error(`处理第${i + 1}页时出错:`, err)
          // 继续处理下一页
          continue
        }
      }
      
      // 恢复UI状态
      restoreUI()
      
      // 移除加载提示
      document.body.removeChild(loadingEl)
      
      // 保存PDF文件
      const fileName = `雅洁五金2026工程图册_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
      alert(`PDF导出成功！共导出${pageContainers.length}页。`)
      
      function restoreUI() {
        // 恢复UI元素显示
        elementsToHide.forEach((el, index) => {
          el.style.display = originalDisplay[index]
        })
        
        // 恢复打印模式
        printMode.value = originalPrintMode
      }
      
    } catch (error) {
      console.error('PDF导出失败:', error)
      alert('PDF导出失败: ' + error.message)
      
      // 尝试恢复UI
      const loadingEl = document.querySelector('div[style*="position:fixed;top:0"]')
      if (loadingEl) {
        document.body.removeChild(loadingEl)
      }
      
      // 恢复打印模式
      printMode.value = false
    }
  }
  
  // 触发打印预览（现有功能兼容）
  function triggerPrint() {
    printMode.value = !printMode.value
    if (printMode.value) {
      alert('进入打印预览模式。点击"导出PDF"按钮可生成高质量PDF文件。')
    }
  }
  
  // 导出项目数据（现有功能兼容）
  function exportProject() {
    const pagesSnapshot = JSON.parse(JSON.stringify(pages.value))
    normalizeCatalogPages(pagesSnapshot)
    const data = {
      pages: pagesSnapshot,
      globalProducts: globalProducts.value,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }

    const dataStr = JSON.stringify(data, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `雅洁五金工程图册项目_${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // 数据持久化：自动保存到localStorage
  watch(pages, (newVal) => {
    try {
      localStorage.setItem('archie_catalog_store', JSON.stringify(newVal))
    } catch(e) { console.warn('存储空间不足') }
  }, { deep: true })

  // 初始化：从localStorage加载数据，如果没有则创建默认数据
  const saved = localStorage.getItem('archie_catalog_store')
  if (saved) {
    try {
      pages.value = JSON.parse(saved)
    } catch(e) {
      console.error('加载存储数据失败:', e)
      // 如果加载失败，创建默认数据
      resetData()
    }
  } else {
    // 如果没有保存的数据，创建默认数据
    resetData()
  }

  return {
    pages,
    showPrice,
    printMode,
    history,
    future,
    clipboardBlock,
    globalProducts,
    recordSnapshot,
    undo,
    redo,
    createItem,
    createProduct,
    createPageData,
    generatePageNumbers,
    batchMatchImages,
    resetData,
    movePage,
    addPage,
    removePage,
    updatePageData,
    addBlock,
    removeBlock,
    duplicateBlock,
    bringToFront,
    sendToBack,
    recordDragEnd,
    setPageSize,
    addProductToPage,
    removeProductFromPage,
    addItem,
    removeItem,
    importExcel,
    importExcelWithGlobalProducts,
    updateAllProductGridPagesWithGlobalProducts,
    refreshProductGridPages,
    clearGlobalProducts,
    exportGlobalProducts,
    exportToPDF,
    triggerPrint,
    exportProject
  }
})
