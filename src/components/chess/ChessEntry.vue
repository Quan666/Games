<template>
  <div class="chinese-chess-game">
    <!-- 竖屏布局 -->
    <div v-if="!isLandscape" class="portrait-layout">
      <!-- 顶部游戏标题和状态 -->
      <div class="game-header">
        <h2>中国象棋</h2>
        <div class="game-status">
          <div class="status-text">{{ gameStatusText }}</div>
          <div
            class="current-player-indicator"
            :class="{ red: currentPlayer === 'red', black: currentPlayer === 'black' }"
          >
            <div class="player-circle"></div>
            <span class="player-text">{{ currentPlayer === 'red' ? '红方' : '黑方' }}</span>
          </div>
        </div>
      </div>

      <!-- 棋盘区域 -->
      <div class="board-container-portrait">
        <ChessBoard
          ref="chessBoardRef"
          :width="boardSize.width"
          :height="boardSize.height"
          :gameState="gameState"
          :selectedPiece="selectedPiece"
          :availableMoves="availableMoves"
          @piece-click="onPieceClick"
          @board-click="onBoardClick"
          @move-click="onMoveClick"
        />
      </div>

      <!-- 底部控制区域 -->
      <div class="controls-portrait">
        <div class="control-buttons">
          <button @click="toggleSound" class="control-btn" :class="{ active: soundEnabled }">
            {{ soundEnabled ? '🔊' : '🔇' }}
          </button>
          <button @click="toggleVoice" class="control-btn" :class="{ active: voiceEnabled }">
            {{ voiceEnabled ? '🗣️' : '🔇' }}
          </button>
          <button @click="resetGame" class="control-btn primary">重新开始</button>
          <button @click="undoMove" class="control-btn" :disabled="!canUndo">悔棋</button>
          <button @click="toggleHistory" class="control-btn">
            {{ showMoveHistory ? '隐藏' : '显示' }}历史
          </button>
        </div>

        <!-- 历史记录 -->
        <div v-if="showMoveHistory" class="move-history">
          <h3>走法历史</h3>
          <div class="history-list">
            <div v-for="(move, index) in moveHistory" :key="index" class="move-item">
              <span class="move-number">{{ index + 1 }}.</span>
              <span class="move-text">
                {{ formatMove(move) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 横屏布局 -->
    <div v-else class="landscape-layout">
      <!-- 左侧控制面板 -->
      <div class="controls-landscape">
        <!-- 标题和状态 -->
        <div class="controls-header">
          <h2>中国象棋</h2>
          <div class="game-status-compact">
            <div class="status-text">{{ gameStatusText }}</div>
            <div
              class="current-player-indicator"
              :class="{ red: currentPlayer === 'red', black: currentPlayer === 'black' }"
            >
              <div class="player-circle"></div>
              <span class="player-text">{{ currentPlayer === 'red' ? '红方' : '黑方' }}</span>
            </div>
          </div>
        </div>

        <!-- 控制按钮 -->
        <div class="control-buttons-landscape">
          <!-- 声音控制和历史记录 -->
          <div class="sound-history-row">
            <div class="switch-group">
              <label class="switch-item">
                <span class="switch-label">🔊 音效</span>
                <div class="switch" :class="{ 'switch-on': soundEnabled }">
                  <input type="checkbox" :checked="soundEnabled" @change="toggleSound" />
                  <span class="slider"></span>
                </div>
              </label>
              <label class="switch-item">
                <span class="switch-label">🗣️ 语音</span>
                <div class="switch" :class="{ 'switch-on': voiceEnabled }">
                  <input type="checkbox" :checked="voiceEnabled" @change="toggleVoice" />
                  <span class="slider"></span>
                </div>
              </label>
              <label class="switch-item">
                <span class="switch-label">📚 历史</span>
                <div class="switch" :class="{ 'switch-on': showMoveHistory }">
                  <input type="checkbox" :checked="showMoveHistory" @change="toggleHistory" />
                  <span class="slider"></span>
                </div>
              </label>
            </div>
          </div>

          <!-- 游戏控制按钮 -->
          <div class="game-control-row">
            <button @click="resetGame" class="control-btn primary">重新开始</button>
            <button @click="undoMove" class="control-btn" :disabled="!canUndo">悔棋</button>
          </div>
        </div>

        <!-- 历史记录 -->
        <div v-if="showMoveHistory" class="move-history-landscape">
          <h3>走法历史</h3>
          <div class="history-list-landscape">
            <div v-for="(move, index) in moveHistory" :key="index" class="move-item">
              <span class="move-number">{{ index + 1 }}.</span>
              <span class="move-text">
                {{ formatMove(move) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧棋盘区域 - 占满剩余空间和高度 -->
      <div class="board-container-landscape">
        <ChessBoard
          ref="chessBoardRef"
          :width="boardSize.width"
          :height="boardSize.height"
          :gameState="gameState"
          :selectedPiece="selectedPiece"
          :availableMoves="availableMoves"
          @piece-click="onPieceClick"
          @board-click="onBoardClick"
          @move-click="onMoveClick"
        />
      </div>
    </div>

    <!-- 游戏结束对话框 -->
    <div v-if="gameStatus !== 'playing'" class="game-over-modal">
      <div class="modal-content">
        <h3>游戏结束</h3>
        <p>{{ gameStatusText }}</p>
        <div class="modal-actions">
          <button @click="resetGame" class="primary-btn">重新开始</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import ChessBoard from './board/ChessBoard.vue'
import { createChessSoundGenerator } from './ChessSound'
import { ChessGame, type ChessPiece as ChessPieceType, type Position, type Move } from './ChessGame'

const chessBoardRef = ref()
const showMoveHistory = ref(true)
const soundEnabled = ref(true)
const voiceEnabled = ref(true)

// 游戏实例
const game = new ChessGame()
const gameState = reactive(game.getState())
const gameStatus = ref('playing')
const currentPlayer = ref('red')
const moveHistory = ref<Move[]>([])

// 选中的棋子和可移动位置
const selectedPiece = ref<ChessPieceType | null>(null)
const availableMoves = ref<Position[]>([])

// 响应式屏幕尺寸
const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)

// 判断是否为横屏
const isLandscape = computed(() => windowWidth.value > windowHeight.value)

// 根据屏幕大小计算棋盘尺寸
const boardSize = computed(() => {
  if (isLandscape.value) {
    // 横屏时棋盘占满高度，左侧留给控制面板
    const controlPanelWidth = 320 // 控制面板宽度加间距
    const availableWidth = windowWidth.value - controlPanelWidth
    const availableHeight = windowHeight.value - 40 // 减去上下padding

    // 中国象棋棋盘比例：宽540 × 高600
    const aspectRatio = 540 / 600

    // 首先按高度计算，让棋盘占满高度
    let height = availableHeight
    let width = height * aspectRatio

    // 如果宽度超出可用空间，则按宽度计算
    if (width > availableWidth) {
      width = availableWidth
      height = width / aspectRatio
    }

    // 确保最小尺寸
    const minHeight = Math.min(400, availableHeight * 0.8)
    const minWidth = minHeight * aspectRatio

    if (height < minHeight) {
      height = minHeight
      width = minWidth
    }

    return {
      width: Math.floor(width),
      height: Math.floor(height),
    }
  } else {
    // 竖屏时保持原有逻辑
    const availableWidth = windowWidth.value * 0.9
    const availableHeight = windowHeight.value * 0.6 // 减少高度占比，为控制面板留空间

    // 保持棋盘的宽高比例 (540:600)
    const aspectRatio = 540 / 600

    let width = Math.min(availableWidth, availableHeight * aspectRatio)
    let height = width / aspectRatio

    // 确保最小尺寸
    const minWidth = 300
    const minHeight = minWidth / aspectRatio

    if (width < minWidth) {
      width = minWidth
      height = minHeight
    }

    return {
      width: Math.floor(width),
      height: Math.floor(height),
    }
  }
})

// 音效管理器
const soundGenerator = createChessSoundGenerator(
  () => soundEnabled.value,
  () => voiceEnabled.value,
)

// 计算游戏状态文本
const gameStatusText = computed(() => {
  switch (gameStatus.value) {
    case 'playing':
      return gameState.isInCheck
        ? `${currentPlayer.value === 'red' ? '红方' : '黑方'}被将军!`
        : `轮到${currentPlayer.value === 'red' ? '红方' : '黑方'}下棋`
    case 'checkmate':
      return `${currentPlayer.value === 'red' ? '黑方' : '红方'}获胜!`
    case 'stalemate':
      return '和棋 - 无棋可走'
    case 'draw':
      return '和棋'
    default:
      return ''
  }
})

// 是否可以悔棋
const canUndo = computed(() => moveHistory.value.length > 0)

// 初始化游戏状态
const updateGameState = () => {
  const newState = game.getState()
  console.log('更新游戏状态 - 新状态棋子数量:', newState.pieces.filter((p) => p.alive).length)

  // 深度更新响应式状态
  Object.assign(gameState, {
    pieces: [...newState.pieces],
    currentPlayer: newState.currentPlayer,
    gameStatus: newState.gameStatus,
    isInCheck: newState.isInCheck,
    moveHistory: [...newState.moveHistory],
  })

  gameStatus.value = newState.gameStatus
  currentPlayer.value = newState.currentPlayer
  moveHistory.value = [...newState.moveHistory]

  console.log('更新后存活棋子数量:', newState.pieces.filter((p) => p.alive).length)
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
    soundGenerator.playPiecePlaceSound(piece.type)
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
      soundGenerator.playPiecePlaceSound(piece.type)
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
      const movingPieceType = selectedPiece.value.type
      const success = game.makeMove(selectedPiece.value.position, targetPosition)
      if (success) {
        const newState = game.getState()

        // 播放音效
        soundGenerator.playCaptureSound(movingPieceType, piece.type)
        if (newState.isInCheck) {
          soundGenerator.playCheckSound()
        }

        selectedPiece.value = null
        availableMoves.value = []
        updateGameState()

        // 游戏结束检查
        if (newState.gameStatus === 'checkmate') {
          soundGenerator.playGameOverSound(false)
        }

        console.log('吃子完成，清除选中状态和移动提示')
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

      // 播放音效
      if (targetPiece) {
        soundGenerator.playCaptureSound(movingPieceType, targetPiece.type)
      } else {
        soundGenerator.playMoveSound()
      }

      if (newState.isInCheck) {
        soundGenerator.playCheckSound()
      }

      selectedPiece.value = null
      availableMoves.value = []
      updateGameState()

      // 游戏结束检查
      if (newState.gameStatus === 'checkmate') {
        soundGenerator.playGameOverSound(false)
      }
    }
  }
}

// 可移动位置点击
const onMoveClick = (pos: Position) => {
  onBoardClick(pos.x, pos.y)
}

// 重置游戏
const resetGame = () => {
  game.reset()
  selectedPiece.value = null
  availableMoves.value = []
  updateGameState()
  soundGenerator.playGameStartSound()
}

// 悔棋
const undoMove = () => {
  if (canUndo.value) {
    const success = game.undoMove()
    if (success) {
      // 清除选中状态
      selectedPiece.value = null
      availableMoves.value = []

      // 更新游戏状态
      updateGameState()

      // 播放悔棋音效
      soundGenerator.playUndoSound()

      console.log('悔棋成功')
    } else {
      console.log('悔棋失败')
    }
  }
}

// 处理窗口尺寸变化
// 响应式布局处理
const handleResize = () => {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
}

// TODO: 这些事件处理器可能在未来版本中使用
// const onGameStatusChange = (status: string) => {
//   gameStatus.value = status
//   // 播放游戏结束音效
//   if (status === 'checkmate') {
//     soundGenerator.playGameOverSound(false)
//   }
// }

// const onPlayerChange = (player: string) => {
//   currentPlayer.value = player
// }

// const onMovePerformed = (data: any) => {
//   const { isCapture, isCheck, pieceType, capturedPieceType } = data
//   // 播放音效
//   if (isCapture && capturedPieceType) {
//     soundGenerator.playCaptureSound(pieceType, capturedPieceType)
//   } else {
//     soundGenerator.playMoveSound()
//   }
//   if (isCheck) {
//     soundGenerator.playCheckSound()
//   }
// }

// const onPieceSelected = () => {
//   // 棋子选中时的处理
// }

// 音效控制
const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value
}

const toggleVoice = () => {
  voiceEnabled.value = !voiceEnabled.value
}

// 历史记录控制
const toggleHistory = () => {
  showMoveHistory.value = !showMoveHistory.value
}

// 格式化走法文本
const formatMove = (move: Move) => {
  if (!move) return ''

  const pieceNames: Record<string, string> = {
    king: '帅/将',
    advisor: '仕/士',
    elephant: '相/象',
    horse: '马',
    chariot: '车',
    cannon: '炮',
    pawn: '兵/卒',
  }

  const pieceName = pieceNames[move.piece.type] || move.piece.type
  const fromPos = `(${move.from.x},${move.from.y})`
  const toPos = `(${move.to.x},${move.to.y})`

  return `${pieceName}${fromPos}→${toPos}`
}

onMounted(() => {
  updateGameState()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* 基础样式 */
.chinese-chess-game {
  font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
}

/* 竖屏布局 */
.portrait-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.game-header {
  text-align: center;
  padding: 10px 0;
  flex-shrink: 0;
}

.game-header h2 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.game-status {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.status-text {
  font-size: 16px;
  font-weight: bold;
  color: #34495e;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.current-player-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.current-player-indicator.red {
  background: linear-gradient(135deg, #dc3545, #a71e2a);
  color: white;
  border-color: #dc3545;
  box-shadow: 0 0 15px rgba(220, 53, 69, 0.4);
}

.current-player-indicator.black {
  background: linear-gradient(135deg, #4a4a4a, #1a1a1a);
  color: white;
  border-color: #4a4a4a;
  box-shadow: 0 0 15px rgba(74, 74, 74, 0.4);
}

.player-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse-player 2s infinite;
}

@keyframes pulse-player {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.board-container-portrait {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
}

.controls-portrait {
  flex-shrink: 0;
  padding: 10px 0;
}

.control-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

/* 横屏布局 */
.landscape-layout {
  height: 100vh;
  display: flex;
  padding: 10px;
  gap: 20px;
}

.controls-landscape {
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-shrink: 0;
  overflow-y: auto;
}

.controls-header {
  text-align: center;
}

.controls-header h2 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: bold;
}

.game-status-compact {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.control-buttons-landscape {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 声音控制和历史记录行 */
.sound-history-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background: rgba(248, 249, 250, 0.8);
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.switch-group {
  display: flex;
  gap: 20px;
}

.switch-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.switch-label {
  font-size: 12px;
  color: #495057;
  font-weight: 500;
  text-align: center;
}

/* Switch 样式 */
.switch {
  position: relative;
  width: 40px;
  height: 20px;
  background-color: #ccc;
  border-radius: 20px;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.switch.switch-on {
  background-color: #28a745;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: white;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.switch-on .slider {
  transform: translateX(20px);
}

.history-btn {
  min-width: 70px;
  padding: 8px 12px;
  font-size: 12px;
}

/* 游戏控制按钮行 */
.game-control-row {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.board-container-landscape {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  overflow: hidden;
}

/* 控制按钮样式 */
.control-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #6c757d, #495057);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 80px;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.control-btn:active {
  transform: translateY(0);
}

.control-btn.primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
}

.control-btn.primary:hover {
  background: linear-gradient(135deg, #0056b3, #004085);
}

.control-btn.active {
  background: linear-gradient(135deg, #28a745, #1e7e34);
}

.control-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.control-btn:disabled:hover {
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 历史记录样式 */
.move-history,
.move-history-landscape {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.move-history h3,
.move-history-landscape h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 16px;
  text-align: center;
}

.history-list,
.history-list-landscape {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.history-list-landscape {
  max-height: 300px;
}

.move-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  font-size: 12px;
  transition: all 0.2s ease;
}

.move-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateX(3px);
}

.move-number {
  font-weight: bold;
  color: #007bff;
  min-width: 20px;
}

.move-text {
  color: #495057;
  flex: 1;
}

/* 游戏结束对话框 */
.game-over-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
}

.modal-content h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 24px;
}

.modal-content p {
  margin: 0 0 20px 0;
  color: #495057;
  font-size: 16px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.primary-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

.primary-btn:hover {
  background: linear-gradient(135deg, #0056b3, #004085);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .landscape-layout {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }

  .controls-landscape {
    width: 100%;
    order: 2;
  }

  .board-container-landscape {
    order: 1;
    height: 60vh;
  }

  .sound-history-row {
    flex-direction: column;
    gap: 10px;
    align-items: center;
    padding: 10px;
  }

  .switch-group {
    justify-content: center;
    gap: 15px;
  }

  .switch-item {
    gap: 6px;
  }

  .switch-label {
    font-size: 11px;
  }

  .game-control-row {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-height: 600px) {
  .landscape-layout {
    padding: 5px;
    gap: 10px;
  }

  .controls-landscape {
    width: 250px;
    padding: 15px;
  }

  .controls-header h2 {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .control-btn {
    padding: 8px 12px;
    font-size: 12px;
  }

  .sound-history-row {
    padding: 8px;
  }

  .switch-group {
    gap: 12px;
  }

  .switch-item {
    gap: 5px;
  }

  .switch-label {
    font-size: 10px;
  }

  .switch {
    width: 32px;
    height: 16px;
  }

  .slider {
    width: 12px;
    height: 12px;
    top: 2px;
    left: 2px;
  }

  .switch-on .slider {
    transform: translateX(16px);
  }
}
</style>
