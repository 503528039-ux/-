// 统一导出 store
// 根据环境变量决定使用新版还是旧版 catalog store

// 是否使用命令模式
const USE_COMMAND_MODE = true

// 导出 store
import { useCatalogStore as useCatalogStoreOld } from './catalog'
import { useCatalogStore as useCatalogStoreNew } from './catalog-new'

// 根据配置导出相应的 store
export const useCatalogStore = USE_COMMAND_MODE ? useCatalogStoreNew : useCatalogStoreOld