<template>
  <div class="chess-board-container">
    <div class="board-wrapper">
      <!-- SVG 棋盘 -->
      <svg :width="boardWidth" :height="boardHeight" class="chess-board">
        <!-- 毛玻璃背景 -->
        <defs>
          <!-- 模糊滤镜定义 -->
          <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>

          <!-- 渐变背景定义 -->
          <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color: #667eea; stop-opacity: 0.3" />
            <stop offset="50%" style="stop-color: #764ba2; stop-opacity: 0.2" />
            <stop offset="100%" style="stop-color: #f093fb; stop-opacity: 0.3" />
          </linearGradient>
        </defs>

        <!-- 背景 -->
        <rect x="0" y="0" :width="boardWidth" :height="boardHeight" fill="url(#glassGradient)" />

        <!-- 棋盘线条 -->
        <!-- 横线 -->
        <g v-for="row in 10" :key="'row-' + row">
          <line
            :x1="margin"
            :y1="margin + (row - 1) * cellSize"
            :x2="margin + 8 * cellSize"
            :y2="margin + (row - 1) * cellSize"
            stroke="rgba(0, 0, 0, 0.6)"
            :stroke-width="2 * scale"
          />
        </g>

        <!-- 竖线 -->
        <g v-for="col in 9" :key="'col-' + col">
          <!-- 上半部分 -->
          <line
            :x1="margin + (col - 1) * cellSize"
            :y1="margin"
            :x2="margin + (col - 1) * cellSize"
            :y2="margin + 4 * cellSize"
            stroke="rgba(0, 0, 0, 0.6)"
            :stroke-width="2 * scale"
          />
          <!-- 下半部分 -->
          <line
            :x1="margin + (col - 1) * cellSize"
            :y1="margin + 5 * cellSize"
            :x2="margin + (col - 1) * cellSize"
            :y2="margin + 9 * cellSize"
            stroke="rgba(0, 0, 0, 0.6)"
            :stroke-width="2 * scale"
          />
        </g>

        <!-- 九宫格斜线 -->
        <!-- 上方九宫 -->
        <line
          :x1="margin + 3 * cellSize"
          :y1="margin"
          :x2="margin + 5 * cellSize"
          :y2="margin + 2 * cellSize"
          stroke="rgba(0, 0, 0, 0.6)"
          :stroke-width="2 * scale"
        />
        <line
          :x1="margin + 5 * cellSize"
          :y1="margin"
          :x2="margin + 3 * cellSize"
          :y2="margin + 2 * cellSize"
          stroke="rgba(0, 0, 0, 0.6)"
          :stroke-width="2 * scale"
        />

        <!-- 下方九宫 -->
        <line
          :x1="margin + 3 * cellSize"
          :y1="margin + 7 * cellSize"
          :x2="margin + 5 * cellSize"
          :y2="margin + 9 * cellSize"
          stroke="rgba(0, 0, 0, 0.6)"
          :stroke-width="2 * scale"
        />
        <line
          :x1="margin + 5 * cellSize"
          :y1="margin + 7 * cellSize"
          :x2="margin + 3 * cellSize"
          :y2="margin + 9 * cellSize"
          stroke="rgba(0, 0, 0, 0.6)"
          :stroke-width="2 * scale"
        />

        <!-- 楚河汉界文字 -->
        <text
          :x="margin + 2 * cellSize"
          :y="margin + 4.6 * cellSize"
          font-family="serif"
          :font-size="18 * scale"
          font-weight="bold"
          fill="rgba(0, 0, 0, 0.7)"
          text-anchor="middle"
        >
          楚河
        </text>
        <text
          :x="margin + 6 * cellSize"
          :y="margin + 4.6 * cellSize"
          font-family="serif"
          :font-size="18 * scale"
          font-weight="bold"
          fill="rgba(0, 0, 0, 0.7)"
          text-anchor="middle"
        >
          汉界
        </text>

        <!-- 炮位直角标记 -->
        <!-- 黑方炮位 (1,2) 和 (7,2) -->
        <g v-for="x in [1, 7]" :key="'black-cannon-' + x">
          <!-- 左上角 -->
          <g>
            <line
              :x1="margin + x * cellSize - 12 * scale"
              :y1="margin + 2 * cellSize - 6 * scale"
              :x2="margin + x * cellSize - 6 * scale"
              :y2="margin + 2 * cellSize - 6 * scale"
              stroke="rgba(0, 0, 0, 0.6)"
              :stroke-width="1.5 * scale"
            />
            <line
              :x1="margin + x * cellSize - 6 * scale"
              :y1="margin + 2 * cellSize - 12 * scale"
              :x2="margin + x * cellSize - 6 * scale"
              :y2="margin + 2 * cellSize - 6 * scale"
              stroke="rgba(0, 0, 0, 0.6)"
              :stroke-width="1.5 * scale"
            />
          </g>
          <!-- 右上角 -->
          <g>
            <line
              :x1="margin + x * cellSize + 6 * scale"
              :y1="margin + 2 * cellSize - 6 * scale"
              :x2="margin + x * cellSize + 12 * scale"
              :y2="margin + 2 * cellSize - 6 * scale"
              stroke="rgba(0, 0, 0, 0.6)"
              :stroke-width="1.5 * scale"
            />
            <line
              :x1="margin + x * cellSize + 6 * scale"
              :y1="margin + 2 * cellSize - 12 * scale"
              :x2="margin + x * cellSize + 6 * scale"
              :y2="margin + 2 * cellSize - 6 * scale"
              stroke="rgba(0, 0, 0, 0.6)"
              :stroke-width="1.5 * scale"
            />
          </g>
          <!-- 左下角 -->
          <g>
            <line
              :x1="margin + x * cellSize - 12 * scale"
              :y1="margin + 2 * cellSize + 6 * scale"
              :x2="margin + x * cellSize - 6 * scale"
              :y2="margin + 2 * cellSize + 6 * scale"
              stroke="rgba(0, 0, 0, 0.6)"
              :stroke-width="1.5 * scale"
            />
            <line
              :x1="margin + x * cellSize - 6 * scale"
              :y1="margin + 2 * cellSize + 6 * scale"
              :x2="margin + x * cellSize - 6 * scale"
              :y2="margin + 2 * cellSize + 12 * scale"
              stroke="rgba(0, 0, 0, 0.6)"
              :stroke-width="1.5 * scale"
            />
          </g>
          <!-- 右下角 -->
          <g>
            <line
              :x1="margin + x * cellSize + 6 * scale"
              :y1="margin + 2 * cellSize + 6 * scale"
              :x2="margin + x * cellSize + 12 * scale"
              :y2="margin + 2 * cellSize + 6 * scale"
              stroke="rgba(0, 0, 0, 0.6)"
              :stroke-width="1.5 * scale"
            />
            <line
              :x1="margin + x * cellSize + 6 * scale"
              :y1="margin + 2 * cellSize + 6 * scale"
              :x2="margin + x * cellSize + 6 * scale"
              :y2="margin + 2 * cellSize + 12 * scale"
              stroke="rgba(0, 0, 0, 0.6)"
              :stroke-width="1.5 * scale"
            />
          </g>
        </g>

        <!-- 红方炮位 (1,7) 和 (7,7) -->
        <g v-for="x in [1, 7]" :key="'red-cannon-' + x">
          <!-- 左上角 -->
          <g>
            <line
              :x1="margin + x * cellSize - 12 * scale"
              :y1="margin + 7 * cellSize - 6 * scale"
              :x2="margin + x * cellSize - 6 * scale"
              :y2="margin + 7 * cellSize - 6 * scale"
              stroke="rgba(211, 47, 47, 0.7)"
              :stroke-width="1.5 * scale"
            />
            <line
              :x1="margin + x * cellSize - 6 * scale"
              :y1="margin + 7 * cellSize - 12 * scale"
              :x2="margin + x * cellSize - 6 * scale"
              :y2="margin + 7 * cellSize - 6 * scale"
              stroke="rgba(211, 47, 47, 0.7)"
              :stroke-width="1.5 * scale"
            />
          </g>
          <!-- 右上角 -->
          <g>
            <line
              :x1="margin + x * cellSize + 6 * scale"
              :y1="margin + 7 * cellSize - 6 * scale"
              :x2="margin + x * cellSize + 12 * scale"
              :y2="margin + 7 * cellSize - 6 * scale"
              stroke="rgba(211, 47, 47, 0.7)"
              :stroke-width="1.5 * scale"
            />
            <line
              :x1="margin + x * cellSize + 6 * scale"
              :y1="margin + 7 * cellSize - 12 * scale"
              :x2="margin + x * cellSize + 6 * scale"
              :y2="margin + 7 * cellSize - 6 * scale"
              stroke="rgba(211, 47, 47, 0.7)"
              :stroke-width="1.5 * scale"
            />
          </g>
          <!-- 左下角 -->
          <g>
            <line
              :x1="margin + x * cellSize - 12 * scale"
              :y1="margin + 7 * cellSize + 6 * scale"
              :x2="margin + x * cellSize - 6 * scale"
              :y2="margin + 7 * cellSize + 6 * scale"
              stroke="rgba(211, 47, 47, 0.7)"
              :stroke-width="1.5 * scale"
            />
            <line
              :x1="margin + x * cellSize - 6 * scale"
              :y1="margin + 7 * cellSize + 6 * scale"
              :x2="margin + x * cellSize - 6 * scale"
              :y2="margin + 7 * cellSize + 12 * scale"
              stroke="rgba(211, 47, 47, 0.7)"
              :stroke-width="1.5 * scale"
            />
          </g>
          <!-- 右下角 -->
          <g>
            <line
              :x1="margin + x * cellSize + 6 * scale"
              :y1="margin + 7 * cellSize + 6 * scale"
              :x2="margin + x * cellSize + 12 * scale"
              :y2="margin + 7 * cellSize + 6 * scale"
              stroke="rgba(211, 47, 47, 0.7)"
              :stroke-width="1.5 * scale"
            />
            <line
              :x1="margin + x * cellSize + 6 * scale"
              :y1="margin + 7 * cellSize + 6 * scale"
              :x2="margin + x * cellSize + 6 * scale"
              :y2="margin + 7 * cellSize + 12 * scale"
              stroke="rgba(211, 47, 47, 0.7)"
              :stroke-width="1.5 * scale"
            />
          </g>
        </g>

        <!-- 兵卒位直角标记 -->
        <!-- 黑方卒位 (0,3), (2,3), (4,3), (6,3), (8,3) -->
        <g v-for="x in [0, 2, 4, 6, 8]" :key="'black-pawn-' + x">
          <!-- 左上角 (只在不是最左边时绘制) -->
          <g v-if="x > 0">
            <line
              :x1="margin + x * cellSize - 10 * scale"
              :y1="margin + 3 * cellSize - 4 * scale"
              :x2="margin + x * cellSize - 4 * scale"
              :y2="margin + 3 * cellSize - 4 * scale"
              stroke="rgba(0, 0, 0, 0.6)"
              :stroke-width="1 * scale"
            />
            <line
              :x1="margin + x * cellSize - 4 * scale"
              :y1="margin + 3 * cellSize - 10 * scale"
              :x2="margin + x * cellSize - 4 * scale"
              :y2="margin + 3 * cellSize - 4 * scale"
              stroke="rgba(0, 0, 0, 0.6)"
              :stroke-width="1 * scale"
            />
          </g>
          <!-- 右上角 (只在不是最右边时绘制) -->
          <g v-if="x < 8">
            <line
              :x1="margin + x * cellSize + 4 * scale"
              :y1="margin + 3 * cellSize - 4 * scale"
              :x2="margin + x * cellSize + 10 * scale"
              :y2="margin + 3 * cellSize - 4 * scale"
              stroke="rgba(0, 0, 0, 0.6)"
              :stroke-width="1 * scale"
            />
            <line
              :x1="margin + x * cellSize + 4 * scale"
              :y1="margin + 3 * cellSize - 10 * scale"
              :x2="margin + x * cellSize + 4 * scale"
              :y2="margin + 3 * cellSize - 4 * scale"
              stroke="rgba(0, 0, 0, 0.6)"
              :stroke-width="1 * scale"
            />
          </g>
          <!-- 左下角 (只在不是最左边时绘制) -->
          <g v-if="x > 0">
            <line
              :x1="margin + x * cellSize - 10 * scale"
              :y1="margin + 3 * cellSize + 4 * scale"
              :x2="margin + x * cellSize - 4 * scale"
              :y2="margin + 3 * cellSize + 4 * scale"
              stroke="rgba(0, 0, 0, 0.6)"
              :stroke-width="1 * scale"
            />
            <line
              :x1="margin + x * cellSize - 4 * scale"
              :y1="margin + 3 * cellSize + 4 * scale"
              :x2="margin + x * cellSize - 4 * scale"
              :y2="margin + 3 * cellSize + 10 * scale"
              stroke="rgba(0, 0, 0, 0.6)"
              :stroke-width="1 * scale"
            />
          </g>
          <!-- 右下角 (只在不是最右边时绘制) -->
          <g v-if="x < 8">
            <line
              :x1="margin + x * cellSize + 4 * scale"
              :y1="margin + 3 * cellSize + 4 * scale"
              :x2="margin + x * cellSize + 10 * scale"
              :y2="margin + 3 * cellSize + 4 * scale"
              stroke="rgba(0, 0, 0, 0.6)"
              :stroke-width="1 * scale"
            />
            <line
              :x1="margin + x * cellSize + 4 * scale"
              :y1="margin + 3 * cellSize + 4 * scale"
              :x2="margin + x * cellSize + 4 * scale"
              :y2="margin + 3 * cellSize + 10 * scale"
              stroke="rgba(0, 0, 0, 0.6)"
              :stroke-width="1 * scale"
            />
          </g>
        </g>

        <!-- 红方兵位 (0,6), (2,6), (4,6), (6,6), (8,6) -->
        <g v-for="x in [0, 2, 4, 6, 8]" :key="'red-pawn-' + x">
          <!-- 左上角 (只在不是最左边时绘制) -->
          <g v-if="x > 0">
            <line
              :x1="margin + x * cellSize - 10 * scale"
              :y1="margin + 6 * cellSize - 4 * scale"
              :x2="margin + x * cellSize - 4 * scale"
              :y2="margin + 6 * cellSize - 4 * scale"
              stroke="rgba(211, 47, 47, 0.7)"
              :stroke-width="1 * scale"
            />
            <line
              :x1="margin + x * cellSize - 4 * scale"
              :y1="margin + 6 * cellSize - 10 * scale"
              :x2="margin + x * cellSize - 4 * scale"
              :y2="margin + 6 * cellSize - 4 * scale"
              stroke="rgba(211, 47, 47, 0.7)"
              :stroke-width="1 * scale"
            />
          </g>
          <!-- 右上角 (只在不是最右边时绘制) -->
          <g v-if="x < 8">
            <line
              :x1="margin + x * cellSize + 4 * scale"
              :y1="margin + 6 * cellSize - 4 * scale"
              :x2="margin + x * cellSize + 10 * scale"
              :y2="margin + 6 * cellSize - 4 * scale"
              stroke="rgba(211, 47, 47, 0.7)"
              :stroke-width="1 * scale"
            />
            <line
              :x1="margin + x * cellSize + 4 * scale"
              :y1="margin + 6 * cellSize - 10 * scale"
              :x2="margin + x * cellSize + 4 * scale"
              :y2="margin + 6 * cellSize - 4 * scale"
              stroke="rgba(211, 47, 47, 0.7)"
              :stroke-width="1 * scale"
            />
          </g>
          <!-- 左下角 (只在不是最左边时绘制) -->
          <g v-if="x > 0">
            <line
              :x1="margin + x * cellSize - 10 * scale"
              :y1="margin + 6 * cellSize + 4 * scale"
              :x2="margin + x * cellSize - 4 * scale"
              :y2="margin + 6 * cellSize + 4 * scale"
              stroke="rgba(211, 47, 47, 0.7)"
              :stroke-width="1 * scale"
            />
            <line
              :x1="margin + x * cellSize - 4 * scale"
              :y1="margin + 6 * cellSize + 4 * scale"
              :x2="margin + x * cellSize - 4 * scale"
              :y2="margin + 6 * cellSize + 10 * scale"
              stroke="rgba(211, 47, 47, 0.7)"
              :stroke-width="1 * scale"
            />
          </g>
          <!-- 右下角 (只在不是最右边时绘制) -->
          <g v-if="x < 8">
            <line
              :x1="margin + x * cellSize + 4 * scale"
              :y1="margin + 6 * cellSize + 4 * scale"
              :x2="margin + x * cellSize + 10 * scale"
              :y2="margin + 6 * cellSize + 4 * scale"
              stroke="rgba(211, 47, 47, 0.7)"
              :stroke-width="1 * scale"
            />
            <line
              :x1="margin + x * cellSize + 4 * scale"
              :y1="margin + 6 * cellSize + 4 * scale"
              :x2="margin + x * cellSize + 4 * scale"
              :y2="margin + 6 * cellSize + 10 * scale"
              stroke="rgba(211, 47, 47, 0.7)"
              :stroke-width="1 * scale"
            />
          </g>
        </g>
      </svg>

      <!-- 棋子 -->
      <div class="pieces-container">
        <!-- 渲染所有存活的棋子 -->
        <template v-for="(piece, index) in alivePieces" :key="`piece-${piece?.id || index}`">
          <ChessPiece
            v-if="piece && piece.alive && piece.position"
            :key="`piece-${piece.id}-${piece.position.x}-${piece.position.y}-${piece.alive}-${index}`"
            :piece="piece"
            :x="piece.position.x"
            :y="piece.position.y"
            :is-black="piece.camp === 'black'"
            :is-selected="isPieceSelected(piece)"
            :cell-size="cellSize"
            :margin="margin"
            :scale="scale"
            :z-index="50 + index"
            @click="onPieceClick(piece)"
          />
        </template>

        <!-- 选中标记 -->
        <div
          v-if="props.selectedPiece"
          class="selection-mark"
          :style="{
            left: margin + props.selectedPiece.position.x * cellSize - pieceRadius + 'px',
            top: margin + props.selectedPiece.position.y * cellSize - pieceRadius + 'px',
            width: pieceRadius * 2 + 'px',
            height: pieceRadius * 2 + 'px',
          }"
        ></div>

        <!-- 可移动位置提示 -->
        <template
          v-for="pos in props.availableMoves || []"
          :key="`move-${pos?.x || 0}-${pos?.y || 0}`"
        >
          <div
            v-if="pos && typeof pos.x === 'number' && typeof pos.y === 'number'"
            :key="`move-${pos.x}-${pos.y}`"
            :class="[
              'move-hint',
              {
                'attack-hint': isAttackPosition(pos),
                'attack-red-target':
                  isAttackPosition(pos) && getAttackTargetPiece(pos)?.camp === 'red',
                'attack-black-target':
                  isAttackPosition(pos) && getAttackTargetPiece(pos)?.camp === 'black',
              },
            ]"
            :style="{
              left: margin + pos.x * cellSize - 15 * scale + 'px',
              top: margin + pos.y * cellSize - 15 * scale + 'px',
              width: 30 * scale + 'px',
              height: 30 * scale + 'px',
            }"
            @click="onMoveClick(pos)"
          ></div>
        </template>

        <!-- 可被吃掉的棋子高亮提示 -->
        <template v-for="piece in attackablePieces" :key="`attackable-${piece?.id || 'unknown'}`">
          <div
            v-if="piece && piece.position"
            :key="`attackable-${piece.id}`"
            :class="[
              'attackable-piece-highlight',
              { 'attackable-red-piece': piece.camp === 'red' },
              { 'attackable-black-piece': piece.camp === 'black' },
            ]"
            :style="{
              left: margin + piece.position.x * cellSize - pieceRadius - 4 * scale + 'px',
              top: margin + piece.position.y * cellSize - pieceRadius - 4 * scale + 'px',
              width: (pieceRadius + 4 * scale) * 2 + 'px',
              height: (pieceRadius + 4 * scale) * 2 + 'px',
            }"
          ></div>
        </template>

        <!-- 棋盘交叉点点击区域 -->
        <div
          v-for="row in 10"
          :key="'row-' + row"
          class="board-row"
          :style="{
            top: margin + (row - 1) * cellSize - 15 * scale + 'px',
            height: 30 * scale + 'px',
          }"
        >
          <div
            v-for="col in 9"
            :key="'col-' + col"
            class="board-cell"
            :style="{
              left: margin + (col - 1) * cellSize - 15 * scale + 'px',
              width: 30 * scale + 'px',
              height: 30 * scale + 'px',
            }"
            @click="onBoardClick(col - 1, row - 1)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ChessPiece from './ChessPiece.vue'
