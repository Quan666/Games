<template>
  <div class="gomoku-game relative">
    <!-- AI状态监控面板 -->
    <AIStatusPanel
      :game-mode="gameMode"
      :ai-status="aiStatus"
      :ai-thinking="aiThinking"
      :ai-logs="aiLogs"
    />

    <!-- 胜利弹窗 -->
    <WinDialog :show="showWinDialog" :winner-text="winnerText" />

    <!-- 游戏设置弹窗 -->
    <GameSettings
      :show="store.state.gomoku.ui.showGameSettings"
      :game-mode="gameMode"
      :ai-player="aiPlayer"
      :game-settings="gameSettings"
      :ai-vs-ai-settings="aiVsAiSettings"
      :ai-thinking="aiThinking"
      :is-game-in-progress="isGameInProgress()"
    />

    <!-- AI设置弹窗 -->
    <AISettings
      :show="store.state.gomoku.ui.showAISettings"
      :ai-settings="aiSettings"
      :ai-player="aiPlayer"
      :game-settings="gameSettings"
      :ai-thinking="aiThinking"
      :is-game-in-progress="isGameInProgress()"
      @reset="resetAISettings"
    />

    <!-- 竖屏布局 -->
    <div v-if="isPortrait" class="min-h-screen bg-gradient-to-br flex flex-col">
      <!-- 顶部信息 -->
      <GameInfoHeader />

      <!-- 棋盘区域 -->
      <div class="flex flex-col items-stretch flex-1">
        <div class="flex justify-center">
          <!-- 棋盘紧贴顶部 -->
          <GomokuBoard
            :ai-best-position="aiBestPosition"
            :window-width="windowWidth"
            :window-height="windowHeight"
            @move="makeMove"
          />
        </div>
        <div class="flex-1 flex flex-col justify-stretch">
          <!-- 底部控制区紧贴棋盘 -->
          <GameControlPanel
            @reset-game="resetGame"
            @undo-move="undoMove"
            @toggle-ai-vs-ai="toggleAiVsAi"
            :ai-vs-ai-game-running="aiVsAiGameRunning"
          />
        </div>
      </div>
    </div>

    <!-- 横屏布局 -->
    <div v-else class="min-h-screen bg-gradient-to-br flex">
      <!-- 左侧区域 -->
      <div class="w-80 bg-white/95 backdrop-blur-sm p-6 shadow-lg flex flex-col gap-6">
        <!-- 顶部信息 -->
        <GameInfoHeader />
        <!-- 左侧控制面板 -->
        <GameControlPanel
          @reset-game="resetGame"
          @undo-move="undoMove"
          @toggle-ai-vs-ai="toggleAiVsAi"
          :ai-vs-ai-game-running="aiVsAiGameRunning"
        />
      </div>

      <!-- 中间棋盘 -->
      <div class="flex-1 flex items-center justify-center">
        <GomokuBoard
          :ai-best-position="aiBestPosition"
          :window-width="windowWidth"
          :window-height="windowHeight"
          @move="makeMove"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
// @ts-ignore
import { useStore } from 'vuex'
import { SoundGenerator } from '../../utils/sound'

const base = import.meta.env.BASE_URL || '/'
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

// GomokuAI 类型定义
interface GomokuAI {
  init(callback?: (status: any) => void): Promise<void>
  setConfig(config: any): void
  think(moves: number[][], boardSize?: number, balanceSettings?: any): Promise<number[]>
  stop(): boolean
  destroy(): void
  getStatus(): { ready: boolean; thinking: boolean; timeUsed: number }
}

// 全局 GomokuAI 声明
declare global {
  interface Window {
    GomokuAI: new (assetsPath?: string) => GomokuAI
  }
}

// 游戏状态 - 使用store管理
const board = computed({
  get: () => store.state.gomoku.gameState.board,
  set: (value: number[][]) => store.commit('updateGameState', { board: value }),
})

const currentPlayer = computed({
  get: () => store.state.gomoku.gameState.currentPlayer,
  set: (value: number) => store.commit('updateGameState', { currentPlayer: value }),
})

const gameOver = computed({
  get: () => store.state.gomoku.gameState.gameOver,
  set: (value: boolean) => store.commit('updateGameState', { gameOver: value }),
})

const moveHistory = computed({
  get: () => store.state.gomoku.gameState.moveHistory,
  set: (value: Move[]) => store.commit('updateGameState', { moveHistory: value }),
})

const moveCount = computed({
  get: () => store.state.gomoku.gameState.moveCount,
  set: (value: number) => store.commit('updateGameState', { moveCount: value }),
})

const winningPositions = computed({
  get: () => store.state.gomoku.gameState.winningPositions,
  set: (value: Position[] | null) => store.commit('updateGameState', { winningPositions: value }),
})

const lastMove = computed({
  get: () => store.state.gomoku.gameState.lastMove,
  set: (value: Position | null) => store.commit('updateGameState', { lastMove: value }),
})

const aiThinking = computed({
  get: () => store.state.gomoku.gameState.aiThinking,
  set: (value: boolean) => store.commit('setAiThinking', value),
})

const showWinDialog = ref<boolean>(false)
const winnerText = ref<string>('')

// 游戏显示设置
const store = useStore()
const gameSettings = computed({
  get: () => store.state.gomoku.gameSettings,
  set: (value: any) => store.commit('updateGameSettings', value),
})

