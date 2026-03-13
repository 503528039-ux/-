# 基于页面代码.txt的逐组件修复计划

## 📐 设计稿概述

[`页面代码/页面代码.txt`](../页面代码/页面代码.txt) 是一个完整的静态 HTML 设计稿，定义了 **13 个页面模板**，包含精确的 CSS 规范。这是所有 Vue 组件的**唯一视觉真相来源**。

### 设计稿页面清单

| 序号 | 页面类型 | 设计稿行号 | 对应Vue组件 | 状态 |
|------|---------|-----------|------------|------|
| 01 | 封面 | L303-336 | `CatalogCover.vue` | 需对比 |
| 02 | 公司简介 | L338-351 | `CompanyIntroPage.vue` | 需对比 |
| 03 | 荣誉资质 | L353-371 | `CertificatesPage.vue` | 需对比 |
| 04 | 战略合作伙伴 | L373-388 | `PartnersPage.vue` | 需对比 |
| 05 | 工程案例 | L390-414 | `ProjectCasesPage.vue` | 需对比 |
| 06 | 表面处理 | L416-432 | `SurfaceFinishesPage.vue` | 需对比 |
| 07 | 总目录 | L434-453 | `TableOfContentsPage.vue` | 需对比 |
| 08 | 过渡页 | L455-461 | `DividerPage.vue` | 需对比 |
| 09 | 6宫格产品页-门锁 | L463-543 | `ProductGridPage.vue` | 需对比 |
| 10 | 6宫格产品页-小五金 | L545-625 | `ProductGridPage.vue` | 需对比 |
| 11 | 复合产品页-门锁 | L627-737 | `CompositeProductPage.vue` | 需对比 |
| 12 | 复合产品页-小五金 | L739-849 | `CompositeProductPage.vue` | 需对比 |
| 13 | 封底 | L851-863 | `BackCoverPage.vue` | 需对比 |

---

## 🔍 逐组件差异分析与修复方案

### 1. 基础布局层：A4Page.vue

**设计稿规范** (L40-58):
```css
.a4-page { width: 210mm; height: 297mm; background: #fff; position: relative; display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(0,0,0,0.15); overflow: hidden; }
.page-content { flex-grow: 1; padding: 0 var(--page-padding); display: flex; flex-direction: column; }
```

**当前代码问题** ([`A4Page.vue`](../src/components/layout/A4Page.vue:62)):
- ❌ `.page-content` 使用 `padding: 15mm`（四面等距），设计稿是 `padding: 0 15mm`（仅左右）
- ❌ 页眉和页脚应在 `.page-content` **外部**，但当前通过 slot 放在内部

**修复方案**:
```
.page-content { padding: 0 15mm; }  // 仅左右边距，上下由 header/footer 控制
```

---

### 2. 页眉：PageHeader.vue

**设计稿规范** (L60-76):
```css
.page-header {
    height: 20mm;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    padding: 0 15mm 4mm 15mm;
    border-bottom: 0.5px solid #E5E5EA;
    margin-bottom: 8mm;
}
.header-title { font-size: 11px; font-weight: 500; color: #86868B; letter-spacing: 3px; text-transform: uppercase; }
```

**当前代码问题** ([`PageHeader.vue`](../src/components/layout/PageHeader.vue:86)):
- ❌ 结构过于复杂：有 left/center/right 三区域，设计稿只有一个右对齐的 `.header-title`
- ❌ 使用了 CSS 变量引用 `var(--size-page-padding)` 但未确认是否正确解析
- ⚠️ 功能上过度设计，设计稿只需要一行右对齐文字

**修复方案**:
- 简化模板结构，默认只显示右对齐的标题文字
- 确保 `height: 20mm`, `padding: 0 15mm 4mm 15mm`, `border-bottom: 0.5px solid #E5E5EA`, `margin-bottom: 8mm`

---

### 3. 页脚：PageFooter.vue