import { type ChessPiece as ChessPieceType, type Position } from '../ChessGame'

// 定义 props
interface Props {
  width?: number
  height?: number
  gameState: any
  selectedPiece: any
  availableMoves: any[]
}

const props = withDefaults(defineProps<Props>(), {
  width: 540,
  height: 600,
  availableMoves: () => [],
})

// 棋盘尺寸计算
// 标准比例：宽540，高600，边距50，格子55
const STANDARD_WIDTH = 540
const STANDARD_HEIGHT = 600
const STANDARD_MARGIN = 50
const STANDARD_CELL_SIZE = 55
const STANDARD_PIECE_RADIUS = 22

// 计算缩放比例
const scaleX = computed(() => props.width / STANDARD_WIDTH)
const scaleY = computed(() => props.height / STANDARD_HEIGHT)
const scale = computed(() => Math.min(scaleX.value, scaleY.value)) // 保持比例，使用较小的缩放值

// 计算实际尺寸
const boardWidth = computed(() => STANDARD_WIDTH * scale.value)
const boardHeight = computed(() => STANDARD_HEIGHT * scale.value)
const margin = computed(() => STANDARD_MARGIN * scale.value)
const cellSize = computed(() => STANDARD_CELL_SIZE * scale.value)
const pieceRadius = computed(() => STANDARD_PIECE_RADIUS * scale.value)

