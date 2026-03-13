/**
 * 重置数据命令
 */
import { BaseCommand } from '../core/BaseCommand'
import { Result, ok, err, CommandError, CommandManager } from '../types'
import { PageStore, PageData, PageType } from './types'
import { nanoid } from 'nanoid'

/**
 * 重置数据命令
 * 用于重置图册数据到初始状态
 */
export class ResetDataCommand extends BaseCommand<void> {
  /**
   * 重置前的页面数据
   * 用于撤销操作
   */
  private previousPages: PageData[] | null = null

  /**
   * 命令管理器
   */
  private commandManager: CommandManager | null = null

  /**
   * 构造函数
   * @param store 页面存储
   * @param commandManager 命令管理器（可选）
   */
  constructor(private store: PageStore, commandManager?: CommandManager) {
    super('ResetData')
    this.commandManager = commandManager || null
  }

  /**
   * 获取缓存键
   */
  get cacheKey(): string {
    return `${this.name}-${this.timestamp}`
  }

  /**
   * 执行命令
   * 重置图册数据到初始状态
   */
  execute(): Result<void> {
    return this.safeExecute(() => {
      // 保存当前页面状态，用于撤销
      this.previousPages = [...this.store.getPages()]
      
      // 创建默认页面
      const defaultPages = this.createDefaultPages()
      
      // 更新页面列表
      this.store.setPages(defaultPages)
      
      // 重置成功后，清空命令管理器的撤销/重做栈
      // 确保清空后无法撤销到重置前的状态
      if (this.commandManager) {
        this.commandManager.clear()
      }
    })
  }

  /**
   * 撤销命令
   * 恢复到重置前的状态
   */
  undo(): Result<void> {
    return this.safeExecute(() => {
      // 如果没有保存之前的状态，无法撤销
      if (!this.previousPages) {
        throw new Error('无法撤销未执行的重置数据命令')
      }
      
      // 恢复之前的状态
      this.store.setPages(this.previousPages)
    })
  }

  /**
   * 创建默认页面
   * @returns 默认页面数组
   */
  private createDefaultPages(): PageData[] {
    const pages: PageData[] = []
    
    // 创建完整的默认页面集合，与 catalog-new.js 中的旧版实现完全一致
    pages.push(this.createPage('cover'))      // 封面
    pages.push(this.createPage('toc'))        // 目录
    pages.push(this.createPage('brand'))      // 品牌介绍
    pages.push(this.createPage('intro'))      // 类别介绍
    pages.push(this.createPage('cert'))       // 荣誉证书
    pages.push(this.createPage('partner'))    // 合作伙伴
    pages.push(this.createPage('project'))    // 工程案例
    pages.push(this.createPage('custom'))     // 自由页面
    pages.push(this.createPage('product', 'lock'))    // 门锁产品页面
    pages.push(this.createPage('product', 'hardware')) // 五金产品页面
    pages.push(this.createPage('back'))       // 封底
    
    // 生成页码
    this.generatePageNumbers(pages)
    
    return pages
  }

