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
            @update:gameState="onGameStateUpdate"
            @animationComplete="onAnimationComplete"
          />
        </div>
        <div class="flex-1 flex flex-col justify-stretch">
          <!-- 底部控制区 -->
          <ChessGameControlPanel
            :can-undo="canUndo"
            @reset-game="resetGame"
            @undo-move="undoMove"
            @toggle-ai-vs-ai="toggleAiVsAi"
            @test-ai="testAI"
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
          @test-ai="testAI"
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
          @update:gameState="onGameStateUpdate"
          @animationComplete="onAnimationComplete"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive, watch } from 'vue'
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
import { ChessGame, type Position, type GameConfig, type ChessPiece } from './ChessGameWrapper'

import { createChessSoundGenerator } from './core/ChessSound'

const store = useStore()
const chessBoardRef = ref()

// 初始化游戏配置 - 直接使用store中的数据
function initializeGameConfig(): GameConfig {
  const storeSettings = store.state.chess?.settings || {}
  const storeGameConfig = store.state.chess?.gameConfig || {}

  console.log('=== 从store初始化配置 ===')

  // 直接使用store中的配置，确保单一数据源
  const config: GameConfig = {
    gameMode: storeSettings.gameMode || 'pvp',
    playerCamp: storeSettings.playerCamp || 'red',
    enableAI: (storeSettings.gameMode || 'pvp') !== 'pvp',
    aiConfig: storeGameConfig.aiConfig || {
      threads: 1,
      hashSize: 64,
      depth: 8,
      timeLimit: 5,
      skillLevel: 12,
      multiPV: 1,
      moveOverhead: 10,
      repetitionRule: 'AsianRule',
      drawRule: 'None',
      sixtyMoveRule: true,
      maxCheckCount: 3,
      limitStrength: false,
      uciElo: 2800,
      ponder: false,
    },
    aiVsAiConfig: storeGameConfig.aiVsAiConfig || {
      redAI: {
        threads: 1,
        hashSize: 64,
        depth: 8,
        timeLimit: 5,
        skillLevel: 18,
        multiPV: 1,
        moveOverhead: 10,
        repetitionRule: 'AsianRule',
        drawRule: 'None',
        sixtyMoveRule: true,
        maxCheckCount: 3,
        limitStrength: false,
        uciElo: 2800,
        ponder: false,
      },
      blackAI: {
        threads: 1,
        hashSize: 64,
        depth: 8,
        timeLimit: 5,
        skillLevel: 16,
        multiPV: 1,
        moveOverhead: 10,
        repetitionRule: 'AsianRule',
        drawRule: 'None',
        sixtyMoveRule: true,
        maxCheckCount: 3,
        limitStrength: false,
        uciElo: 2800,
        ponder: false,
      },
      gameSpeed: 2000,
    },
  }

  console.log('✅ 配置初始化完成:', config)
  return config
}

// 初始化游戏 - 根据store中的数据初始化ChessGame
function initializeGame(): ChessGame {
  const config = initializeGameConfig()
  const savedState = store.state.chess?.gameState?.currentGame

  console.log('=== 游戏初始化 ===')
  console.log('Saved state:', !!savedState)

  // 创建 ChessGame 实例
  const game = new ChessGame(savedState, config)

  console.log(savedState ? '✅ 恢复保存的游戏状态' : 'ℹ️ 创建新游戏')
  return game
}

// 响应式状态
const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)

