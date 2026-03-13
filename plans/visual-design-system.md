# 雅洁五金 2026 - 视觉设计系统 (Quiet Luxury & Engineering)

## 1. 设计理念

### 1.1 Quiet Luxury (静奢风) 核心原则
- **极简主义**: 去除冗余装饰，专注核心功能
- **高级质感**: 通过材质和细节体现品质感
- **克制用色**: 中性色调为主，品牌色点缀
- **精密工程**: 体现工业设计的精确性和可靠性

### 1.2 工程美学融合
- **数据精确性**: 技术参数使用等宽字体
- **网格系统**: 严格的布局对齐和间距
- **功能导向**: 每个视觉元素都有明确的功能目的
- **耐久感**: 视觉上传达产品的坚固和可靠

## 2. 色彩系统

### 2.1 主色调 (Primary Palette)
```css
/* 中性色调 - 静奢基础 */
--color-gray-50: #F5F5F7;    /* 背景色 - 极简浅灰 */
--color-gray-100: #E5E5E7;   /* 次要背景 */
--color-gray-200: #D2D2D7;   /* 边框色 - 极细深灰 */
--color-gray-300: #C7C7CC;   /* 分隔线 */
--color-gray-400: #AEAEB2;   /* 禁用状态 */
--color-gray-500: #8E8E93;   /* 辅助文字 */
--color-gray-600: #636366;   /* 次要文字 */
--color-gray-700: #48484A;   /* 主要文字 */
--color-gray-800: #3A3A3C;   /* 标题文字 */
--color-gray-900: #1D1D1F;   /* 强调文字 - 炭黑 */

/* 品牌色 - 谨慎使用 */
--color-brand-purple: #4C1A79;  /* 主品牌色 - 深紫 */
--color-brand-orange: #FF6B00;  /* 强调色 - 活力橙 */
--color-brand-blue: #007AFF;    /* 交互色 - 系统蓝 */
```

### 2.2 功能色 (Functional Colors)
```css
/* 状态反馈 */
--color-success: #34C759;      /* 成功 - 鲜绿 */
--color-warning: #FF9500;      /* 警告 - 琥珀 */
--color-error: #FF3B30;        /* 错误 - 鲜红 */
--color-info: #007AFF;         /* 信息 - 系统蓝 */

/* 交互状态 */
--color-primary-hover: #0056CC; /* 主色悬停 */
--color-primary-active: #0047AB; /* 主色激活 */
--color-surface-hover: #F2F2F7; /* 表面悬停 */
--color-surface-active: #E5E5EA; /* 表面激活 */
```

### 2.3 渐变系统 (Gradients)
```css
/* 品牌渐变 */
--gradient-brand: linear-gradient(135deg, #4C1A79 0%, #FF6B00 100%);
--gradient-subtle: linear-gradient(135deg, #F5F5F7 0%, #FFFFFF 100%);

/* 玻璃质感渐变 */
--gradient-glass: linear-gradient(
  135deg, 
  rgba(255, 255, 255, 0.95) 0%, 
  rgba(255, 255, 255, 0.85) 100%
);
```

## 3. 字体系统

### 3.1 字体族定义
```css
/* 英文字体栈 */
--font-sans-en: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono-en: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;

/* 中文字体栈 */
--font-sans-zh: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
--font-mono-zh: 'Menlo', 'Monaco', 'Courier New', monospace;
```

### 3.2 字号层级 (Type Scale)
```css
/* 显示文本 (Display) */
--text-display-3xl: 48px;   /* 特大标题 */
--text-display-2xl: 40px;   /* 大标题 */
--text-display-xl: 32px;    /* 主标题 */

/* 标题文本 (Heading) */
--text-heading-lg: 24px;    /* 章节标题 */
--text-heading-md: 20px;    /* 区块标题 */
--text-heading-sm: 18px;    /* 小标题 */

/* 正文文本 (Body) */
--text-body-lg: 16px;       /* 大正文 */
--text-body-md: 14px;       /* 标准正文 */
--text-body-sm: 12px;       /* 小正文/说明 */

/* 辅助文本 (Caption) */
--text-caption: 11px;       /* 图注/标签 */
--text-micro: 10px;         /* 极小文本 */
```

### 3.3 字重系统 (Font Weights)
```css
--font-weight-thin: 100;      /* 极细 */
--font-weight-light: 300;     /* 细体 */
--font-weight-regular: 400;   /* 常规 */
--font-weight-medium: 500;    /* 中等 */
--font-weight-semibold: 600;  /* 半粗 */
--font-weight-bold: 700;      /* 粗体 */
--font-weight-black: 900;     /* 特粗 */
```

### 3.4 行高系统 (Line Heights)
```css
--line-height-tight: 1.2;     /* 标题行高 */
--line-height-normal: 1.5;    /* 正文行高 */
--line-height-relaxed: 1.75;  /* 长文行高 */
```

## 4. 间距系统 (Spacing Scale)

### 4.1 基础间距单位
```css
--spacing-px: 1px;
--spacing-0: 0;
--spacing-1: 4px;    /* 超小间距 */
--spacing-2: 8px;    /* 小间距 */
--spacing-3: 12px;   /* 基础间距 */
--spacing-4: 16px;   /* 中等间距 */
--spacing-5: 20px;   /* 大间距 */
--spacing-6: 24px;   /* 超大间距 */
--spacing-8: 32px;   /* 特大间距 */
--spacing-10: 40px;  /* 容器间距 */
--spacing-12: 48px;  /* 区块间距 */
--spacing-16: 64px;  /* 大区块间距 */
```

