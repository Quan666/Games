// 象棋游戏包装器 - 保持向后兼容性，包含AI功能

import {
  ChessGame as CoreChessGame,
  type ChessGameConfig,
  type GameState,
  type Position,
  type ChessPiece,
  type Move,
} from './core'
import { ChessAI, uciToMove } from './ai'
import type { AIEngineConfig } from './ai'

export type {
  PieceType,
  Camp,
  Position,
  ChessPiece,
  Move,
  GameState,
  ChessGameSettings,
} from './core'

export interface GameConfig {
  enableAI?: boolean
  aiConfig?: AIEngineConfig
  gameMode?: 'pvp' | 'pve' | 'ai-vs-ai'
  playerCamp?: 'red' | 'black'
  aiVsAiConfig?: {
    redAI: AIEngineConfig
    blackAI: AIEngineConfig
    gameSpeed?: number
  }
}

export class ChessGame {
  private coreGame: CoreChessGame
  private config: GameConfig
  private aiManager: ChessAI | null = null
  private isAIThinking = false
  private aiVsAiRunning = false
  private aiVsAiTimer: number | null = null
  private externalMoveHandler: ((from: Position, to: Position) => boolean) | null = null

  constructor(savedState?: GameState, config: GameConfig = {}) {
    this.config = {
      enableAI: false,
      gameMode: 'pvp',
      playerCamp: 'red',
      ...config,
    }

    // 创建核心游戏实例
    const coreConfig: ChessGameConfig = {
      initialState: savedState,
      onStateUpdate: () => {
        // 这里可以添加额外的状态更新逻辑
      },
    }
    this.coreGame = new CoreChessGame(coreConfig)

    // 如果启用AI，初始化AI管理器
    if (
      (this.config.gameMode === 'pve' || this.config.gameMode === 'ai-vs-ai') &&
      this.config.aiConfig
    ) {
      this.initAI()
        .then(() => {
          this.checkAndMakeAIMove()
        })
        .catch((error) => {
          console.error('AI初始化失败:', error)
        })
    }
  }

  // 代理核心游戏的方法
  getState(): GameState {
    return this.coreGame.getState()
  }

  getSettings() {
    return this.coreGame.getSettings()
  }

  updateSettings(settings: any): void {
    this.coreGame.updateSettings(settings)
  }

  getPieceAt(position: Position): ChessPiece | null {
    return this.coreGame.getPieceAt(position)
  }

  getValidMoves(piece: ChessPiece): Position[] {
    return this.coreGame.getValidMoves(piece)
  }

  makeMove(from: Position, to: Position): boolean {
    const success = this.coreGame.makeMove(from, to)

    if (success) {
      // 在人机模式下，如果下一步应该是AI走棋
      if (this.config.gameMode === 'pve' && this.shouldAIMove()) {
        setTimeout(() => {
          this.makeAIMove().catch((error) => {
            console.error('AI走棋失败:', error)
          })
        }, 800)
      }
      // AI对AI模式的逻辑在makeAIMove中处理
    }

    return success
  }

  undoMove(): boolean {
    this.stopAIThinking()
    return this.coreGame.undoMove()
  }

  reset(): void {
    this.stopAiVsAi()
    this.coreGame.reset()
  }

  getStateForSaving(): GameState {
    return this.coreGame.getStateForSaving()
  }

  toFEN(): string {
    return this.coreGame.toFEN()
  }

  getCurrentFenWithMoves(): string {
    return this.coreGame.getCurrentFenWithMoves()
  }

  getUCIMoveHistory(): string[] {
    return this.coreGame.getUCIMoveHistory()
  }

  destroy(): void {
    this.stopAiVsAi()
    if (this.aiManager) {
      this.aiManager.destroy()
      this.aiManager = null
    }
    this.coreGame.destroy()
  }

  // AI相关方法
  private async initAI(): Promise<void> {
    if (!this.config.aiConfig) return

    try {
      this.aiManager = new ChessAI()
      await this.aiManager.init()

      // 使用完整的AI配置
      this.aiManager.updateConfig(this.config.aiConfig)
    } catch (error) {
      console.error('AI初始化失败:', error)
      throw error
    }
  }

  async enableAI(aiConfig: AIEngineConfig): Promise<void> {
    this.config.enableAI = true
    this.config.aiConfig = aiConfig

    if (this.aiManager) {
      this.aiManager.destroy()
    }

    await this.initAI()
  }

  disableAI(): void {
    this.config.enableAI = false
    if (this.aiManager) {
      this.aiManager.destroy()
      this.aiManager = null
    }
  }

