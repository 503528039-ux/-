# 雅洁五金 2026 工程图册 — 近期项目报告与进度分析

**报告日期**：2026-03-21  
**仓库**：archie-catalog（Vue 3 + Vite）  
**构建**：`npm run build` 已通过（本报告撰写时）

---

## 1. 项目目标（简述）

在浏览器内编辑、排版 A4 工程产品图册，支持多页模板、产品六宫格/复合图解、页眉页脚与数据持久化（localStorage / JSON 导出导入），并兼顾屏幕预览与打印/PDF 导出体验。

---

## 2. 本阶段已完成事项

### 2.1 页眉体系

- **横向页眉 + 右侧色块标题**：标题由 `header-title-block` 承载，背景色可配置（默认 `#EDE9F5`），与侧栏「页眉（全页）」联动持久化。
- **顶栏装饰线**：`.page-header::before` 金紫渐变顶线。
- **页眉与正文分界**：`.page-header::after` 底部分界渐变线。
- **标题与底线整体下移**：页眉高度 `calc(var(--header-height) + 2mm)`，上内边距增至 `3.2mm`，标题色块与底部分界线相对纸面上缘整体下移 **2mm**，内层可用高度保持不变。
- **苹果风纸面装饰（全局 `main.css`）**：`.a4-page::before` 多层径向渐变（环境光 + 右上/左下角标式水印），**不占用布局、不拦截点击**；标题色块增加轻柔 `box-shadow`。
- **产品页标题统一**：`getProductPageHeaderTitle()` — 智能门锁 / 门锁五金 / 工程小五金，**不区分**无线图与有线图页型。

### 2.2 数据与 Store

- `headerTitleBlockColor`、`headerTitleFontSizePx`（默认 16px）等与页眉相关的字段在 `dataMigration`、`catalog-new` 中加载、保存、导出/导入。

### 2.3 侧栏

- 页眉：标题色、字号、**色块背景**取色器与快捷预设。

### 2.4 涉及的主要路径

| 类别 | 路径 |
|------|------|
| 样式 | `src/assets/main.css` |
| 布局 | `src/components/layout/A4Page.vue` |
| 产品页标题 | `src/utils/productPageHeaderTitle.js` |
| Store / 迁移 | `src/stores/catalog-new.js`, `src/utils/dataMigration.js` |
| 侧栏 | `src/components/TheSidebar.vue` |
| 产品页 | `ProductGridPage.vue`, `CompositeProductPage.vue` |

---

## 3. 进度分析

| 维度 | 状态 | 说明 |
|------|------|------|
| 页眉视觉与交互 | **已完成** | 色块、顶线、底线、整体下移、装饰渐变与阴影 |
| 产品页标题策略 | **已完成** | 按 `subType` 统一文案，与页型解耦 |
| 持久化与导出 | **已完成** | 页眉相关字段纳入存储与项目 JSON |
| 打印一致性 | **需持续目测** | 依赖 `print-color-adjust`；极淡渐变在部分打印机上的表现需实机确认 |
| 大资源与工具目录 | **未纳入版本库** | 本地 venv、PDF 原稿、extracted 等见 `.gitignore` |

**风险与注意**

- 若某页曾手动编辑过 `headerText`，会覆盖自动标题逻辑，需在该页重新编辑或清除自定义页眉以使用统一标题。
- 纸面装饰为低对比度渐变，在强光或低质量显示器上可能不明显，属预期范围。

---

## 4. 建议的下一步（可选）

1. 打印/PDF 实机抽检一页，确认渐变与阴影是否需对 `@media print` 单独压暗或关闭。  
2. 为 `getProductPageHeaderTitle` 与页眉规则补充简短开发者注释或单元测试（若引入测试框架）。  
3. 将本报告与 `README.md` 中「项目说明」小节互链，便于新成员上手。

---

## 5. 版本与构建

- 建议使用 Node LTS，执行 `npm ci` / `npm install` 后 `npm run build` 验证。

---

*本报告由项目协作流程生成，随仓库版本迭代可继续追加 `docs/PROJECT_REPORT_YYYYMMDD.md`。*
