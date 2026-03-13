<script setup>
import A4Page from '../layout/A4Page.vue'

const props = defineProps({
  // 品牌英文名
  brandEn: { type: String, default: 'ARCHIE' },
  // 品牌中文名
  brandCn: { type: String, default: '雅洁五金' },
  // 二维码URL
  qrCodeUrl: { type: String, default: '' },
  // 联系电话
  phone: { type: String, default: '400-888-xxxx' },
  // 官方网站
  website: { type: String, default: 'www.archie.com.cn' },
  // 公司地址
  address: { type: String, default: '广东省佛山市南海区大沥镇雅洁工业园' }
})
</script>

<template>
  <A4Page :showHeader="false" :showFooter="false">
    <!-- 封底：全紫色背景，居中布局 -->
    <div class="back-cover-wrapper">
      <!-- 品牌标志区域 -->
      <h2 class="brand-en">{{ props.brandEn }}</h2>
      <p class="brand-cn">{{ props.brandCn }}</p>

      <!-- 二维码区域 -->
      <div class="qr-code">
        <img v-if="props.qrCodeUrl" :src="props.qrCodeUrl" alt="二维码" />
        <div v-else class="qr-placeholder"></div>
      </div>

      <!-- 联系信息 -->
      <div class="contact-info">
        <strong>广东雅洁五金有限公司</strong><br />
        GUANGDONG ARCHIE HARDWARE CO., LTD.<br /><br />
        全国服务热线：{{ props.phone }}<br />
        官方网站：{{ props.website }}<br />
        总部地址：{{ props.address }}
      </div>
    </div>
  </A4Page>
</template>

<style scoped>
/* 封底：全紫色背景，撑满 page-content */
.back-cover-wrapper {
  flex: 1;
  margin: 0 -15mm;
  padding-left: 30mm;
  padding-right: 30mm;
  background-color: #5E4585; /* --color-archie-purple */
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.brand-en {
  font-size: 24px;
  color: #fff;
  letter-spacing: 12px;
  margin-bottom: 8px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  text-align: center;
}

.brand-cn {
  color: #9A805E; /* --color-archie-gold */
  letter-spacing: 8px;
  font-size: 14px;
  margin-bottom: 20mm;
  text-align: center;
}

.qr-code {
  width: 35mm;
  height: 35mm;
  margin-bottom: 15mm;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-code img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr-placeholder {
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px dashed rgba(255, 255, 255, 0.3);
}

.contact-info {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  line-height: 2;
}

.contact-info strong {
  font-size: 14px;
  color: #fff;
  font-weight: 700;
}

/* 打印优化 */
@media print {
  .back-cover-wrapper {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
