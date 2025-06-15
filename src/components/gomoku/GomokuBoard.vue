<template>
  <div
    ref="gameBoard"
    class="relative bg-yellow-100 border-4 border-yellow-800 rounded-lg gomoku-board-container"
    :class="{
      'shadow-2xl': !isPortrait,
    }"
    style="aspect-ratio: 1/1; background-color: #d2b48c"
    :style="boardContainerStyle"
  >
    <!-- SVG网格、定位点和坐标 -->
    <svg class="absolute inset-0 w-full h-full pointer-events-none">
      <!-- 网格线 -->
      <g v-for="i in boardSize" :key="`v-${i}`">
        <line
          :x1="`${padding_percent + (grid_area_percent / (boardSize - 1)) * (i - 1)}%`"
          :y1="`${padding_percent}%`"
          :x2="`${padding_percent + (grid_area_percent / (boardSize - 1)) * (i - 1)}%`"
          :y2="`${100 - padding_percent}%`"
          stroke="#8B4513"
          stroke-width="1.5"
        />
      </g>
      <g v-for="i in boardSize" :key="`h-${i}`">
        <line
          :x1="`${padding_percent}%`"
          :y1="`${padding_percent + (grid_area_percent / (boardSize - 1)) * (i - 1)}%`"
          :x2="`${100 - padding_percent}%`"
          :y2="`${padding_percent + (grid_area_percent / (boardSize - 1)) * (i - 1)}%`"
          stroke="#8B4513"
          stroke-width="1.5"
        />
      </g>

      <!-- 定位点 -->
      <circle
        v-for="point in starPoints"
        :key="`star-${point.row}-${point.col}`"
        :cx="`${padding_percent + (grid_area_percent / (boardSize - 1)) * point.col}%`"
        :cy="`${padding_percent + (grid_area_percent / (boardSize - 1)) * point.row}%`"
        :r="starPointSize"
        fill="#8B4513"
      />

      <!-- 横坐标 A-T（顶部和底部） -->
      <g v-if="gameSettings.showCoordinates" v-for="i in boardSize" :key="`coord-h-${i}`">
        <!-- 顶部坐标 -->
        <text
          :x="`${padding_percent + (grid_area_percent / (boardSize - 1)) * (i - 1)}%`"
          :y="`${padding_percent * 0.5}%`"
          :font-size="coordinateFontSize"
          text-anchor="middle"
          dominant-baseline="middle"
          fill="#8B4513"
          font-weight="bold"
        >
          {{ String.fromCharCode(64 + i) }}
        </text>
        <!-- 底部坐标 -->
        <text
          :x="`${padding_percent + (grid_area_percent / (boardSize - 1)) * (i - 1)}%`"
          :y="`${100 - padding_percent * 0.5}%`"
          :font-size="coordinateFontSize"
          text-anchor="middle"
          dominant-baseline="middle"
          fill="#8B4513"
          font-weight="bold"
        >
          {{ String.fromCharCode(64 + i) }}
        </text>
      </g>

      <!-- 纵坐标 1-19（左侧和右侧） -->
      <g v-if="gameSettings.showCoordinates" v-for="i in boardSize" :key="`coord-v-${i}`">
        <!-- 左侧坐标 -->
        <text
          :x="`${padding_percent * 0.5}%`"
          :y="`${padding_percent + (grid_area_percent / (boardSize - 1)) * (i - 1)}%`"
          :font-size="coordinateFontSize"
          text-anchor="middle"
          dominant-baseline="middle"
          fill="#8B4513"
          font-weight="bold"
        >
          {{ boardSize + 1 - i }}
        </text>
        <!-- 右侧坐标 -->
        <text
          :x="`${100 - padding_percent * 0.5}%`"
          :y="`${padding_percent + (grid_area_percent / (boardSize - 1)) * (i - 1)}%`"
          :font-size="coordinateFontSize"
          text-anchor="middle"
          dominant-baseline="middle"
          fill="#8B4513"
          font-weight="bold"
        >
          {{ boardSize + 1 - i }}
        </text>
      </g>
    </svg>

    <!-- 交点和棋子 -->
    <div class="absolute inset-0">
      <template v-for="(row, rowIndex) in board" :key="`row-${rowIndex}`">
        <div
          v-for="(cell, colIndex) in row"
          :key="`cell-${rowIndex}-${colIndex}`"
          class="absolute cursor-pointer flex items-center justify-center transition-all duration-200"
          :class="[
            getHoverClass(rowIndex, colIndex),
            {
              'z-100': isLastMove(rowIndex, colIndex) || isWinningPiece(rowIndex, colIndex),
              'z-10': !isLastMove(rowIndex, colIndex),
            },
          ]"
          @click="handleMove(rowIndex, colIndex)"
          :style="getIntersectionPosition(rowIndex, colIndex)"
        >
          <!-- 棋子 -->
          <div
            v-if="cell !== 0"
            class="relative flex items-center justify-center"
            style="width: 100%; height: 100%"
          >
            <!-- 棋子本体 -->
            <div
              class="rounded-full border-2 border-gray-800 shadow-lg relative w-full h-full"
              :class="getPieceClass(rowIndex, colIndex)"
              :style="pieceStyle"
            >
              <!-- 棋子顺序号 -->
              <div
                v-if="gameSettings.showMoveOrder"
                class="absolute inset-0 flex items-center justify-center"
              >
                <span
                  :style="getMoveOrderFontStyle()"
                  :class="cell === 1 ? 'text-white font-bold' : 'text-black font-bold'"
                >
                  {{ getMoveOrder(rowIndex, colIndex) }}
                </span>
              </div>
            </div>
          </div>

          <!-- AI思考的最佳位置标记 -->
          <div
            v-if="
              cell === 0 &&
              aiBestPosition &&
              aiBestPosition.row === rowIndex &&
              aiBestPosition.col === colIndex
            "
            class="absolute inset-0 flex items-center justify-center z-20"
          >
            <div
              :style="aiBestMarkStyle"
              class="bg-red-500 rounded-full shadow-lg border-2 border-white ai-best-mark"
              :title="`AI建议: (${rowIndex}, ${colIndex})`"
            ></div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// @ts-ignore