// AI 相关状态
const gameMode = computed({
  get: () => store.state.gomoku.gameMode,
  set: (value: string) => store.commit('updateGameMode', value),
})
const aiPlayer = computed({
  get: () => store.state.gomoku.aiPlayer,
  set: (value: number) => store.commit('updateAiPlayer', value),
})

// 为AI设置创建可写computed属性
const aiSettings = reactive({
  get rule() {
    return store.state.gomoku.aiSettings.rule
  },
  set rule(value: number) {
    store.commit('updateAiSettings', { rule: value })
  },
  get strength() {
    return store.state.gomoku.aiSettings.strength
  },
  set strength(value: number) {
    store.commit('updateAiSettings', { strength: value })
  },
  get maxDepth() {
    return store.state.gomoku.aiSettings.maxDepth
  },
  set maxDepth(value: number) {
    store.commit('updateAiSettings', { maxDepth: value })
  },
  get maxNodes() {
    return store.state.gomoku.aiSettings.maxNodes
  },
  set maxNodes(value: number) {
    store.commit('updateAiSettings', { maxNodes: value })
  },
  get candRange() {
    return store.state.gomoku.aiSettings.candRange
  },
  set candRange(value: number) {
    store.commit('updateAiSettings', { candRange: value })
  },
  get nbest() {
    return store.state.gomoku.aiSettings.nbest
  },
  set nbest(value: number) {
    store.commit('updateAiSettings', { nbest: value })
  },
  get turnTime() {
    return store.state.gomoku.aiSettings.turnTime
  },
  set turnTime(value: number) {
    store.commit('updateAiSettings', { turnTime: value })
  },
  get matchTime() {
    return store.state.gomoku.aiSettings.matchTime
  },
  set matchTime(value: number) {
    store.commit('updateAiSettings', { matchTime: value })
  },
  get threads() {
    return store.state.gomoku.aiSettings.threads
  },
  set threads(value: number) {
    store.commit('updateAiSettings', { threads: value })
  },
  get hashSize() {
    return store.state.gomoku.aiSettings.hashSize
  },
  set hashSize(value: number) {
    store.commit('updateAiSettings', { hashSize: value })
  },
  get configIndex() {
    return store.state.gomoku.aiSettings.configIndex
  },
  set configIndex(value: number) {
    store.commit('updateAiSettings', { configIndex: value })
  },
  get pondering() {
    return store.state.gomoku.aiSettings.pondering
  },
  set pondering(value: boolean) {
    store.commit('updateAiSettings', { pondering: value })
  },
  get showDetail() {
    return store.state.gomoku.aiSettings.showDetail
  },
  set showDetail(value: boolean) {
    store.commit('updateAiSettings', { showDetail: value })
  },
})
const showAISettings = ref<boolean>(false) // 显示AI设置弹窗

// AI对战AI设置 - 使用computed来访问store
const aiVsAiSettings = computed({
  get: () => store.state.gomoku.aiVsAiSettings,
  set: (value: any) => store.commit('updateAiVsAiSettings', value),
})

// AI对战AI游戏控制状态
const aiVsAiGameRunning = ref<boolean>(false)

// AI状态信息
const aiStatus = reactive({
  thinkTime: 0,
  totalTimeUsed: 0,
  timeLeft: '-',
  engineReady: '未初始化',
  thinkingStatus: '空闲',
  searchDepth: '-',
  selDepth: '-',
  searchNodes: '-',
  totalNodes: '-',
  searchSpeed: '-',
  evaluation: '-',
  winRate: '-',
  bestLine: '-',
  bestMove: '-',
  realtimeBest: '-',
  realtimeThinking: '-',
  currentPV: '0',
  forbidMoves: '-',
})

// AI日志
interface AILog {
  time: string
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
}

const aiLogs = ref<AILog[]>([])

// AI当前思考的最佳位置
const aiBestPosition = ref<{ row: number; col: number } | null>(null)

// 添加AI日志
const addAILog = (type: AILog['type'], message: string) => {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  // console.log(`[AI Log] ${time} [${type}] ${message}`)
  aiLogs.value.push({ time, type, message })

  // 限制日志数量，只保留最近100条
  if (aiLogs.value.length > 100) {
    aiLogs.value = aiLogs.value.slice(-100)
  }
}

// 坐标转换函数：将数组坐标转换为五子棋标准坐标
const convertToChessCoord = (row: number, col: number): string => {
  // 横坐标：A-T (col 0-18 对应 A-T)
  const horizontalCoord = String.fromCharCode(65 + col) // A=65
  // 纵坐标：1-19 (row 0-18 对应 19-1，即底部为1，顶部为19)
  const verticalCoord = boardSize.value - row
  return `${horizontalCoord}${verticalCoord}`
}

// AI 实例
let gomokuAI: GomokuAI | null = null
let aiInitialized = false

const windowWidth = ref<number>(0)
const windowHeight = ref<number>(0)

// 棋盘大小（根据设置动态获取）
const boardSize = computed(() => store.state.gomoku.gameSettings.boardSize)

// 计算属性
const isPortrait = computed<boolean>(() => windowWidth.value < windowHeight.value)

const canUndo = computed<boolean>(() => moveHistory.value.length > 0 && !aiThinking.value)

