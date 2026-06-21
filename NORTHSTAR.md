# NORTHSTAR — 雅洁五金 2026 工程图册

## 北极星目标

为雅洁五金（ARCHIE）打造一套**离线优先、所见即所得**的 A4 工程产品图册编辑与发布系统。结合 Excel 数据驱动和可视化拖拽编辑，将 1900+ SKU 的产品资料高效转化为专业印刷级 PDF 图册。

**一句话：让非技术人员也能用 Excel + 拖图，10 分钟内生成一本 200+ 页的专业工程图册 PDF。**

---

## 核心原则

1. **数据驱动优先** — 产品信息来自 Excel 主表，程序负责排版、匹配图片、生成页面。人工编辑是增量，不是起点。
2. **离线优先** — 所有数据持久化在浏览器 IndexedDB（localforage），不依赖服务端。支持 JSON 导出/导入作为备份与迁移手段。
3. **非破坏性编辑** — 命令模式（Command Pattern）支撑撤销/重做，数据迁移只增字段不删字段。
4. **A4 印刷精度** — 所有布局以 210×297mm A4 为基准，支持双通道 PDF 导出（Playwright 无头浏览器 + html2canvas/jsPDF 兜底）。
5. **中文优先** — UI、模板默认文案、PDF 字体均以中文为第一语言，英文为辅助。

---

## 技术栈

| 层 | 选型 | 用途 |
|---|------|------|
| 框架 | Vue 3 (Composition API) | UI 组件与响应式状态 |
| 构建 | Vite 5 | 开发/生产构建 |
| 状态管理 | Pinia | 全局图册数据 store |
| 样式 | Tailwind CSS 3 + 自建设计 Token | 原子化 + 品牌变量 |
| 持久化 | localforage (IndexedDB) | 离线数据存储 |
| 撤销/重做 | 自建 CommandManager | 命令栈（最大 50 步） |
| Excel 解析 | SheetJS (xlsx) | 产品清单/展示清单导入 |
| 拖拽排序 | vuedraggable | 页面重排 |
| PDF 导出 | Playwright (主) / html2canvas + jsPDF (兜底) | 双通道 PDF 生成 |
| 类型检查 | TypeScript (渐進) | 核心模块类型约束 |

---

## 项目结构

```
src/
├── App.vue                  # 根组件：画布+侧栏+拖入匹配
├── main.js                  # 入口
├── assets/                  # CSS 设计 Token、品牌字体
├── commands/                # 命令模式（撤销/重做）
│   ├── core/                # CommandManager、BaseCommand
│   └── page/                # Add/Move/Remove/Reorder/Snapshot 命令
├── components/
│   ├── layout/              # A4Page、PageHeader/Footer、Hero 等布局组件
│   ├── pages/               # 页面类型：Cover、ProductGrid、CompanyIntro 等 12 种
│   └── ui/                  # 通用 UI：EditableText、ImageUploader、ConfirmModal
├── composables/             # 组合式函数：拖拽、批量选择、图片读取
├── config/                  # 页面模板默认值、Demo 图册生成
├── stores/                  # Pinia store：catalog-new.js（主 store）
├── types/                   # TypeScript 类型定义
├── utils/                   # 工具函数：Excel 导入、PDF 导出、数据迁移、图片匹配等
└── dev/                     # 开发工具：模板画廊预览
```

---

## 页面类型（12 种）

| 类型 | 组件 | 说明 |
|------|------|------|
| `cover` | CatalogCoverWhite | 封面（支持 dark/light 主题） |
| `companyIntro` | CompanyIntroPage | 公司简介/品牌故事 |
| `certificates` | CertificatesPage | 荣誉资质（4×2 网格） |
| `partners` | PartnersPage | 战略合作伙伴 |
| `projectCases` | ProjectCasesPage | 工程案例 |
| `surfaceFinishes` | SurfaceFinishesPage | 表面处理工艺 |
| `tableOfContents` | TableOfContentsPage | 目录页 |
| `productGrid` | ProductGridPage | 产品实拍页（3×3 九宫格） |
| `compositeProduct` | CompositeProductPage | 复合线图页 |
| `divider` | DividerPage | 章节过渡页 |
| `backCover` | BackCoverPage | 封底 |
| `freePage` | FreePage | 自由编辑页 |

---

## 数据流

```
Excel 主表 (.xlsx)
  → SheetJS 解析 → 产品行
  → 按类别分组 → 自动生成 productGrid/compositeProduct 页
  → Pinia Store → Vue 响应式渲染
  → IndexedDB 自动持久化（localforage）
  → 导出：项目 JSON 备份 / Playwright PDF 出版
```

图片匹配规则：
- 拖入图片 → 按文件名匹配产品型号或格子名称
- 支持 `/public/uploads/` 路径化存储
- 未匹配图片提示手动入位

---

## 关键设计决策

- **ADR-001**: 采用命令模式管理所有可变操作，确保撤销/重做可覆盖增删改排序全场景
- **数据版本管理**: 非破坏性迁移链 v0→v1→v2→v3，每次迁移只新增字段
- **PDF 双通道**: Playwright 为主力（字体嵌入、色彩准确），html2canvas/jsPDF 为纯浏览器兜底
- **封面双主题**: dark（建筑极简）与 light（博物馆暖白），通过 `data-cover-theme` 切换
- **`claude设计模板/` 目录**: Claude 生成的页面模板 `.vue` 文件，通过 Vite 插件解析相对路径别名，`?templateGallery=1` 开发预览，不进生产包

---

## V1 发布基线（2026年6月）

- 1923 条产品 → 215 页产品实拍页 → 总计约 226 页
- 优先交付 PDF，程序继续作为生产工具迭代
- 资料不完整的产品保留但不虚构数据
- 后续 V1.1、V1.2 持续更新主表和图片

---

## 约束

- **无服务端**：纯前端应用，不引入后端/数据库
- **浏览器兼容**：以 Chromium 为核心目标（PDF 导出依赖），兼顾现代浏览器
- **不引入重型状态库**：Pinia 足够，不引入 Redux/Vuex
- **图片体积可控**：PDF 导出前自动归一化处理，单页图片总体积控制在合理范围

---

## 相关资源

- 产品主表：`/Users/cmaj/Developer/天书图册图片和表格提取/雅洁程序导入_程序识别字段增强版.xlsx`
- 天书 PDF：`0504-天书下册.pdf`
- 图片素材：`public/uploads/`
- 架构文档：`plans/architecture-summary.md`
- 技术规格：`plans/technical-specification.md`
- V1 综合报告：`图册V1上线与持续迭代综合报告_20260611.md`
