<template>
  <div class="chess-board-container">
    <div class="board-wrapper">
      <!-- SVG 棋盘 -->
      <svg :width="boardWidth" :height="boardHeight" class="chess-board">
        <!-- 木质纹理背景 -->
        <defs>
          <pattern
            id="woodTexture"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <rect x="0" y="0" width="100" height="100" fill="#deb887" />
            <rect x="0" y="0" width="100" height="20" fill="#d2b48c" opacity="0.5" />
            <rect x="0" y="40" width="100" height="20" fill="#d2b48c" opacity="0.3" />
            <rect x="0" y="80" width="100" height="20" fill="#d2b48c" opacity="0.5" />
          </pattern>
        </defs>

        <!-- 背景 -->
        <rect x="0" y="0" :width="boardWidth" :height="boardHeight" fill="url(#woodTexture)" />

        <!-- 棋盘线条 -->
        <!-- 横线 -->
        <g v-for="row in 10" :key="'row-' + row">
          <line
            :x1="margin"
            :y1="margin + (row - 1) * cellSize"
            :x2="margin + 8 * cellSize"
            :y2="margin + (row - 1) * cellSize"
            stroke="#8B4513"
            stroke-width="2"
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
            stroke="#8B4513"
            stroke-width="2"
          />
          <!-- 下半部分 -->
          <line
            :x1="margin + (col - 1) * cellSize"
            :y1="margin + 5 * cellSize"
            :x2="margin + (col - 1) * cellSize"
            :y2="margin + 9 * cellSize"
            stroke="#8B4513"
            stroke-width="2"
          />
        </g>

        <!-- 九宫格斜线 -->
        <!-- 上方九宫 -->
        <line
          :x1="margin + 3 * cellSize"
          :y1="margin"
          :x2="margin + 5 * cellSize"
          :y2="margin + 2 * cellSize"
          stroke="#8B4513"
          stroke-width="2"
        />
        <line
          :x1="margin + 5 * cellSize"
          :y1="margin"
          :x2="margin + 3 * cellSize"
          :y2="margin + 2 * cellSize"
          stroke="#8B4513"
          stroke-width="2"
        />

        <!-- 下方九宫 -->
        <line
          :x1="margin + 3 * cellSize"
          :y1="margin + 7 * cellSize"
          :x2="margin + 5 * cellSize"
          :y2="margin + 9 * cellSize"
          stroke="#8B4513"
          stroke-width="2"
        />
        <line
          :x1="margin + 5 * cellSize"
          :y1="margin + 7 * cellSize"
          :x2="margin + 3 * cellSize"
          :y2="margin + 9 * cellSize"
          stroke="#8B4513"
          stroke-width="2"
        />

        <!-- 楚河汉界文字 -->
        <text
          :x="margin + 2 * cellSize"
          :y="margin + 4.6 * cellSize"
          font-family="serif"
          font-size="18"
          font-weight="bold"
          fill="#8B4513"
          text-anchor="middle"
        >
          楚河
        </text>
        <text
          :x="margin + 6 * cellSize"
          :y="margin + 4.6 * cellSize"
          font-family="serif"
          font-size="18"
          font-weight="bold"
          fill="#8B4513"
          text-anchor="middle"
        >
          汉界
        </text>
      </svg>

      <!-- 棋子 -->
      <div class="pieces-container">
        <!-- 渲染所有存活的棋子 -->
        <ChessPiece
          v-for="piece in alivePieces"
          :key="piece.id"
          :piece="piece"
          :x="piece.position.x"
          :y="piece.position.y"
          :is-black="piece.camp === 'black'"
          :is-selected="isPieceSelected(piece)"
          @click="onPieceClick(piece)"
        />

        <!-- 选中标记 -->
        <div
          v-if="selectedPiece"
          class="selection-mark"
          :style="{
            left: margin + selectedPiece.position.x * cellSize - pieceRadius + 'px',
            top: margin + selectedPiece.position.y * cellSize - pieceRadius + 'px',
          }"
        ></div>

        <!-- 可移动位置提示 -->
        <div
          v-for="pos in availableMoves"
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
            left: margin + pos.x * cellSize - 15 + 'px',
            top: margin + pos.y * cellSize - 15 + 'px',
          }"
          @click="onMoveClick(pos)"
        ></div>

        <!-- 可被吃掉的棋子高亮提示 -->
        <div
          v-for="piece in attackablePieces"
          :key="`attackable-${piece.id}`"
          :class="[
            'attackable-piece-highlight',
            { 'attackable-red-piece': piece.camp === 'red' },
            { 'attackable-black-piece': piece.camp === 'black' },
          ]"
          :style="{
            left: margin + piece.position.x * cellSize - pieceRadius - 4 + 'px',
            top: margin + piece.position.y * cellSize - pieceRadius - 4 + 'px',
          }"
        ></div>

        <!-- 棋盘交叉点点击区域 -->
        <div
          v-for="row in 10"
          :key="'row-' + row"
          class="board-row"
          :style="{ top: margin + (row - 1) * cellSize - 15 + 'px' }"
        >
          <div
            v-for="col in 9"
            :key="'col-' + col"
            class="board-cell"
            :style="{ left: margin + (col - 1) * cellSize - 15 + 'px' }"
            @click="onBoardClick(col - 1, row - 1)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import ChessPiece from './ChessPiece.vue'