// 音效生成器 - 使用全局和局部设置的组合
const soundGenerator = new SoundGenerator(() => {
  return store.state.globalSettings.soundEnabled && store.state.gomoku.gameSettings.enableSound
})

// 方法
const updateWindowSize = (): void => {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
}

// 开始AI对战AI游戏
const startAiVsAiGame = async (): Promise<void> => {
  // 检查游戏状态和AI初始化状态
  if (
    gameMode.value !== 'ave' ||
    !aiInitialized ||
    !gomokuAI ||
    gameOver.value ||
    !aiVsAiGameRunning.value
  ) {
    if (!aiInitialized || !gomokuAI) {
      addAILog('error', 'AI引擎未初始化，无法开始AI对战')
    }
    return
  }

  // 让当前AI玩家思考
  addAILog('info', `AI${currentPlayer.value} 开始思考...`)

  try {
    // 根据当前玩家设置AI强度
    const aiStrength =
      currentPlayer.value === 1
        ? aiVsAiSettings.value.aiPlayer1Strength
        : aiVsAiSettings.value.aiPlayer2Strength

    // 临时调整AI强度
    const originalStrength = aiSettings.strength
    aiSettings.strength = aiStrength

    // 应用AI配置
    applyAISettings()

    await makeAIMove()

    // 恢复原始强度
    aiSettings.strength = originalStrength

    // 如果游戏未结束且仍在运行状态，继续下一轮
    if (!gameOver.value && gameMode.value === 'ave' && aiVsAiGameRunning.value) {
      setTimeout(() => {
        startAiVsAiGame()
      }, aiVsAiSettings.value.gameSpeed)
    }
  } catch (error) {
    console.error('AI vs AI move failed:', error)
    addAILog('error', `AI对战出错: ${error}`)
  }
}

// AI对战AI控制函数
const toggleAiVsAi = (): void => {
  // 检查游戏模式、AI初始化状态和游戏是否结束
  if (gameMode.value !== 'ave' || !aiInitialized || !gomokuAI || gameOver.value) {
    if (!aiInitialized || !gomokuAI) {
      addAILog('error', 'AI引擎未初始化，请刷新页面重新加载')
      // 初始化AI引擎
      initializeAI()
        .then(() => {
          addAILog('success', 'AI引擎初始化成功')
        })
        .catch((error) => {
          console.error('AI引擎初始化失败:', error)
          addAILog('error', `AI引擎初始化失败: ${error}`)
        })
    }
    return
  }

  if (!aiVsAiGameRunning.value) {
    // 开始游戏
    aiVsAiGameRunning.value = true
    addAILog('info', 'AI对战AI游戏开始')

    // 开始游戏循环
    setTimeout(() => {
      startAiVsAiGame()
    }, 500)
  } else {
    // 暂停游戏
    aiVsAiGameRunning.value = false
    addAILog('info', 'AI对战AI游戏已暂停，可以手动下子')

    // 如果AI正在思考，停止AI思考
    if (aiThinking.value && gomokuAI) {
      try {
        gomokuAI.stop()
        aiThinking.value = false
        addAILog('info', 'AI思考已中断')
      } catch (error) {
        console.error('Failed to stop AI thinking:', error)
      }
    }
  }
}

const makeMove = async (row: number, col: number, isAIMove: boolean = false): Promise<void> => {
  if (gameOver.value || board.value[row][col] !== 0) return // 在人机模式下，如果不是AI移动且当前轮到AI，则拒绝人类玩家的移动
  if (gameMode.value === 'pve' && !isAIMove && currentPlayer.value === aiPlayer.value) {
    console.log('Blocked human move during AI turn')
    return
  } // 在AI对战AI模式下，只有在暂停状态下才允许人类玩家移动
  if (gameMode.value === 'ave' && !isAIMove && aiVsAiGameRunning.value) {
    console.log('Blocked human move in AI vs AI mode - game is running')
    return
  } // 在AI对战AI模式下，如果AI还没有初始化完成，阻止游戏进行
  if (gameMode.value === 'ave' && !aiInitialized) {
    console.log('Blocked move: AI not yet initialized')
    return
  }

  console.log(
    `Making move: row=${row}, col=${col}, player=${currentPlayer.value}, isAI=${isAIMove}`,
  )

  // 记录移动
  const movePlayer = currentPlayer.value
  moveHistory.value.push({ row, col, player: movePlayer })
  board.value[row][col] = movePlayer
  moveCount.value++
  lastMove.value = { row, col }

  // 播放落子音效
  await soundGenerator.playPlaceSound(movePlayer === 1) // 检查获胜 - 使用移动时的玩家而不是当前玩家
  if (checkWinForPlayer(row, col, movePlayer)) {
    gameOver.value = true // 停止AI对战AI
    if (gameMode.value === 'ave') {
      aiVsAiGameRunning.value = false
    }

    winnerText.value = movePlayer === 1 ? '黑棋' : '白棋'
    showWinDialog.value = true

    // 3秒后自动关闭弹窗
    setTimeout(() => {
      showWinDialog.value = false
    }, 3000)

    await soundGenerator.playWinSound()
  } else if (checkDraw()) {
    // 检查和局
    gameOver.value = true // 停止AI对战AI
    if (gameMode.value === 'ave') {
      aiVsAiGameRunning.value = false
    }

    winnerText.value = '和局'
    showWinDialog.value = true

    // 3秒后自动关闭弹窗
    setTimeout(() => {
      showWinDialog.value = false
    }, 3000)

    // 播放特殊音效或使用默认音效
    await soundGenerator.playWinSound()
  } else {
    currentPlayer.value = currentPlayer.value === 1 ? 2 : 1 // 在人机模式下，如果轮到AI，让AI移动
    if (
      gameMode.value === 'pve' &&
      currentPlayer.value === aiPlayer.value &&
      !isAIMove &&
      aiInitialized
    ) {
      console.log('Triggering AI move...')
      setTimeout(() => {
        makeAIMove()
      }, 500) // 延迟500ms让玩家看到棋子落下
    } // 在AI对战AI模式下，如果是人工下子且游戏仍在运行，继续AI游戏
    if (gameMode.value === 'ave' && !isAIMove && aiInitialized && aiVsAiGameRunning.value) {
      setTimeout(() => {
        startAiVsAiGame()
      }, aiVsAiSettings.value.gameSpeed)
    }
  }

  // 保存棋盘状态到store
  saveBoardStateToStore()
}