  shouldAIMove(): boolean {
    if (!this.aiManager || this.isAIThinking) {
      return false
    }

    const state = this.coreGame.getState()
    if (state.gameStatus !== 'playing') {
      return false
    }

    if (!this.aiManager.isReady()) {
      return false
    }

    switch (this.config.gameMode) {
      case 'pve':
        return state.currentPlayer !== this.config.playerCamp
      case 'ai-vs-ai':
        return this.aiVsAiRunning
      default:
        return false
    }
  }

  async makeAIMove(): Promise<boolean> {
    const aiMove = await this.requestAIMove()
    if (aiMove) {
      if (this.externalMoveHandler) {
        const success = this.externalMoveHandler(aiMove.from, aiMove.to)

        // 如果是AI对AI模式，设置等待时间后继续下一步
        if (success && this.config.gameMode === 'ai-vs-ai' && this.aiVsAiRunning) {
          const delay = this.config.aiVsAiConfig?.gameSpeed || 2000
          console.log(`AI走棋完成，等待 ${delay}ms 后继续`)

          this.aiVsAiTimer = window.setTimeout(() => {
            if (this.aiVsAiRunning && this.shouldAIMove()) {
              this.makeAIMove().catch((error) => {
                console.error('AI对AI连续走棋失败:', error)
              })
            }
          }, delay)
        }

        return success
      } else {
        const success = this.makeMove(aiMove.from, aiMove.to)

        // 如果是AI对AI模式，设置等待时间后继续下一步
        if (success && this.config.gameMode === 'ai-vs-ai' && this.aiVsAiRunning) {
          const delay = this.config.aiVsAiConfig?.gameSpeed || 2000
          console.log(`AI走棋完成，等待 ${delay}ms 后继续`)

          this.aiVsAiTimer = window.setTimeout(() => {
            if (this.aiVsAiRunning && this.shouldAIMove()) {
              this.makeAIMove().catch((error) => {
                console.error('AI对AI连续走棋失败:', error)
              })
            }
          }, delay)
        }

        return success
      }
    }
    return false
  }

