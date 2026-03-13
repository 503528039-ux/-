<script setup>
import A4Page from '../layout/A4Page.vue'
import PageHeader from '../layout/PageHeader.vue'
import PageFooter from '../layout/PageFooter.vue'

const props = defineProps({
  // 页面标题配置
  title: {
    type: String,
    default: '质感美学'
  },
  subtitle: {
    type: String,
    default: 'Surface Finishes'
  },
  
  // 表面处理数据
  finishes: {
    type: Array,
    default: () => [
      {
        id: 1,
        name: 'PVD 钛金',
        enName: 'PVD Titanium',
        colorClass: 'swatch-pvd',
        gradient: 'linear-gradient(135deg, #e6c27a 0%, #b8860b 50%, #8b6508 100%)'
      },
      {
        id: 2,
        name: '哑光黑',
        enName: 'Matte Black',
        colorClass: 'swatch-black',
        gradient: 'linear-gradient(135deg, #333 0%, #1a1a1a 50%, #000 100%)'
      },
      {
        id: 3,
        name: '拉丝砂镍',
        enName: 'Satin Nickel',
        colorClass: 'swatch-nickel',
        gradient: 'linear-gradient(135deg, #d3d3d3 0%, #a9a9a9 50%, #808080 100%)'
      },
      {
        id: 4,
        name: '拉丝枪灰',
        enName: 'Gunmetal',
        colorClass: 'swatch-gunmetal',
        gradient: 'linear-gradient(135deg, #7a7a8c 0%, #4a4a5a 50%, #2a2a3a 100%)'
      },
      {
        id: 5,
        name: '青古铜',
        enName: 'A. Bronze',
        colorClass: 'swatch-bronze',
        gradient: 'linear-gradient(135deg, #cd7f32 0%, #8b4513 50%, #5c3317 100%)'
      },
      {
        id: 6,
        name: '烤漆白',
        enName: 'Baked White',
        colorClass: 'swatch-white',
        gradient: 'linear-gradient(135deg, #fff 0%, #f0f0f0 50%, #e0e0e0 100%)'
      }
    ]
  },
  
  // 页面元数据
  pageNumber: {
    type: [String, Number],
    default: 5
  },
  totalPages: {
    type: [String, Number],
    default: 48
  }
})
</script>