**设计稿规范** (L78-88):
```css
.page-footer {
    height: 15mm;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 9px;
    color: #86868B;
    letter-spacing: 2px;
    font-family: Inter, monospace;
}
```
页脚内容格式：`- PAGE 02 -`

**当前代码问题** ([`PageFooter.vue`](../src/components/layout/PageFooter.vue:158)):
- ❌ 结构过于复杂：有 left/center/right 三区域
- ❌ 设计稿只需要居中的 `- PAGE XX -` 文字
- ⚠️ 页脚应在 `.page-content` 外部

**修复方案**:
- 简化为居中显示 `- PAGE XX -`
- 确保 `height: 15mm`, `font-size: 9px`, `color: #86868B`, `letter-spacing: 2px`

---

### 4. 封面：CatalogCover.vue

**设计稿规范** (L97-152, L303-336):
```css
.cover-page { justify-content: center; align-items: center; text-align: center; padding: 20mm; background: radial-gradient(circle at 50% 30%, #644B8E 0%, #2A1A40 100%); }
```
关键元素：
- 水印 `ARCHIE`（200px, opacity 0.04）
- 裁切线（四角金色L形）
- SVG 装饰背景（门把手素描）
- 英文品牌名 `ARCHIE`（22px, 金色, letter-spacing 16px）
- 中文品牌名 `雅洁五金`（100px, 白色, letter-spacing 24px）
- 金色竖线分隔（2px x 50mm）
- 年份副标题 `2026 工程产品手册`（46px, 白色）
- 英文副标题 `ENGINEERING SOLUTIONS`（10px, 金色）

**修复方案**:
- 确保封面不使用 `A4Page` 包裹（封面是全出血设计，无页眉页脚）
- 精确还原渐变背景、水印、裁切线、SVG装饰
- 确保所有字体大小、颜色、间距与设计稿一致

---

### 5. 公司简介：CompanyIntroPage.vue

**设计稿规范** (L154-166, L338-351):
```css
.hero-img { width: calc(100% + 15mm * 2); height: 110mm; background: #000; margin-left: -15mm; margin-right: -15mm; margin-bottom: 12mm; overflow: hidden; }
.hero-img img { width: 100%; height: 100%; object-fit: cover; opacity: 0.9; }
.text-cols { column-count: 2; column-gap: 12mm; font-size: 12px; line-height: 2; color: #1D1D1F; text-align: justify; }
```

**关键差异**:
- Hero图片需要**出血排版**（负边距突破页边距）
- 双栏文本使用 CSS `column-count: 2`
- 标题使用 `.section-title`（28px, 紫色）和 `.section-subtitle`（11px, 金色, letter-spacing 2px）

**修复方案**:
- 确保 hero 图片使用负边距实现出血效果
- 双栏文本使用 `column-count: 2; column-gap: 12mm`
- 标题样式精确匹配

---

### 6. 荣誉资质：CertificatesPage.vue

**设计稿规范** (L168-172, L353-371):
```css
.grid-cert { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12mm; margin-top: 15mm; margin-bottom: 10mm; }
.cert-box { border: 1px solid #E5E5EA; height: 75mm; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-direction: column; background: #fff; }
.cert-box img { width: 60%; opacity: 0.6; margin-bottom: 15px; }
.cert-text { font-size: 10px; color: #86868B; text-align: center; padding: 0 4px; font-weight: 500; }
```

**修复方案**:
- 4列网格，间距 12mm
- 证书盒子高度 75mm，圆角 6px
- 图片宽度 60%，透明度 0.6

---

### 7. 战略合作伙伴：PartnersPage.vue

**设计稿规范** (L174-176, L373-388):
```css
.grid-partner { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8mm; margin-top: 15mm; }
.partner-box { background: #F8F8FA; height: 35mm; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: #86868B; }
```

**修复方案**:
- 3列网格，间距 8mm
- 合作伙伴盒子高度 35mm，圆角 8px
- 背景色 `#F8F8FA`

