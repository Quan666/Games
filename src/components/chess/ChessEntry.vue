<template>
  <div class="chess-game relative">
    <!-- 回到首页按钮 -->
    <HomeButton />

    <!-- 胜利弹窗 -->
    <GameOverDialog
      :show="showGameOverDialog"
      :gameStatus="gameStatus"
      :currentPlayer="currentPlayer"
      :isInCheck="gameState.isInCheck"
      @close="closeGameOverDialog"
    />

    <!-- 游戏设置弹窗 -->
    <GameSettings
      :show="showGameSettings"
      @close="showGameSettings = false"
      @apply-settings="onApplySettings"
      @open-move-history="openMoveHistory"
    />

    <!-- AI设置弹窗 -->
    <ChessAISettings
      :show="showAISettings"
      :config="gameConfig"
      :aiStatus="aiStatus"
      @update:config="onConfigUpdate"
      @stop-ai="onStopAI"
      @close="showAISettings = false"
    />

    <!-- 棋谱弹窗 -->
    <MoveHistoryDialog
      :show="showMoveHistory"
      :move-history="moveHistory"
      :game-start-time="gameStartTime"
      @close="closeMoveHistory"
    />

    <!-- 竖屏布局 -->
    <div
      v-if="isPortrait"
      class="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col"
    >
      <!-- 顶部信息 -->
      <ChessGameInfoHeader
        :current-player="currentPlayer"
        :move-count="moveHistory.length"
        :game-mode="gameConfig.gameMode || 'pvp'"
        :player-camp="gameConfig.playerCamp"
        :ai-thinking="aiStatus?.thinking || false"
        :ai-status="aiStatus"
        :ai-config="gameConfig.aiConfig"
        :game-result="gameResult"
        :is-in-check="gameState.isInCheck"
        :is-checkmate="gameStatus === 'checkmate'"
      />

      <!-- 棋盘区域 -->
      <div class="flex flex-col items-stretch flex-1">
        <div class="flex justify-center px-1">
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
        <div class="flex-1 flex flex-col justify-stretch">
          <!-- 底部控制区 -->
          <ChessGameControlPanel
            :can-undo="canUndo"
            @reset-game="resetGame"
            @undo-move="undoMove"
            @toggle-ai-vs-ai="toggleAiVsAi"
          />
        </div>
      </div>
    </div>

    <!-- 横屏布局 -->
    <div v-else class="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex">
      <!-- 左侧区域 -->
      <div class="w-80 bg-white/95 backdrop-blur-sm p-6 shadow-lg flex flex-col gap-6">
        <!-- 顶部信息 -->
        <ChessGameInfoHeader
          :current-player="currentPlayer"
          :move-count="moveHistory.length"
          :game-mode="gameConfig.gameMode || 'pvp'"
          :player-camp="gameConfig.playerCamp"
          :ai-thinking="aiStatus?.thinking || false"
          :ai-status="aiStatus"
          :ai-config="gameConfig.aiConfig"
          :game-result="gameResult"
          :is-in-check="gameState.isInCheck"
          :is-checkmate="gameStatus === 'checkmate'"
        />

        <!-- 左侧控制面板 -->
        <ChessGameControlPanel
          :can-undo="canUndo"
          @reset-game="resetGame"
          @undo-move="undoMove"
          @toggle-ai-vs-ai="toggleAiVsAi"
        />
      </div>

      <!-- 中间棋盘 -->
      <div class="flex-1 flex items-center justify-center">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
// @ts-ignore
import { useStore } from 'vuex'
import ChessBoard from './board/ChessBoard.vue'
import GameOverDialog from './GameOverDialog.vue'
import MoveHistoryDialog from './MoveHistoryDialog.vue'
import HomeButton from '../HomeButton.vue'
import ChessGameControlPanel from './ChessGameControlPanel.vue'
import ChessGameInfoHeader from './ChessGameInfoHeader.vue'
import GameSettings from './ChessSettings.vue'
import ChessAISettings from './ChessAISettings.vue'
import { ChessGame, type Position, type GameConfig, type ChessPiece } from './ChessGame'
import { createChessSoundGenerator } from './ChessSound'

