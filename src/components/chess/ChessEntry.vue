<template>
  <div class="chinese-chess-game">
    <!-- 回到首页按钮 -->
    <HomeButton />

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
          :showCoordinates="showCoordinates"
          @piece-click="onPieceClick"
          @board-click="onBoardClick"
          @move-click="onMoveClick"
        />
      </div>

      <!-- 底部控制区域 -->
      <div class="controls-portrait">
        <div class="control-buttons-grid">
          <!-- 第一行：游戏控制 -->
          <div class="control-row">
            <button @click="resetGame" class="control-btn primary">重新开始</button>
            <button @click="undoMove" class="control-btn" :disabled="!canUndo">悔棋</button>
          </div>

          <!-- 第二行：设置 -->
          <div class="control-row">
            <button @click="showSettings = true" class="control-btn settings">⚙️ 设置</button>
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
          <div class="control-row">
            <button @click="resetGame" class="control-btn primary">重新开始</button>
            <button @click="undoMove" class="control-btn" :disabled="!canUndo">悔棋</button>
          </div>
          <div class="control-row">
            <button @click="showSettings = true" class="control-btn settings">⚙️ 设置</button>
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
          :showCoordinates="showCoordinates"
          @piece-click="onPieceClick"
          @board-click="onBoardClick"
          @move-click="onMoveClick"
        />
      </div>
    </div>

    <!-- 游戏结束弹窗 -->
    <GameOverDialog
      :show="showGameOverDialog"
      :gameStatus="gameStatus"
      :currentPlayer="currentPlayer"
      :isInCheck="gameState.isInCheck"
      @close="hideGameOverDialog"
    />

    <!-- 走法历史弹窗 -->
    <MoveHistoryDialog
      :show="chessSettings.showMoveHistory"
      :moveHistory="moveHistory"
      :gameStartTime="gameStartTime"
      @close="closeMoveHistoryDialog"
    />

    <!-- 象棋设置弹窗 -->
    <ChessSettings
      :show="showSettings"
      @close="showSettings = false"
      @apply-settings="applySettings"
      @open-move-history="openMoveHistoryFromSettings"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
// @ts-ignore
import { useStore } from 'vuex'
import ChessBoard from './board/ChessBoard.vue'
import HomeButton from '../HomeButton.vue'
import GameOverDialog from './GameOverDialog.vue'
import MoveHistoryDialog from './MoveHistoryDialog.vue'
import ChessSettings from './ChessSettings.vue'
import { createChessSoundGenerator } from './ChessSound'
import { ChessGame, type ChessPiece as ChessPieceType, type Position, type Move } from './ChessGame'

const store = useStore()
const chessBoardRef = ref()

// 设置弹窗状态
const showSettings = ref(false)

// 从 store 获取设置，如果不存在则使用默认值
const chessSettings = computed(
  () =>
    store.state.chess?.settings || {
      gameMode: 'pvp',
      showCoordinates: true,
      showMoveHistory: false,
      enableSound: true,
      enableVoice: false,
    },
)

const globalSettings = computed(
  () =>
    store.state.globalSettings || {
      soundEnabled: true,
      voiceEnabled: false,
    },
)

// 使用计算属性从 store 获取设置
const showCoordinates = computed(() => chessSettings.value.showCoordinates)
const soundEnabled = computed(
  () => globalSettings.value.soundEnabled && chessSettings.value.enableSound,
)
const voiceEnabled = computed(
  () =>
    globalSettings.value.soundEnabled &&
    globalSettings.value.voiceEnabled &&
    chessSettings.value.enableSound &&
    chessSettings.value.enableVoice,
)

// 游戏实例 - 从store恢复或创建新游戏
const initializeGame = () => {
  const savedGame = store.state.chess.gameState.currentGame
  if (savedGame && chessSettings.value.autoSave) {
    try {
      return new ChessGame(savedGame)
    } catch (error) {
      console.warn('恢复游戏状态失败，创建新游戏:', error)
      return new ChessGame()
    }
  }
  return new ChessGame()
}