// 从 store 获取设置
const chessSettings = computed(
  () =>
    store.state.chess?.settings || {
      gameMode: 'pvp',
      playerCamp: 'red',
      showCoordinates: true,
      showMoveHistory: false,
      enableSound: true,
      enableVoice: false,
      // 不再需要 autoSave 设置项，默认自动保存
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

// 音效管理器
const chessSound = createChessSoundGenerator(
  () => soundEnabled.value,
  () => voiceEnabled.value,
)

// 游戏配置 - 从游戏实例获取当前配置
const gameConfig = computed(() => game.getConfig())

// 计算属性
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

const canUndo = computed(
  () => moveHistory.value.length > 0 && !aiStatus.value?.thinking && !aiVsAiRunning.value,
)
const gameResult = computed(() => gameStatusText.value)

// 游戏状态更新函数 - 只在ChessGame数据变化时更新store
const updateGameState = () => {
  const newState = game.getState()
  console.log('更新游戏状态')

  // 更新本地响应式状态
  Object.assign(gameState, {
    board: newState.board.map((row) => [...row]),
    pieces: [...newState.pieces],
    currentPlayer: newState.currentPlayer,
    gameStatus: newState.gameStatus,
    isInCheck: newState.isInCheck,
    moveHistory: [...newState.moveHistory],
  })

  gameStatus.value = newState.gameStatus
  currentPlayer.value = newState.currentPlayer
  moveHistory.value = [...newState.moveHistory]

  // 更新AI状态
  aiStatus.value = game.getAIStatus()
  aiVsAiRunning.value = game.getAiVsAiStatus()

  // 同步更新store（单向更新）
  store.commit('chess/updateGameState', {
    moveHistory: [...newState.moveHistory],
    gameOver: newState.gameStatus !== 'playing',
    aiThinking: aiStatus.value?.thinking || false,
    aiVsAiRunning: aiVsAiRunning.value,
  })

  // 显示游戏结束弹窗
  showGameOverDialog.value = newState.gameStatus !== 'playing'

  // 自动保存游戏状态到store
  try {
    const gameStateForSaving = game.getStateForSaving()
    store.commit('saveChessGame', gameStateForSaving)
  } catch (error) {
    console.warn('保存游戏状态失败:', error)
  }
}

// 初始化 - 进入网页时初始化游戏
onMounted(async () => {
  console.log('=== ChessEntry 组件初始化 ===')

  // AI状态监控
  const aiStatusTimer = setInterval(() => {
    const newAiStatus = game.getAIStatus()
    if (JSON.stringify(aiStatus.value) !== JSON.stringify(newAiStatus)) {
      aiStatus.value = newAiStatus
    }
  }, 500)

  // 组件卸载时清理资源
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    clearInterval(aiStatusTimer)
    game.destroy()
  })

  // 初始化
  updateGameState()
  window.addEventListener('resize', handleResize)

  // 设置AI移动处理器
  game.setExternalMoveHandler((from: Position, to: Position) => {
    return chessBoardRef.value?.movePiece(from, to) || false
  })

  // 根据游戏模式初始化AI
  const currentConfig = game.getConfig()
  if (currentConfig.enableAI && currentConfig.aiConfig) {
    console.log('初始化AI引擎...')
    setTimeout(async () => {
      try {
        await game.enableAI(currentConfig.aiConfig!)
        console.log('AI初始化成功')

        // 人机模式：如果当前是AI回合，进行AI分析下子
        if (currentConfig.gameMode === 'pve' && game.shouldAIMove()) {
          setTimeout(() => game.makeAIMove().then((success) => success && updateGameState()), 1000)
        }

        // AI对AI模式：开始自动对战
        if (currentConfig.gameMode === 'ai-vs-ai') {
          console.log('启动AI对AI自动对战')
          game.startAiVsAi()
        }
      } catch (error) {
        console.warn('AI初始化失败:', error)
        // 更新store状态
        store.commit('chess/updateGameMode', 'pvp')
      }
      updateGameState()
    }, 100)
  }
})

// 监听store设置变化 - 当游戏配置变化时调用ChessGame的相关事件
watch(
  () => chessSettings.value.gameMode,
  async (newGameMode, oldGameMode) => {
    if (newGameMode && newGameMode !== oldGameMode) {
      console.log('游戏模式变化:', oldGameMode, '->', newGameMode)

      try {
        // 获取完整配置并更新游戏实例
        const newConfig = {
          gameMode: newGameMode,
          enableAI: newGameMode !== 'pvp',
          playerCamp: chessSettings.value.playerCamp || 'red',
          aiConfig: store.state.chess?.gameConfig?.aiConfig,
          aiVsAiConfig: store.state.chess?.gameConfig?.aiVsAiConfig,
        }

        await game.updateConfig(newConfig)

        // 保存配置到store
        store.commit('saveChessGameConfig', newConfig)

        // 根据新模式执行相应逻辑
        if (newGameMode === 'pve' && game.shouldAIMove()) {
          setTimeout(() => game.makeAIMove().then((success) => success && updateGameState()), 1000)
        } else if (newGameMode === 'ai-vs-ai') {
          game.startAiVsAi()
        }

        updateGameState()
      } catch (error) {
        console.error('游戏模式切换失败:', error)
      }
    }
  },
)