  /**
   * 创建单个页面
   * @param type 页面类型
   * @param subType 页面子类型
   * @returns 页面数据
   */
  private createPage(type: PageType, subType?: 'lock' | 'hardware'): PageData {
    const id = nanoid()
    const defaultSize = { width: 210, height: 297 }
    
    // 创建基本页面数据，与 catalog.js 中的字段完全对齐
    const page: any = {
      id,
      type,
      subType: subType || 'lock',
      bgImage: '',
      blocks: [],
      items: [],
      pageNumber: '',
      showPageNum: (type === 'product'),
      resetNumbering: false,
      stopNumbering: false,
      ...defaultSize
    }
    
    // 特殊页面类型处理：封面、封底、品牌等需要转换为 canvas 类型
    if (['cover', 'back', 'custom', 'brand', 'intro'].includes(type)) {
      page.type = 'canvas'
      page.canvasType = type
    }
    
    // 根据页面类型创建默认块
    switch (type) {
      case 'product':
        // 产品页面
        if (subType === 'lock') {
          page.title = 'DOOR LOCK SYSTEM'
          page.sub = '门锁五金系统'
          // 门锁产品页面预填6个空产品占位符
          page.items = Array(6).fill(null).map(() => ({
            id: nanoid(),
            name: '',
            model: '',
            image: '',
            subType: 'lock'
          }))
        } else {
          page.title = 'HARDWARE ACCESSORIES'
          page.sub = '小五金配件系列'
          // 五金产品页面预填8个空产品占位符
          page.items = Array(8).fill(null).map(() => ({
            id: nanoid(),
            name: '',
            model: '',
            image: '',
            subType: 'hardware'
          }))
        }
        break
        
      case 'toc':
        // 目录页面
        page.title = 'CONTENTS / 目录'
        page.items = Array(2).fill(null).map((_, i) => ({
          id: nanoid(),
          name: `0${i+1}. 章节名称`,
          page: i === 0 ? 'P.01' : 'P.05'
        }))
        break
        
      case 'cover':
        // 封面页面 - 极简瑞士风格
        page.blocks = [
          {
            id: nanoid(),
            type: 'txt',
            val: '<div style="font-family: Helvetica, Arial, sans-serif; font-weight: 700; font-size: 14px; color: #1d1d1f; letter-spacing: 2px;">ARCHIE <span style="color:#86868b; font-weight:400;">HARDWARE</span></div>',
            w: 300,
            h: 30,
            x: 60,
            y: 60
          },
          {
            id: nanoid(),
            type: 'txt',
            val: '<div style="width:100%; height:4px; background:linear-gradient(90deg, #4c1a79 0%, #ff6b00 100%); border-radius:2px;"></div>',
            w: 60,
            h: 4,
            x: 60,
            y: 100
          },
          {
            id: nanoid(),
            type: 'txt',
            val: '<div style="font-family: Helvetica, sans-serif; font-size: 90px; font-weight: 900; line-height: 0.9; color: #1d1d1f; letter-spacing: -3px;">PRODUCT<br>CATALOG</div>',
            w: 600,
            h: 180,
            x: 55,
            y: 150
          },
          {
            id: nanoid(),
            type: 'txt',
            val: '<div style="font-family: Helvetica; font-size: 90px; font-weight: 900; color: transparent; -webkit-text-stroke: 2px #e5e5e5; letter-spacing: -3px;">2026</div>',
            w: 400,
            h: 100,
            x: 55,
            y: 320
          },
          {
            id: nanoid(),
            type: 'txt',
            val: '<div style="font-size: 16px; color: #666; font-weight: 500;">Engineering & Architectural Solutions</div>',
            w: 400,
            h: 30,
            x: 60,
            y: 430
          },
          {
            id: nanoid(),
            type: 'img',
            val: '',
            w: 674,
            h: 550,
            x: 60,
            y: 500
          }
        ]
        break
        
      case 'text':
        // 文本页面
        page.blocks = [
          {
            id: nanoid(),
            type: 'text',
            content: '',
            items: []
          }
        ]
        break
        
      case 'brand':
        // 品牌介绍页面
        page.title = '品牌介绍 / ABOUT US'
        page.blocks = [
          {
            id: nanoid(),
            type: 'txt',
            val: '<div style="font-size:12px; font-weight:700; color:#ff6b00; letter-spacing:1px;">品牌介绍 / ABOUT US</div>',
            w: 200,
            h: 20,
            x: 50,
            y: 50
          },
          {
            id: nanoid(),
            type: 'txt',
            val: '<div style="font-size:48px; font-weight:700; color:#1d1d1f; line-height:1.1;">精工匠心<br>智造未来.</div>',
            w: 500,
            h: 120,
            x: 50,
            y: 80
          },
          {
            id: nanoid(),
            type: 'txt',
            val: '<div style="font-size:14px; color:#444; line-height:1.8; text-align:justify;">雅洁五金始创于1990年...</div>',
            w: 300,
            h: 400,
            x: 50,
            y: 220
          },
          {
            id: nanoid(),
            type: 'img',
            val: '',
            w: 350,
            h: 500,
            x: 380,
            y: 220
          }
        ]
        break
        
      case 'intro':
        // 类别介绍页面
        page.title = 'DOOR LOCK SYSTEMS / 门锁系统'
        page.blocks = [
          {
            id: nanoid(),
            type: 'txt',
            val: '<div style="font-size:200px; font-weight:900; color:#f3f3f3; line-height:1;">01</div>',
            w: 300,
            h: 200,
            x: -20,
            y: 40
          },
          {
            id: nanoid(),
            type: 'txt',
            val: '<div style="font-size:14px; letter-spacing:2px; color:#86868b; font-weight:600;">DOOR LOCK SYSTEMS</div>',
            w: 400,
            h: 30,
            x: 60,
            y: 100
          },
          {
            id: nanoid(),
            type: 'txt',
            val: '<div style="font-size:56px; font-weight:700; color:#4c1a79;">门锁系统</div>',
            w: 400,
            h: 80,
            x: 56,
            y: 120
          },
          {
            id: nanoid(),
            type: 'txt',
            val: '<div style="width:100%; height:4px; background:#ff6b00;"></div>',
            w: 60,
            h: 10,
            x: 60,
            y: 210
          },
          {
            id: nanoid(),
            type: 'txt',
            val: '<div style="font-size:14px; color:#555; line-height:1.8;">汇集现代简约设计与精密机械工艺。</div>',
            w: 400,
            h: 100,
            x: 60,
            y: 240
          },
          {
            id: nanoid(),
            type: 'img',
            val: '',
            w: 600,
            h: 500,
            x: 100,
            y: 400
          }
        ]
        break
        
      case 'cert':
        // 荣誉证书页面
        page.title = 'HONORS / 荣誉资质'
        page.sub = '资质证书展示'
        page.items = Array(8).fill(null).map(() => ({
          id: nanoid(),
          img: '',
          name: '荣誉证书 Title'
        }))
        break
        
      case 'partner':
        // 合作伙伴页面
        page.title = 'STRATEGIC PARTNERS / 战略合作伙伴'
        page.sub = '品牌合作展示'
        page.items = Array(8).fill(null).map(() => ({
          id: nanoid(),
          img: '',
          name: '企业名称 Company',
          desc: '简短描述'
        }))
        break
        
      case 'project':
        // 工程案例页面
        page.title = 'PROJECT CASES / 工程案例'
        page.sub = '经典项目回顾'
        page.items = Array(4).fill(null).map(() => ({
          id: nanoid(),
          img: '',
          name: '项目名称 Project',
          loc: '地点 Location'
        }))
        break
        
      case 'back':
        // 封底页面
        page.type = 'canvas'
        page.canvasType = 'back'
        page.blocks = [
          {
            id: nanoid(),
            type: 'txt',
            val: '<div style="width:100%; height:1px; background:#e5e5e5;"></div>',
            w: 674,
            h: 2,
            x: 60,
            y: 60
          },
          {
            id: nanoid(),
            type: 'txt',
            val: '<div style="font-family: Helvetica; font-weight:900; font-size:48px; color:#1d1d1f; letter-spacing:-2px; margin-bottom:20px;">ARCHIE</div><div style="font-size:12px; color:#444; line-height:1.8;"><b>广东雅洁五金有限公司</b><br>Guangdong Archie Hardware Co., Ltd.<br><br>Add: 中国·广东省佛山市南海区大沥镇长虹岭工业园<br>Tel: +86-757-8555-xxxx<br>Web: <span style="color:#ff6b00; font-weight:bold;">www.archie.com</span></div>',
            w: 400,
            h: 300,
            x: 60,
            y: 850
          },
          {
            id: nanoid(),
            type: 'txt',
            val: '<div style="width:8px; height:8px; background:#4c1a79; border-radius:50%;"></div>',
            w: 20,
            h: 20,
            x: 720,
            y: 1050
          }
        ]
        break
        
      case 'custom':
        // 自由页面
        page.type = 'canvas'
        page.canvasType = 'custom'
        page.blocks = []
        break
        
      case 'blank':
      default:
        // 空白页面
        page.blocks = []
        break
    }
    
    return page as PageData
  }

  /**
   * 生成页码
   * @param pages 页面数组
   */
  private generatePageNumbers(pages: PageData[]): void {
    let pageNumber = 1
    
    for (const page of pages) {
      // 封面和目录页不显示页码
      if (page.type !== 'cover' && page.type !== 'toc') {
        page.pageNumber = pageNumber.toString()
        pageNumber++
      }
    }
  }
}