const checkWinForPlayer = (row: number, col: number, player: number): boolean => {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ]

  for (const [dx, dy] of directions) {
    let count = 1
    const positions: Position[] = [{ row, col }] // 向一个方向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row + dx * i
      const newCol = col + dy * i
      if (
        newRow >= 0 &&
        newRow < boardSize.value &&
        newCol >= 0 &&
        newCol < boardSize.value &&
        board.value[newRow][newCol] === player
      ) {
        count++
        positions.push({ row: newRow, col: newCol })
      } else break
    }

    // 向相反方向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row - dx * i
      const newCol = col - dy * i
      if (
        newRow >= 0 &&
        newRow < boardSize.value &&
        newCol >= 0 &&
        newCol < boardSize.value &&
        board.value[newRow][newCol] === player
      ) {
        count++
        positions.unshift({ row: newRow, col: newCol })
      } else break
    }

    if (count >= 5) {
      winningPositions.value = positions.slice(0, 5)
      return true
    }
  }
  return false
}

// 检查是否和局（棋盘下满且无人获胜）
const checkDraw = (): boolean => {
  // 计算总的棋盘格子数
  const totalCells = boardSize.value * boardSize.value

  // 检查是否所有格子都被占满
  return moveCount.value >= totalCells
}

const resetGame = (): void => {
  // 如果AI正在思考，先停止AI
  if (aiThinking.value && gomokuAI) {
    gomokuAI.stop()
    aiThinking.value = false
  }

  // 清除AI最佳位置标记
  aiBestPosition.value = null // 重置AI对战AI状态
  aiVsAiGameRunning.value = false

  // 使用store重置游戏状态
  store.commit('resetGameState')
  showWinDialog.value = false // 如果是人机模式且AI先手，让AI走第一步
  if (gameMode.value === 'pve' && aiPlayer.value === 1 && aiInitialized) {
    setTimeout(() => {
      makeAIMove()
    }, 1000)
  }

  // AI对战AI模式不自动开始，等待用户点击开始按钮
}

const switchGameMode = (): void => {
  // 如果AI正在思考，先停止AI
  if (aiThinking.value && gomokuAI) {
    gomokuAI.stop()
    aiThinking.value = false
  }

  // 清除AI最佳位置标记
  aiBestPosition.value = null // 重置AI对战AI状态
  aiVsAiGameRunning.value = false

  // 使用store重置游戏状态
  // store.commit('resetGameState')
  showWinDialog.value = false
  // 如果是人机模式
  if (gameMode.value === 'pve' && aiInitialized) {
    // 如果轮到AI走
    if (currentPlayer.value === aiPlayer.value) {
      // 让AI走第一步
      setTimeout(() => {
        makeAIMove()
      }, 1000)
    }
  }

  // AI对战AI模式不自动开始，等待用户点击开始按钮
}

const undoMove = async (): Promise<void> => {
  if (!canUndo.value || aiThinking.value) return

  // 清除AI最佳位置标记
  aiBestPosition.value = null

  // 记录悔棋前的游戏状态
  const wasGameOver = gameOver.value

  // 根据游戏模式确定回退步数
  let stepsToUndo = 1
  if (gameMode.value === 'pve' && moveHistory.value.length >= 2) {
    // 人机模式回退2步（玩家和AI各一步）
    stepsToUndo = 2
  } else if (gameMode.value === 'pvp' || gameMode.value === 'ave') {
    // 双人模式和机机模式回退1步
    stepsToUndo = 1
  }

  // 如果是机机模式，悔棋后需要暂停游戏
  if (gameMode.value === 'ave') {
    aiVsAiGameRunning.value = false
    if (wasGameOver) {
      addAILog('info', '悔棋成功，AI对战已暂停，请手动点击开始继续游戏')
    } else {
      addAILog('info', '悔棋后AI对战已暂停，请手动点击开始继续游戏')
    }
  }

  // 执行悔棋操作
  for (let i = 0; i < stepsToUndo && moveHistory.value.length > 0; i++) {
    const move = moveHistory.value.pop()
    if (move) {
      board.value[move.row][move.col] = 0
      moveCount.value--
      currentPlayer.value = move.player
    }
  }

  // 如果游戏原本已结束，需要重置游戏结束状态
  if (wasGameOver) {
    gameOver.value = false
    showWinDialog.value = false
    winnerText.value = ''
    winningPositions.value = null

    // 根据模式添加日志提示
    if (gameMode.value === 'pve') {
      addAILog('info', '胜利后悔棋成功，已回退2步，游戏继续')
    } else if (gameMode.value === 'pvp') {
      addAILog('info', '胜利后悔棋成功，已回退1步，游戏继续')
    }
  }

  // 更新最后一步标记
  lastMove.value =
    moveHistory.value.length > 0 ? moveHistory.value[moveHistory.value.length - 1] : null

  await soundGenerator.playUndoSound()
}

