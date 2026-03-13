/**
 * 数据版本管理与迁移工具
 * 
 * 该模块负责处理应用数据的版本迁移，确保旧版本数据能够安全地升级到最新版本。
 * 采用非破坏性迁移原则：优先新增字段，避免删除现有字段。
 */

// 当前最新数据版本号
export const LATEST_DATA_VERSION = 2

// 数据存储的 localStorage 键名
export const STORAGE_KEY = 'archie_catalog_store'

/**
 * 数据迁移函数集合
 * 每个函数负责将数据从一个特定版本迁移到下一个版本
 * 格式：{ [fromVersion]: (data) => migratedData }
 */
export const migrations = {
  // 从版本 0（无版本号）迁移到版本 1
  0: (data) => {
    console.log('正在从版本 0 迁移到版本 1...')
    
    // 如果数据本身就是数组（旧格式），则转换为新格式
    if (Array.isArray(data)) {
      return {
        version: 1,
        pages: data
      }
    }
    
    // 如果数据是对象但没有版本号，添加版本号
    if (data && typeof data === 'object' && !data.version) {
      // 确保 pages 字段存在且为数组
      if (!data.pages) {
        // 如果数据有其他字段，尝试将其作为页面
        const possiblePages = Object.values(data).find(val => Array.isArray(val))
        data.pages = possiblePages || []
      }
      
      data.version = 1
      return data
    }
    
    // 如果数据已经是对象且有 pages 字段，直接添加版本号
    if (data && typeof data === 'object') {
      return {
        version: 1,
        pages: data.pages || []
      }
    }
    
    // 其他情况返回默认结构
    return {
      version: 1,
      pages: []
    }
  },
  
  // 从版本 1 迁移到版本 2：确保所有页面都有必要的字段，防止组件渲染错误
  1: (data) => {
    console.log('正在从版本 1 迁移到版本 2...')
    if (data && Array.isArray(data.pages)) {
      data.pages = data.pages.map(page => {
        // 确保基本字段存在
        const migratedPage = {
          id: page.id || Math.random().toString(36).substr(2, 9),
          type: page.type || 'product',
          subType: page.subType || 'lock',
          blocks: page.blocks || [],
          items: page.items || [],
          width: page.width || 210,
          height: page.height || 297,
          ...page
        }
        
        // 特殊处理：将旧的 props 字段展开（如果 App.vue 还在使用 page.props）
        if (page.props) {
          Object.assign(migratedPage, page.props)
        }
        
        return migratedPage
      })
    }
    data.version = 2
    return data
  }
}

/**
 * 执行数据迁移
 * @param {Object} data - 原始数据
 * @returns {Object} 迁移后的数据
 */
export function migrateData(data) {
  // 如果没有数据，返回最新版本的默认结构
  if (!data || typeof data !== 'object') {
    return {
      version: LATEST_DATA_VERSION,
      pages: []
    }
  }
  
  // 确定当前版本（如果没有版本号，则视为版本 0）
  let currentVersion = data.version || 0
  
  // 如果已经是最新版本，直接返回
  if (currentVersion === LATEST_DATA_VERSION) {
    return data
  }
  
  // 创建数据的深拷贝，避免修改原始数据
  let migratedData = JSON.parse(JSON.stringify(data))
  
  console.log(`开始数据迁移：从版本 ${currentVersion} 到版本 ${LATEST_DATA_VERSION}`)
  
  // 逐步执行迁移
  while (currentVersion < LATEST_DATA_VERSION) {
    const migrator = migrations[currentVersion]
    
    if (migrator) {
      try {
        migratedData = migrator(migratedData)
        currentVersion = migratedData.version || (currentVersion + 1)
        console.log(`成功迁移到版本 ${currentVersion}`)
      } catch (error) {
        console.error(`从版本 ${currentVersion} 迁移时出错:`, error)
        // 迁移失败时，返回最新版本的默认结构
        return {
          version: LATEST_DATA_VERSION,
          pages: []
        }
      }
    } else {
      // 没有找到对应的迁移函数
      console.warn(`找不到从版本 ${currentVersion} 的迁移函数，使用默认结构`)
      return {
        version: LATEST_DATA_VERSION,
        pages: []
      }
    }
  }
  
  console.log('数据迁移完成')
  return migratedData
}

/**
 * 从 localStorage 加载并迁移数据
 * @returns {Object} 迁移后的数据
 */
export function loadAndMigrateData() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY)
    
    // 如果没有数据，返回最新版本的默认结构
    if (!rawData) {
      return {
        version: LATEST_DATA_VERSION,
        pages: []
      }
    }
    
    // 解析 JSON
    let data
    try {
      data = JSON.parse(rawData)
    } catch (parseError) {
      console.error('解析 localStorage 数据失败:', parseError)
      return {
        version: LATEST_DATA_VERSION,
        pages: []
      }
    }
    
    // 执行迁移
    const migratedData = migrateData(data)
    
    // 如果数据发生了变化，保存回 localStorage
    if (JSON.stringify(data) !== JSON.stringify(migratedData)) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedData))
        console.log('已将迁移后的数据保存回 localStorage')
      } catch (saveError) {
        console.warn('保存迁移后的数据失败:', saveError)
      }
    }
    
    return migratedData
  } catch (error) {
    console.error('加载和迁移数据时发生未知错误:', error)
    return {
      version: LATEST_DATA_VERSION,
      pages: []
    }
  }
}

/**
 * 保存数据到 localStorage（自动添加版本号）
 * @param {Object} data - 要保存的数据（应包含 pages 字段）
 */
export function saveData(data) {
  try {
    const dataToSave = {
      version: LATEST_DATA_VERSION,
      pages: data.pages || []
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
  } catch (error) {
    console.error('保存数据失败:', error)
  }
}

/**
 * 验证数据结构的完整性
 * @param {Object} data - 要验证的数据
 * @returns {boolean} 数据是否有效
 */
export function validateData(data) {
  if (!data || typeof data !== 'object') {
    return false
  }
  
  if (data.version !== LATEST_DATA_VERSION) {
    return false
  }
  
  if (!Array.isArray(data.pages)) {
    return false
  }
  
  return true
}