### 4.2 布局间距应用
```css
/* 容器内边距 */
--container-padding: var(--spacing-6);
--section-padding: var(--spacing-8);
--card-padding: var(--spacing-4);

/* 元素间距 */
--element-gap-sm: var(--spacing-2);
--element-gap-md: var(--spacing-3);
--element-gap-lg: var(--spacing-4);

/* 分组间距 */
--group-gap-sm: var(--spacing-3);
--group-gap-md: var(--spacing-4);
--group-gap-lg: var(--spacing-6);
```

## 5. 圆角系统 (Border Radius)

### 5.1 圆角层级
```css
--radius-none: 0;
--radius-sm: 4px;     /* 小元素圆角 */
--radius-md: 8px;     /* 标准圆角 */
--radius-lg: 12px;    /* 大圆角 */
--radius-xl: 16px;    /* 特大圆角 */
--radius-2xl: 24px;   /* 超大圆角 */
--radius-full: 9999px; /* 圆形 */
```

### 5.2 应用场景
```css
/* 按钮 */
--button-radius: var(--radius-md);

/* 卡片 */
--card-radius: var(--radius-lg);

/* 输入框 */
--input-radius: var(--radius-md);

/* 模态框 */
--modal-radius: var(--radius-xl);

/* 头像/图标 */
--avatar-radius: var(--radius-full);
```

## 6. 阴影系统 (Shadow System)

### 6.1 阴影层级
```css
/* 基础阴影 */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* 内阴影 */
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);

/* 特殊效果 */
--shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.1);
--shadow-floating: 0 20px 40px rgba(0, 0, 0, 0.15);
```

### 6.2 应用场景
```css
/* 卡片阴影 */
--card-shadow: var(--shadow-lg);
--card-shadow-hover: var(--shadow-xl);

/* 侧边栏阴影 */
--sidebar-shadow: var(--shadow-md);

/* 工具栏阴影 */
--toolbar-shadow: var(--shadow-sm);

/* 模态框阴影 */
--modal-shadow: var(--shadow-2xl);
```

## 7. 材质效果 (Material Effects)

### 7.1 玻璃质感 (Glass Morphism)
```css
/* 基础玻璃效果 */
.glass-panel {
  background: linear-gradient(
    135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(255, 255, 255, 0.85) 100%
  );
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-glass);
}

/* 侧边栏玻璃效果 */
.sidebar-glass {
  @apply glass-panel;
  border-right: 1px solid rgba(210, 210, 215, 0.3);
}
```

### 7.2 金属质感 (Metal Finish)
```css
/* 拉丝金属效果 */
.metal-brushed {
  background: linear-gradient(
    135deg,
    #F8F8F8 0%,
    #E5E5E5 50%,
    #F8F8F8 100%
  );
  background-size: 200% 200%;
  animation: brushed-metal 3s ease-in-out infinite;
}

@keyframes brushed-metal {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### 7.3 磨砂质感 (Frosted Glass)
```css
.frosted-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

## 8. 动画与过渡 (Animation & Transition)

### 8.1 持续时间 (Durations)
```css
--duration-75: 75ms;
--duration-100: 100ms;
--duration-150: 150ms;
--duration-200: 200ms;
--duration-300: 300ms;
--duration-500: 500ms;
--duration-700: 700ms;
--duration-1000: 1000ms;
```

### 8.2 缓动函数 (Easing Functions)
```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
```

### 8.3 动画关键帧
```css
/* 淡入淡出 */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* 滑动动画 */
@keyframes slide-in-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slide-in-down {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* 缩放动画 */
@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

## 9. 图标系统 (Icon System)

### 9.1 图标尺寸
```css
--icon-xs: 12px;
--icon-sm: 16px;
--icon-md: 20px;
--icon-lg: 24px;
--icon-xl: 32px;
--icon-2xl: 40px;
```

### 9.2 图标颜色
```css
--icon-primary: var(--color-gray-900);
--icon-secondary: var(--color-gray-500);
--icon-disabled: var(--color-gray-400);
--icon-success: var(--color-success);
--icon-warning: var(--color-warning);
--icon-error: var(--color-error);
--icon-info: var(--color-info);
```

## 10. Tailwind CSS 配置示例

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // 静奢色调
        gray: {
          50: '#F5F5F7',
          100: '#E5E5E7',
          200: '#D2D2D7',
          300: '#C7C7CC',
          400: '#AEAEB2',
          500: '#8E8E93',
          600: '#636366',
          700: '#48484A',
          800: '#3A3A3C',
          900: '#1D1D1F',
        },
        // 品牌色
        brand: {
          purple: '#4C1A79',
          orange: '#FF6B00',
          blue: '#007AFF',
        },
        // 功能色
        functional: {
          success: '#34C759',
          warning: '#FF9500',
          error: '#FF3B30',
          info: '#007AFF',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          'PingFang SC',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        mono: [
          'SF Mono',
          'Monaco',
          'Cascadia Code',
          'Roboto Mono',
          'monospace'
        ]
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      backdropOpacity: {
        95: '0.95',
        90: '0.90',
        85: '0.85',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ]
}
```

## 11. 设计 Token 使用指南

### 11.1 CSS 自定义属性使用
```css
/* 在全局样式或组件中使用 */
.component {
  background-color: var(--color-gray-50);
  color: var(--color-gray-900);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-4);
  font-family: var(--font-sans-en);
  font-size: var(--text-body-md);
  transition: all var(--duration-300) var(--ease-in-out);
}
```

### 11.2 Vue 组件中使用
```vue
<template>
  <div class="glass-panel">
    <h3 :style="{ color: 'var(--color-gray-900)' }">
      {{ title }}
    </h3>
    <p :style="{ fontSize: 'var(--text-body-sm)' }">
      {{ description }}
    </p>
  </div>
</template>

<style scoped>
.glass-panel {
  background: var(--gradient-glass);
  backdrop-filter: blur(12px