// AI 相关方法
const updateAIStatus = () => {
  if (gomokuAI && aiInitialized) {
    const status = gomokuAI.getStatus()
    aiStatus.engineReady = status.ready ? '已就绪' : '未就绪'
    aiStatus.thinkingStatus = status.thinking ? '思考中' : '空闲'
    aiStatus.totalTimeUsed = status.timeUsed || 0

    // 不在这里重置思考时间，让它保持显示最后一次的思考时间
    // 思考时间只在开始新的思考时重置为0，在思考完成时设置最终值
  }
}

const initializeAI = async (): Promise<void> => {
  if (aiInitialized) {
    addAILog('info', 'AI已经初始化，跳过')
    return
  }

  if (!window.GomokuAI) {
    addAILog('error', 'GomokuAI不可用')
    throw new Error('GomokuAI not available')
  }

  try {
    // 设置初始化状态
    aiStatus.engineReady = '初始化中'
    addAILog('info', '正在创建AI实例...')

    // 创建AI实例
    gomokuAI = new window.GomokuAI(`${base}gomoku-ai/`)

    if (!gomokuAI) {
      throw new Error('Failed to create AI instance')
    }

    addAILog('success', 'AI实例创建成功') // 初始化AI引擎
    addAILog('info', '正在初始化AI引擎...')

    // 创建回调对象
    const realtimeCallback = {
      onMessage: (message: any) => {
        handleAIMessage(message)
      },
      onThinking: (pos: any) => {
        handleThinkingPosition(pos)
      },
      onThought: (pos: any) => {
        clearThinkingPosition(pos)
      },
      onBest: (pos: any) => {
        handleBestMove(pos)
      },
      onProgress: (output: any) => {
        handleAIProgress(output)
      },
      onLost: () => {
        // 处理失败位置
      },
    }

    await (gomokuAI as any).init(realtimeCallback)

    aiInitialized = true
    addAILog('success', 'AI引擎初始化成功')

    // 初始化AI状态监控数据
    aiStatus.engineReady = '已就绪'
    aiStatus.thinkingStatus = '空闲'
    aiStatus.searchDepth = '0'
    aiStatus.selDepth = '0'
    aiStatus.searchNodes = '0'
    aiStatus.totalNodes = '0'
    aiStatus.searchSpeed = '0 nodes/s'
    aiStatus.evaluation = '0.00'
    aiStatus.winRate = '50.0%'
    aiStatus.bestMove = '-'
    aiStatus.realtimeBest = '-'
    aiStatus.realtimeThinking = '-' // 配置AI参数
    if (gomokuAI) {
      gomokuAI.setConfig({
        rule: aiSettings.rule,
        threads: aiSettings.threads,
        candRange: aiSettings.candRange,
        strength: aiSettings.strength,
        turnTime: aiSettings.turnTime,
        matchTime: aiSettings.matchTime,
        maxDepth: aiSettings.maxDepth,
        maxNodes: aiSettings.maxNodes,
        nbest: aiSettings.nbest,
        configIndex: aiSettings.configIndex,
        hashSize: aiSettings.hashSize,
        pondering: aiSettings.pondering,
        showDetail: aiSettings.showDetail,
      })
      addAILog('success', 'AI配置应用成功')
    }
  } catch (error) {
    addAILog('error', `AI初始化失败: ${error}`)
    aiInitialized = false
    gomokuAI = null
    aiStatus.engineReady = '初始化失败'
    throw error
  }
}

const loadAIScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.GomokuAI) {
      console.log('AI script already loaded')
      resolve()
      return
    }

    console.log('Loading AI script...')
    const script = document.createElement('script')
    script.src = `${base}gomoku-ai/gomoku-ai.js`

    const timeoutId = setTimeout(() => {
      script.remove()
      reject(new Error('AI script loading timeout'))
    }, 15000) // 15秒超时

    script.onload = () => {
      clearTimeout(timeoutId)
      console.log('AI script loaded successfully')
      if (window.GomokuAI) {
        resolve()
      } else {
        reject(new Error('AI script loaded but GomokuAI not available'))
      }
    }

    script.onerror = (error) => {
      clearTimeout(timeoutId)
      script.remove()
      console.error('Failed to load AI script:', error)
      reject(new Error('Failed to load AI script'))
    }

    document.head.appendChild(script)
  })
}

const getBoardMoves = (): number[][] => {
  const moves: number[][] = []
  for (const move of moveHistory.value) {
    moves.push([move.col, move.row])
  }
  return moves
}