// 计算可攻击的棋子（用于高亮显示）
const attackablePieces = computed(() => {
  if (!props.selectedPiece) return []

  const pieces = props.gameState?.pieces || []
  const availableMoves = props.availableMoves || []

  return pieces.filter((piece: any) => {
    if (!piece || !piece.alive || piece.camp === props.selectedPiece?.camp) return false

    // 检查这个棋子的位置是否在可移动位置中
    return availableMoves.some(
      (move) => move && move.x === piece.position.x && move.y === piece.position.y,
    )
  })
})

// 计算棋子列表用于渲染
const alivePieces = computed(() => {
  // 确保 pieces 数组存在并且过滤掉所有无效的棋子
  const pieces = props.gameState?.pieces || []
  const alive = pieces.filter(
    (piece: any) =>
      piece &&
      piece.alive === true &&
      piece.id &&
      piece.type &&
      piece.position &&
      typeof piece.position.x === 'number' &&
      typeof piece.position.y === 'number',
  )

  // 按照固定的顺序排序，确保渲染顺序一致
  // 先按阵营排序（黑方在前），再按棋子类型，最后按ID
  return alive.sort((a: any, b: any) => {
    if (a.camp !== b.camp) {
      return a.camp === 'black' ? -1 : 1
    }
    if (a.type !== b.type) {
      return a.type.localeCompare(b.type)
    }
    return a.id.localeCompare(b.id)
  })
})

