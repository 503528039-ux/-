/**
 * 页面命令模块
 * 导出所有页面相关的命令和类型
 */

// 导出类型定义
export * from './types'

// 导出命令类
import { AddPageCommand } from './AddPageCommand'
import { MovePageCommand } from './MovePageCommand'
import { RemovePageCommand } from './RemovePageCommand'
import { ResetDataCommand } from './ResetDataCommand'
import { PageStore, PageType, PageSubType, PageData } from './types'
import { CommandManager } from '../types'

// 重新导出命令类
export { 
  AddPageCommand, 
  MovePageCommand, 
  RemovePageCommand,
  ResetDataCommand
}

// 工厂函数：创建添加页面命令
export function createAddPageCommand(
  store: PageStore,
  pageType: PageType,
  pageSubType?: PageSubType,
  pageData?: Partial<PageData>
) {
  return new AddPageCommand(store, pageType, pageSubType, pageData)
}

// 工厂函数：创建移动页面命令
export function createMovePageCommand(
  store: PageStore,
  fromIndex: number,
  toIndex: number
) {
  return new MovePageCommand(store, fromIndex, toIndex)
}

// 工厂函数：创建删除页面命令
export function createRemovePageCommand(
  store: PageStore,
  pageId: string
) {
  return new RemovePageCommand(store, pageId)
}

// 工厂函数：创建重置数据命令
export function createResetDataCommand(
  store: PageStore,
  commandManager?: CommandManager
) {
  return new ResetDataCommand(store, commandManager)
}