const makeAIMove = async (): Promise<void> => {
  if (!gomokuAI || !aiInitialized || gameOver.value) {
    console.log('AI cannot move:', {
      gomokuAI: !!gomokuAI,
      aiInitialized,
      gameOver: gameOver.value,
    })
    addAILog('warning', 'AI无法移动 - 未初始化或游戏结束')
    return
  }

  try {
    console.log('AI starting to think...')
    addAILog('info', 'AI开始思考...')
    aiThinking.value = true

    // 清除之前的AI最佳位置标记
    aiBestPosition.value = null

    // 更新状态
    aiStatus.thinkingStatus = '思考中'
    aiStatus.thinkTime = 0

    const moves = getBoardMoves()
    console.log('Current moves for AI:', moves)
    addAILog('info', `当前棋局步数: ${moves.length}`)

    const startTime = Date.now()

    // AI开始思考

    // 启动AI思考状态更新定时器
    const thinkingInterval = setInterval(() => {
      if (aiThinking.value) {
        aiStatus.thinkTime = Date.now() - startTime
        updateAIStatus()
      }
    }, 100) // 每100ms更新一次

    const aiMove = await gomokuAI.think(moves, boardSize.value)
    const endTime = Date.now()

    // 清除定时器
    clearInterval(thinkingInterval)

    aiStatus.thinkTime = endTime - startTime
    aiStatus.totalTimeUsed += aiStatus.thinkTime

    console.log('AI returned move:', aiMove)
    addAILog('success', `AI完成思考，用时${aiStatus.thinkTime}ms`)

    if (aiMove && aiMove.length === 2) {
      const [col, row] = aiMove
      console.log(`AI wants to move to: row=${row}, col=${col}`)
      addAILog('info', `AI选择位置: ${convertToChessCoord(row, col)}`) // 验证移动是否有效
      if (
        row >= 0 &&
        row < boardSize.value &&
        col >= 0 &&
        col < boardSize.value &&
        board.value[row][col] === 0
      ) {
        await makeMove(row, col, true)
        addAILog('success', `AI成功落子于 ${convertToChessCoord(row, col)}`)
      } else {
        console.error('Invalid AI move:', { row, col, boardValue: board.value[row]?.[col] })
        addAILog('error', `AI无效落子: ${convertToChessCoord(row, col)}`)
      }
    } else {
      console.error('AI returned invalid move:', aiMove)
      addAILog('error', 'AI返回无效落子')
    }
  } catch (error) {
    console.error('AI move failed:', error)
    addAILog('error', `AI思考失败: ${error}`)
  } finally {
    aiThinking.value = false
    aiStatus.thinkingStatus = '空闲'
    // 清除AI最佳位置标记
    aiBestPosition.value = null
  }
}

const applyAISettings = (): void => {
  showAISettings.value = false

  // 如果AI已初始化，更新AI配置
  if (gomokuAI && aiInitialized) {
    console.log('Applying new AI configuration:', aiSettings)
    addAILog('info', '正在应用AI配置...')

    try {
      gomokuAI.setConfig({
        rule: aiSettings.rule,
        threads: aiSettings.threads,
        candRange: aiSettings.candRange,
        strength: aiSettings.strength,
        turnTime: aiSettings.turnTime,
        matchTime: aiSettings.matchTime,
        maxDepth: aiSettings.maxDepth,
        maxNodes: aiSettings.maxNodes,
        nbest: aiSettings.nbest,
        configIndex: aiSettings.configIndex,
        hashSize: aiSettings.hashSize,
        pondering: aiSettings.pondering,
        showDetail: aiSettings.showDetail,
      })
      console.log('AI configuration applied successfully')
      addAILog('success', 'AI配置应用成功')
    } catch (error) {
      console.error('Failed to apply AI configuration:', error)
      addAILog('error', `AI配置应用失败: ${error}`)
    }
  }
  addAILog('info', '配置已保存，将在AI完成当前思考后生效')
}

const resetAISettings = (): void => {
  store.commit('resetAiSettings')
}

// 棋盘状态管理辅助函数
const saveBoardStateToStore = (): void => {
  store.commit('saveBoardState', {
    board: board.value,
    currentPlayer: currentPlayer.value,
    moveCount: moveCount.value,
    gameOver: gameOver.value,
    moveHistory: moveHistory.value,
    lastMove: lastMove.value,
    winningPositions: winningPositions.value,
    aiThinking: aiThinking.value,
  })
}

// 获取游戏是否正在进行中（有棋子在棋盘上）
const isGameInProgress = (): boolean => {
  return moveCount.value > 0 && !gameOver.value
}

// 检查是否可以安全修改AI设置（不会影响当前对局）
const canSafelyModifyAISettings = (): boolean => {
  return !aiThinking.value || moveCount.value === 0
}

// AI回调处理方法
const handleAIMessage = (msg: any): void => {
  console.log('AI Message callback called:', msg, typeof msg)

  if (typeof msg === 'string') {
    addAILog('info', `AI: ${msg}`)
    // 尝试解析可能的状态信息
    if (msg.includes('ready') || msg.includes('初始化')) {
      aiStatus.engineReady = '已就绪'
    }
  } else if (typeof msg === 'object' && msg !== null) {
    addAILog('info', `AI: ${JSON.stringify(msg)}`)
    if (msg.status) {
      aiStatus.engineReady = msg.status
    }
  }
}

