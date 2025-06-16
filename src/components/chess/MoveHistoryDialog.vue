<template>
  <!-- 走法历史弹窗 -->
  <div
    v-if="show"
    ref="elementRef"
    class="fixed top-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-80 max-h-[85vh] move-history-dialog"
    :class="{ 'cursor-move': isDragging }"
  >
    <!-- 头部 -->
    <div
      class="flex justify-between items-center p-4 border-b border-gray-200 cursor-move"
      @mousedown="startDrag"
    >
      <h3 class="text-lg font-bold text-gray-800 flex items-center select-none">
        📖 走法记录
        <span v-if="moveHistory.length > 0" class="ml-2 text-sm text-gray-500">
          ({{ moveHistory.length }}步)
        </span>
      </h3>
      <button
        @click="$emit('close')"
        class="text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold"
      >
        ✕
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="p-4 flex-1 overflow-hidden">
      <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 h-full flex flex-col">
        <div
          class="bg-black rounded p-2 h-48 overflow-y-auto font-mono text-xs scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
        >
          <div
            v-for="(move, index) in moveHistory"
            :key="index"
            class="mb-1 leading-relaxed hover:bg-gray-800 px-1 rounded transition-colors"
          >
            <span class="text-gray-500 text-[10px]">[{{ formatMoveTimestamp(move) }}]</span>
            <span class="text-gray-400 ml-1">[{{ String(index + 1).padStart(2, '0') }}]</span>
            <span :class="move.piece.camp === 'red' ? 'text-red-400' : 'text-blue-400'">
              {{ move.piece.camp === 'red' ? '🔴' : '⚫' }}
            </span>
            <span
              class="ml-1"
              :class="move.piece.camp === 'red' ? 'text-red-300' : 'text-blue-300'"
            >
              {{ formatMove(move) }}
            </span>
          </div>
          <div v-if="moveHistory.length === 0" class="text-green-400 text-center py-8">
            🤔 暂无走法记录
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="mt-3 flex-shrink-0">
        <div class="text-sm text-gray-600">
          <div class="flex justify-between items-center">
            <span>⏱️ 游戏时长: {{ formatGameDuration }}</span>
            <span>🎯 总步数: {{ moveHistory.length }}</span>
          </div>
          <div v-if="moveHistory.length > 0" class="mt-1 text-xs text-gray-500">
            最后一步: {{ formatLastMoveTime }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import type { Move } from './ChessGame'
import { useDraggable } from '../../composables/useDraggable'

// Props
interface Props {
  show: boolean
  moveHistory: Move[]
  gameStartTime: Date
}

const props = defineProps<Props>()

// Emits
defineEmits<{
  close: []
}>()

// 拖动功能
const { elementRef, isDragging, startDrag } = useDraggable()

// 当前时间，用于实时更新显示
const currentTime = ref(new Date())

// 启动定时器实时更新时间
let timeUpdateInterval: number | null = null

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      // 打开窗口时启动定时器
      currentTime.value = new Date()
      timeUpdateInterval = setInterval(() => {
        currentTime.value = new Date()
      }, 1000) // 每秒更新一次
    } else {
      // 关闭窗口时清除定时器
      if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval)
        timeUpdateInterval = null
      }
    }
  },
  { immediate: true },
)

// 组件销毁时清理定时器
onUnmounted(() => {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
    timeUpdateInterval = null
  }
})

