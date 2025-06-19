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
        :ai-status="aiStatus"
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
            :disabled="isBoardDisabled"
            @piece-click="onPieceClick"
            @board-click="onBoardClick"
            @move-click="onMoveClick"
            @update:gameState="onGameStateUpdate"
            @animationComplete="onAnimationComplete"
            @disabledClick="onBoardDisabledClick"
          />
        </div>
        <div class="flex-1 flex flex-col justify-stretch">
          <!-- 底部控制区 -->
          <ChessGameControlPanel @reset-game="resetGame" @undo-move="undoMove" />
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
          :ai-status="aiStatus"
          :game-result="gameResult"
          :is-in-check="gameState.isInCheck"
          :is-checkmate="gameStatus === 'checkmate'"
        />

        <!-- 左侧控制面板 -->
        <ChessGameControlPanel @reset-game="resetGame" @undo-move="undoMove" />
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
          :disabled="isBoardDisabled"
          @piece-click="onPieceClick"
          @board-click="onBoardClick"
          @move-click="onMoveClick"
          @update:gameState="onGameStateUpdate"
          @animationComplete="onAnimationComplete"
          @disabledClick="onBoardDisabledClick"
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
import { EnhancedChessGame, type Position, type ChessPiece } from './EnhancedChessGameWrapper'

import { createChessSoundGenerator } from './core/ChessSound'

const store = useStore()
const chessBoardRef = ref()

// 初始化游戏 - 使用增强版包装器和store配置管理
function initializeGame(): EnhancedChessGame {
  const savedState = store.state.chess?.gameState?.currentGame

  console.log('=== 增强游戏初始化 ===')
  console.log('Saved state:', !!savedState)

  // 从store获取完整的游戏配置
  const gameConfig = store.state.chess?.gameConfig || {}
  const settings = store.state.chess?.settings || {}

  // 创建增强的 ChessGame 实例，传入store以支持配置管理
  const game = new EnhancedChessGame(savedState, {
    enableAI: gameConfig.gameMode !== 'pvp' || settings.gameMode !== 'pvp',
    gameMode: gameConfig.gameMode || settings.gameMode || 'pvp',
    playerCamp: gameConfig.playerCamp || settings.playerCamp || 'red',
    store: store, // 传入store以支持配置监听
  })

  console.log(savedState ? '✅ 恢复保存的游戏状态' : 'ℹ️ 创建新游戏')
  console.log('游戏配置:', {
    gameMode: gameConfig.gameMode || settings.gameMode || 'pvp',
    playerCamp: gameConfig.playerCamp || settings.playerCamp || 'red',
  })
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

// 弹窗状态 - 直接从store获取，确保响应式
const showGameSettings = computed({
  get: () => store.state.chess?.ui?.showGameSettings || false,
  set: (value) => store.commit('chess/setShowGameSettings', value),
})
const showAISettings = computed({
  get: () => store.state.chess?.ui?.showAISettings || false,
  set: (value) => store.commit('chess/setShowAISettings', value),
})
const showGameOverDialog = ref(false)

// 从 store 读取走法记录显示状态，确保响应式
const showMoveHistory = computed({
  get: () => store.state.chess?.settings?.showMoveHistory || false,
  set: () => store.commit('chess/toggleChessMoveHistory'),
})

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

// 直接从store获取游戏状态，确保响应式
const gameStatus = computed(() => {
  const storeGameOver = store.state.chess?.gameState?.gameOver || false
  if (storeGameOver) {
    return gameState.gameStatus || 'playing'
  }
  return gameState.gameStatus || 'playing'
})

const currentPlayer = computed(() => gameState.currentPlayer || 'red')

// 移动历史直接从store获取，确保响应式
const moveHistory = computed({
  get: () => store.state.chess?.gameState?.moveHistory || [],
  set: (value) => {
    // 通过游戏逻辑更新，会自动同步到store
    gameState.moveHistory = value
  },
})

// 选中的棋子和可移动位置
const selectedPiece = ref<ChessPiece | null>(null)
const availableMoves = ref<Position[]>([])

// 游戏开始时间
const gameStartTime = ref(new Date())

// AI相关状态 - 直接从store获取，确保响应式
const aiStatus = computed(() => {
  const thinking = store.state.chess?.gameState?.aiThinking || false
  return {
    thinking,
    thinkingTime: thinking ? Date.now() - (game.getAIStatus()?.startTime || Date.now()) : 0,
    ...game.getAIStatus(),
  }
})

// aiVsAiRunning 直接使用 store 的状态，确保响应式
const aiVsAiRunning = computed({
  get: () => store.state.chess?.gameState?.aiVsAiRunning || false,
  set: (val: boolean) => store.commit('chess/setAiVsAiRunning', val),
})

// 棋盘禁用状态计算属性
const isBoardDisabled = computed(() => {
  const currentGameMode = game.getConfig().gameMode

  // AI vs AI 模式：当 aiVsAiRunning 为 true 时禁用
  if (currentGameMode === 'ai-vs-ai') {
    return aiVsAiRunning.value
  }

  // 人机对战模式：轮到 AI 走棋且 AI 正在思考时禁用
  if (currentGameMode === 'pve') {
    const isAITurn = game.shouldAIMove()
    const isAIThinking = aiStatus.value?.thinking || false
    return isAITurn && isAIThinking
  }

  // PVP 模式：不禁用
  return false
})

// 音效管理器
const chessSound = createChessSoundGenerator(
  () => soundEnabled.value,
  () => voiceEnabled.value,
)

// 游戏配置 - 从store获取当前配置
const gameConfig = computed(() => {
  // 始终用store的gameConfig，避免header信息不同步
  const config = store.state.chess?.gameConfig || {}
  return {
    gameMode: config.gameMode || 'pvp',
    playerCamp: config.playerCamp || 'red',
    enableAI: config.gameMode !== 'pvp',
    aiConfig: config.aiConfig || {},
    aiVsAiConfig: config.aiVsAiConfig || {},
  }
})

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

  // 直接更新store状态，让计算属性自动响应
  store.commit('chess/updateGameState', {
    moveHistory: [...newState.moveHistory],
    gameOver: newState.gameStatus !== 'playing',
    aiThinking: game.getAIStatus()?.thinking || false,
    aiVsAiRunning: game.isAiVsAiRunning(),
  })

  // 如果游戏结束，确保停止AI对AI模式
  if (newState.gameStatus !== 'playing' && aiVsAiRunning.value) {
    console.log('游戏结束，停止AI对AI模式')
    aiVsAiRunning.value = false
    store.commit('chess/setAiVsAiRunning', false)
  }

  // 显示游戏结束弹窗
  showGameOverDialog.value = newState.gameStatus !== 'playing'

  // 自动保存游戏状态到store
  try {
    const gameStateForSaving = game.getStateForSaving()
    store.commit('chess/saveGame', gameStateForSaving)
  } catch (error) {
    console.warn('保存游戏状态失败:', error)
  }
}

