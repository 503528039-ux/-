<template>
  <Transition name="modal-fade">
    <div 
      v-if="visible" 
      class="confirm-modal-overlay"
      @click.self="handleOverlayClick"
      @keydown.esc="handleCancel"
    >
      <div class="confirm-modal-container">
        <!-- 标题 -->
        <div class="confirm-modal-header">
          <h3 class="confirm-modal-title">{{ title }}</h3>
          <button 
            v-if="showCloseButton"
            class="confirm-modal-close"
            @click="handleCancel"
            aria-label="关闭"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 内容 -->
        <div class="confirm-modal-body">
          <p class="confirm-modal-message">{{ message }}</p>
        </div>

        <!-- 按钮组 -->
        <div class="confirm-modal-footer">
          <button
            ref="cancelButton"
            class="confirm-modal-btn confirm-modal-btn-cancel"
            @click="handleCancel"
            :disabled="isConfirming"
          >
            {{ cancelText }}
          </button>
          <button
            ref="confirmButton"
            class="confirm-modal-btn confirm-modal-btn-confirm"
            @click="handleConfirm"
            :disabled="isConfirming"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  // 弹窗可见性
  visible: {
    type: Boolean,
    required: true
  },
  // 标题
  title: {
    type: String,
    default: '确认操作'
  },
  // 正文内容
  message: {
    type: String,
    default: '确定要执行此操作吗？'
  },
  // 确认按钮文本
  confirmText: {
    type: String,
    default: '确认'
  },
  // 取消按钮文本
  cancelText: {
    type: String,
    default: '取消'
  },
  // 是否显示关闭按钮
  showCloseButton: {
    type: Boolean,
    default: true
  },
  // 点击遮罩层是否可关闭
  closeOnOverlayClick: {
    type: Boolean,
    default: true
  },
  // 确认按钮延迟保护时间（毫秒）
  confirmDelay: {
    type: Number,
    default: 300
  }
})

const emit = defineEmits(['confirm', 'cancel', 'update:visible'])

const isConfirming = ref(false)
const cancelButton = ref(null)
const confirmButton = ref(null)

// 处理确认
const handleConfirm = async () => {
  if (isConfirming.value) return
  
  isConfirming.value = true
  
  // 延迟保护
  await new Promise(resolve => setTimeout(resolve, props.confirmDelay))
  
  emit('confirm')
  emit('update:visible', false)
  
  // 重置状态
  setTimeout(() => {
    isConfirming.value = false
  }, 100)
}

// 处理取消
const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

// 处理遮罩层点击
const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    handleCancel()
  }
}

// 键盘事件处理
const handleKeydown = (event) => {
  if (!props.visible) return
  
  switch (event.key) {
    case 'Escape':
      handleCancel()
      break
    case 'Enter':
      if (document.activeElement === confirmButton.value) {
        handleConfirm()
      }
      break
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 当弹窗显示时，自动聚焦到取消按钮（更安全）
const focusCancelButton = async () => {
  await nextTick()
  if (props.visible && cancelButton.value) {
    cancelButton.value.focus()
  }
}

// 监听 visible 变化
defineExpose({ focusCancelButton })
</script>

<style scoped>
.confirm-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.confirm-modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 420px;
  overflow: hidden;
  animation: modal-scale 0.2s ease-out;
}

.confirm-modal-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.confirm-modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.4;
}

.confirm-modal-close {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #999;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-modal-close:hover {
  background-color: #f5f5f5;
  color: #666;
}

.confirm-modal-body {
  padding: 24px;
}

.confirm-modal-message {
  font-size: 15px;
  line-height: 1.6;
  color: #555;
  margin: 0;
}

.confirm-modal-footer {
  padding: 16px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid #f0f0f0;
}

.confirm-modal-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  min-width: 80px;
  text-align: center;
}

.confirm-modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.confirm-modal-btn-cancel {
  background-color: #f8f9fa;
  color: #495057;
  border-color: #e9ecef;
}

.confirm-modal-btn-cancel:hover:not(:disabled) {
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.confirm-modal-btn-confirm {
  background-color: #ff6b6b; /* 低饱和度警示色 */
  color: white;
  border-color: #ff6b6b;
}

.confirm-modal-btn-confirm:hover:not(:disabled) {
  background-color: #ff5252;
  border-color: #ff5252;
}

/* 动画效果 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes modal-scale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 响应式调整 */
@media (max-width: 480px) {
  .confirm-modal-container {
    width: 95%;
    margin: 0 10px;
  }
  
  .confirm-modal-footer {
    flex-direction: column;
  }
  
  .confirm-modal-btn {
    width: 100%;
  }
}
</style>