---

### 8. 工程案例：ProjectCasesPage.vue

**设计稿规范** (L390-414):
- 两个全宽图片区域，使用负边距出血
- 每个图片底部有渐变遮罩 + 文字叠加
- 标签（金色, 10px, letter-spacing 2px）
- 标题（白色, 20px）

**修复方案**:
- 确保图片区域使用负边距出血
- 渐变遮罩 `linear-gradient(transparent, rgba(0,0,0,0.9))`
- 文字叠加定位正确

---

### 9. 表面处理：SurfaceFinishesPage.vue

**设计稿规范** (L178-201, L416-432):
```css
.grid-finishes { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10mm 4mm; margin-top: 10mm; }
.finish-swatch { width: 22mm; height: 22mm; border-radius: 50%; margin-bottom: 12px; box-shadow: inset 0 2px 8px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.08); }
.finish-name { font-size: 11px; font-weight: 700; color: #1D1D1F; margin-bottom: 3px; }
.finish-en { font-size: 8px; color: #86868B; text-transform: uppercase; letter-spacing: 0.2px; line-height: 1.1; }
```

**修复方案**:
- 6列网格，间距 `10mm 4mm`
- 色板圆形 22mm x 22mm
- 6种预设渐变色（PVD钛金、哑光黑、砂镍、枪灰、青古铜、烤漆白）

---

### 10. 总目录：TableOfContentsPage.vue

**设计稿规范** (L203-209, L434-453):
```css
.toc-list { list-style: none; padding: 0; margin-top: 10mm; width: 85%; margin-left: auto; margin-right: auto; }
.toc-item { display: flex; align-items: baseline; margin-bottom: 8mm; }
.toc-title { font-size: 16px; font-weight: 600; color: #5E4585; margin-right: 15px; }
.toc-en { font-size: 11px; color: #86868B; letter-spacing: 1px; }
.toc-dots { flex-grow: 1; border-bottom: 1px dotted #86868B; margin: 0 15px; opacity: 0.5; }
.toc-page { font-size: 14px; font-family: Inter; font-weight: 600; color: #9A805E; }
```

**修复方案**:
- 目录列表宽度 85%，居中
- 每项：标题（紫色）+ 英文（灰色）+ 点线 + 页码（金色）
- 特殊项使用金色标题

---

### 11. 过渡页：DividerPage.vue

**设计稿规范** (L211-216, L455-461):
```css
.divider-page { background-color: #5E4585; color: #fff; justify-content: center; padding-left: 30mm; position: relative; overflow: hidden; }
.divider-page h2 { color: #fff; font-size: 56px; letter-spacing: 8px; margin-bottom: 15px; z-index: 2; }
.divider-page p { color: #9A805E; font-size: 14px; letter-spacing: 4px; z-index: 2; }
.divider-line { width: 80px; height: 1.5px; background-color: #9A805E; margin-top: 40px; z-index: 2; }
.divider-number { font-size: 450px; font-weight: 900; color: rgba(255,255,255,0.04); position: absolute; bottom: -40mm; right: -25mm; line-height: 0.8; font-family: Inter; z-index: 1; }
```

**修复方案**:
- 全紫色背景，无页眉页脚
- 左对齐（padding-left: 30mm）
- 巨大数字水印（450px, 极低透明度）

---

### 12. 6宫格产品页：ProductGridPage.vue + ProductCard.vue