const store = useStore()
const chessBoardRef = ref()

// 响应式状态
const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)

// 从 store 获取设置，如果不存在则使用默认值
const chessSettings = computed(
  () =>
    store.state.chess?.settings || {
      gameMode: 'pvp',
      playerCamp: 'red',
      showCoordinates: true,
      showMoveHistory: false,
      enableSound: true,
      enableVoice: false,
      autoSave: true,
    },
)

const globalSettings = computed(
  () =>
    store.state.globalSettings || {
      soundEnabled: true,
      voiceEnabled: false,
    },
)

// 弹窗状态 - 从store获取
const showGameSettings = computed({
  get: () => store.state.chess?.ui?.showGameSettings || false,
  set: (value) => store.commit('chess/setShowGameSettings', value),
})
const showAISettings = computed({
  get: () => store.state.chess?.ui?.showAISettings || false,
  set: (value) => store.commit('chess/setShowAISettings', value),
})
const showGameOverDialog = ref(false)

// 从 store 读取走法记录显示状态
const showMoveHistory = computed(() => store.state.chess?.settings?.showMoveHistory || false)

// 使用计算属性从 store 获取设置
const showCoordinates = computed(() => chessSettings.value.showCoordinates)
const soundEnabled = computed(
  () => globalSettings.value.soundEnabled && chessSettings.value.enableSound,
)
const voiceEnabled = computed(
  () =>
    globalSettings.value.soundEnabled &&
    globalSettings.value.voiceEnabled &&
    chessSettings.value.enableVoice,
)

// 计算属性
const isPortrait = computed(() => windowWidth.value < windowHeight.value)

// 根据屏幕大小计算棋盘尺寸
const boardSize = computed(() => {
  if (!isPortrait.value) {
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
    // 竖屏时让棋盘占满宽度，但要考虑头部和底部组件的高度
    const availableWidth = windowWidth.value * 0.98 // 留出极少边距，基本占满宽度

    // 估算头部和底部组件占用的高度
    const headerHeight = 120 // ChessGameInfoHeader 大约高度
    const controlPanelHeight = 80 // ChessGameControlPanel 大约高度
    const layoutPadding = 20 // 上下边距
    const reservedHeight = headerHeight + controlPanelHeight + layoutPadding

    // 计算棋盘可用的最大高度
    const availableHeight = windowHeight.value - reservedHeight

    // 基于屏幕宽度和可用高度计算合适的棋盘尺寸
    const aspectRatio = 600 / 660

    let width = availableWidth
    let height = width / aspectRatio

    // 如果按宽度计算的高度超过可用高度，则按高度重新计算
    if (height > availableHeight) {
      height = availableHeight * 0.95 // 留5%的缓冲空间
      width = height * aspectRatio
    }

    // 确保最小尺寸
    const minWidth = 280
    const minHeight = minWidth / aspectRatio

    // 确保不超过屏幕宽度
    const maxWidth = windowWidth.value * 0.95
    const maxHeight = maxWidth / aspectRatio

    if (width < minWidth) {
      width = minWidth
      height = minHeight
    } else if (width > maxWidth) {
      width = maxWidth
      height = maxHeight
    }

    // 最终检查高度是否合适
    if (height > availableHeight * 0.95) {
      height = availableHeight * 0.95
      width = height * aspectRatio
    }

    return {
      width: Math.floor(width),
      height: Math.floor(height),
    }
  }
})