  private async requestAIMove(): Promise<Move | null> {
    if (!this.shouldAIMove()) {
      return null
    }

    try {
      this.isAIThinking = true
      console.log('开始请求AI走棋...')

      // 在AI对战模式下，根据当前轮到的玩家切换AI配置
      if (this.config.gameMode === 'ai-vs-ai' && this.config.aiVsAiConfig) {
        const currentPlayer = this.coreGame.getState().currentPlayer
        const currentAiConfig =
          currentPlayer === 'red'
            ? this.config.aiVsAiConfig.redAI
            : this.config.aiVsAiConfig.blackAI

        console.log(`切换到${currentPlayer === 'red' ? '红方' : '黑方'}AI配置:`, currentAiConfig)
        // 直接替换整个AI配置，因为每个AI的配置是独立的
        this.config.aiConfig = { ...currentAiConfig }
        if (this.aiManager) {
          this.aiManager.updateConfig(this.config.aiConfig)
        }

        // 同时更新当前的AI配置引用，以便后续使用正确的深度和时间
        this.config.aiConfig = currentAiConfig

        // 等待配置生效
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      const fenWithMoves = this.getCurrentFenWithMoves()
      console.log('发送给AI的位置信息:', fenWithMoves)

      // 使用配置中的深度和思考时间
      const depth = this.config.aiConfig?.depth || 8
      const timeLimit = this.config.aiConfig?.timeLimit || 5

      const aiMove = await this.aiManager!.analyze(fenWithMoves, depth, timeLimit)

      if (aiMove) {
        console.log('AI返回移动:', aiMove)

        const { from, to } = uciToMove(`${aiMove.from}${aiMove.to}`)

        const piece = this.coreGame.getPieceAt(from)
        if (!piece) {
          console.error('起始位置没有棋子:', from)
          return null
        }

        const capturedPiece = this.coreGame.getPieceAt(to) || undefined

        return {
          from,
          to,
          piece,
          capturedPiece,
          timestamp: Date.now(),
          isCheck: false,
          isCheckmate: false,
        }
      } else {
        console.warn('AI未返回有效移动')
        return null
      }
    } catch (error) {
      console.error('AI走棋失败:', error)
      return null
    } finally {
      this.isAIThinking = false
    }
  }

  stopAIThinking(): void {
    if (this.aiManager) {
      this.aiManager.stop()
    }
    this.isAIThinking = false
  }

  getAIStatus() {
    return {
      enabled: !!(this.config.gameMode === 'pve' || this.config.gameMode === 'ai-vs-ai'),
      thinking: this.isAIThinking,
      ready: this.aiManager?.isReady() || false,
      status: this.aiManager?.getStatus() || 'idle',
      stats: this.aiManager?.getStats() || null,
      canPlayerMove: this.canPlayerMove(),
      aiVsAiRunning: this.aiVsAiRunning,
    }
  }

  updateAIConfig(newConfig: Partial<AIEngineConfig>): void {
    if (this.aiManager && this.config.aiConfig) {
      this.config.aiConfig = { ...this.config.aiConfig, ...newConfig }
      this.aiManager.updateConfig(this.config.aiConfig)
    }
  }

  setExternalMoveHandler(handler: ((from: Position, to: Position) => boolean) | null): void {
    this.externalMoveHandler = handler
  }

  getConfig(): GameConfig {
    return { ...this.config }
  }

  async updateConfig(newConfig: Partial<GameConfig>): Promise<void> {
    console.log('更新游戏配置:', { old: this.config, new: newConfig })

    const oldConfig = { ...this.config }
    this.config = { ...this.config, ...newConfig }

    if (oldConfig.gameMode !== this.config.gameMode) {
      await this.handleGameModeChange(oldConfig.gameMode, this.config.gameMode)
    }
  }

  private async handleGameModeChange(oldMode?: string, newMode?: string): Promise<void> {
    console.log('游戏模式变化:', oldMode, '->', newMode)

    this.stopAiVsAi()

    switch (newMode) {
      case 'pvp':
        this.disableAI()
        break
      case 'pve':
        if (this.config.aiConfig) {
          try {
            await this.enableAI(this.config.aiConfig)
            this.checkAndMakeAIMove()
          } catch (error) {
            console.warn('AI启用失败，保持当前游戏模式', error)
            // 不修改 gameMode，保持 pve 模式但AI功能不可用
            this.aiManager = null
          }
        }
        break
      case 'ai-vs-ai':
        if (this.config.aiConfig) {
          try {
            await this.enableAI(this.config.aiConfig)
          } catch (error) {
            console.warn('AI启用失败，保持当前游戏模式', error)
            // 不修改 gameMode，保持 ai-vs-ai 模式但AI功能不可用
            this.aiManager = null
          }
        }
        break
    }
  }

  startAiVsAi(): void {
    if (this.config.gameMode !== 'ai-vs-ai' || !this.aiManager) {
      console.warn('无法启动AI对AI：模式不正确或AI未初始化')
      return
    }

    if (!this.aiManager.isReady()) {
      console.warn('AI尚未准备好，无法启动AI对AI')
      return
    }

    this.aiVsAiRunning = true
    console.log('启动AI对AI自动对战')

    this.checkAndMakeAIMove()
  }

  stopAiVsAi(): void {
    this.aiVsAiRunning = false
    if (this.aiVsAiTimer) {
      clearTimeout(this.aiVsAiTimer)
      this.aiVsAiTimer = null
    }
    this.stopAIThinking()
    console.log('停止AI对AI自动对战')
  }

  toggleAiVsAi(): void {
    if (this.aiVsAiRunning) {
      this.stopAiVsAi()
    } else {
      this.startAiVsAi()
    }
  }

  getAiVsAiStatus(): boolean {
    return this.aiVsAiRunning
  }

  canPlayerMovePiece(piece: ChessPiece): boolean {
    const state = this.coreGame.getState()

    if (state.gameStatus !== 'playing') {
      return false
    }

    if (piece.camp !== state.currentPlayer) {
      return false
    }

    switch (this.config.gameMode) {
      case 'pvp':
        return true
      case 'pve':
        if (this.isAIThinking && piece.camp !== this.config.playerCamp) {
          return false
        }
        return piece.camp === this.config.playerCamp
      case 'ai-vs-ai':
        return false
      default:
        return false
    }
  }

  canPlayerMove(): boolean {
    const state = this.coreGame.getState()

    if (state.gameStatus !== 'playing') {
      return false
    }

    switch (this.config.gameMode) {
      case 'pvp':
        return true
      case 'pve':
        if (this.isAIThinking) {
          return false
        }
        return state.currentPlayer === this.config.playerCamp
      case 'ai-vs-ai':
        return false
      default:
        return false
    }
  }

  /**
   * 从保存的状态恢复游戏
   */
  restoreFromState(state: GameState): void {
    this.coreGame.restoreFromState(state)
    // 状态更新会通过 onStateUpdate 回调自动触发
  }

  private checkAndMakeAIMove(): void {
    if (this.shouldAIMove() && !this.isAIThinking) {
      console.log('检测到需要AI走棋')
      const delay = this.config.gameMode === 'ai-vs-ai' ? 1000 : 500
      setTimeout(() => {
        this.makeAIMove().catch((error) => {
          console.error('AI走棋失败:', error)
        })
      }, delay)
    }
  }
}