// 监听音效设置变化，同步到核心游戏
watch(
  [soundEnabled, voiceEnabled],
  ([newSoundEnabled, newVoiceEnabled]) => {
    console.log('音效设置变化:', { soundEnabled: newSoundEnabled, voiceEnabled: newVoiceEnabled })

    // 同步设置到核心游戏
    game.updateSettings({
      soundEnabled: newSoundEnabled,
      voiceEnabled: newVoiceEnabled,
    })
  },
  { immediate: true },
)

// 响应式处理
const handleResize = () => {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
}

const updateAvailableMoves = () => {
  if (selectedPiece.value) {
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
      const fromPosition = selectedPiece.value.position

      // 使用棋盘组件的动画移动进行吃子
      if (chessBoardRef.value) {
        chessBoardRef.value
          .movePiece(fromPosition, targetPosition)
          .then((success: boolean) => {
            if (success) {
              // 动画完成后，游戏逻辑在 onAnimationComplete 中统一处理
              console.log('吃子动画完成，等待 onAnimationComplete 处理游戏逻辑')
            }
          })
          .catch((error: any) => {
            console.error('Attack animation failed:', error)
            // 如果动画失败，回退到直接移动
            const success = game.makeMove(fromPosition, targetPosition)
            if (success) {
              selectedPiece.value = null
              availableMoves.value = []
              updateGameState()
            }
          })
      } else {
        // 如果没有棋盘引用，回退到直接移动
        const success = game.makeMove(fromPosition, targetPosition)
        if (success) {
          selectedPiece.value = null
          availableMoves.value = []
          updateGameState()
        }
      }
    }
  }
}

// 游戏状态更新事件 - 来自棋盘组件的双向绑定
const onGameStateUpdate = (newGameState: any) => {
  console.log('收到棋盘组件的状态更新:', newGameState)

  // 从棋盘组件同步状态到本地游戏状态
  Object.assign(gameState, newGameState)

  // 清除选中状态和移动提示
  selectedPiece.value = null
  availableMoves.value = []

  // 更新游戏内部状态
  updateGameState()

  console.log('状态同步完成，当前游戏状态:', gameState)
}

// 动画完成事件处理
const onAnimationComplete = (moveData: {
  from: Position
  to: Position
  movingPiece: any
  targetPiece: any
}) => {
  console.log('动画完成，执行游戏逻辑:', moveData)

  //@ts-ignore
  const { from, to, movingPiece, targetPiece } = moveData
  //@ts-ignore
  const movingPieceType = movingPiece.type

  // 使用游戏引擎执行真正的移动
  const success = game.makeMove(from, to)

  if (success) {
    // 清除选中状态和移动提示
    selectedPiece.value = null
    availableMoves.value = []

    // 注意：音效播放已由核心游戏类自动处理，无需重复播放

    updateGameState()
    console.log('游戏逻辑执行完成')
  } else {
    console.error('移动失败，恢复棋盘状态')
    // 如果移动失败，需要通知棋盘恢复状态
    updateGameState()
  }
}

// 棋盘点击事件（空位移动）
const onBoardClick = async (x: number, y: number) => {
  if (!selectedPiece.value) return

  const targetPosition = { x, y }
  const isValidMove = availableMoves.value.some(
    (move) => move.x === targetPosition.x && move.y === targetPosition.y,
  )

  if (isValidMove) {
    const fromPosition = selectedPiece.value.position

    // 使用棋盘组件的动画移动
    if (chessBoardRef.value) {
      try {
        // 先执行动画移动，游戏逻辑在 onAnimationComplete 中处理
        await chessBoardRef.value.movePiece(fromPosition, targetPosition)
        console.log('移动动画完成，等待 onAnimationComplete 处理游戏逻辑')
      } catch (error) {
        console.error('Move animation failed:', error)
        // 如果动画失败，直接执行游戏逻辑
        const success = game.makeMove(fromPosition, targetPosition)
        if (success) {
          selectedPiece.value = null
          availableMoves.value = []
          updateGameState()
        }
      }
    } else {
      // 如果没有棋盘引用，直接移动
      const success = game.makeMove(fromPosition, targetPosition)
      if (success) {
        selectedPiece.value = null
        availableMoves.value = []
        updateGameState()
      }
    }
  }
}