import { ChessGame, type ChessPiece as ChessPieceType, type Position } from '../ChessGame'

// 棋盘尺寸
const boardWidth = 540
const boardHeight = 600
const margin = 50
const cellSize = 55
const pieceRadius = 22

// 游戏实例
const game = new ChessGame()
const gameState = reactive(game.getState())

// 选中的棋子和可移动位置
const selectedPiece = ref<ChessPieceType | null>(null)
const availableMoves = ref<Position[]>([])

// 用于强制刷新UI的响应式变量
const forceUpdate = ref(0)

// 计算可攻击的棋子（用于高亮显示）
const attackablePieces = computed(() => {
  if (!selectedPiece.value) return []

  return gameState.pieces.filter((piece) => {
    if (!piece.alive || piece.camp === selectedPiece.value?.camp) return false

    // 检查这个棋子的位置是否在可移动位置中
    return availableMoves.value.some(
      (move) => move.x === piece.position.x && move.y === piece.position.y,
    )
  })
})

// 计算棋子列表用于渲染
const alivePieces = computed(() => {
  // 强制响应式更新，使用新数组确保Vue能检测到变化
  forceUpdate.value // 触发响应式依赖
  const alive = gameState.pieces.filter((piece) => piece.alive)
  console.log('计算存活棋子:', alive.length, '个')
  return alive
})

// 事件发射
const emit = defineEmits<{
  gameStatusChange: [status: string]
  playerChange: [player: string]
  movePerformed: [
    data: {
      move?: any
      isCapture: boolean
      isCheck: boolean
      pieceType: string
      capturedPieceType?: string
    },
  ]
  pieceSelected: []
}>()

// 初始化游戏状态
const updateGameState = () => {
  const newState = game.getState()
  console.log('更新游戏状态 - 新状态棋子数量:', newState.pieces.filter((p) => p.alive).length)
  // 深度更新响应式状态 - 完全替换数组确保响应式更新
  Object.assign(gameState, {
    pieces: [...newState.pieces],
    currentPlayer: newState.currentPlayer,
    gameStatus: newState.gameStatus,
    isInCheck: newState.isInCheck,
    moveHistory: [...newState.moveHistory],
  })

  // 强制触发UI更新
  forceUpdate.value++

  console.log('更新后存活棋子数量:', alivePieces.value.length)

  emit('gameStatusChange', gameState.gameStatus)
  emit('playerChange', gameState.currentPlayer)
}

// 棋子点击事件
const onPieceClick = (piece: ChessPieceType) => {
  // 如果没有选中棋子，只能选中自己的棋子
  if (!selectedPiece.value) {
    if (piece.camp !== gameState.currentPlayer) {
      return
    }
    // 选中棋子
    selectedPiece.value = piece
    availableMoves.value = game.getValidMoves(piece)
    console.log(
      '选中棋子:',
      piece.type,
      '在位置:',
      piece.position,
      '可移动位置:',
      availableMoves.value,
    )
    emit('pieceSelected')
    return
  }

  // 如果点击的是自己的棋子
  if (piece.camp === gameState.currentPlayer) {
    if (selectedPiece.value?.id === piece.id) {
      // 取消选中
      selectedPiece.value = null
      availableMoves.value = []
    } else {
      // 选中其他自己的棋子
      selectedPiece.value = piece
      availableMoves.value = game.getValidMoves(piece)
      console.log(
        '重新选中棋子:',
        piece.type,
        '在位置:',
        piece.position,
        '可移动位置:',
        availableMoves.value,
      )
      emit('pieceSelected')
    }
    return
  }

  // 如果点击的是敌方棋子，尝试吃子
  if (selectedPiece.value && piece.camp !== gameState.currentPlayer) {
    const targetPosition = piece.position
    const isValidMove = availableMoves.value.some(
      (move) => move.x === targetPosition.x && move.y === targetPosition.y,
    )

    if (isValidMove) {
      console.log(
        '正在吃子:',
        selectedPiece.value.type,
        '吃',
        piece.type,
        '在位置:',
        piece.position,
      )
      console.log('被吃棋子移动前alive状态:', piece.alive)
      const movingPieceType = selectedPiece.value.type
      const success = game.makeMove(selectedPiece.value.position, targetPosition)
      if (success) {
        console.log('吃子成功，被吃棋子移动后alive状态:', piece.alive)
        const newState = game.getState()
        const checkPiece = newState.pieces.find((p) => p.id === piece.id)
        console.log('新状态中被吃棋子alive状态:', checkPiece?.alive)
        const latestMove = newState.moveHistory[newState.moveHistory.length - 1]
        emit('movePerformed', {
          move: latestMove,
          isCapture: true,
          isCheck: newState.isInCheck,
          pieceType: movingPieceType,
          capturedPieceType: piece.type,
        })

        selectedPiece.value = null
        availableMoves.value = []
        updateGameState()

        // 确保UI立即反映变化
        console.log('吃子完成，清除选中状态和移动提示')
        console.log('状态更新后存活棋子数量:', alivePieces.value.length)
      }
    }
  }
}

