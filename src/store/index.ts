// @ts-ignore
import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

const store = createStore({
  state() {
    return {
      count: 1,
      // 全局设置
      globalSettings: {
        soundEnabled: true, // 全局音效开关
        voiceEnabled: true, // 全局语音开关
        theme: 'light', // 主题: light, dark
        language: 'zh-CN', // 语言
      },
      // 五子棋游戏设置
      gomoku: {
        gameSettings: {
          showMoveOrder: false, // 是否显示棋子落下的顺序
          showLastMove: true, // 是否显示最后一步标记
          showCoordinates: true, // 是否显示棋盘坐标
          showStatusPanel: false, // 是否显示AI状态监控面板
          boardSize: 15, // 棋盘大小: 13, 15, 19
          enableSound: true, // 音效开关（兼容性保留）
        },
        gameMode: 'pvp', // 游戏模式: pvp=双人对战, pve=人机对战, ave=AI对战AI
        aiPlayer: 2, // AI 执子: 1=黑棋, 2=白棋

        // AI对战AI模式设置
        aiVsAiSettings: {
          aiPlayer1Strength: 80, // AI1强度
          aiPlayer2Strength: 70, // AI2强度
          gameSpeed: 1000, // 对战速度(毫秒)
        }, // 游戏状态
        gameState: {
          board: Array(15)
            .fill(null)
            .map(() => Array(15).fill(0)), // 棋盘状态
          currentPlayer: 1, // 当前玩家
          moveCount: 0, // 步数
          gameOver: false, // 游戏是否结束
          moveHistory: [], // 移动历史
          lastMove: null, // 最后一步
          winningPositions: null, // 获胜位置
          aiThinking: false, // AI是否正在思考
          aiThinkingStartTime: null, // AI开始思考的时间
          currentAiPlayer: 1, // AI对战AI模式中的当前AI玩家
          aiVsAiRunning: false, // AI对战AI是否正在运行
        },
        aiSettings: {
          // 基础设置
          rule: 0, // 游戏规则: 0=自由规则, 1=标准规则, 2=连珠规则(有禁手)
          strength: 80, // AI强度: 10-100, 控制AI的整体实力水平

          // 搜索设置
          maxDepth: 64, // 最大搜索深度: 限制AI搜索的层数，影响计算质量
          maxNodes: 0, // 最大搜索节点数: 0=不限制，限制AI搜索的节点总数
          candRange: 3, // 候选范围: 1-5, 控制AI考虑落子位置的范围，值越大考虑越全面
          nbest: 1, // 最佳着法数量: 1-5, AI返回的最佳着法数量

          // 时间设置
          turnTime: 5000, // 单步思考时间(毫秒): 1000-30000, 每步棋的最大思考时间
          matchTime: 300000, // 总对局时间(毫秒): 控制整局游戏的总思考时间

          // 性能设置
          threads: Math.max(Math.floor(navigator.hardwareConcurrency / 2), 1), // 线程数: 1-8, 并行计算线程数
          hashSize: 256, // 哈希表大小(MB): 64-1024, 用于存储搜索结果的内存大小

          // 高级设置
          configIndex: 2, // 配置文件索引: 0-2, 使用预设的AI配置文件
          pondering: false, // 后台思考: 是否在对手思考时继续计算                    showDetail: true // 显示详细信息: 是否显示AI的详细搜索信息
        },
        // 弹窗UI控制
        ui: {
          showGameSettings: false,
          showAISettings: false,
        },
      },
      // 中国象棋游戏设置
      chess: {
        settings: {
          gameMode: 'pvp', // 游戏模式: pvp=双人对战, pve=人机对战, ai-vs-ai=AI对战
          playerCamp: 'red', // 玩家执棋颜色
          showCoordinates: true, // 显示棋盘坐标
          showMoveHistory: false, // 显示走法记录开关
          enableSound: true, // 音效开关
          enableVoice: false, // 语音播报开关
        },
        gameConfig: {
          gameMode: 'pvp',
          playerCamp: 'red',
          enableAI: false,
          // 公共AI配置 - 所有AI实例共享
          aiConfig: {
            engine: 'pikafish',
            thinkingTime: 5,
            depth: 8,
            threads: 1,
            hashSize: 16,
            // Pikafish完整的UCI选项
            skillLevel: 20, // Skill Level: 0-20, 默认20
            multiPV: 1, // MultiPV: 1-128, 默认1
            moveOverhead: 10, // Move Overhead: 0-5000ms, 默认10
            nodestime: 0, // nodestime: 0-10000, 默认0
            mateThreatDepth: 1, // Mate Threat Depth: 0-10, 默认1
            repetitionRule: 'AsianRule', // Repetition Rule
            drawRule: 'None', // Draw Rule
            //sixtyMoveRule: true, // Sixty Move Rule, 默认true
            //rule60MaxPly: 120, // Rule60MaxPly: 1-150, 默认120
            maxCheckCount: 0, // MaxCheckCount: 0-1000, 默认0
            limitStrength: false, // UCI_LimitStrength, 默认false
            uciElo: 1280, // UCI_Elo: 1280-3133, 默认1280
            //uciWDLCentipawn: true, // UCI_WDLCentipawn, 默认true
            //luOutput: true, // LU_Output, 默认true
            //uciShowWDL: false, // UCI_ShowWDL, 默认false
            //evalFile: 'pikafish.nnue', // EvalFile, 默认pikafish.nnue
            ponder: false, // Ponder, 默认false
          },
          // AI对战AI模式的配置
          aiVsAiConfig: {
            // 红方AI非公共配置（只存储与公共配置不同的部分）
            redAI: {
              skillLevel: 18, // 红方AI棋力
              thinkingTime: 5,
              depth: 8,
              uciElo: 1280,
              ponder: false,
              mateThreatDepth: 1,
            },
            // 黑方AI非公共配置（只存储与公共配置不同的部分）
            blackAI: {
              skillLevel: 16, // 黑方AI棋力
              thinkingTime: 5,
              depth: 8,
              uciElo: 1280,
              ponder: false,
              mateThreatDepth: 1,
            },
            gameSpeed: 2000, // AI对战速度（毫秒）
          },
        },
        gameState: {
          // 当前游戏状态将动态保存
          currentGame: null, // 当前游戏的序列化状态
          savedGames: [], // 已保存的游戏列表
          lastPlayTime: null, // 最后游戏时间
          moveHistory: [], // 走法历史
          gameOver: false, // 游戏是否结束
          aiThinking: false, // AI是否正在思考
          aiVsAiRunning: false, // AI对战是否正在运行
        },
        ui: {
          showSettings: false,
          showSaveDialog: false,
          showGameSettings: false,
          showAISettings: false,
        },
      },
    }
  },
  mutations: {
    increment(state: { count: number }) {
      state.count++
    },
    // 五子棋设置mutations
    updateGameSettings(state: any, payload: any) {
      let oldBoardSize = state.gomoku.gameSettings.boardSize
      Object.assign(state.gomoku.gameSettings, payload)
      // 如果棋盘大小发生变化，重新初始化棋盘
      if (payload.boardSize && payload.boardSize !== oldBoardSize) {
        const newSize = payload.boardSize
        state.gomoku.gameState.board = Array(newSize)
          .fill(null)
          .map(() => Array(newSize).fill(0))
        state.gomoku.gameState.moveHistory = []
        state.gomoku.gameState.moveCount = 0
        state.gomoku.gameState.gameOver = false
        state.gomoku.gameState.lastMove = null
        state.gomoku.gameState.winningPositions = null
      }
    },
    updateGameMode(state: any, mode: string) {
      state.gomoku.gameMode = mode
    },
    updateAiPlayer(state: any, player: number) {
      state.gomoku.aiPlayer = player
    },
    updateAiSettings(state: any, payload: any) {
      Object.assign(state.gomoku.aiSettings, payload)
    },
    resetAiSettings(state: any) {
      state.gomoku.aiSettings = {
        rule: 0,
        strength: 80,
        maxDepth: 64,
        maxNodes: 0,
        candRange: 3,
        nbest: 1,
        turnTime: 5000,
        matchTime: 300000,
        threads: Math.max(Math.floor(navigator.hardwareConcurrency / 2), 1),
        hashSize: 256,
        configIndex: 2,
        pondering: false,
        showDetail: true,
      }
    },
    // 游戏状态相关mutations
    updateGameState(state: any, payload: any) {
      Object.assign(state.gomoku.gameState, payload)
    },
    resetGameState(state: any) {
      const boardSize = state.gomoku.gameSettings.boardSize
      state.gomoku.gameState = {
        board: Array(boardSize)
          .fill(null)
          .map(() => Array(boardSize).fill(0)),
        currentPlayer: 1,
        moveCount: 0,
        gameOver: false,
        moveHistory: [],
        lastMove: null,
        winningPositions: null,
        aiThinking: false,
        aiThinkingStartTime: null,
        currentAiPlayer: 1,
        aiVsAiRunning: false,
      }
    },
    updateBoard(state: any, { row, col, player }: { row: number; col: number; player: number }) {
      state.gomoku.gameState.board[row][col] = player
    },
    addMoveToHistory(state: any, move: any) {
      state.gomoku.gameState.moveHistory.push(move)
    },
    removeLastMoveFromHistory(state: any) {
      state.gomoku.gameState.moveHistory.pop()
    },
    // AI思考状态管理
    setAiThinking(state: any, thinking: boolean) {
      state.gomoku.gameState.aiThinking = thinking
      if (thinking) {
        state.gomoku.gameState.aiThinkingStartTime = Date.now()
      } else {
        state.gomoku.gameState.aiThinkingStartTime = null
      }
    },
    // AI对战AI运行状态管理
    setAiVsAiRunning(state: any, running: boolean) {
      state.gomoku.gameState.aiVsAiRunning = running
    },
    // 保存完整的棋盘状态
    saveBoardState(state: any, boardState: any) {
      Object.assign(state.gomoku.gameState, boardState)
    },

    // 更新AI对战AI设置
    updateAiVsAiSettings(state: any, payload: any) {
      Object.assign(state.gomoku.aiVsAiSettings, payload)
    },

    // 更新棋盘大小
    updateBoardSize(state: any, newSize: number) {
      state.gomoku.gameSettings.boardSize = newSize
      // 重新初始化棋盘
      const boardSize = newSize
      state.gomoku.gameState.board = Array(boardSize)
        .fill(null)
        .map(() => Array(boardSize).fill(0))
      state.gomoku.gameState.moveHistory = []
      state.gomoku.gameState.moveCount = 0
      state.gomoku.gameState.gameOver = false
      state.gomoku.gameState.lastMove = null
      state.gomoku.gameState.winningPositions = null
    },
    setShowGameSettings(state: any, show: boolean) {
      state.gomoku.ui.showGameSettings = show
    },
    setShowAISettings(state: any, show: boolean) {
      state.gomoku.ui.showAISettings = show
    },

    // 全局设置 mutations
    updateGlobalSettings(state: any, payload: any) {
      Object.assign(state.globalSettings, payload)
    },
    toggleGlobalSound(state: any) {
      state.globalSettings.soundEnabled = !state.globalSettings.soundEnabled
      // 同步更新五子棋设置以保持兼容性
      state.gomoku.gameSettings.enableSound = state.globalSettings.soundEnabled
      // 如果音效关闭，也关闭语音
      if (!state.globalSettings.soundEnabled) {
        state.globalSettings.voiceEnabled = false
      }
    },
    toggleGlobalVoice(state: any) {
      state.globalSettings.voiceEnabled = !state.globalSettings.voiceEnabled
    },

    // 中国象棋设置 mutations
    'chess/updateGameMode'(state: any, mode: string) {
      state.chess.settings.gameMode = mode
    },
    'chess/updateChessSettings'(state: any, payload: any) {
      Object.assign(state.chess.settings, payload)
    },
    'chess/updateSettings'(state: any, payload: any) {
      Object.assign(state.chess.settings, payload)
    },
    'chess/toggleChessSound'(state: any) {
      state.chess.settings.enableSound = !state.chess.settings.enableSound
    },
    'chess/toggleChessVoice'(state: any) {
      state.chess.settings.enableVoice = !state.chess.settings.enableVoice
    },
    'chess/toggleChessMoveHistory'(state: any) {
      state.chess.settings.showMoveHistory = !state.chess.settings.showMoveHistory
    },
    'chess/setShowGameSettings'(state: any, show: boolean) {
      state.chess.ui.showGameSettings = show
    },
    'chess/setShowAISettings'(state: any, show: boolean) {
      state.chess.ui.showAISettings = show
    },

    // 兼容旧的mutation名称
    updateChessSettings(state: any, payload: any) {
      Object.assign(state.chess.settings, payload)
    },
    toggleChessSound(state: any) {
      state.chess.settings.enableSound = !state.chess.settings.enableSound
    },
    toggleChessVoice(state: any) {
      state.chess.settings.enableVoice = !state.chess.settings.enableVoice
    },
    toggleChessMoveHistory(state: any) {
      state.chess.settings.showMoveHistory = !state.chess.settings.showMoveHistory
    },

    // 中国象棋游戏状态 mutations
    'chess/updateGameState'(state: any, payload: any) {
      Object.assign(state.chess.gameState, payload)
    },
    'chess/setAiThinking'(state: any, thinking: boolean) {
      state.chess.gameState.aiThinking = thinking
    },
    'chess/setAiVsAiRunning'(state: any, running: boolean) {
      state.chess.gameState.aiVsAiRunning = running
    },
    'chess/addMoveToHistory'(state: any, move: any) {
      state.chess.gameState.moveHistory.push(move)
    },
    'chess/removeLastMoveFromHistory'(state: any) {
      if (state.chess.gameState.moveHistory.length > 0) {
        state.chess.gameState.moveHistory.pop()
      }
    },
    'chess/setGameOver'(state: any, gameOver: boolean) {
      state.chess.gameState.gameOver = gameOver
    },
    'chess/saveGame'(state: any, gameData: any) {
      state.chess.gameState.currentGame = gameData
      state.chess.gameState.lastPlayTime = Date.now()
    },
    'chess/clearGame'(state: any) {
      state.chess.gameState.currentGame = null
      state.chess.gameState.lastPlayTime = null
    },

    // 保存象棋AI配置
    'chess/saveGameConfig'(state: any, config: any) {
      state.chess.gameConfig = { ...state.chess.gameConfig, ...config }
    },
    // 保存象棋AI对战AI配置
    'chess/updateAiVsAiConfig'(state: any, config: any) {
      if (!state.chess.gameConfig.aiVsAiConfig) {
        state.chess.gameConfig.aiVsAiConfig = {}
      }
      Object.assign(state.chess.gameConfig.aiVsAiConfig, config)
    },
    // 保存象棋AI配置（人机模式）
    'chess/updateAiConfig'(state: any, config: any) {
      if (!state.chess.gameConfig.aiConfig) {
        state.chess.gameConfig.aiConfig = {}
      }
      Object.assign(state.chess.gameConfig.aiConfig, config)
    },
    // 更新红方AI非公共配置
    'chess/updateRedAiConfig'(state: any, config: any) {
      if (!state.chess.gameConfig.aiVsAiConfig) {
        state.chess.gameConfig.aiVsAiConfig = { redAI: {}, blackAI: {}, gameSpeed: 2000 }
      }
      if (!state.chess.gameConfig.aiVsAiConfig.redAI) {
        state.chess.gameConfig.aiVsAiConfig.redAI = {}
      }
      Object.assign(state.chess.gameConfig.aiVsAiConfig.redAI, config)
    },
    // 更新黑方AI非公共配置
    'chess/updateBlackAiConfig'(state: any, config: any) {
      if (!state.chess.gameConfig.aiVsAiConfig) {
        state.chess.gameConfig.aiVsAiConfig = { redAI: {}, blackAI: {}, gameSpeed: 2000 }
      }
      if (!state.chess.gameConfig.aiVsAiConfig.blackAI) {
        state.chess.gameConfig.aiVsAiConfig.blackAI = {}
      }
      Object.assign(state.chess.gameConfig.aiVsAiConfig.blackAI, config)
    },
    // 更新AI对战游戏速度
    'chess/updateGameSpeed'(state: any, speed: number) {
      if (!state.chess.gameConfig.aiVsAiConfig) {
        state.chess.gameConfig.aiVsAiConfig = { redAI: {}, blackAI: {}, gameSpeed: 2000 }
      }
      state.chess.gameConfig.aiVsAiConfig.gameSpeed = speed
    },
    addSavedChessGame(state: any, gameData: any) {
      const savedGame = {
        id: Date.now(),
        name: gameData.name || `游戏 ${new Date().toLocaleString()}`,
        data: gameData.data,
        timestamp: Date.now(),
      }
      state.chess.gameState.savedGames.unshift(savedGame)
      // 限制保存的游戏数量
      if (state.chess.gameState.savedGames.length > 10) {
        state.chess.gameState.savedGames = state.chess.gameState.savedGames.slice(0, 10)
      }
    },
    removeSavedChessGame(state: any, gameId: number) {
      state.chess.gameState.savedGames = state.chess.gameState.savedGames.filter(
        (game: any) => game.id !== gameId,
      )
    },

    // 中国象棋UI控制
    setShowChessSettings(state: any, show: boolean) {
      state.chess.ui.showSettings = show
    },
    setShowChessSaveDialog(state: any, show: boolean) {
      state.chess.ui.showSaveDialog = show
    },
  },
  getters: {
    // 获取红方AI完整配置（公共配置 + 红方特定配置）
    'chess/getRedAiFullConfig': (state: any) => {
      const commonConfig = state.chess.gameConfig.aiConfig || {}
      const redConfig = state.chess.gameConfig.aiVsAiConfig?.redAI || {}
      return { ...commonConfig, ...redConfig }
    },
    // 获取黑方AI完整配置（公共配置 + 黑方特定配置）
    'chess/getBlackAiFullConfig': (state: any) => {
      const commonConfig = state.chess.gameConfig.aiConfig || {}
      const blackConfig = state.chess.gameConfig.aiVsAiConfig?.blackAI || {}
      return { ...commonConfig, ...blackConfig }
    },
    // 获取当前AI配置（根据游戏模式）
    'chess/getCurrentAiConfig': (state: any) => {
      if (state.chess.gameConfig.gameMode === 'ai-vs-ai') {
        // AI对战模式，返回红方配置作为默认
        const commonConfig = state.chess.gameConfig.aiConfig || {}
        const redConfig = state.chess.gameConfig.aiVsAiConfig?.redAI || {}
        return { ...commonConfig, ...redConfig }
      } else {
        // 人机模式，返回公共配置
        return state.chess.gameConfig.aiConfig || {}
      }
    },
    // 获取AI对战游戏速度
    'chess/getGameSpeed': (state: any) => {
      return state.chess.gameConfig.aiVsAiConfig?.gameSpeed || 2000
    },
  },
  actions: {},
  // 初始化默认值

  plugins: [createPersistedState()],
})

export default store
