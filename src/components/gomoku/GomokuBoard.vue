<template>
  <div
    ref="gameBoard"
    class="relative bg-yellow-100 border-4 border-yellow-800 rounded-lg shadow-2xl"
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
          :class="getHoverClass(rowIndex, colIndex)"
          @click="handleMove(rowIndex, colIndex)"
          :style="getIntersectionPosition(rowIndex, colIndex)"
        >
          <!-- 棋子 -->
          <div
            v-if="cell !== 0"
            class="rounded-full border-2 border-gray-800 shadow-lg relative z-10"
            :class="getPieceClass(rowIndex, colIndex)"
            :style="pieceStyle"
          >
            <!-- 最后一步标记 -->
            <div
              v-if="gameSettings.showLastMove && isLastMove(rowIndex, colIndex)"
              class="absolute inset-0 flex items-center justify-center"
            >
              <div :style="lastMoveMarkStyle" class="bg-red-500 rounded-full animate-pulse"></div>
            </div>
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
            ></div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
// @ts-ignore
import { useStore } from 'vuex'

// 类型定义
interface Position {
  row: number
  col: number
}

interface Move {
  row: number
  col: number
  player: number
}

// Props
const props = defineProps<{
  windowWidth: number
  windowHeight: number
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
const aiBestPosition = computed(() => store.state.gomoku.gameState.aiBestPosition)

// Emits
const emits = defineEmits<{
  move: [row: number, col: number]
}>()

// 布局常量
const padding_percent = 8
const grid_area_percent = 84

// 计算属性
const isPortrait = computed(() => props.windowWidth < props.windowHeight)

const boardSize_px = computed(() => {
  let size: number
  if (!props.windowWidth || !props.windowHeight) {
    return 400 // 默认棋盘像素
  }
  if (isPortrait.value) {
    const maxWidth = props.windowWidth * 0.9
    const maxHeight = props.windowHeight * 0.7
    size = Math.min(maxWidth, maxHeight)
  } else {
    const maxSize = Math.max(props.windowHeight * 0.8, props.windowWidth * 0.4)
    size = Math.max(maxSize, 400)
  }
  // 棋盘必须正方形
  return Math.max(Math.min(size, props.windowWidth, props.windowHeight), 100)
})

const boardContainerStyle = computed(() => ({
  width: `${boardSize_px.value}px`,
  height: `${boardSize_px.value}px`,
  backgroundColor: '#D2B48C',
}))

const pieceStyle = computed(() => {
  const cellSize = (boardSize_px.value * (grid_area_percent / 100)) / (boardSize.value - 1)
  const pieceSize = Math.max(cellSize * 0.8, 12)

  return {
    width: `${pieceSize}px`,
    height: `${pieceSize}px`,
  }
})

const starPointSize = computed(() => {
  const px = boardSize_px.value
  if (!px || isNaN(px) || px <= 0) return 2
  return Math.max(px / 150, 2)
})

const coordinateFontSize = computed(() => Math.max(boardSize_px.value / 40, 10))

const lastMoveMarkSize = computed(() => {
  const cellSize = (boardSize_px.value * (grid_area_percent / 100)) / (boardSize.value - 1)
  return Math.max(cellSize * 0.15, 4)
})

const lastMoveMarkStyle = computed(() => ({
  width: `${lastMoveMarkSize.value}px`,
  height: `${lastMoveMarkSize.value}px`,
}))

const aiBestMarkSize = computed(() => {
  const cellSize = (boardSize_px.value * (grid_area_percent / 100)) / (boardSize.value - 1)
  return Math.max(cellSize * 0.25, 6)
})

const aiBestMarkStyle = computed(() => ({
  width: `${aiBestMarkSize.value}px`,
  height: `${aiBestMarkSize.value}px`,
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
  const cellSize = (boardSize_px.value * (grid_area_percent / 100)) / (boardSize.value - 1)
  const clickArea = Math.max(cellSize, 20)

  return {
    left: `${left}%`,
    top: `${top}%`,
    width: `${clickArea}px`,
    height: `${clickArea}px`,
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

  return `${baseClass} ${winningClass}`
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
  const cellSize = (boardSize_px.value * (grid_area_percent / 100)) / (boardSize.value - 1)
  const fontSize = Math.max(cellSize * 0.25, 8)
  return {
    fontSize: `${fontSize}px`,
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
</style>