// 事件发射
const emit = defineEmits<{
  pieceClick: [piece: ChessPieceType]
  boardClick: [x: number, y: number]
  moveClick: [position: Position]
}>()

// 棋子点击事件
const onPieceClick = (piece: ChessPieceType) => {
  // 只处理活着的棋子点击
  if (piece.alive) {
    emit('pieceClick', piece)
  }
}

// 棋盘点击事件（空位移动）
const onBoardClick = (x: number, y: number) => {
  emit('boardClick', x, y)
}

// 可移动位置点击
const onMoveClick = (pos: Position) => {
  emit('moveClick', pos)
}

// 棋子是否被选中
const isPieceSelected = (piece: ChessPieceType) => {
  return piece && piece.alive && props.selectedPiece?.id === piece.id
}

// 检查位置是否是攻击位置（有敌方棋子）
const isAttackPosition = (pos: Position) => {
  // 直接检查这个位置是否有敌方棋子
  const pieces = props.gameState?.pieces || []
  const targetPiece = pieces.find(
    (p: any) => p && p.position.x === pos.x && p.position.y === pos.y && p.alive,
  )
  return targetPiece && props.selectedPiece && targetPiece.camp !== props.selectedPiece.camp
}

// 获取攻击位置上的棋子
const getAttackTargetPiece = (pos: Position) => {
  const pieces = props.gameState?.pieces || []
  return pieces.find((p: any) => p && p.position.x === pos.x && p.position.y === pos.y && p.alive)
}
</script>