import { useStore } from 'vuex'

// 类型定义
interface Position {
  row: number
  col: number
}

// Props
const props = defineProps<{
  windowWidth: number
  windowHeight: number
  aiBestPosition?: { row: number; col: number } | null
}>()

// Store
const store = useStore()
const boardSize = computed(() => store.state.gomoku.gameSettings.boardSize)
const gameSettings = computed(() => store.state.gomoku.gameSettings)
const board = computed(() => store.state.gomoku.gameState.board)
const lastMove = computed(() => store.state.gomoku.gameState.lastMove)
const moveHistory = computed(() => store.state.gomoku.gameState.moveHistory)
const winningPositions = computed(() => store.state.gomoku.gameState.winningPositions)
const gameOver = computed(() => store.state.gomoku.gameState.gameOver)

// Emits
const emits = defineEmits<{
  move: [row: number, col: number]
}>()
// 计算属性
const isPortrait = computed(() => props.windowWidth < props.windowHeight)

// 布局常量
const padding_percent = 8
const grid_area_percent = 84

// 计算棋盘大小

const boardContainerStyle = computed(() => {
  if (isPortrait.value) {
    return {
      width: '98vw',
      height: '98vw', // 保证棋盘为正方形
    }
  } else {
    return {
      width: '90vh',
      height: '90vh', // 保证棋盘为正方形
    }
  }
})

// pieceStyle、starPointSize、coordinateFontSize、lastMoveMarkSize、aiBestMarkSize、getIntersectionPosition、getMoveOrderFontStyle 等相关依赖全部改为用相对单位
// 例如 pieceStyle:
const pieceStyle = computed(() => {
  let size = 5 // 默认值
  if (boardSize.value === 19) {
    size = 4
  } else if (boardSize.value === 15) {
    size = 5
  } else if (boardSize.value === 13) {
    size = 6
  }
  if (isPortrait.value) {
    size = size * 1.1 // 在竖屏下稍微增大棋子
    return {
      width: `${size}vw`,
      height: `calc(${size}vw)`, // 保证棋子为正圆
      aspectRatio: '1 / 1', // 保证棋子始终为正圆
    }
  } else {
    return {
      width: `calc(${size}vh)`,
      height: `${size}vh`, // 保证棋子为正圆
      aspectRatio: '1 / 1', // 保证棋子始终为正圆
    }
  }
})

const starPointSize = computed(() => {
  const px = 500 // 用默认值或用容器宽度的相对单位
  if (!px || isNaN(px) || px <= 0) return 2
  return Math.max(px / 150, 2)
})

const coordinateFontSize = computed(() => 'min(max(2.5vw, 8px), 22px)')