const handleThinkingPosition = (pos: any): void => {
  console.log('AI Thinking Position callback called:', pos, typeof pos)

  if (Array.isArray(pos) && pos.length >= 2) {
    const [col, row] = pos
    aiStatus.realtimeThinking = `${String.fromCharCode(65 + col)}${row + 1}`
    aiStatus.thinkingStatus = '思考中'
    console.log('AI thinking at position:', pos)
    addAILog('info', `AI正在考虑: ${aiStatus.realtimeThinking}`)
  } else if (typeof pos === 'string') {
    aiStatus.realtimeThinking = pos
    addAILog('info', `AI思考位置: ${pos}`)
  }
}

const clearThinkingPosition = (result?: any): void => {
  console.log('AI Clear Thinking Position callback called:', result)
  aiStatus.thinkingStatus = '分析中'
  addAILog('info', 'AI完成当前位置思考')

  if (result) {
    console.log('AI thinking result:', result)
    if (Array.isArray(result) && result.length >= 2) {
      const [col, row] = result
      aiStatus.bestMove = convertToChessCoord(row, col)
    }
  }
}

const handleBestMove = (pos: any): void => {
  console.log('AI Best Move callback called:', pos, typeof pos)

  if (Array.isArray(pos) && pos.length >= 2) {
    const [col, row] = pos
    const moveStr = `${String.fromCharCode(65 + col)}${row + 1}`
    aiStatus.bestMove = moveStr
    aiStatus.realtimeBest = moveStr

    // 更新AI最佳位置标记
    aiBestPosition.value = { row, col }

    console.log('AI best move:', pos, '-> ', moveStr)
    addAILog('success', `AI最佳着法: ${moveStr}`)
  } else if (typeof pos === 'string') {
    aiStatus.bestMove = pos
    aiStatus.realtimeBest = pos
    addAILog('success', `AI最佳着法: ${pos}`)
  }
}

const handleAIProgress = (output: any): void => {
  // 记录进度数据
  addAILog('info', `AI进度: ${JSON.stringify(output)}`)

  if (!output) return

  try {
    // 处理不同格式的输出数据
    if (typeof output === 'string') {
      aiStatus.thinkingStatus = '分析中'
      addAILog('info', `AI输出: ${output}`)
    } else if (typeof output === 'object') {
      // 更新搜索深度信息
      if (output.pv && Array.isArray(output.pv) && output.pv.length > 0) {
        const pv = output.pv[0]
        if (pv.depth !== undefined) aiStatus.searchDepth = pv.depth.toString()
        if (pv.seldepth !== undefined) aiStatus.selDepth = pv.seldepth.toString()
        if (pv.nodes !== undefined) aiStatus.searchNodes = pv.nodes.toLocaleString()
        if (pv.eval !== undefined) {
          // 处理eval可能是字符串或数字的情况
          if (typeof pv.eval === 'number') {
            aiStatus.evaluation = pv.eval.toFixed(2)
          } else {
            aiStatus.evaluation = pv.eval.toString()
          }
        }
        if (pv.winrate !== undefined) aiStatus.winRate = (pv.winrate * 100).toFixed(1) + '%' // 处理最佳路径 - 这是思考位置的主要来源
        if (pv.bestline && Array.isArray(pv.bestline) && pv.bestline.length > 0) {
          // 显示前3-5步作为思考路径，避免过长
          const maxSteps = Math.min(5, pv.bestline.length)
          const thinkingPath = pv.bestline
            .slice(0, maxSteps)
            .map((pos: number[]) => convertToChessCoord(pos[1], pos[0]))
            .join(' → ')

          aiStatus.realtimeThinking = thinkingPath // 最佳着法是第一步
          if (pv.bestline[0]) {
            const bestPos = pv.bestline[0]
            aiStatus.bestMove = convertToChessCoord(bestPos[1], bestPos[0])
            aiStatus.realtimeBest = aiStatus.bestMove

            // 更新AI最佳位置标记
            aiBestPosition.value = { row: bestPos[1], col: bestPos[0] }
          }
        }
      }

      // 处理直接的progress数据
      if (output.depth !== undefined) aiStatus.searchDepth = output.depth.toString()
      if (output.seldepth !== undefined) aiStatus.selDepth = output.seldepth.toString()
      if (output.nodes !== undefined) {
        aiStatus.searchNodes = output.nodes.toLocaleString()
        aiStatus.totalNodes = output.nodes.toLocaleString()
      }
      if (output.eval !== undefined) {
        // 同样处理eval的类型检查
        if (typeof output.eval === 'number') {
          aiStatus.evaluation = output.eval.toFixed(2)
        } else {
          aiStatus.evaluation = output.eval.toString()
        }
      }
      if (output.winrate !== undefined) aiStatus.winRate = (output.winrate * 100).toFixed(1) + '%'
      if (output.nps !== undefined) aiStatus.searchSpeed = output.nps.toLocaleString() + ' nodes/s' // 更新总体信息
      if (output.speed !== undefined) {
        aiStatus.searchSpeed = output.speed.toLocaleString() + ' nodes/s'
      }

      // 处理实时思考数据
      if (output.realtime) {
        // 处理实时最佳着法
        if (output.realtime.best && output.realtime.best.length > 0) {
          const best = output.realtime.best[output.realtime.best.length - 1]
          if (Array.isArray(best) && best.length >= 2) {
            const bestStr = convertToChessCoord(best[1], best[0])
            aiStatus.realtimeBest = bestStr
            aiStatus.bestMove = bestStr

            // 更新AI最佳位置标记
            aiBestPosition.value = { row: best[1], col: best[0] }
          }
        } // 处理实时思考位置
        if (output.realtime.thinking && output.realtime.thinking.length > 0) {
          const thinkingPositions = output.realtime.thinking
            .map((p: number[]) => convertToChessCoord(p[1], p[0]))
            .join(', ')
          aiStatus.realtimeThinking = thinkingPositions
        }
      }

      // 更新思考状态
      if (output.status) {
        aiStatus.thinkingStatus = output.status
      }
    }
  } catch (error) {
    addAILog('error', `处理AI进度数据时出错: ${error}`)
  }
}