<style scoped>
.chess-board-container {
  display: inline-block;
  padding: 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.board-wrapper {
  position: relative;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.chess-board {
  display: block;
}

.pieces-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.pieces-container > * {
  pointer-events: auto;
}

.selection-mark {
  position: absolute;
  border: 3px solid #fff;
  border-radius: 50%;
  pointer-events: none;
  z-index: 10;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.move-hint {
  position: absolute;
  background: rgba(76, 175, 80, 0.6);
  border: 3px solid rgba(76, 175, 80, 0.8);
  border-radius: 50%;
  cursor: pointer;
  z-index: 25;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.move-hint::before {
  content: '';
  width: 40%;
  height: 40%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.move-hint:hover {
  background: rgba(76, 175, 80, 0.8);
  border-color: rgba(76, 175, 80, 1);
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.move-hint:hover::before {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.attack-hint {
  background: transparent;
  border: 4px solid rgba(244, 67, 54, 0.9);
  animation: attack-pulse 1.5s infinite;
  z-index: 30;
  box-shadow: 0 0 15px rgba(244, 67, 54, 0.6);
}

/* 攻击红色棋子时使用黑色边框 */
.attack-hint.attack-red-target {
  border: 4px solid rgba(0, 0, 0, 0.9) !important;
  animation: attack-pulse-black 1.5s infinite !important;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.6) !important;
}

/* 攻击黑色棋子时使用红色边框 */
.attack-hint.attack-black-target {
  border: 4px solid rgba(244, 67, 54, 0.9) !important;
  animation: attack-pulse-red 1.5s infinite !important;
  box-shadow: 0 0 15px rgba(244, 67, 54, 0.6) !important;
}

.attack-hint::before {
  display: none;
}

.attack-hint::before {
  background: rgba(255, 255, 255, 0.9);
  animation: attack-inner-pulse 1.5s infinite;
}

.attack-hint:hover {
  background: rgba(244, 67, 54, 0.9);
  border-color: rgba(244, 67, 54, 1);
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.5);
}

.attack-hint.attack-red-target:hover {
  background: rgba(0, 0, 0, 0.9) !important;
  border-color: rgba(0, 0, 0, 1) !important;
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
}

.attack-hint.attack-black-target:hover {
  background: rgba(244, 67, 54, 0.9) !important;
  border-color: rgba(244, 67, 54, 1) !important;
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.5) !important;
}

.attack-hint:hover::before {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.2);
}

@keyframes attack-pulse {
  0% {
    opacity: 0.8;
    transform: scale(1);
    box-shadow: 0 0 15px rgba(244, 67, 54, 0.6);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
    box-shadow: 0 0 25px rgba(244, 67, 54, 0.9);
  }
  100% {
    opacity: 0.8;
    transform: scale(1);
    box-shadow: 0 0 15px rgba(244, 67, 54, 0.6);
  }
}

@keyframes attack-pulse-red {
  0% {
    opacity: 0.8;
    transform: scale(1);
    box-shadow: 0 0 15px rgba(244, 67, 54, 0.6);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
    box-shadow: 0 0 25px rgba(244, 67, 54, 0.9);
  }
  100% {
    opacity: 0.8;
    transform: scale(1);
    box-shadow: 0 0 15px rgba(244, 67, 54, 0.6);
  }
}

@keyframes attack-pulse-black {
  0% {
    opacity: 0.8;
    transform: scale(1);
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.6);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
    box-shadow: 0 0 25px rgba(0, 0, 0, 0.9);
  }
  100% {
    opacity: 0.8;
    transform: scale(1);
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.6);
  }
}

@keyframes attack-inner-pulse {
  0% {
    opacity: 0.9;
    transform: scale(1);
    background: rgba(255, 255, 255, 0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
    background: rgba(255, 255, 255, 1);
  }
  100% {
    opacity: 0.9;
    transform: scale(1);
    background: rgba(255, 255, 255, 0.9);
  }
}

.board-row {
  position: absolute;
  width: 100%;
  pointer-events: none;
}

.board-cell {
  position: absolute;
  pointer-events: auto;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.board-cell:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.attackable-piece-highlight {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 8;
  background: transparent;
}

/* 红色棋子用黑色特效 */
.attackable-piece-highlight.attackable-red-piece {
  border: 3px solid rgba(0, 0, 0, 0.9) !important;
  animation: attackable-pulse-black 1.2s infinite !important;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.9),
    0 0 15px rgba(0, 0, 0, 0.7) !important;
}

/* 黑色棋子用红色特效 */
.attackable-piece-highlight.attackable-black-piece {
  border: 3px solid rgba(244, 67, 54, 0.9) !important;
  animation: attackable-pulse-red 1.2s infinite !important;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.9),
    0 0 15px rgba(244, 67, 54, 0.7) !important;
}

@keyframes attackable-pulse-red {
  0% {
    opacity: 0.9;
    transform: scale(1);
    border-width: 3px;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.9),
      0 0 15px rgba(244, 67, 54, 0.7);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
    border-width: 4px;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 1),
      0 0 25px rgba(244, 67, 54, 0.9);
  }
  100% {
    opacity: 0.9;
    transform: scale(1);
    border-width: 3px;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.9),
      0 0 15px rgba(244, 67, 54, 0.7);
  }
}

@keyframes attackable-pulse-black {
  0% {
    opacity: 0.9;
    transform: scale(1);
    border-width: 3px;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.9),
      0 0 15px rgba(0, 0, 0, 0.7);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
    border-width: 4px;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 1),
      0 0 25px rgba(0, 0, 0, 0.9);
  }
  100% {
    opacity: 0.9;
    transform: scale(1);
    border-width: 3px;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.9),
      0 0 15px rgba(0, 0, 0, 0.7);
  }
}
</style>
