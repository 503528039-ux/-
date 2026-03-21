<script setup>
defineOptions({ inheritAttrs: false })
import { computed, ref, watch, onMounted, nextTick, onUnmounted } from 'vue'
import { useCatalogStore } from '../../stores/index'

const props = defineProps({
  value: { type: String, default: '' },
  tag: { type: String, default: 'span' },
  className: { type: [String, Array, Object], default: '' },
  rootEditable: { type: Boolean, default: false }
})

const emit = defineEmits(['update:value'])

const store = useCatalogStore()
const isPrint = computed(() => store.printMode)

const editableRef = ref(null)
const isFocused = ref(false)

function setText(text) {
  if (!editableRef.value) return
  const normalized = text == null ? '' : String(text)
  if (editableRef.value.innerText !== normalized) {
    editableRef.value.innerText = normalized
  }
}

onMounted(() => {
  setText(props.value)
})

watch(
  () => props.value,
  (val) => {
    // 外部（例如删除格子）把 value 清空时，即使仍在输入 focus，
    // 也需要同步清掉显示内容；否则会出现“数据已删除但 UI 仍显示旧文字”的错觉。
    if (isFocused.value) {
      const normalized = val == null ? '' : String(val)
      if (normalized !== '') return
    }
    setText(val)
  }
)

watch(
  () => store.printMode,
  async (val) => {
    if (!val) {
      await nextTick()
      setText(props.value)
    }
  }
)

function commit() {
  if (!editableRef.value) return
  emit('update:value', editableRef.value.innerText)
}

function onFocus() {
  isFocused.value = true
}

function onBlur() {
  isFocused.value = false
  commit()
  // 父级常用「空则 || 默认文案」：清空后 props.value 可能仍为「默认名称」，watch 不触发；
  // 必须用父级传入值强制同步 innerText，否则会出现删空后界面不恢复默认。
  nextTick(() => {
    setText(props.value)
  })
}

function onKeydown(e) {
  // ESC：强制退出编辑（用于“无法退出”的兜底）
  if (e?.key === 'Escape') {
    try { e.preventDefault?.() } catch {}
    try { editableRef.value?.blur?.() } catch {}
  }
}

// 点击可编辑块外：强制 blur（解决 blur 后又被重新 focus 的体验问题）
function __docPointerDownCapture(e) {
  try {
    if (!isFocused.value) return
    const el = editableRef.value
    const t = e?.target
    const outside = el && t && typeof el.contains === 'function' ? !el.contains(t) : false
    if (outside) {
      try { el?.blur?.() } catch {}
    }
  } catch {
    // ignore
  }
}

onMounted(() => {
  try {
    document.addEventListener('pointerdown', __docPointerDownCapture, true)
  } catch {
    // ignore
  }
})

onUnmounted(() => {
  try {
    document.removeEventListener('pointerdown', __docPointerDownCapture, true)
  } catch {
    // ignore
  }
})
</script>

<template>
  <template v-if="rootEditable">
    <component
      :is="tag"
      ref="editableRef"
      :class="className"
      v-bind="$attrs"
      :contenteditable="!isPrint"
      spellcheck="false"
      class="editable-core-root"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="onKeydown"
      @mousedown.stop
      @click.stop
    >{{ value }}</component>
  </template>
  <template v-else>
    <component :is="tag" :class="className" v-bind="$attrs">
      <template v-if="isPrint">
        {{ value }}
      </template>
      <template v-else>
        <span
          ref="editableRef"
          class="editable-core"
          contenteditable="true"
          spellcheck="false"
          @focus="onFocus"
          @blur="onBlur"
          @keydown="onKeydown"
          @mousedown.stop
          @click.stop
        >{{ value }}</span>
      </template>
    </component>
  </template>
</template>

<style scoped>
.editable-core {
  display: inline-block;
  min-width: 6px;
  outline: none;
}

.editable-core-root {
  outline: none;
}

.editable-core-root:focus {
  outline: 2px solid rgba(94, 69, 133, 0.35);
  border-radius: 3px;
}

.editable-core:focus {
  outline: 2px solid rgba(94, 69, 133, 0.35);
  border-radius: 3px;
}
</style>
