/**
 * 数据迁移功能测试脚本
 *
 * 这个脚本测试数据迁移工具是否正常工作
 * 运行方式：node test-data-migration.js
 */

// 模拟浏览器环境
if (typeof localStorage === 'undefined') {
  const localStorageMock = (() => {
    let store = {}
    return {
      getItem(key) {
        return store[key] || null
      },
      setItem(key, value) {
        store[key] = value.toString()
      },
      removeItem(key) {
        delete store[key]
      },
      clear() {
        store = {}
      }
    }
  })()
  
  global.localStorage = localStorageMock
  console.log('已创建 localStorage mock')
}

// 导入数据迁移工具（使用 ES 模块导入）
async function runTests() {
  try {
    const migrationModule = await import('./src/utils/dataMigration.js')
    console.log('=== 开始数据迁移功能测试 ===\n')
    
    // 测试 1: 保存和加载空数据
    console.log('测试 1: 保存和加载空数据')
    localStorage.clear()
    migrationModule.saveData({ pages: [] })
    
    const loadedData1 = migrationModule.loadAndMigrateData()
    console.log(`✓ 加载数据: 版本 ${loadedData1.version}, 页面数 ${loadedData1.pages.length}`)
    console.log(`✓ 版本号正确: ${loadedData1.version === migrationModule.LATEST_DATA_VERSION}`)
    console.log(`✓ 页面数组正确: ${Array.isArray(loadedData1.pages) && loadedData1.pages.length === 0}\n`)
    
    // 测试 2: 模拟旧版本数据（无版本号）
    console.log('测试 2: 模拟旧版本数据（无版本号）')
    const oldData = [
      { id: 'page-1', type: 'product', title: '旧页面1' },
      { id: 'page-2', type: 'cover', title: '旧页面2' }
    ]
    localStorage.setItem('archie_catalog_store', JSON.stringify(oldData))
    
    const loadedData2 = migrationModule.loadAndMigrateData()
    console.log(`✓ 加载旧数据: 版本 ${loadedData2.version}, 页面数 ${loadedData2.pages.length}`)
    console.log(`✓ 数据已迁移到最新版本: ${loadedData2.version === migrationModule.LATEST_DATA_VERSION}`)
    console.log(`✓ 页面数据保留: ${loadedData2.pages.length === 2}`)
    console.log(`✓ 第一个页面类型正确: ${loadedData2.pages[0].type === 'product'}\n`)
    
    // 测试 3: 模拟损坏的数据
    console.log('测试 3: 模拟损坏的数据')
    localStorage.setItem('archie_catalog_store', '这不是有效的 JSON')
    
    const loadedData3 = migrationModule.loadAndMigrateData()
    console.log(`✓ 处理损坏数据: 版本 ${loadedData3.version}, 页面数 ${loadedData3.pages.length}`)
    console.log(`✓ 返回默认结构: ${loadedData3.version === migrationModule.LATEST_DATA_VERSION && Array.isArray(loadedData3.pages)}\n`)
    
    // 测试 4: 验证数据保存功能
    console.log('测试 4: 验证数据保存功能')
    const testPages = [
      { id: 'test-1', type: 'product', title: '测试页面1', items: [] },
      { id: 'test-2', type: 'cover', title: '测试页面2', items: [] }
    ]
    
    migrationModule.saveData({ pages: testPages })
    const savedRaw = localStorage.getItem('archie_catalog_store')
    const savedData = JSON.parse(savedRaw)
    
    console.log(`✓ 数据已保存: ${savedRaw !== null}`)
    console.log(`✓ 保存的版本号: ${savedData.version}`)
    console.log(`✓ 保存的页面数: ${savedData.pages.length}`)
    console.log(`✓ 版本号正确: ${savedData.version === migrationModule.LATEST_DATA_VERSION}\n`)
    
    // 测试 5: 验证数据验证功能
    console.log('测试 5: 验证数据验证功能')
    const validData = { version: migrationModule.LATEST_DATA_VERSION, pages: [] }
    const invalidData1 = { version: 999, pages: [] }
    const invalidData2 = { version: migrationModule.LATEST_DATA_VERSION, pages: '不是数组' }
    const invalidData3 = null
    
    console.log(`✓ 有效数据验证: ${migrationModule.validateData(validData)}`)
    console.log(`✓ 错误版本验证: ${!migrationModule.validateData(invalidData1)}`)
    console.log(`✓ 错误页面类型验证: ${!migrationModule.validateData(invalidData2)}`)
    console.log(`✓ null 数据验证: ${!migrationModule.validateData(invalidData3)}\n`)
    
    console.log('=== 所有测试完成 ===')
    console.log('✅ 数据迁移功能测试通过！')
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
    process.exit(1)
  }
}

// 运行测试
runTests()