// 初始化 - 进入网页时初始化游戏
onMounted(async () => {
  console.log('=== ChessEntry 组件初始化 ===')

  // 确保settings和gameConfig配置同步
  const settings = store.state.chess?.settings || {}
  const gameConfig = store.state.chess?.gameConfig || {}

  // 如果gameConfig中缺少playerCamp，从settings中同步
  if (!gameConfig.playerCamp && settings.playerCamp) {
    store.commit('chess/saveGameConfig', {
      ...gameConfig,
      playerCamp: settings.playerCamp,
    })
  }

  // 如果gameConfig中缺少gameMode，从settings中同步
  if (!gameConfig.gameMode && settings.gameMode) {
    store.commit('chess/saveGameConfig', {
      ...gameConfig,
      gameMode: settings.gameMode,
    })
  }

  // AI状态监控 - 使用更短的轮询间隔以确保及时响应AI思考状态变化
  const aiStatusTimer = setInterval(() => {
    const newAiStatus = game.getAIStatus()
    const currentThinking = store.state.chess?.gameState?.aiThinking || false

    // 如果AI思考状态发生变化，更新store状态
    if (newAiStatus.thinking !== currentThinking) {
      console.log(`AI思考状态变化: ${currentThinking} -> ${newAiStatus.thinking}`)
      store.commit('chess/setAiThinking', newAiStatus.thinking)
      store.commit('chess/setAiVsAiRunning', game.isAiVsAiRunning())
      updateGameState()
    }
  }, 50) // 减少轮询间隔到50ms，提高响应速度

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

  // 页面刷新后的AI对AI模式初始化逻辑
  await initializeAIAfterRefresh()
})