// 棋盘点击事件（空位移动）
const onBoardClick = (x: number, y: number) => {
  if (!selectedPiece.value) return

  const targetPosition = { x, y }
  const isValidMove = availableMoves.value.some(
    (move) => move.x === targetPosition.x && move.y === targetPosition.y,
  )

  if (isValidMove) {
    const oldState = game.getState()
    const targetPiece = oldState.pieces.find(
      (p) => p.position.x === targetPosition.x && p.position.y === targetPosition.y && p.alive,
    )

    const movingPieceType = selectedPiece.value.type

    const success = game.makeMove(selectedPiece.value.position, targetPosition)
    if (success) {
      const newState = game.getState()
      const latestMove = newState.moveHistory[newState.moveHistory.length - 1]
      emit('movePerformed', {
        move: latestMove,
        isCapture: !!targetPiece,
        isCheck: newState.isInCheck,
        pieceType: movingPieceType,
        capturedPieceType: targetPiece?.type,
      })

      selectedPiece.value = null
      availableMoves.value = []
      updateGameState()
    }
  }
}

// 可移动位置点击
const onMoveClick = (pos: Position) => {
  if (selectedPiece.value) {
    const oldState = game.getState()
    const targetPiece = oldState.pieces.find(
      (p) => p.position.x === pos.x && p.position.y === pos.y && p.alive,
    )

    const movingPieceType = selectedPiece.value.type

    const success = game.makeMove(selectedPiece.value.position, pos)
    if (success) {
      const newState = game.getState()
      const latestMove = newState.moveHistory[newState.moveHistory.length - 1]
      emit('movePerformed', {
        move: latestMove,
        isCapture: !!targetPiece,
        isCheck: newState.isInCheck,
        pieceType: movingPieceType,
        capturedPieceType: targetPiece?.type,
      })

      selectedPiece.value = null
      availableMoves.value = []
      updateGameState()
    }
  }
}

// 棋子是否被选中
const isPieceSelected = (piece: ChessPieceType) => {
  return selectedPiece.value?.id === piece.id
}

// 检查位置是否是攻击位置（有敌方棋子）
const isAttackPosition = (pos: Position) => {
  // 直接检查这个位置是否有敌方棋子
  const targetPiece = gameState.pieces.find(
    (p) => p.position.x === pos.x && p.position.y === pos.y && p.alive,
  )
  return targetPiece && selectedPiece.value && targetPiece.camp !== selectedPiece.value.camp
}

// 获取攻击位置上的棋子
const getAttackTargetPiece = (pos: Position) => {
  return gameState.pieces.find((p) => p.position.x === pos.x && p.position.y === pos.y && p.alive)
}

// 重置游戏
const resetGame = () => {
  game.reset()
  selectedPiece.value = null
  availableMoves.value = []
  updateGameState()
}

// 获取游戏状态文本
const getGameStatusText = () => {
  switch (gameState.gameStatus) {
    case 'playing':
      return gameState.isInCheck
        ? `${gameState.currentPlayer === 'red' ? '红方' : '黑方'}被将军!`
        : `轮到${gameState.currentPlayer === 'red' ? '红方' : '黑方'}下棋`
    case 'checkmate':
      return `${gameState.currentPlayer === 'red' ? '黑方' : '红方'}获胜!`
    case 'stalemate':
      return '和棋 - 无棋可走'
    case 'draw':
      return '和棋'
    default:
      return ''
  }
}

// 暴露方法给父组件
defineExpose({
  resetGame,
  getGameState: () => gameState,
  getGameStatusText,
})

onMounted(() => {
  updateGameState()
})
</script>

<style scoped>
.chess-board-container {
  display: inline-block;
  padding: 20px;
  background: linear-gradient(135deg, #f4e4bc, #e6d5a8);
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.board-wrapper {
  position: relative;
  border: 3px solid #8b4513;
  border-radius: 8px;
  overflow: hidden;
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
  width: 44px;
  height: 44px;
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
  width: 30px;
  height: 30px;
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
  width: 12px;
  height: 12px;
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
  height: 30px;
  pointer-events: none;
}

.board-cell {
  position: absolute;
  width: 30px;
  height: 30px;
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
  width: 52px;
  height: 52px;
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