const aiBestMarkSize = computed(() => {
  if (isPortrait.value) {
    return '2.5vw'
  } else {
    return '2.5vh'
  }
})

const aiBestMarkStyle = computed(() => ({
  width: aiBestMarkSize.value,
  height: aiBestMarkSize.value,
  opacity: 0.85,
  boxShadow: '0 0 12px 4px #f87171',
  border: '2.5px solid #fff',
  background: 'radial-gradient(circle, #f87171 60%, #fff 100%)',
  pointerEvents: 'none' as const,
}))

// 定位点
const starPoints = computed<Position[]>(() => {
  const size = boardSize.value
  if (size === 13) {
    return [
      { row: 3, col: 3 },
      { row: 3, col: 9 },
      { row: 6, col: 6 },
      { row: 9, col: 3 },
      { row: 9, col: 9 },
    ]
  } else if (size === 15) {
    return [
      { row: 3, col: 3 },
      { row: 3, col: 11 },
      { row: 7, col: 7 },
      { row: 11, col: 3 },
      { row: 11, col: 11 },
    ]
  } else {
    // 19x19
    return [
      { row: 3, col: 3 },
      { row: 3, col: 9 },
      { row: 3, col: 15 },
      { row: 9, col: 3 },
      { row: 9, col: 9 },
      { row: 9, col: 15 },
      { row: 15, col: 3 },
      { row: 15, col: 9 },
      { row: 15, col: 15 },
    ]
  }
})

// 方法
const getIntersectionPosition = (row: number, col: number) => {
  const left = padding_percent + (grid_area_percent / (boardSize.value - 1)) * col
  const top = padding_percent + (grid_area_percent / (boardSize.value - 1)) * row
  return {
    left: `${left}%`,
    top: `${top}%`,
    width: '5%',
    height: '5%',
    transform: 'translate(-50%, -50%)',
  }
}

const getHoverClass = (row: number, col: number): string => {
  if (gameOver.value || board.value[row][col] !== 0) return ''
  return 'hover:bg-white/30 rounded-full'
}

const getPieceClass = (row: number, col: number): string => {
  const baseClass =
    board.value[row][col] === 1
      ? 'bg-gradient-radial from-gray-600 to-black'
      : 'bg-gradient-radial from-white to-gray-300'

  const winningClass = isWinningPiece(row, col)
    ? 'ring-4 ring-red-500 ring-opacity-70 animate-pulse'
    : ''

  // 最后一步加蓝色圈圈
  const lastMoveClass =
    gameSettings.value.showLastMove && isLastMove(row, col) && !gameOver.value
      ? 'last-move-outline'
      : ''

  return `${baseClass} ${winningClass} ${lastMoveClass}`
}

const isLastMove = (row: number, col: number): boolean => {
  return lastMove.value?.row === row && lastMove.value?.col === col
}

const isWinningPiece = (row: number, col: number): boolean => {
  if (!winningPositions.value) return false
  return winningPositions.value.some((pos: any) => pos.row === row && pos.col === col)
}

const getMoveOrder = (row: number, col: number): number => {
  const moveIndex = moveHistory.value.findIndex((move: any) => move.row === row && move.col === col)
  return moveIndex >= 0 ? moveIndex + 1 : 0
}

const getMoveOrderFontStyle = () => {
  // 使用 clamp 限制字号范围，防止无限变大或变小
  return {
    fontSize: 'clamp(8px, 2vw, 18px)',
    lineHeight: '1',
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
  }
}

const handleMove = (row: number, col: number) => {
  emits('move', row, col)
}
</script>

<style scoped>
.bg-gradient-radial {
  background: radial-gradient(circle at 30% 30%, var(--tw-gradient-from), var(--tw-gradient-to));
}

.last-move-outline {
  box-shadow:
    0 0 0 0.18em #3b82f6,
    0 0 8px 0 #3b82f6;
  animation: lastMovePulse 1.2s infinite alternate;
}
@keyframes lastMovePulse {
  0% {
    box-shadow:
      0 0 0 0.18em #3b82f6,
      0 0 8px 0 #3b82f6;
  }
  100% {
    box-shadow:
      0 0 0 0.32em #60a5fa,
      0 0 12px 2px #3b82f6;
  }
}

@keyframes aiBestPulse {
  0%,
  100% {
    opacity: 0.8;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.ai-best-mark {
  animation: aiBestPulse 1.5s ease-in-out infinite;
}

.gomoku-board-container {
  aspect-ratio: 1 / 1;
}
</style>