// 重写的AI对AI初始化逻辑
const initializeAIAfterRefresh = async () => {
  const currentConfig = game.getConfig()

  // 首先判断当前是否是AI对AI模式
  if (currentConfig.gameMode === 'ai-vs-ai') {
    console.log('检测到AI对AI模式，开始初始化引擎...')

    try {
      // 如果是AI对AI模式，初始化引擎
      await game.enableAI(currentConfig.aiConfig || {})
      console.log('AI对AI模式引擎初始化成功')

      // 判断是否处于开始状态aiVsAiRunning=true
      const savedAiVsAiRunning = store.state.chess?.gameState?.aiVsAiRunning || false
      const gameStatus = gameState.gameStatus || 'playing'

      console.log('AI对AI状态检查:', { savedAiVsAiRunning, gameStatus })

      // 如果游戏还在进行中且应该运行AI对战
      if (gameStatus === 'playing' && savedAiVsAiRunning) {
        console.log('恢复AI对AI对战状态，启动自动对战')

        // 启动AI对AI模式
        game.startAiVsAi()

        // 确保store状态同步
        store.commit('chess/setAiVsAiRunning', true)

        // 检查是否需要AI走棋，如果需要则开始思考
        setTimeout(() => {
          if (game.shouldAIMove()) {
            console.log('需要AI走棋，启动思考周期')
            startAIThinkingCycle()
          }
        }, 500)
      } else if (gameStatus === 'playing') {
        console.log('AI对AI模式游戏进行中，但未标记为运行状态')
      } else {
        console.log('游戏已结束，不启动AI对战')
      }
    } catch (error) {
      console.warn('AI对AI引擎初始化失败:', error)
      store.commit('chess/updateGameMode', 'pvp')
    }
  } else if (currentConfig.enableAI && currentConfig.gameMode === 'pve') {
    // 人机模式的AI初始化
    console.log('初始化人机模式AI引擎...')
    try {
      await game.enableAI(currentConfig.aiConfig || {})
      console.log('人机模式AI初始化成功')

      // 如果当前是AI回合，需要AI走棋
      if (game.shouldAIMove()) {
        console.log('加载页面时发现轮到AI走棋，启动AI思考')
        setTimeout(() => {
          updateGameState()
          startAIThinkingCycle()
        }, 1000)
      }
    } catch (error) {
      console.warn('人机模式AI初始化失败:', error)
      store.commit('chess/updateGameMode', 'pvp')
    }
  }

  updateGameState()
}

// AI思考周期管理
const startAIThinkingCycle = async () => {
  // 检查是否应该AI走棋
  if (!game.shouldAIMove()) {
    console.log('AI思考周期检查失败，停止执行 - AI不应该走棋')
    return
  }

  // 获取当前游戏模式
  const currentGameMode = game.getConfig().gameMode

  // 对于AI对AI模式，需要额外检查aiVsAiRunning状态
  if (currentGameMode === 'ai-vs-ai' && !aiVsAiRunning.value) {
    console.log('AI思考周期检查失败，停止执行 - AI对AI模式未运行')
    return
  }

  console.log(`开始AI思考周期 - 模式: ${currentGameMode}`)

  try {
    // 开始AI思考
    const success = await game.makeAIMove()

    if (success) {
      console.log('AI思考并下子成功，等待动画完成')
      // AI下子成功，游戏逻辑会在onAnimationComplete中继续处理
    } else {
      console.log('AI思考失败，尝试重新开始思考周期')
      // 如果AI思考失败，等待一段时间后重试
      setTimeout(() => {
        // 根据游戏模式决定重试条件
        const shouldRetry =
          currentGameMode === 'ai-vs-ai'
            ? aiVsAiRunning.value && game.shouldAIMove()
            : game.shouldAIMove()

        if (shouldRetry) {
          startAIThinkingCycle()
        }
      }, 2000)
    }
  } catch (error) {
    console.error('AI思考周期出错:', error)
    // 出错时也尝试重新开始
    setTimeout(() => {
      // 根据游戏模式决定重试条件
      const shouldRetry =
        currentGameMode === 'ai-vs-ai'
          ? aiVsAiRunning.value && game.shouldAIMove()
          : game.shouldAIMove()

      if (shouldRetry) {
        startAIThinkingCycle()
      }
    }, 2000)
  }
}