// 可移动位置点击
const onMoveClick = (pos: Position) => {
  onBoardClick(pos.x, pos.y)
}

// 重新开始游戏
const resetGame = () => {
  console.log('重新开始游戏')

  // 停止AI相关活动
  if (aiVsAiRunning.value) {
    game.stopAiVsAi()
  }

  // 重置游戏
  game.reset()
  gameStartTime.value = new Date()
  selectedPiece.value = null
  availableMoves.value = []
  showGameOverDialog.value = false
  updateGameState()
  // 游戏开始音效已由核心游戏类自动播放，无需重复

  // 清除保存的游戏状态
  store.commit('clearChessGame')

  // 根据当前游戏模式重新初始化AI逻辑
  const currentConfig = game.getConfig()
  if (currentConfig.gameMode === 'pve' && game.shouldAIMove()) {
    setTimeout(() => game.makeAIMove().then((success) => success && updateGameState()), 1000)
  } else if (currentConfig.gameMode === 'ai-vs-ai') {
    setTimeout(() => game.startAiVsAi(), 1000)
  }
}

// 悔棋功能
const undoMove = () => {
  if (canUndo.value) {
    console.log('执行悔棋')

    game.stopAIThinking()
    const success = game.undoMove()

    if (success) {
      selectedPiece.value = null
      availableMoves.value = []
      updateGameState()
      // 悔棋音效已由核心游戏类自动播放，无需重复
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

// 游戏设置应用
const onApplySettings = async (
  chessSettings: any,
  globalSettings: any,
  aiVsAiConfig?: any,
  aiConfig?: any,
) => {
  console.log('应用游戏设置:', { chessSettings, globalSettings, aiVsAiConfig, aiConfig })

  // 更新store中的设置
  store.commit('updateChessSettings', chessSettings)
  store.commit('updateGlobalSettings', globalSettings)

  if (aiVsAiConfig) {
    store.commit('chess/updateAiVsAiConfig', aiVsAiConfig)
  }
  if (aiConfig) {
    store.commit('chess/updateAiConfig', aiConfig)
  }

  // 如果游戏模式发生变化，更新游戏配置
  if (chessSettings.gameMode) {
    const newConfig = {
      gameMode: chessSettings.gameMode,
      enableAI: chessSettings.gameMode !== 'pvp',
      playerCamp: chessSettings.playerCamp || 'red',
      aiConfig: aiConfig
        ? { ...store.state.chess?.gameConfig?.aiConfig, ...aiConfig }
        : store.state.chess?.gameConfig?.aiConfig,
      aiVsAiConfig: aiVsAiConfig
        ? { ...store.state.chess?.gameConfig?.aiVsAiConfig, ...aiVsAiConfig }
        : store.state.chess?.gameConfig?.aiVsAiConfig,
    }

    try {
      await game.updateConfig(newConfig)
      store.commit('saveChessGameConfig', newConfig)
      updateGameState()
    } catch (error) {
      console.error('游戏配置更新失败:', error)
    }
  }

  showGameSettings.value = false
}

const onConfigUpdate = async (newConfig: GameConfig) => {
  console.log('更新AI配置:', newConfig)

  try {
    await game.updateConfig(newConfig)
    store.commit('saveChessGameConfig', newConfig)
    updateGameState()
  } catch (error) {
    console.error('AI配置更新失败:', error)
  }
}

const onStopAI = () => {
  console.log('停止AI思考')
  game.stopAIThinking()
  updateGameState()
}

// AI对AI模式切换和测试功能
const toggleAiVsAi = () => {
  console.log('切换AI对战模式')

  const currentConfig = game.getConfig()
  if (currentConfig.gameMode === 'ai-vs-ai') {
    game.toggleAiVsAi()
    aiVsAiRunning.value = game.getAiVsAiStatus()
  } else {
    // 切换到AI对AI模式
    store.commit('chess/updateGameMode', 'ai-vs-ai')
  }

  updateGameState()
}

const testAI = async () => {
  console.log('手动测试AI走棋')
  try {
    const success = await game.makeAIMove()
    if (success) {
      updateGameState()
    } else {
      alert('AI走棋失败，请检查AI配置')
    }
  } catch (error) {
    console.error('手动AI走棋失败:', error)
    alert(`AI走棋失败: ${(error as Error).message || error}`)
  }
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