**设计稿规范** (L218-229, L463-543):
```css
.grid-6 { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(3, 1fr); gap: 8mm; flex-grow: 1; padding-bottom: 5mm; }
.product-card { display: flex; flex-direction: column; }
.card-img-box { height: 48mm; background-color: rgba(134, 134, 139, 0.04); border-radius: 12px; display: flex; justify-content: center; align-items: center; padding: 10mm; position: relative; }
.card-img-box img { max-width: 100%; max-height: 100%; object-fit: contain; mix-blend-mode: multiply; }
.card-info { padding-top: 12px; flex-grow: 1; display: flex; flex-direction: column; }
.card-title { font-size: 15px; font-weight: 700; color: #1D1D1F; margin-bottom: 2px; }
.card-model { font-size: 11px; font-family: Inter; color: #5E4585; font-weight: 600; margin-bottom: 10px; }
.card-specs-mini { display: flex; flex-direction: column; gap: 4px; }
.mini-spec-row { display: flex; justify-content: space-between; font-size: 10px; border-bottom: 0.5px dashed #E5E5EA; padding-bottom: 3px; }
.mini-label { color: #86868B; }
.mini-value { color: #1D1D1F; font-weight: 500; }
```

**当前代码问题** ([`ProductGridPage.vue`](../src/components/pages/ProductGridPage.vue:39)):
- ✅ 网格结构基本正确（2列3行，gap 8mm）
- ⚠️ 需要确认 `ProductCard.vue` 的样式是否精确匹配

**ProductCard.vue 关键差异** ([`ProductCard.vue`](../src/components/ProductCard.vue:120)):
- ✅ `.card-img-box` 高度 48mm 已正确
- ✅ `mix-blend-mode: multiply` 已正确
- ❌ `.card-title` 设计稿是 `15px/700/#1D1D1F`，需确认当前实现
- ❌ `.card-model` 设计稿是 `11px/Inter/600/#5E4585`，需确认
- ❌ `.mini-spec-row` 设计稿是 `flex/space-between/10px/dashed border`，需确认
- ❌ 当前使用 `<input>` 元素做编辑，打印模式下需确保样式与设计稿一致

---

### 13. 复合产品页：CompositeProductPage.vue

**设计稿规范** (L231-285, L627-737):
```css
.composite-mode .card-img-box {
    background-color: #fff;
    border: 0.5px solid rgba(154, 128, 94, 0.3);
    border-radius: 6px;
    background-image: linear-gradient(rgba(154, 128, 94, 0.05) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(154, 128, 94, 0.05) 1px, transparent 1px);
    background-size: 5mm 5mm;
    display: flex; justify-content: space-between; align-items: center;
    padding: 5mm 3mm;
}
.composite-photo { width: 58%; height: 90%; }
.composite-photo img { filter: drop-shadow(0 6px 12px rgba(0,0,0,0.08)); }
.composite-line { width: 38%; height: 85%; border-left: 1px dashed rgba(154, 128, 94, 0.4); padding-left: 3mm; }
.composite-line img { filter: contrast(200%) grayscale(100%) brightness(0.85); mix-blend-mode: multiply; opacity: 0.6; }
.tech-tag { position: absolute; top: -6px; right: 0; font-size: 7px; color: #86868B; font-family: monospace; background: #fff; padding: 0 4px; }
```

**修复方案**:
- 复合模式使用工程图纸网格背景（5mm方格）
- 实拍图占 58%，线图占 38%
- 线图使用高对比度灰度滤镜
- 技术标签（SCALE 1:1）

---

### 14. 封底：BackCoverPage.vue

**设计稿规范** (L287-292, L851-863):
```css
.back-cover { background-color: #5E4585; color: #fff; justify-content: center; align-items: center; text-align: center; }
.qr-code { width: 35mm; height: 35mm; background: #fff; padding: 2mm; margin: 20mm auto; border-radius: 4px; }
.contact-info { font-size: 11px; line-height: 2; color: rgba(255,255,255,0.7); letter-spacing: 1px; }
.contact-info strong { color: #9A805E; font-size: 14px; display: block; margin-bottom: 10px; letter-spacing: 3px; }
```

**修复方案**:
- 全紫色背景，无页眉页脚
- 品牌名 ARCHIE（24px, 白色, letter-spacing 12px）
- 二维码区域 35mm x 35mm
- 联系信息（白色半透明, 金色强调）

---

## 🏗️ 修复执行顺序