// 监听游戏模式变化，确保AI vs AI状态正确同步
watch(
  () => game?.getConfig()?.gameMode,
  (newMode, oldMode) => {
    if (!game) return // 游戏未初始化时跳过

    console.log('ChessGame模式变化:', oldMode, '->', newMode)
    if (newMode === 'ai-vs-ai' && store.state.chess?.gameState?.aiVsAiRunning) {
      console.log('切换到AI对AI模式，且store中已标记为运行状态，确保启动')
      setTimeout(() => {
        // 确保AI已初始化完成后再启动
        if (game && game.getAIStatus().ready) {
          game.startAiVsAi()
          // 检查是否需要AI走棋
          if (game.shouldAIMove()) {
            startAIThinkingCycle()
          }
        } else {
          console.log('AI尚未准备好，等待初始化完成')
        }
      }, 300)
    } else if (newMode !== 'ai-vs-ai') {
      // 切换到非AI对AI模式时，停止AI对战并重置状态
      console.log('切换到非AI对AI模式，停止AI对战')
      if (game) {
        game.stopAiVsAi()
      }
      store.commit('chess/setAiVsAiRunning', false)
    }
  },
)

// 专门监听 store 中的 aiVsAiRunning 状态变化
watch(
  () => store.state.chess?.gameState?.aiVsAiRunning,
  (running, oldRunning) => {
    console.log('Store中aiVsAiRunning状态变化:', oldRunning, '->', running)
    // 确保ChessGame内部状态与store同步
    if (running !== oldRunning && game) {
      const currentConfig = game.getConfig()
      console.log('同步状态到ChessGame:', { running, gameMode: currentConfig.gameMode })

      // 同步内部状态
      game.setAiVsAiRunning(running)

      if (currentConfig.gameMode === 'ai-vs-ai') {
        if (running) {
          console.log('启动AI对AI对战')
          game.startAiVsAi()
          // 延迟触发AI走棋，使用新的思考周期管理
          setTimeout(() => {
            console.log('触发第一步AI走棋')
            if (game.shouldAIMove()) {
              startAIThinkingCycle()
            }
          }, 200)
        } else {
          console.log('停止AI对AI对战')
          game.stopAiVsAi()
        }
      }
    }
  },
  { immediate: true },
)

// 监听aiVsAiRunning变化，主要用于兼容性（现在主要逻辑在上面的store监听中）
watch(
  () => aiVsAiRunning.value,
  (running) => {
    console.log('computed aiVsAiRunning 状态变化:', running)
    // 主要逻辑已移到store监听中，这里只做简单的状态检查
    updateGameState()
  },
  { immediate: true },
)

// 监听store设置变化 - 当游戏配置变化时调用ChessGame的相关事件
watch(
  () => chessSettings.value.gameMode,
  async (newGameMode, oldGameMode) => {
    if (newGameMode && newGameMode !== oldGameMode) {
      console.log('游戏模式变化:', oldGameMode, '->', newGameMode)
      try {
        // 同步settings和gameConfig的gameMode
        store.commit('chess/updateGameMode', newGameMode)
        store.commit('chess/updateChessSettings', { gameMode: newGameMode })
        store.commit('chess/saveGameConfig', { gameMode: newGameMode })
        await game.updateGameMode(newGameMode)
        // 切换到非ai-vs-ai模式时，强制停止AI对战并同步store
        if (newGameMode !== 'ai-vs-ai') {
          store.commit('chess/setAiVsAiRunning', false)
        }

        // 如果切换到人机模式，检查是否需要AI走棋
        if (newGameMode === 'pve' && game.shouldAIMove()) {
          setTimeout(() => {
            updateGameState()
            startAIThinkingCycle()
          }, 1000)
        }

        updateGameState()
      } catch (error) {
        console.error('游戏模式切换失败:', error)
      }
    }
  },
)