const game = initializeGame()
const gameState = reactive(game.getState())
const gameStatus = ref<'playing' | 'checkmate' | 'stalemate' | 'draw'>('playing')
const currentPlayer = ref<'red' | 'black'>('red')
const moveHistory = ref<Move[]>([])

// 选中的棋子和可移动位置
const selectedPiece = ref<ChessPieceType | null>(null)
const availableMoves = ref<Position[]>([])

// 游戏结束弹窗控制
const showGameOverDialog = ref(false)

// 游戏开始时间
const gameStartTime = ref(new Date())

// 响应式屏幕尺寸
const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)

// 判断是否为横屏
const isLandscape = computed(() => windowWidth.value > windowHeight.value)

// 根据屏幕大小计算棋盘尺寸
const boardSize = computed(() => {
  if (isLandscape.value) {
    // 横屏时棋盘占满可用空间，左侧留给控制面板
    // 根据屏幕宽度确定控制面板宽度
    let controlPanelWidth = 280 // 默认控制面板宽度
    if (windowWidth.value >= 1920) {
      controlPanelWidth = 360
    } else if (windowWidth.value >= 1440) {
      controlPanelWidth = 320
    }

    const layoutPadding = 20 // 整体布局左右padding (10px * 2)
    const layoutGap = 20 // 控制面板和棋盘之间的gap
    const boardContainerPadding = 20 // 棋盘容器的内边距

    // 计算棋盘可用空间
    const totalReservedWidth = controlPanelWidth + layoutPadding + layoutGap + boardContainerPadding
    const availableWidth = Math.max(windowWidth.value - totalReservedWidth, 300)
    const availableHeight = Math.max(windowHeight.value - layoutPadding, 400) // 减去上下padding

    // 中国象棋棋盘比例：宽600 × 高660（包含四个方向的坐标）
    const aspectRatio = 600 / 660

    // 优先按高度计算，充分利用屏幕高度
    let height = availableHeight * 0.99 // 留1%边距
    let width = height * aspectRatio

    // 如果宽度超出可用空间，则按宽度计算
    if (width > availableWidth) {
      width = availableWidth * 0.99 // 留1%边距
      height = width / aspectRatio
    }

    // 设置最小和最大尺寸
    const minSize = Math.min(windowWidth.value, windowHeight.value) * 0.4
    const maxSize = Math.min(windowWidth.value, windowHeight.value) * 0.9

    const minHeight = Math.max(minSize / aspectRatio, 350)
    const maxHeight = maxSize / aspectRatio
    const minWidth = minHeight * aspectRatio
    const maxWidth = maxHeight * aspectRatio

    // 应用尺寸限制
    height = Math.min(Math.max(height, minHeight), maxHeight)
    width = Math.min(Math.max(width, minWidth), maxWidth)

    // 对于超宽屏幕，适当增大棋盘尺寸
    if (windowWidth.value / windowHeight.value > 2) {
      const scaleFactor = Math.min(1.3, windowWidth.value / windowHeight.value / 2)
      height = Math.min(height * scaleFactor, availableHeight * 0.9)
      width = height * aspectRatio
    }

    return {
      width: Math.floor(width),
      height: Math.floor(height),
    }
  } else {
    // 竖屏时优化布局，不占满屏幕高度
    const availableWidth = windowWidth.value * 0.95 // 减少宽度占比，确保有足够边距

    // 基于屏幕宽度计算合适的棋盘尺寸，而不是依赖屏幕高度
    const aspectRatio = 600 / 660

    let width = availableWidth
    let height = width / aspectRatio

    // 确保最小尺寸
    const minWidth = 280
    const minHeight = minWidth / aspectRatio

    // 确保最大尺寸，避免棋盘过大
    const maxWidth = Math.min(windowWidth.value * 0.95, 450)
    const maxHeight = maxWidth / aspectRatio

    if (width < minWidth) {
      width = minWidth
      height = minHeight
    } else if (width > maxWidth) {
      width = maxWidth
      height = maxHeight
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
  console.log('更新游戏状态 - 存活棋子数量:', newState.pieces.filter((p) => p.alive).length)

  // 深度更新响应式状态
  Object.assign(gameState, {
    board: newState.board.map((row) => [...row]), // 深拷贝棋盘状态
    pieces: [...newState.pieces],
    currentPlayer: newState.currentPlayer,
    gameStatus: newState.gameStatus,
    isInCheck: newState.isInCheck,
    moveHistory: [...newState.moveHistory],
  })

  gameStatus.value = newState.gameStatus
  currentPlayer.value = newState.currentPlayer
  moveHistory.value = [...newState.moveHistory]

  // 显示游戏结束弹窗
  if (newState.gameStatus !== 'playing') {
    showGameOverDialog.value = true
  } else {
    showGameOverDialog.value = false
  }

  // 自动保存完整游戏状态（包括悔棋后的状态）
  if (chessSettings.value.autoSave) {
    try {
      const gameStateForSaving = game.getStateForSaving()
      store.commit('saveChessGame', gameStateForSaving)
    } catch (error) {
      console.warn('保存游戏状态失败:', error)
    }
  }
}

// 棋子点击事件
const onPieceClick = (piece: ChessPieceType) => {
  // 首先检查棋子是否存活
  if (!piece.alive) {
    console.warn('尝试点击已死亡的棋子:', piece)
    return
  }

  // 如果游戏已结束，不允许操作
  if (gameState.gameStatus !== 'playing') {
    return
  }

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

        // 立即清除选中状态和移动提示，无论游戏是否结束
        selectedPiece.value = null
        availableMoves.value = []

        // 游戏结束检查
        if (newState.gameStatus === 'checkmate') {
          const winner = newState.currentPlayer === 'red' ? '黑方' : '红方'
          soundGenerator.playCheckmateSound(winner, piece?.type)
        } else {
          // 只有在非将死情况下才播放普通音效
          // 播放音效
          soundGenerator.playCaptureSound(movingPieceType, piece.type)
          if (newState.isInCheck) {
            soundGenerator.playCheckSound()
          }
        }

        updateGameState()

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

      // 游戏结束检查
      if (newState.gameStatus === 'checkmate') {
        const winner = newState.currentPlayer === 'red' ? '黑方' : '红方'
        soundGenerator.playCheckmateSound(winner, targetPiece?.type)
      } else {
        // 只有在非将死情况下才播放普通音效
        // 播放音效
        if (targetPiece) {
          soundGenerator.playCaptureSound(movingPieceType, targetPiece.type)
        } else {
          soundGenerator.playMoveSound()
        }

        if (newState.isInCheck) {
          soundGenerator.playCheckSound()
        }
      }

      selectedPiece.value = null
      availableMoves.value = []
      updateGameState()
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
  gameStartTime.value = new Date()
  selectedPiece.value = null
  availableMoves.value = []
  showGameOverDialog.value = false
  updateGameState()
  soundGenerator.playGameStartSound()

  // 清除保存的游戏状态
  store.commit('clearChessGame')
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

// 隐藏游戏结束弹窗
const hideGameOverDialog = () => {
  showGameOverDialog.value = false
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

// 设置应用
const applySettings = (settings: any, globalSettings: any) => {
  // 更新象棋设置
  store.commit('updateChessSettings', settings)
  // 更新全局设置
  store.commit('updateGlobalSettings', globalSettings)
}

// 从设置中打开走法记录
const openMoveHistoryFromSettings = () => {
  // 走法记录弹窗的显示已经由设置控制，这里不需要额外操作
}

// 关闭走法历史弹窗（将设置中的开关关闭）
const closeMoveHistoryDialog = () => {
  store.commit('updateChessSettings', { showMoveHistory: false })
}

onMounted(() => {
  // 显示上次游戏的基本信息（如果有的话）
  const savedGame = store.state.chess?.gameState?.currentGame
  if (savedGame && chessSettings.value.autoSave) {
    console.log('上次游戏信息:', savedGame)
    // 只显示统计信息，不恢复游戏状态
  }

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
  min-height: auto;
}

/* 竖屏布局 */
.portrait-layout {
  display: flex;
  flex-direction: column;
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
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  width: 100%;
}

.controls-portrait {
  flex-shrink: 0;
  padding: 20px 0;
  margin-bottom: 20px;
}

.control-buttons-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  max-width: 400px;
  margin: 0 auto;
}

.control-row {
  display: flex;
  gap: 12px;
  justify-content: center;
  width: 100%;
}

/* 竖屏版本的声音控制和历史记录行 */
.sound-history-row-portrait {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background: rgba(248, 249, 250, 0.8);
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.switch-group-portrait {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

/* 竖屏版本的游戏控制按钮行 */
.game-control-row-portrait {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
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

/* 超大屏幕优化 */
@media (min-width: 1440px) {
  .controls-landscape {
    width: 320px;
    padding: 24px;
  }

  .controls-header h2 {
    font-size: 22px;
  }

  .control-btn {
    padding: 12px 18px;
    font-size: 15px;
  }
}

@media (min-width: 1920px) {
  .controls-landscape {
    width: 360px;
    padding: 28px;
  }
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
  gap: 12px;
  margin-top: 20px;
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

/* 走法历史按钮样式 */
.history-btn {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin: 0 3px;
  min-width: 80px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.history-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
}

.history-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 新增设置按钮样式 */
.control-btn.settings {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.control-btn.settings:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
}

.control-btn.history {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
}

.control-btn.history:hover {
  background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
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
  width: 100%;
  overflow: auto; /* 如果棋盘太大，允许滚动 */
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

/* 走法历史日志样式 */
.move-history,
.move-history-landscape {
  .bg-gradient-to-br {
    background-image: linear-gradient(to bottom right, #f9fafb, #f3f4f6);
  }

  .font-mono {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  }

  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: #2d3748;
    border-radius: 3px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #4a5568;
    border-radius: 3px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #718096;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .landscape-layout {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
    padding: 5px;
    gap: 10px;
  }

  .controls-landscape {
    width: 100%;
    order: 2;
    padding: 15px;
  }

  .board-container-landscape {
    order: 1;
    height: 65vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
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

  /* 竖屏布局的响应式调整 */
  .sound-history-row-portrait {
    padding: 10px;
    max-width: 100%;
  }

  .switch-group-portrait {
    gap: 15px;
  }

  .game-control-row-portrait {
    flex-wrap: wrap;
    justify-content: center;
  }
}

/* 针对平板横屏的优化 */
@media (min-width: 769px) and (max-width: 1024px) and (orientation: landscape) {
  .landscape-layout {
    padding: 8px;
    gap: 15px;
  }

  .controls-landscape {
    width: 260px;
    padding: 18px;
  }

  .controls-header h2 {
    font-size: 19px;
  }

  .control-btn {
    padding: 9px 14px;
    font-size: 13px;
  }
}

/* 针对小屏幕横屏设备的特殊优化 */
@media (max-width: 1024px) and (orientation: landscape) and (max-height: 768px) {
  .landscape-layout {
    padding: 5px;
    gap: 10px;
  }

  .controls-landscape {
    width: 240px;
    padding: 12px;
    overflow-y: auto;
    max-height: calc(100vh - 10px);
  }

  .board-container-landscape {
    flex: 1;
    min-width: 0; /* 允许flex项目缩小 */
    min-height: 0;
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

  /* 竖屏布局的小屏幕高度调整 */
  .sound-history-row-portrait {
    padding: 8px;
  }

  .switch-group-portrait {
    gap: 12px;
  }
}

/* 禁用状态样式 */
.control-btn.disabled,
.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.switch-item.disabled {
  opacity: 0.5;
}

.switch.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.switch.disabled input {
  cursor: not-allowed;
}

.switch.disabled .slider {
  cursor: not-allowed;
}
</style>