// 格式化走法文本 - 使用ICCS坐标格式
const formatMove = (move: Move) => {
  if (!move) return ''

  // 转换坐标为ICCS格式
  const fromPos = convertToICCS(move.from)
  const toPos = convertToICCS(move.to)

  // 生成ICCS格式记谱
  let notation = `${fromPos}-${toPos}`

  // 添加棋子类型和中文记谱法说明
  const pieceSymbols: Record<string, { red: string; black: string }> = {
    帥: { red: '帅', black: '将' },
    將: { red: '帅', black: '将' },
    仕: { red: '仕', black: '士' },
    士: { red: '仕', black: '士' },
    相: { red: '相', black: '象' },
    象: { red: '相', black: '象' },
    馬: { red: '马', black: '马' },
    車: { red: '车', black: '车' },
    炮: { red: '炮', black: '炮' },
    砲: { red: '炮', black: '炮' },
    兵: { red: '兵', black: '卒' },
    卒: { red: '兵', black: '卒' },
  }

  const pieceSymbol = pieceSymbols[move.piece.type]?.[move.piece.camp] || move.piece.type

  // 计算中文记谱法
  const chineseNotation = generateChineseNotation(move)

  notation += ` (${pieceSymbol}${chineseNotation})`

  // 如果有吃子，显示吃子信息
  if (move.capturedPiece) {
    const capturedSymbol =
      pieceSymbols[move.capturedPiece.type]?.[move.capturedPiece.camp] || move.capturedPiece.type
    notation += ` 吃${capturedSymbol}`
  }

  return notation
}

// 将坐标转换为ICCS格式
const convertToICCS = (pos: { x: number; y: number }) => {
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
  const column = columns[pos.x]
  const row = 9 - pos.y // ICCS中，0在下方，9在上方
  return `${column}${row}`
}

// 生成中文记谱法
const generateChineseNotation = (move: Move) => {
  // 汉字数字映射
  const chineseNumbers = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

  // 判断移动方向
  let direction = ''
  if (move.from.y === move.to.y) {
    direction = '平'
  } else if (move.piece.camp === 'red') {
    direction = move.from.y > move.to.y ? '进' : '退'
  } else {
    direction = move.from.y < move.to.y ? '进' : '退'
  }

  // 计算起始和目标位置
  let fromFile: string
  let toFile: string

  if (move.piece.camp === 'red') {
    // 红方：从右到左为一到九
    fromFile = chineseNumbers[9 - move.from.x]
    toFile = chineseNumbers[9 - move.to.x]
  } else {
    // 黑方：从左到右为一到九
    fromFile = chineseNumbers[move.from.x + 1]
    toFile = chineseNumbers[move.to.x + 1]
  }

  return `${fromFile}${direction}${toFile}`
}

// 格式化游戏时长 - 使用计算属性实现实时更新
const formatGameDuration = computed(() => {
  if (props.moveHistory.length === 0) return '0分0秒'

  const firstMove = props.moveHistory[0]
  const lastMove = props.moveHistory[props.moveHistory.length - 1]

  if (!firstMove?.timestamp || !lastMove?.timestamp) return '未知'

  // 使用当前时间与第一步的时间差来计算游戏总时长
  const duration = currentTime.value.getTime() - firstMove.timestamp.getTime()
  const minutes = Math.floor(duration / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)

  return `${minutes}分${seconds}秒`
})

// 格式化最后一步时间 - 使用计算属性实现实时更新
const formatLastMoveTime = computed(() => {
  if (props.moveHistory.length === 0) return ''

  const lastMove = props.moveHistory[props.moveHistory.length - 1]
  if (!lastMove?.timestamp) return ''

  const diff = currentTime.value.getTime() - lastMove.timestamp.getTime()
  const seconds = Math.floor(diff / 1000)

  if (seconds < 60) return `${seconds}秒前`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  return `${hours}小时前`
})

// 格式化走法时间戳
const formatMoveTimestamp = (move: Move) => {
  if (!move.timestamp) return ''

  const time = move.timestamp
  const hours = time.getHours().toString().padStart(2, '0')
  const minutes = time.getMinutes().toString().padStart(2, '0')
  const seconds = time.getSeconds().toString().padStart(2, '0')

  return `${hours}:${minutes}:${seconds}`
}
</script>

<style scoped>
/* 滚动条样式 */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-track-gray-800::-webkit-scrollbar-track {
  background: #2d3748;
  border-radius: 3px;
}

.scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 3px;
}

.scrollbar-thumb-gray-600::-webkit-scrollbar-thumb:hover {
  background: #718096;
}

/* 渐变背景 */
.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, #f9fafb, #f3f4f6);
}

/* 字体样式 */
.font-mono {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

/* 弹窗动画 */
.move-history-dialog {
  animation: slideInRight 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

.move-history-dialog.cursor-move {
  cursor: move;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
