<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-white rounded-xl p-0 shadow-2xl hide-scrollbar"
      :style="{
        width: width || 'auto',
        height: height || 'auto',
        maxWidth: maxWidth || '90vw',
        maxHeight: maxHeight || '90vh',
        minWidth: width ? 'auto' : '600px',
      }"
    >
      <!-- 头部 -->
      <div
        class="flex items-center justify-between px-6 py-4 border-b-2 border-gray-200 sticky top-0 bg-white z-10 rounded-t-xl"
      >
        <h3 class="text-xl font-bold text-gray-800 flex items-center">{{ title }}</h3>
        <button
          @click="handleClose"
          class="ml-2 w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors text-2xl font-bold focus:outline-none"
          aria-label="关闭"
        >
          ×
        </button>
      </div>

      <!-- 内容区域 -->
      <div
        class="p-6 pt-4 overflow-y-auto hide-scrollbar"
        :style="{ maxHeight: contentMaxHeight || 'calc(90vh - 120px)' }"
      >
        <slot />

        <!-- 按钮组 -->
        <div v-if="showButtons" class="flex gap-3 mt-6">
          <button
            v-if="resetCallback"
            @click="handleReset"
            class="flex-1 py-2 px-4 border border-gray-300 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {{ resetText }}
          </button>
          <button
            @click="handleCancel"
            class="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {{ cancelText }}
          </button>

          <button
            v-if="applyCallback"
            @click="handleApply"
            class="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {{ applyText }}
          </button>
        </div>
      </div>
    </div>

    <!-- 确认保存弹窗 -->
    <ConfirmDialog
      :show="showConfirm"
      title="保存设置"
      message="设置已修改，是否保存更改？"
      confirm-text="保存"
      cancel-text="不保存"
      @confirm="handleConfirmSave"
      @cancel="handleCancelSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ConfirmDialog from './ConfirmDialog.vue'

interface Props {
  /** 是否显示弹窗 - 支持 v-model */
  modelValue: boolean
  /** 弹窗标题 */
  title: string
  /** 宽度，支持 CSS 值如 '500px', '50%' 等 */
  width?: string
  /** 高度，支持 CSS 值如 '600px', '70vh' 等 */
  height?: string
  /** 最大宽度，默认 '90vw' */
  maxWidth?: string
  /** 最大高度，默认 '90vh' */
  maxHeight?: string
  /** 内容区域最大高度，默认 'calc(90vh - 120px)' */
  contentMaxHeight?: string
  /** 应用按钮文本，默认 '应用' */
  applyText?: string
  /** 取消按钮文本，默认 '取消' */
  cancelText?: string
  /** 恢复默认按钮文本，默认 '恢复默认' */
  resetText?: string
  /** 应用按钮回调函数，传入则显示应用按钮 */
  applyCallback?: () => void
  /** 取消按钮回调函数，传入则显示取消按钮 */
  cancelCallback?: () => void
  /** 恢复默认按钮回调函数，传入则显示恢复默认按钮 */
  resetCallback?: () => void
  /** 旧数据，用于比较是否有更改 */
  oldData?: any
  /** 新数据，用于比较是否有更改 */
  newData?: any
}

const props = withDefaults(defineProps<Props>(), {
  applyText: '应用',
  cancelText: '取消',
  resetText: '恢复默认',
  maxWidth: '90vw',
  maxHeight: '90vh',
  contentMaxHeight: 'calc(90vh - 120px)',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  apply: []
  cancel: []
  reset: []
}>()

// 确认弹窗状态
const showConfirm = ref(false)

// 关闭弹窗的方法
const closeDialog = () => {
  emit('update:modelValue', false)
  emit('close')
}

// 是否显示按钮组 - 总是显示取消按钮，其他按钮根据回调函数决定
const showButtons = computed(() => {
  return true // 总是显示按钮组，因为至少有取消按钮
})

// 检查数据是否有变更
const hasChanges = computed(() => {
  if (props.oldData && props.newData) {
    return JSON.stringify(props.oldData) !== JSON.stringify(props.newData)
  }
  return false
})

// 外部主动触发确认窗口的方法
const tryClose = () => {
  // 如果传入了新旧数据对比，且数据有变更，弹出确认框
  if (hasChanges.value) {
    showConfirm.value = true
    return true // 返回 true 表示显示了确认窗口
  } else {
    closeDialog()
    return false // 返回 false 表示直接关闭了，没有显示确认窗口
  }
}

// 暴露方法给外部组件使用
defineExpose({
  tryClose,
})

// 处理关闭
const handleClose = () => {
  tryClose()
}

// 处理应用
const handleApply = () => {
  if (props.applyCallback) {
    props.applyCallback()
  }
  emit('apply')
  closeDialog()
}

// 处理取消
const handleCancel = () => {
  if (props.cancelCallback) {
    props.cancelCallback()
  }
  emit('cancel')
  closeDialog()
}

// 处理恢复默认
const handleReset = () => {
  if (props.resetCallback) {
    props.resetCallback()
  }
  emit('reset')
}

// 确认保存
const handleConfirmSave = () => {
  showConfirm.value = false
  handleApply()
  closeDialog()
}

// 取消保存
const handleCancelSave = () => {
  showConfirm.value = false
  // 调用父组件的取消回调
  if (props.cancelCallback) {
    props.cancelCallback()
  }
  emit('cancel')
  closeDialog()
}
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