// 游戏实例和状态
const initializeGame = () => {
  const savedGame = store.state.chess?.gameState?.currentGame
  const autoSave = store.state.chess?.settings?.autoSave ?? true
  if (savedGame && autoSave) {
    try {
      console.log('尝试恢复游戏状态:', savedGame)
      return new ChessGame(savedGame)
    } catch (error) {
      console.warn('恢复游戏状态失败，创建新游戏:', error)
      return new ChessGame()
    }
  }
  console.log('创建新游戏')
  return new ChessGame()
}

const game = initializeGame()
const gameState = reactive(game.getState())
const gameStatus = ref<'playing' | 'checkmate' | 'stalemate' | 'draw'>('playing')
const currentPlayer = ref<'red' | 'black'>('red')
const moveHistory = ref<any[]>([])

// 选中的棋子和可移动位置
const selectedPiece = ref<ChessPiece | null>(null)
const availableMoves = ref<Position[]>([])

// 游戏开始时间
const gameStartTime = ref(new Date())

// AI相关状态
const aiStatus = ref<any>(null)
const aiVsAiRunning = ref(false)

// 游戏配置
const gameConfig = reactive<GameConfig>({
  gameMode: 'pvp',
  playerCamp: 'red',
  enableAI: false,
  aiConfig: {
    engine: 'pikafish',
    difficulty: 'medium',
    thinkingTime: 5,
    depth: 8,
    threads: 1,
    hashSize: 16,
    // Pikafish完整的UCI选项
    skillLevel: 20, // Skill Level: 0-20, 默认20
    multiPV: 1, // MultiPV: 1-128, 默认1
    moveOverhead: 10, // Move Overhead: 0-5000ms, 默认10
    repetitionRule: 'AsianRule', // Repetition Rule
    drawRule: 'None', // Draw Rule
    sixtyMoveRule: true, // Sixty Move Rule, 默认true
    maxCheckCount: 0, // MaxCheckCount: 0-1000, 默认0
    limitStrength: false, // UCI_LimitStrength, 默认false
    uciElo: 1280, // UCI_Elo: 1280-3133, 默认1280
    ponder: false, // Ponder, 默认false
  },
})

// 音效管理器
const chessSound = createChessSoundGenerator(
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
const canUndo = computed(
  () =>
    moveHistory.value.length > 0 &&
    !aiStatus.value?.thinking &&
    !store.state.chess?.gameState?.aiVsAiRunning,
)

// 游戏结果
const gameResult = computed(() => gameStatusText.value)

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

  // 同步更新store中的游戏状态
  store.commit('chess/updateGameState', {
    moveHistory: [...newState.moveHistory],
    gameOver: newState.gameStatus !== 'playing',
    aiThinking: false,
  })

  // 显示游戏结束弹窗
  if (newState.gameStatus !== 'playing') {
    showGameOverDialog.value = true
  } else {
    showGameOverDialog.value = false
  }

  // 自动保存完整游戏状态（包括悔棋后的状态）
  const autoSave = store.state.chess?.settings?.autoSave ?? true
  if (autoSave) {
    try {
      const gameStateForSaving = game.getStateForSaving()
      store.commit('saveChessGame', gameStateForSaving)
      console.log('游戏状态已保存')
    } catch (error) {
      console.warn('保存游戏状态失败:', error)
    }
  }
}

// 初始化
onMounted(() => {
  // 显示上次游戏的基本信息（如果有的话）
  const savedGame = store.state.chess?.gameState?.currentGame
  const autoSave = store.state.chess?.settings?.autoSave ?? true
  if (savedGame && autoSave) {
    console.log('上次游戏信息:', savedGame)
  }

  updateGameState()
  window.addEventListener('resize', handleResize)

  // 从store加载配置
  const savedConfig = store.state.chess?.gameConfig
  if (savedConfig) {
    Object.assign(gameConfig, savedConfig)
  }

  // 同步store中的gameMode到本地gameConfig
  if (chessSettings.value.gameMode) {
    gameConfig.gameMode = chessSettings.value.gameMode
    gameConfig.enableAI = chessSettings.value.gameMode !== 'pvp'
  }
})

