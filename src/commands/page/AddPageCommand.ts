/**
 * 添加页面命令
 */
import { BaseCommand } from '../core/BaseCommand'
import { Result, ok, err, CommandError } from '../types'
import { PageData, PageStore, PageType, PageSubType } from './types'

/**
 * 添加页面命令
 * 用于向图册中添加新页面
 */
export class AddPageCommand extends BaseCommand<string> {
  /**
   * 添加的页面ID
   * 执行命令后会被设置
   */
  private pageId: string | null = null

  /**
   * 构造函数
   * @param store 页面存储
   * @param pageType 页面类型
   * @param pageSubType 页面子类型
   * @param pageData 页面数据（可选，如果提供则使用该数据，否则创建新页面）
   */
  constructor(
    private store: PageStore,
    private pageType: PageType,
    private pageSubType?: PageSubType,
    private pageData?: Partial<PageData>
  ) {
    super('AddPage')
  }

  /**
   * 获取缓存键
   * 基于页面类型和子类型生成唯一键
   */
  get cacheKey(): string {
    return `${this.name}-${this.pageType}-${this.pageSubType || 'none'}-${this.timestamp}`
  }

  /**
   * 执行命令
   * 添加新页面到图册
   * @returns 添加的页面ID
   */
  execute(): Result<string> {
    return this.safeExecute(() => {
      // 如果已经执行过，直接返回页面ID
      if (this.pageId) {
        return this.pageId
      }

      // 创建页面数据
      const page = this.createPageData()
      
      // 添加页面
      this.pageId = this.store._addPage(page)
      
      return this.pageId
    })
  }

  /**
   * 撤销命令
   * 从图册中移除添加的页面
   */
  undo(): Result<void> {
    return this.safeExecute(() => {
      // 如果没有页面ID，无法撤销
      if (!this.pageId) {
        throw new Error('无法撤销未执行的添加页面命令')
      }
      
      // 移除页面
      this.store._removePage(this.pageId)
    })
  }