// 监听玩家执棋变化
watch(
  () => chessSettings.value.playerCamp,
  async (newPlayerCamp, oldPlayerCamp) => {
    if (newPlayerCamp && newPlayerCamp !== oldPlayerCamp) {
      console.log('玩家执棋变化:', oldPlayerCamp, '->', newPlayerCamp)
      try {
        // 同步settings和gameConfig的playerCamp
        store.commit('chess/updateChessSettings', { playerCamp: newPlayerCamp })
        store.commit('chess/saveGameConfig', { playerCamp: newPlayerCamp })

        // 更新游戏配置
        await game.updateConfig({ playerCamp: newPlayerCamp })

        // 如果当前是人机模式，检查是否需要AI走棋
        if (chessSettings.value.gameMode === 'pve' && game.shouldAIMove()) {
          setTimeout(() => {
            updateGameState()
            startAIThinkingCycle()
          }, 1000)
        }

        updateGameState()
      } catch (error) {
        console.error('玩家执棋切换失败:', error)
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

    // 根据游戏模式处理后续逻辑
    const currentGameMode = game.getConfig().gameMode

    if (currentGameMode === 'pvp') {
      // 双人对战模式 - 只移动棋子，无需额外处理
      console.log('双人对战模式：棋子移动完成')
    } else if (currentGameMode === 'pve') {
      // 人机模式 - 棋子移动完成后检查是否需要AI走棋
      console.log('人机模式：棋子移动完成，检查是否需要AI走棋')
      if (game.shouldAIMove()) {
        console.log('轮到AI走棋，启动AI思考')
        setTimeout(() => {
          if (game.shouldAIMove() && gameState.gameStatus === 'playing') {
            startAIThinkingCycle()
          }
        }, 500) // 给界面一点时间更新
      }
    } else if (currentGameMode === 'ai-vs-ai') {
      // AI对AI模式 - 棋子移动完成后等待gameSpeed毫秒，然后检查是否继续AI对战
      if (aiVsAiRunning.value) {
        const gameSpeed = store.getters?.['chess/getGameSpeed'] || 2000
        console.log(`AI对AI模式：等待 ${gameSpeed}ms 后执行下一步`)

        setTimeout(() => {
          // 再次检查游戏是否还在进行中且AI对AI模式仍在运行
          if (aiVsAiRunning.value && game.shouldAIMove() && gameState.gameStatus === 'playing') {
            console.log('启动下一轮AI思考')
            startAIThinkingCycle()
          } else {
            console.log('AI对AI模式已停止或游戏已结束')
            // 确保 aiVsAiRunning 状态被设置为 false
            if (aiVsAiRunning.value) {
              console.log('停止AI对AI模式')
              aiVsAiRunning.value = false
              store.commit('chess/setAiVsAiRunning', false)
            }
          }
        }, gameSpeed)
      }
    }
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

// 棋盘禁用状态下的点击事件
const onBoardDisabledClick = () => {
  const currentGameMode = game.getConfig().gameMode

  if (currentGameMode === 'ai-vs-ai' && aiVsAiRunning.value) {
    console.log('AI对AI正在运行中，无法操作棋盘')
    // 可以在这里添加用户提示，比如显示一个 toast 消息
  } else if (currentGameMode === 'pve' && aiStatus.value?.thinking) {
    console.log('AI正在思考中，请等待...')
    // 可以在这里添加用户提示
  }
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
  store.commit('chess/clearGame')

  // 根据当前游戏模式重新初始化AI逻辑
  const currentConfig = game.getConfig()
  console.log('重置后的游戏配置:', currentConfig)

  if (currentConfig.gameMode === 'pve') {
    // 检查是否需要AI走棋
    if (game.shouldAIMove()) {
      console.log('重置后AI需要先走棋')
      setTimeout(() => {
        // 通过更新store状态来触发AI状态变化
        updateGameState()
        startAIThinkingCycle()
      }, 1000)
    } else {
      console.log('重置后玩家先走棋')
    }
  } else if (currentConfig.gameMode === 'ai-vs-ai' && aiVsAiRunning.value) {
    setTimeout(() => {
      game.startAiVsAi()
      // 启动新的思考周期
      if (game.shouldAIMove()) {
        startAIThinkingCycle()
      }
    }, 1000)
  }
}

// 悔棋功能
const undoMove = async () => {
  if (canUndo.value) {
    console.log('执行悔棋')
    if (gameConfig.value.gameMode === 'pve') {
      // 人机模式悔棋 RET_UNDO_STEPS 步
      const RET_UNDO_STEPS = 2
      let step = 0
      let success = false
      for (let i = 0; i < RET_UNDO_STEPS; i++) {
        success = game.undoMove() || success
        step++
      }
      if (success) {
        selectedPiece.value = null
        availableMoves.value = []
        updateGameState()
        // 如果悔棋后轮到AI，自动让AI走棋
        if (game.shouldAIMove()) {
          setTimeout(() => {
            // 通过更新store状态来触发AI状态变化
            updateGameState()
            startAIThinkingCycle()
          }, 500)
        }
        console.log(`人机模式悔棋${RET_UNDO_STEPS}步成功`)
      } else {
        console.log('悔棋失败')
      }
    } else {
      // 其他模式悔棋1步
      const success = game.undoMove()
      if (success) {
        selectedPiece.value = null
        availableMoves.value = []
        updateGameState()
        console.log('悔棋成功')
      } else {
        console.log('悔棋失败')
      }
    }
  }
}

const openMoveHistory = () => {
  store.commit('chess/toggleChessMoveHistory')
}

const closeMoveHistory = () => {
  store.commit('chess/toggleChessMoveHistory')
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
  store.commit('chess/updateChessSettings', chessSettings)
  store.commit('updateGlobalSettings', globalSettings)

  if (aiVsAiConfig) {
    store.commit('chess/updateAiVsAiConfig', aiVsAiConfig)
  }
  if (aiConfig) {
    store.commit('chess/updateAiConfig', aiConfig)
  }

  // 保存完整的游戏配置到gameConfig
  const newGameConfig = {
    gameMode: chessSettings.gameMode,
    playerCamp: chessSettings.playerCamp || 'red',
    enableAI: chessSettings.gameMode !== 'pvp',
    aiConfig: aiConfig
      ? { ...store.state.chess?.gameConfig?.aiConfig, ...aiConfig }
      : store.state.chess?.gameConfig?.aiConfig,
    aiVsAiConfig: aiVsAiConfig
      ? { ...store.state.chess?.gameConfig?.aiVsAiConfig, ...aiVsAiConfig }
      : store.state.chess?.gameConfig?.aiVsAiConfig,
  }

  // 保存到gameConfig
  store.commit('chess/saveGameConfig', newGameConfig)

  // 如果游戏模式或玩家执棋发生变化，更新游戏实例配置
  if (chessSettings.gameMode || chessSettings.playerCamp) {
    try {
      await game.updateConfig(newGameConfig)

      // 如果切换到人机模式且当前轮到AI，让AI走棋
      if (chessSettings.gameMode === 'pve' && game.shouldAIMove()) {
        setTimeout(() => {
          updateGameState()
          startAIThinkingCycle()
        }, 500)
      }

      // 如果切换到AI对战模式，启动AI对战
      if (chessSettings.gameMode === 'ai-vs-ai') {
        setTimeout(() => {
          store.commit('chess/setAiVsAiRunning', true)
        }, 500)
      }
    } catch (error) {
      console.error('更新游戏配置失败:', error)
    }
  }

  // 即使游戏模式没有变化，也要更新AI配置
  if (aiConfig && (chessSettings.gameMode === 'pve' || chessSettings.gameMode === 'ai-vs-ai')) {
    try {
      console.log('应用AI配置到游戏引擎:', aiConfig)
      game.updateAIConfig(aiConfig)
    } catch (error) {
      console.error('更新AI配置失败:', error)
    }
  }

  // 更新AI对战配置
  if (aiVsAiConfig && chessSettings.gameMode === 'ai-vs-ai') {
    try {
      console.log('应用AI对战配置到游戏引擎:', aiVsAiConfig)
      game.updateAIVsAIConfig(aiVsAiConfig)
    } catch (error) {
      console.error('更新AI对战配置失败:', error)
    }
  }

  updateGameState()
  showGameSettings.value = false
}

const onConfigUpdate = async (newConfig: any) => {
  console.log('更新AI配置:', newConfig)

  // 配置会自动通过store监听器应用，这里只需要更新store
  if (newConfig.aiConfig) {
    store.commit('chess/updateAiConfig', newConfig.aiConfig)

    // 立即应用AI配置到游戏引擎
    try {
      console.log('应用新的AI配置到游戏引擎:', newConfig.aiConfig)
      game.updateAIConfig(newConfig.aiConfig)
    } catch (error) {
      console.error('应用AI配置到引擎失败:', error)
    }
  }
  if (newConfig.aiVsAiConfig) {
    store.commit('chess/updateAiVsAiConfig', newConfig.aiVsAiConfig)

    // 应用AI对战配置到游戏引擎
    try {
      console.log('应用新的AI对战配置到游戏引擎:', newConfig.aiVsAiConfig)
      game.updateAIVsAIConfig(newConfig.aiVsAiConfig)
    } catch (error) {
      console.error('应用AI对战配置到引擎失败:', error)
    }
  }

  updateGameState()
}

const onStopAI = () => {
  console.log('停止AI思考')
  game.stopAIThinking()
  updateGameState()
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
