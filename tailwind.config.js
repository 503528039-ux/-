/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 静奢色调 - Quiet Luxury Neutrals
        gray: {
          50: '#F5F5F7',    // 背景色 - 极简浅灰
          100: '#E5E5E7',   // 次要背景
          200: '#D2D2D7',   // 边框色 - 极细深灰
          300: '#C7C7CC',   // 分隔线
          400: '#AEAEB2',   // 禁用状态
          500: '#8E8E93',   // 辅助文字
          600: '#636366',   // 次要文字
          700: '#48484A',   // 主要文字
          800: '#3A3A3C',   // 标题文字
          900: '#1D1D1F',   // 强调文字 - 炭黑
        },
        
        // 品牌色 - Archie Hardware
        brand: {
          // 来自页面代码.txt的品牌色
          archie: {
            purple: '#5E4585',      // --archie-purple
            gold: '#9A805E',        // --archie-gold
            cream: '#F8F8FA',       // --luxury-cream
          },
          // 文字色
          text: {
            dark: '#1D1D1F',        // --text-dark
            gray: '#86868B',        // --text-gray
          },
          divider: '#E5E5EA',       // --divider
          
          // 原有品牌色（保持兼容）
          purple: {
            DEFAULT: '#4C1A79',     // 深紫 - 主品牌色
            light: '#6A3A9A',
            dark: '#3A0F5C',
          },
          orange: {
            DEFAULT: '#FF6B00',     // 古铜金/活力橙
            light: '#FF8C33',
            dark: '#CC5500',
          },
          blue: {
            DEFAULT: '#007AFF',     // 系统蓝 - 交互色
            light: '#3395FF',
            dark: '#0056CC',
          },
        },
        
        // 功能色 - Functional Colors
        functional: {
          success: '#34C759',    // 成功 - 鲜绿
          warning: '#FF9500',    // 警告 - 琥珀
          error: '#FF3B30',      // 错误 - 鲜红
          info: '#007AFF',       // 信息 - 系统蓝
        },
        
        // 表面色 - Surface Colors
        surface: {
          primary: '#FFFFFF',
          secondary: '#F2F2F7',
          tertiary: '#E5E5EA',
          quaternary: '#D1D1D6',
        },
        
        // 工业金属色 - Industrial Metals
        metal: {
          brushed: '#E8E8ED',    // 拉丝金属
          polished: '#F0F0F5',   // 抛光金属
          anodized: '#4A4A4F',   // 阳极氧化
          stainless: '#C0C0C5',  // 不锈钢
        },
      },
      
      fontFamily: {
        sans: [
          'Inter',
          'PingFang SC',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
        mono: [
          'SF Mono',
          'Monaco',
          'Cascadia Code',
          'Roboto Mono',
          'Consolas',
          'monospace'
        ],
        display: [
          'Inter',
          'PingFang SC',
          '-apple-system',
          'sans-serif'
        ],
      },
      
      fontSize: {
        // 显示文本 (Display)
        'display-3xl': ['48px', { lineHeight: '1.1', fontWeight: '900' }],
        'display-2xl': ['40px', { lineHeight: '1.1', fontWeight: '800' }],
        'display-xl': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        
        // 标题文本 (Heading)
        'heading-lg': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
        'heading-md': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-sm': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        
        // 正文文本 (Body)
        'body-lg': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        
        // 辅助文本 (Caption)
        'caption': ['11px', { lineHeight: '1.4', fontWeight: '400' }],
        'micro': ['10px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      
      spacing: {
        'sidebar-left': '240px',
        'sidebar-right': '300px',
        'canvas-padding': '40px',
        'toolbar-height': '48px',
        'statusbar-height': '32px',
        'mm-15': '15mm',
        'mm-48': '48mm',
      },
      
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'floating': '0 20px 40px rgba(0, 0, 0, 0.15)',
        'subtle': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'elevated': '0 10px 30px rgba(0, 0, 0, 0.12)',
        'inset': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
      
      backdropOpacity: {
        '85': '0.85',
        '90': '0.90',
        '95': '0.95',
        '98': '0.98',
      },
      
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'slide-in-up': 'slide-in-up 0.3s ease-out',
        'slide-in-down': 'slide-in-down 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      transitionProperty: {
        'layout': 'width, height, margin, padding',
        'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
        'transform': 'transform',
        'opacity': 'opacity',
        'shadow': 'box-shadow',
      },
      
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '500': '500ms',
      },
      
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}