  /**
   * 创建页面数据
   * 根据页面类型和子类型创建默认页面数据，与 catalog.js 中的 createPageData 完全对齐
   */
  private createPageData(): PageData {
    // 如果提供了页面数据，使用提供的数据
    if (this.pageData && 'id' in this.pageData && 'type' in this.pageData) {
      return this.pageData as PageData
    }
    
    // 默认页面尺寸
    const defaultSize = { width: 210, height: 297 }
    
    // 创建基本页面数据，与 catalog.js 中的字段完全对齐
    const page: any = {
      id: '', // 将由 store._addPage 设置
      type: this.pageType,
      subType: this.pageSubType || 'lock',
      bgImage: '',
      blocks: [],
      items: [],
      pageNumber: '',
      showPageNum: (this.pageType === 'product'),
      resetNumbering: false,
      stopNumbering: false,
      ...defaultSize
    }
    
    // 特殊页面类型处理：封面、封底、品牌等需要转换为 canvas 类型
    if (['cover', 'back', 'custom', 'brand', 'intro'].includes(this.pageType)) {
      page.type = 'canvas'
      page.canvasType = this.pageType
    }
    
    // 根据页面类型创建默认块
    switch (this.pageType) {
      case 'cover':
        // 封面页面 - 极简瑞士风格
        page.blocks = [
          {
            id: '',
            type: 'txt',
            val: '<div style="font-family: Helvetica, Arial, sans-serif; font-weight: 700; font-size: 14px; color: #1d1d1f; letter-spacing: 2px;">ARCHIE <span style="color:#86868b; font-weight:400;">HARDWARE</span></div>',
            w: 300,
            h: 30,
            x: 60,
            y: 60
          },
          {
            id: '',
            type: 'txt',
            val: '<div style="width:100%; height:4px; background:linear-gradient(90deg, #4c1a79 0%, #ff6b00 100%); border-radius:2px;"></div>',
            w: 60,
            h: 4,
            x: 60,
            y: 100
          },
          {
            id: '',
            type: 'txt',
            val: '<div style="font-family: Helvetica, sans-serif; font-size: 90px; font-weight: 900; line-height: 0.9; color: #1d1d1f; letter-spacing: -3px;">PRODUCT<br>CATALOG</div>',
            w: 600,
            h: 180,
            x: 55,
            y: 150
          },
          {
            id: '',
            type: 'txt',
            val: '<div style="font-family: Helvetica; font-size: 90px; font-weight: 900; color: transparent; -webkit-text-stroke: 2px #e5e5e5; letter-spacing: -3px;">2026</div>',
            w: 400,
            h: 100,
            x: 55,
            y: 320
          },
          {
            id: '',
            type: 'txt',
            val: '<div style="font-size: 16px; color: #666; font-weight: 500;">Engineering & Architectural Solutions</div>',
            w: 400,
            h: 30,
            x: 60,
            y: 430
          },
          {
            id: '',
            type: 'img',
            val: '',
            w: 674,
            h: 550,
            x: 60,
            y: 500
          }
        ]
        break
        
      case 'product':
        // 产品页面
        if (this.pageSubType === 'lock') {
          page.title = 'DOOR LOCK SYSTEM'
          page.sub = '门锁五金系统'
          // 门锁产品页面预填6个空产品占位符
          page.items = Array(6).fill(null).map(() => ({
            id: '',
            subType: 'lock',
            name: '',
            model: '',
            material: '',
            spec: '',
            finish: '',
            body: '',
            door: '',
            price: '',
            image: '',
            pScale: 1.0,
            lineImage: '',
            lScale: 1.0
          }))
        } else {
          page.title = 'HARDWARE ACCESSORIES'
          page.sub = '小五金配件系列'
          // 五金产品页面预填8个空产品占位符
          page.items = Array(8).fill(null).map(() => ({
            id: '',
            subType: 'hardware',
            name: '',
            model: '',
            material: '',
            spec: '',
            finish: '',
            body: '',
            door: '',
            price: '',
            image: '',
            pScale: 1.0,
            lineImage: '',
            lScale: 1.0
          }))
        }
        break
        
      case 'toc':
        // 目录页面
        page.title = 'CONTENTS / 目录'
        page.items = Array(2).fill(null).map((_, i) => ({
          id: '',
          name: `0${i+1}. 章节名称`,
          page: i === 0 ? 'P.01' : 'P.05'
        }))
        break
        
      case 'brand':
        // 品牌页面
        page.type = 'canvas'
        page.canvasType = 'brand'
        page.blocks = [
          {
            id: '',
            type: 'txt',
            val: '<div style="font-size:12px; font-weight:700; color:#ff6b00; letter-spacing:1px;">品牌介绍 / ABOUT US</div>',
            w: 200,
            h: 20,
            x: 50,
            y: 50
          },
          {
            id: '',
            type: 'txt',
            val: '<div style="font-size:48px; font-weight:700; color:#1d1d1f; line-height:1.1;">精工匠心<br>智造未来.</div>',
            w: 500,
            h: 120,
            x: 50,
            y: 80
          },
          {
            id: '',
            type: 'txt',
            val: '<div style="font-size:14px; color:#444; line-height:1.8; text-align:justify;">雅洁五金始创于1990年...</div>',
            w: 300,
            h: 400,
            x: 50,
            y: 220
          },
          {
            id: '',
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
        page.type = 'canvas'
        page.canvasType = 'intro'
        page.blocks = [
          {
            id: '',
            type: 'txt',
            val: '<div style="font-size:200px; font-weight:900; color:#f3f3f3; line-height:1;">01</div>',
            w: 300,
            h: 200,
            x: -20,
            y: 40
          },
          {
            id: '',
            type: 'txt',
            val: '<div style="font-size:14px; letter-spacing:2px; color:#86868b; font-weight:600;">DOOR LOCK SYSTEMS</div>',
            w: 400,
            h: 30,
            x: 60,
            y: 100
          },
          {
            id: '',
            type: 'txt',
            val: '<div style="font-size:56px; font-weight:700; color:#4c1a79;">门锁系统</div>',
            w: 400,
            h: 80,
            x: 56,
            y: 120
          },
          {
            id: '',
            type: 'txt',
            val: '<div style="width:100%; height:4px; background:#ff6b00;"></div>',
            w: 60,
            h: 10,
            x: 60,
            y: 210
          },
          {
            id: '',
            type: 'txt',
            val: '<div style="font-size:14px; color:#555; line-height:1.8;">汇集现代简约设计与精密机械工艺。</div>',
            w: 400,
            h: 100,
            x: 60,
            y: 240
          },
          {
            id: '',
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
          id: '',
          img: '',
          name: '荣誉证书 Title'
        }))
        break
        
      case 'partner':
        // 合作伙伴页面
        page.title = 'STRATEGIC PARTNERS / 战略合作伙伴'
        page.sub = '品牌合作展示'
        page.items = Array(8).fill(null).map(() => ({
          id: '',
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
          id: '',
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
            id: '',
            type: 'txt',
            val: '<div style="width:100%; height:1px; background:#e5e5e5;"></div>',
            w: 674,
            h: 2,
            x: 60,
            y: 60
          },
          {
            id: '',
            type: 'txt',
            val: '<div style="font-family: Helvetica; font-weight:900; font-size:48px; color:#1d1d1f; letter-spacing:-2px; margin-bottom:20px;">ARCHIE</div><div style="font-size:12px; color:#444; line-height:1.8;"><b>广东雅洁五金有限公司</b><br>Guangdong Archie Hardware Co., Ltd.<br><br>Add: 中国·广东省佛山市南海区大沥镇长虹岭工业园<br>Tel: +86-757-8555-xxxx<br>Web: <span style="color:#ff6b00; font-weight:bold;">www.archie.com</span></div>',
            w: 400,
            h: 300,
            x: 60,
            y: 850
          },
          {
            id: '',
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
        
      case 'finish':
        // 表面处理页面
        page.title = 'FINISHES / 表面处理'
        page.sub = '工艺及颜色选择'
        page.items = Array(9).fill(null).map(() => ({
          id: '',
          img: '',
          name: '颜色 Color'
        }))
        break
        
      default:
        // 其他页面类型
        page.blocks = []
        break
    }
    
    // 合并用户提供的页面数据（如果有）
    if (this.pageData) {
      return { ...page, ...this.pageData }
    }
    
    return page as PageData
  }
}