### 阶段 A：基础架构修复（最高优先级）

| 步骤 | 文件 | 修复内容 |
|------|------|---------|
| A1 | `A4Page.vue` | 修正 `.page-content` padding 为 `0 15mm`；页眉页脚移到 content 外部 |
| A2 | `PageHeader.vue` | 简化结构，精确匹配设计稿的右对齐单行标题 |
| A3 | `PageFooter.vue` | 简化结构，精确匹配设计稿的居中页码格式 |
| A4 | `App.vue` | 修复 pageComponents 映射，移除错误的临时映射 |

### 阶段 B：产品展示修复（高优先级）

| 步骤 | 文件 | 修复内容 |
|------|------|---------|
| B1 | `ProductCard.vue` | 精确匹配 `.card-title`/`.card-model`/`.mini-spec-row` 样式 |
| B2 | `ProductGridPage.vue` | 确认网格结构与设计稿一致 |
| B3 | `CompositeProductPage.vue` | 实现复合模式的工程图纸网格背景和双区域布局 |

### 阶段 C：特殊页面修复（中优先级）

| 步骤 | 文件 | 修复内容 |
|------|------|---------|
| C1 | `CatalogCover.vue` | 精确还原封面设计（渐变、水印、裁切线、SVG装饰） |
| C2 | `CompanyIntroPage.vue` | 修复 hero 图片出血排版和双栏文本 |
| C3 | `DividerPage.vue` | 修复过渡页布局（左对齐、巨大数字水印） |
| C4 | `BackCoverPage.vue` | 修复封底布局（居中、二维码、联系信息） |

### 阶段 D：内容页面修复（标准优先级）

| 步骤 | 文件 | 修复内容 |
|------|------|---------|
| D1 | `CertificatesPage.vue` | 修复 4列网格、证书盒子样式 |
| D2 | `PartnersPage.vue` | 修复 3列网格、合作伙伴盒子样式 |
| D3 | `ProjectCasesPage.vue` | 修复出血图片和文字叠加 |
| D4 | `SurfaceFinishesPage.vue` | 修复 6列网格、色板样式和渐变色 |
| D5 | `TableOfContentsPage.vue` | 修复目录列表样式（点线、页码） |

### 阶段 E：验证与清理

| 步骤 | 内容 |
|------|------|
| E1 | 启动开发服务器，逐页对比设计稿 |
| E2 | 测试打印预览模式 |
| E3 | 清理冗余代码和临时映射 |

---

## 📊 关键CSS规范速查表

| 属性 | 设计稿值 | 用途 |
|------|---------|------|
| `--page-padding` | `15mm` | 页面左右边距 |
| `--header-height` | `20mm` | 页眉高度 |
| `--footer-height` | `15mm` | 页脚高度 |
| `.card-img-box height` | `48mm` | 产品图片区域高度 |
| `.grid-6 gap` | `8mm` | 6宫格间距 |
| `.grid-cert gap` | `12mm` | 证书网格间距 |
| `.grid-partner gap` | `8mm` | 合作伙伴网格间距 |
| `.grid-finishes gap` | `10mm 4mm` | 表面处理网格间距 |
| `.finish-swatch` | `22mm x 22mm` | 色板尺寸 |
| `.cert-box height` | `75mm` | 证书盒子高度 |
| `.partner-box height` | `35mm` | 合作伙伴盒子高度 |
| `.hero-img height` | `110mm` | Hero图片高度 |
| `.qr-code` | `35mm x 35mm` | 二维码尺寸 |

---

## ⚠️ 核心修复原则

1. **CSS 以 [`页面代码.txt`](../页面代码/页面代码.txt) 为唯一真相来源**
2. **使用物理单位 mm** 而非 px 来确保打印精度
3. **保持 Vue 组件的交互功能**（编辑、拖拽、导出），只修复视觉样式
4. **打印模式下隐藏所有编辑控件**，确保输出与设计稿一致
