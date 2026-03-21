<script setup>
import A4Page from '../layout/A4Page.vue'
import { computed } from 'vue'
import { useCatalogStore } from '../../stores/index'
import EditableText from '../ui/EditableText.vue'
import ImageUploader from '../ui/ImageUploader.vue'

const props = defineProps({
  pageIndex: { type: Number, required: true }
})

const store = useCatalogStore()

const pageData = computed(() => store.pages[props.pageIndex] || {})

function ensurePageProps() {
  const page = store.pages[props.pageIndex]
  if (!page) return null
  if (!page.props || typeof page.props !== 'object') page.props = {}
  return page
}

function updateProp(key, val) {
  const page = ensurePageProps()
  if (!page) return
  store.recordSnapshot?.()
  page.props[key] = val
}

const backProps = computed(() => {
  const p = pageData.value.props || {}
  return {
    brandEn: p.brandEn ?? 'ARCHIE',
    brandCn: p.brandCn ?? '雅洁五金',
    companyCn: p.companyCn ?? '广东雅洁五金有限公司',
    companyEn: p.companyEn ?? 'GUANGDONG ARCHIE HARDWARE CO., LTD.',
    phone: p.phone ?? '400-888-xxxx',
    website: p.website ?? 'www.archie.com.cn',
    address: p.address ?? '广东省佛山市南海区大沥镇雅洁工业园',
    qrCodeUrl: p.qrCodeUrl ?? ''
  }
})
</script>

<template>
  <A4Page :page-index="props.pageIndex" :showHeader="false" :showFooter="false">
    <!-- 封底：全紫色背景，居中布局 -->
    <div class="back-cover-wrapper">
      <!-- 品牌标志区域 -->
      <EditableText tag="h2" class-name="brand-en" :value="backProps.brandEn" @update:value="(v) => updateProp('brandEn', v)" />
      <EditableText tag="p" class-name="brand-cn" :value="backProps.brandCn" @update:value="(v) => updateProp('brandCn', v)" />

      <!-- 二维码区域 -->
      <div class="qr-code">
        <img v-if="backProps.qrCodeUrl" :src="backProps.qrCodeUrl" alt="二维码" />
        <div v-else class="qr-placeholder"></div>
        <ImageUploader
          v-if="!store.printMode"
          :has-image="!!backProps.qrCodeUrl"
          @update:src="(src) => updateProp('qrCodeUrl', src || '')"
        />
      </div>

      <!-- 联系信息 -->
      <div class="contact-info">
        <EditableText tag="strong" :value="backProps.companyCn" @update:value="(v) => updateProp('companyCn', v)" /><br />
        <EditableText tag="span" :value="backProps.companyEn" @update:value="(v) => updateProp('companyEn', v)" /><br /><br />
        全国服务热线：<EditableText tag="span" :value="backProps.phone" @update:value="(v) => updateProp('phone', v)" /><br />
        官方网站：<EditableText tag="span" :value="backProps.website" @update:value="(v) => updateProp('website', v)" /><br />
        总部地址：<EditableText tag="span" :value="backProps.address" @update:value="(v) => updateProp('address', v)" />
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
  position: relative;
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
