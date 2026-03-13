<script setup>
defineOptions({ inheritAttrs: false })
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useCatalogStore } from '../../stores/index'

const props = defineProps({
  value: { type: String, default: '' },
  tag: { type: String, default: 'span' },
  className: { type: [String, Array, Object], default: '' }
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
    if (isFocused.value) return
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
}
</script>

<template>
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
        @mousedown.stop
        @click.stop
      >{{ value }}</span>
    </template>
  </component>
</template>

<style scoped>
.editable-core {
  display: inline-block;
  min-width: 6px;
  outline: none;
}

.editable-core:focus {
  outline: 2px solid rgba(94, 69, 133, 0.35);
  border-radius: 3px;
}
</style>