// 监听store中的gameMode变化并同步到gameConfig
watch(
  () => chessSettings.value.gameMode,
  (newGameMode) => {
    if (newGameMode && gameConfig.gameMode !== newGameMode) {
      gameConfig.gameMode = newGameMode
      gameConfig.enableAI = newGameMode !== 'pvp'
      console.log('GameMode已同步:', newGameMode)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 响应式处理
const handleResize = () => {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
}

const updateAvailableMoves = () => {
  if (selectedPiece.value && chessSettings.value) {
    availableMoves.value = game.getValidMoves(selectedPiece.value)
  } else {
    availableMoves.value = []
  }
}

// 棋子点击事件
const onPieceClick = (piece: ChessPiece) => {
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
    updateAvailableMoves()
    console.log(
      '选中棋子:',
      piece.type,
      '在位置:',
      piece.position,
      '可移动位置:',
      availableMoves.value,
    )
    chessSound.playPiecePlaceSound(piece.type)
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
      updateAvailableMoves()
      console.log(
        '重新选中棋子:',
        piece.type,
        '在位置:',
        piece.position,
        '可移动位置:',
        availableMoves.value,
      )
      chessSound.playPiecePlaceSound(piece.type)
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
          chessSound.playCheckmateSound(winner, piece?.type)
        } else {
          // 只有在非将死情况下才播放普通音效
          // 播放音效
          chessSound.playCaptureSound(movingPieceType, piece.type)
          if (newState.isInCheck) {
            chessSound.playCheckSound()
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
        chessSound.playCheckmateSound(winner, targetPiece?.type)
      } else {
        // 只有在非将死情况下才播放普通音效
        // 播放音效
        if (targetPiece) {
          chessSound.playCaptureSound(movingPieceType, targetPiece.type)
        } else {
          chessSound.playMoveSound()
        }

        if (newState.isInCheck) {
          chessSound.playCheckSound()
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
  chessSound.playGameStartSound()

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
      chessSound.playUndoSound()

      console.log('悔棋成功')
    } else {
      console.log('悔棋失败')
    }
  }
}

const openMoveHistory = () => {
  store.commit('toggleChessMoveHistory')
}

const closeMoveHistory = () => {
  store.commit('toggleChessMoveHistory')
}

// 弹窗控制
const closeGameOverDialog = () => {
  showGameOverDialog.value = false
}

// 游戏设置
const onApplySettings = (
  chessSettings: any,
  globalSettings: any,
  aiVsAiConfig?: any,
  aiConfig?: any,
) => {
  // 更新象棋设置
  store.commit('updateChessSettings', chessSettings)
  // 更新全局设置
  store.commit('updateGlobalSettings', globalSettings)
  // 更新AI对战AI配置
  if (aiVsAiConfig) {
    store.commit('chess/updateAiVsAiConfig', aiVsAiConfig)
  }
  // 更新人机模式AI配置
  if (aiConfig) {
    store.commit('chess/updateAiConfig', aiConfig)
  }
}

const onConfigUpdate = async (newConfig: GameConfig) => {
  Object.assign(gameConfig, newConfig)

  // 保存到store
  store.commit('saveChessGameConfig', gameConfig)
}

const onStopAI = () => {
  // TODO: 实现停止AI思考的功能
  console.log('停止AI思考')
}

const toggleAiVsAi = () => {
  aiVsAiRunning.value = !aiVsAiRunning.value
  // TODO: 实现AI对战功能
  console.log('AI对战模式:', aiVsAiRunning.value ? '开启' : '关闭')
}
</script>

<style scoped>
/* 移除焦点边框 */
button:focus,
input:focus,
select:focus {
  outline: none !important;
  box-shadow: none !important;
}

/* 确保所有交互元素都没有焦点边框 */
*:focus {
  outline: none !important;
}
</style>