// 测试功能 - 展示我们的修改
const testFeatures = (): void => {
  console.log('=== 功能测试 ===')
  console.log('1. 棋盘状态管理:', {
    isGameInProgress: isGameInProgress(),
    canSafelyModifyAI: canSafelyModifyAISettings(),
    moveCount: moveCount.value,
    aiThinking: aiThinking.value,
  })

  addAILog('info', '功能测试完成 - 棋盘数据已保存到store，AI设置修改不会影响当前对局')
}

// 生命周期
onMounted(async () => {
  updateWindowSize()
  window.addEventListener('resize', updateWindowSize)

  // 启动音频上下文
  document.addEventListener(
    'click',
    () => {
      soundGenerator.resumeAudioContext()
    },
    { once: true },
  )

  // 预加载AI脚本
  try {
    await loadAIScript()
    addAILog('success', 'AI脚本加载成功')
    // 如果是需要AI的模式（人机对战或AI对战AI），自动初始化AI
    await initializeAI()
    console.log('AI engine initialized successfully')
    addAILog('info', 'AI引擎初始化完成')
    if (gameMode.value === 'ave') {
      // 重置AI对战AI控制状态，确保刷新后状态正确
      aiVsAiGameRunning.value = false
    }
  } catch (error) {
    console.warn('Failed to load AI script:', error)
    addAILog('warning', `AI脚本加载失败: ${error}`)

    // 如果AI加载失败且是需要AI的模式，回退到PVP
    if (gameMode.value === 'pve' || gameMode.value === 'ave') {
      gameMode.value = 'pvp'
      addAILog('error', 'AI初始化失败，已切换到双人对战模式')
    }
  } // 启动AI状态监控定时器
  setInterval(() => {
    if (aiInitialized && gomokuAI) {
      updateAIStatus()
    }
  }, 1000) // 每秒更新一次状态    // 检查是否有保存的游戏状态需要恢复
  if (isGameInProgress()) {
    addAILog('info', '检测到保存的游戏状态，已自动恢复')
  }

  // 运行功能测试
  testFeatures()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowSize)

  // 清理AI资源
  if (gomokuAI) {
    gomokuAI.destroy()
    gomokuAI = null
    aiInitialized = false
  }
})

watch(
  () => store.state.gomoku.gameState,
  (newState) => {
    // 当store中的状态发生变化时，确保本地状态同步
    console.log('Game state changed in store:', newState)
  },
  { deep: true },
)

// 监听AI思考状态变化
watch(aiThinking, (newThinking, oldThinking) => {
  if (newThinking !== oldThinking) {
    console.log('AI thinking state changed:', newThinking)
    // 同步到store
    store.commit('setAiThinking', newThinking)
  }
})

// watch声音开关，首次开启时通过公开方法恢复权限
watch(
  () => [store.state.globalSettings.soundEnabled, store.state.gomoku.gameSettings.enableSound],
  async ([globalSound, localSound], [oldGlobalSound, oldLocalSound]) => {
    const newSoundEnabled = globalSound && localSound
    const oldSoundEnabled = oldGlobalSound && oldLocalSound

    if (newSoundEnabled && !oldSoundEnabled) {
      // 播放一个声音
      await soundGenerator.playOpenSound()
      await soundGenerator.resumeAudioContext()
    }
  },
)

// 监听游戏模式变化
watch(
  () => gameMode.value,
  () => {
    switchGameMode()
  },
)

// aiPlayer 监听
watch(
  () => aiPlayer.value,
  (newPlayer) => {
    // 如果AI玩家变更，且是人机对战模式，重新开始AI思考
    if (gameMode.value === 'pve' && aiInitialized) {
      console.log(`AI玩家变更为: ${newPlayer}`)
      addAILog('info', `AI玩家变更为: ${newPlayer}`)

      // 如果当前轮到AI玩家，立即让AI思考
      if (currentPlayer.value === aiPlayer.value) {
        setTimeout(() => {
          makeAIMove()
        }, 500) // 延迟500ms让玩家看到棋子落下
      }
    }
  },
)
</script>

<style scoped>
.bg-gradient-radial {
  background: radial-gradient(circle at 30% 30%, var(--tw-gradient-from), var(--tw-gradient-to));
}

/* 渐变背景 */
.bg-gradient-to-br {
  background-image: linear-gradient(
    to bottom right,
    var(--tw-gradient-from),
    var(--tw-gradient-to)
  );
}
</style>