<template>
  <A4Page
    :title="title"
    :pageNumber="pageNumber"
    :showHeader="true"
    :showFooter="true"
  >
    <div class="content-section">
      <h2 class="section-title">{{ title }}</h2>
      <p class="section-subtitle">{{ subtitle }}</p>
      
      <!-- 表面处理介绍 -->
      <div 
        class="finishes-intro"
        :style="{
          fontSize: '12px',
          color: 'var(--color-text-dark)',
          lineHeight: '1.8',
          marginBottom: 'var(--spacing-xl)',
          textAlign: 'justify'
        }"
      >
        <p>雅洁五金提供六种高端表面处理工艺，每种工艺都经过严格测试，确保色彩持久、质感卓越。我们的表面处理不仅美观，更具备优异的耐磨、耐腐蚀性能。</p>
      </div>
      
      <!-- 一行6个的表面处理网格 -->
      <div 
        class="finishes-grid"
        :style="{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '10mm 4mm',
          marginTop: 'var(--spacing-lg)'
        }"
      >
        <div 
          v-for="finish in props.finishes" 
          :key="finish.id"
          class="finish-item"
          :style="{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }"
        >
          <!-- 表面处理色板圆环 -->
          <div 
            class="finish-swatch"
            :style="{
              width: '22mm',
              height: '22mm',
              borderRadius: '50%',
              marginBottom: '12px',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.08)',
              background: finish.gradient,
              border: finish.colorClass === 'swatch-white' ? '1px solid var(--color-divider)' : 'none'
            }"
          >
            <!-- 内部装饰圆环 -->
            <div 
              class="swatch-inner-ring"
              :style="{
                width: '16mm',
                height: '16mm',
                borderRadius: '50%',
                position: 'relative',
                top: '3mm',
                left: '3mm',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }"
            />
          </div>
          
          <!-- 表面处理名称 -->
          <h3 
            class="finish-name"
            :style="{
              fontSize: '11px',
              fontWeight: '700',
              color: 'var(--color-text-dark)',
              marginBottom: '3px',
              lineHeight: '1.2'
            }"
          >
            {{ finish.name }}
          </h3>
          
          <!-- 英文名称 -->
          <div
            class="finish-en"
            :style="{
              fontSize: '8px',
              color: 'var(--color-text-gray)',
              fontFamily: 'Inter, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.2px',
              lineHeight: '1.1',
              marginBottom: 'var(--spacing-xs)'
            }"
          >
            {{ finish.enName }}
          </div>
          
          <!-- 工艺描述 -->
          <div 
            class="finish-description"
            :style="{
              fontSize: '7px',
              color: 'var(--color-text-gray)',
              lineHeight: '1.3',
              marginTop: 'var(--spacing-xs)',
              maxWidth: '20mm'
            }"
          >
            {{ finish.description }}
          </div>
        </div>
      </div>
      
      <!-- 工艺特性说明 -->
      <div 
        class="finishes-features"
        :style="{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--spacing-md)',
          marginTop: 'var(--spacing-xl)',
          paddingTop: 'var(--spacing-lg)',
          borderTop: '1px solid var(--color-divider)'
        }"
      >
        <div class="feature-item">
          <div 
            class="feature-icon"
            :style="{
              fontSize: '20px',
              color: 'var(--color-archie-gold)',
              marginBottom: 'var(--spacing-xs)'
            }"
          >
            ⚡
          </div>
          <div 
            class="feature-title"
            :style="{
              fontSize: '10px',
              fontWeight: '700',
              color: 'var(--color-text-dark)',
              marginBottom: '2px'
            }"
          >
            耐磨测试
          </div>
          <div 
            class="feature-desc"
            :style="{
              fontSize: '8px',
              color: 'var(--color-text-gray)',
              lineHeight: '1.4'
            }"
          >
            通过10万次摩擦测试，色彩持久如新
          </div>
        </div>
        
        <div class="feature-item">
          <div 
            class="feature-icon"
            :style="{
              fontSize: '20px',
              color: 'var(--color-archie-gold)',
              marginBottom: 'var(--spacing-xs)'
            }"
          >
            🛡️
          </div>
          <div 
            class="feature-title"
            :style="{
              fontSize: '10px',
              fontWeight: '700',
              color: 'var(--color-text-dark)',
              marginBottom: '2px'
            }"
          >
            耐腐蚀性
          </div>
          <div 
            class="feature-desc"
            :style="{
              fontSize: '8px',
              color: 'var(--color-text-gray)',
              lineHeight: '1.4'
            }"
          >
            盐雾测试超过500小时，抗腐蚀性能卓越
          </div>
        </div>
        
        <div class="feature-item">
          <div 
            class="feature-icon"
            :style="{
              fontSize: '20px',
              color: 'var(--color-archie-gold)',
              marginBottom: 'var(--spacing-xs)'
            }"
          >
            🎨
          </div>
          <div 
            class="feature-title"
            :style="{
              fontSize: '10px',
              fontWeight: '700',
              color: 'var(--color-text-dark)',
              marginBottom: '2px'
            }"
          >
            色彩一致性
          </div>
          <div 
            class="feature-desc"
            :style="{
              fontSize: '8px',
              color: 'var(--color-text-gray)',
              lineHeight: '1.4'
            }"
          >
            批次色差控制在ΔE≤1.5，确保色彩统一
          </div>
        </div>
      </div>
      
      <!-- 底部说明 -->
      <div 
        class="finishes-footer"
        :style="{
          fontSize: '9px',
          color: 'var(--color-text-gray)',
          textAlign: 'center',
          marginTop: 'var(--spacing-lg)',
          padding: 'var(--spacing-md)',
          backgroundColor: 'var(--color-luxury-cream)',
          borderRadius: '6px',
          lineHeight: '1.6'
        }"
      >
        <p>所有表面处理均符合欧盟RoHS环保标准，不含重金属有害物质。</p>
        <p style="marginTop: 'var(--spacing-xs)', fontWeight: '500'">定制服务：支持客户专属颜色和纹理定制。</p>
      </div>
    </div>

    <!-- 页脚插槽内容 -->
    <template #footer>
      <PageFooter
        :pageNumber="pageNumber"
        :totalPages="totalPages"
        align="center"
        :showBorder="false"
      />
    </template>
  </A4Page>
</template>

<style scoped>
.content-section {
  padding: 0 var(--size-page-padding);
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-archie-purple);
  margin-bottom: var(--spacing-xs);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.section-subtitle {
  font-size: 14px;
  color: var(--color-archie-gold);
  margin-bottom: var(--spacing-lg);
  letter-spacing: 1px;
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .finishes-grid {
    grid-template-columns: repeat(3, 1fr) !important;
    gap: var(--spacing-md) !important;
  }
  
  .finishes-features {
    grid-template-columns: repeat(1, 1fr) !important;
  }
}

/* 打印优化 */
@media print {
  .finish-swatch {
    box-shadow: inset 0 1px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05) !important;
  }
  
  .finishes-footer {
    border: 1px solid var(--color-divider) !important;
  }
}
</style>
