<template>
  <!-- 游戏结束弹窗 -->
  <div
    v-if="show"
    class="fixed top-0 left-0 right-0 text-white py-4 px-6 text-center font-bold text-lg z-50 shadow-lg"
    :class="getDialogClass()"
  >
    <div class="flex items-center justify-center gap-2">
      <span>{{ getDisplayText() }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'

// Props
const props = defineProps<{
  show: boolean
  gameStatus: 'playing' | 'checkmate' | 'stalemate' | 'draw'
  currentPlayer: 'red' | 'black'
  isInCheck: boolean
}>()

// Emits
const emit = defineEmits<{
  close: []
}>()

// 监听show变化，3秒后自动关闭
watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      setTimeout(() => {
        emit('close')
      }, 3000)
    }
  },
)

// 获取弹窗样式类
const getDialogClass = () => {
  if (props.gameStatus === 'draw' || props.gameStatus === 'stalemate') {
    return 'bg-gradient-to-r from-gray-500 to-gray-600'
  } else if (props.gameStatus === 'checkmate') {
    return 'bg-gradient-to-r from-green-500 to-green-600'
  }
  return 'bg-gradient-to-r from-blue-500 to-blue-600'
}

// 获取显示文本
const getDisplayText = () => {
  switch (props.gameStatus) {
    case 'checkmate':
      const winner = props.currentPlayer === 'red' ? '黑方' : '红方'
      return `🎉 ${winner}获胜！`
    case 'stalemate':
      return '🤝 和棋 - 无棋可走！'
    case 'draw':
      return '🤝 和棋！'
    default:
      return ''
  }
}
</script>

<style scoped>
/* 弹窗样式已在模板中内联定义 */
</style>
