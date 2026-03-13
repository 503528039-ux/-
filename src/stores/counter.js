// 文件路径: src/stores/catalog.js
import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import * as XLSX from 'xlsx'

export const useCatalogStore = defineStore('catalog', () => {
  // 1. 核心数据：页面数组
  const pages = ref([
    { id: 'cover-1', type: 'cover', title: 'Engineering', sub: '2026 工程五金投标书', bgImage: '' }
  ])

  // 2. 创建空产品模型
  const createProduct = (n = '', m = '', s = '') => ({
    id: Date.now() + Math.random(),
    name: n || '产品名称',
    model: m || `AS-${new Date().getFullYear()}`,
    spec: s || '材质：铝合金\n表面：阳极黑\n适用：木门/金属门',
    price: '',
    image: '',  // 主图 Base64
    lineImage: '' // 线图 Base64
  })

  // 3. 添加页面 (支持不同模板)
  function addPage(type = 'product') {
    const id = Date.now().toString() + Math.random()
    if (type === 'product') {
      // 新增一页产品（默认6个空位）
      pages.value.push({
        id, type, title: 'New Series',
        items: Array(6).fill(null).map(() => createProduct())
      })
    } else if (type === 'intro') {
      // 新增品牌引言页
      pages.value.push({ id, type, title: 'CATEGORY', sub: '类别名称', desc: '在此输入描述...', image: '' })
    }
  }

  // 4. 删除页面
  function removePage(index) {
    if(confirm('确定删除此页？')) pages.value.splice(index, 1)
  }

  // 5. Excel 导入逻辑 (自动分页，永不乱码)
  function importExcel(file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result)
      const wb = XLSX.read(data, { type: 'array' })
      const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
      
      let chunk = []
      
      json.forEach(row => {
        // 兼容各种表头写法
        const name = row['名称'] || row['Name'] || row['产品名称']
        const model = row['型号'] || row['Model']
        const spec = row['参数'] || row['规格'] || row['Spec']
        const price = row['价格'] || row['Price']

        const p = createProduct(name, model, spec)
        if(price) p.price = price
        
        chunk.push(p)

        // 满6个生成一页
        if (chunk.length === 6) {
          pages.value.push({ 
            id: Date.now() + Math.random(), 
            type: 'product', 
            title: 'Imported Series', 
            items: chunk 
          })
          chunk = []
        }
      })

      // 处理剩余未满6个的产品
      if (chunk.length > 0) {
        while(chunk.length < 6) chunk.push(createProduct())
        pages.value.push({ 
          id: Date.now() + Math.random(), 
          type: 'product', 
          title: 'Imported Series', 
          items: chunk 
        })
      }
      alert('导入成功！')
    }
    reader.readAsArrayBuffer(file)
  }

  // 6. 自动保存 (监听数据变化)
  watch(pages, (newVal) => {
    try {
      localStorage.setItem('archie_vue_store', JSON.stringify(newVal))
    } catch(e) { console.warn('存储空间不足') }
  }, { deep: true })

  // 7. 初始化读取
  const saved = localStorage.getItem('archie_vue_store')
  if (saved) pages.value = JSON.parse(saved)

  return { pages, addPage, removePage, importExcel }
})
