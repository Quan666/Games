// 增强的象棋游戏包装器 - 支持AI对AI模式和配置管理

import {
  ChessGame as CoreChessGame,
  type ChessGameConfig,
  type GameState,
  type Position,
  type ChessPiece,
  type Move,
} from './core'
import { AIManager, type AIManagerConfig } from './ai/AIManager'
import { aiConfigManager, type AIConfigWatcher } from './ai/ConfigManager'
import type { Store } from 'vuex'

export type {
  PieceType,
  Camp,
  Position,
  ChessPiece,
  Move,
  GameState,
  ChessGameSettings,
} from './core'

export interface EnhancedGameConfig {
  enableAI?: boolean
  gameMode?: 'pvp' | 'pve' | 'ai-vs-ai'
  playerCamp?: 'red' | 'black'
  store?: Store<any> // Vuex store for configuration management
}

export class EnhancedChessGame {
  private coreGame: CoreChessGame
  private config: EnhancedGameConfig
  private redAIManager: AIManager | null = null
  private blackAIManager: AIManager | null = null
  private _isAIThinking = false
  private aiVsAiRunning = false
  private aiVsAiTimer: number | null = null
  private configWatcher: AIConfigWatcher | null = null
  private externalMoveHandler: ((from: Position, to: Position) => boolean) | null = null

  constructor(savedState?: GameState, config: EnhancedGameConfig = {}) {
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
        // 状态更新时的逻辑
      },
    }
    this.coreGame = new CoreChessGame(coreConfig)

    // 如果有store，注册配置监听器
    if (this.config.store) {
      this.setupConfigWatcher()
    }

    // 初始化AI（如果需要）
    this.initializeAIManagers()
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
      // 走棋成功后检查是否需要AI走棋
      setTimeout(() => {
        this.checkAndMakeAIMove()
      }, 100)
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
    this.destroyAIManagers()
    if (this.configWatcher) {
      aiConfigManager.unregisterWatcher(this.configWatcher)
      this.configWatcher = null
    }
    this.coreGame.destroy()
  }

  // AI管理相关方法
  private setupConfigWatcher(): void {
    if (!this.config.store) return

    this.configWatcher = {
      redAIManager: this.redAIManager || undefined,
      blackAIManager: this.blackAIManager || undefined,
      store: this.config.store,
    }

    aiConfigManager.registerWatcher(this.configWatcher)
  }

  private async initializeAIManagers(): Promise<void> {
    if (!this.config.store) return

    const gameMode = this.config.store.state.chess.gameConfig.gameMode

    if (gameMode === 'pve') {
      // 人机模式 - 只需要一个AI实例
      await this.initSingleAI()
    } else if (gameMode === 'ai-vs-ai') {
      // AI对战模式 - 需要两个AI实例
      await this.initDualAI()
    }

    // 更新配置监听器
    if (this.configWatcher) {
      this.configWatcher.redAIManager = this.redAIManager || undefined
      this.configWatcher.blackAIManager = this.blackAIManager || undefined
    }
  }

  private async initSingleAI(): Promise<void> {
    if (!this.config.store) return

    try {
      const aiConfig = this.config.store.getters['chess/getCurrentAiConfig']
      console.log('初始化单AI实例，配置:', aiConfig)

      this.redAIManager = new AIManager(aiConfig)
      await this.redAIManager.init()
      
      console.log('单AI实例初始化完成')
    } catch (error) {
      console.error('单AI初始化失败:', error)
      throw error
    }
  }

  private async initDualAI(): Promise<void> {
    if (!this.config.store) return

    try {
      // 获取红方和黑方配置
      const redConfig = this.config.store.getters['chess/getRedAiFullConfig']
      const blackConfig = this.config.store.getters['chess/getBlackAiFullConfig']
      
      console.log('初始化双AI实例')
      console.log('红方配置:', redConfig)
      console.log('黑方配置:', blackConfig)

      // 初始化红方AI
      this.redAIManager = new AIManager(redConfig)
      await this.redAIManager.init()

      // 初始化黑方AI
      this.blackAIManager = new AIManager(blackConfig)
      await this.blackAIManager.init()

      console.log('双AI实例初始化完成')
    } catch (error) {
      console.error('双AI初始化失败:', error)
      throw error
    }
  }

  private destroyAIManagers(): void {
    if (this.redAIManager) {
      this.redAIManager.destroy()
      this.redAIManager = null
    }
    if (this.blackAIManager) {
      this.blackAIManager.destroy()
      this.blackAIManager = null
    }
  }

  // 游戏逻辑相关方法
  private _shouldAIMove(): boolean {
    if (this._isAIThinking) {
      return false
    }

    const state = this.coreGame.getState()
    if (state.gameStatus !== 'playing') {
      return false
    }

    const gameMode = this.config.store?.state.chess.gameConfig.gameMode

    switch (gameMode) {
      case 'pve':
        return state.currentPlayer !== this.config.playerCamp && this.redAIManager?.isReady()
      case 'ai-vs-ai':
        return this.aiVsAiRunning && this.getCurrentAIManager()?.isReady()
      default:
        return false
    }
  }

  private getCurrentAIManager(): AIManager | null {
    const state = this.coreGame.getState()
    const gameMode = this.config.store?.state.chess.gameConfig.gameMode

    if (gameMode === 'pve') {
      return this.redAIManager
    } else if (gameMode === 'ai-vs-ai') {
      return state.currentPlayer === 'red' ? this.redAIManager : this.blackAIManager
    }

    return null
  }

  private async checkAndMakeAIMove(): Promise<void> {
    if (this._shouldAIMove()) {
      try {
        await this._makeAIMove()
      } catch (error) {
        console.error('AI走棋失败:', error)
      }
    }
  }

  private async _makeAIMove(): Promise<boolean> {
    const aiManager = this.getCurrentAIManager()
    if (!aiManager) {
      console.error('没有可用的AI管理器')
      return false
    }

    try {
      this._isAIThinking = true
      console.log('开始AI思考...')

      const gameState = this.coreGame.getState()
      const fenWithMoves = this.getCurrentFenWithMoves()
      
      // 在AI思考前应用当前配置（确保使用最新配置）
      await this.applyCurrentConfigToAI(aiManager, gameState.currentPlayer)
      
      const move = await aiManager.getAIMove(gameState, fenWithMoves)

      if (move) {
        console.log('AI返回走法:', move)
        
        const success = this.externalMoveHandler
          ? this.externalMoveHandler(move.from, move.to)
          : this.makeMove(move.from, move.to)

        if (success && this.config.store?.state.chess.gameConfig.gameMode === 'ai-vs-ai' && this.aiVsAiRunning) {
          // AI对战模式，安排下一步
          this.scheduleNextAIMove()
        }

        return success
      } else {
        console.warn('AI未返回有效走法')
        return false
      }
    } catch (error) {
      console.error('AI走棋失败:', error)
      return false
    } finally {
      this._isAIThinking = false
    }
  }

  /**
   * 在AI思考前应用当前配置（只覆盖非公共配置）
   */
  private async applyCurrentConfigToAI(aiManager: AIManager, currentPlayer: string): Promise<void> {
    if (!this.config.store) return

    const gameMode = this.config.store.state.chess.gameConfig.gameMode

    if (gameMode === 'ai-vs-ai') {
      // AI对战模式，获取对应方的完整配置
      const fullConfig = currentPlayer === 'red'
        ? this.config.store.getters['chess/getRedAiFullConfig']
        : this.config.store.getters['chess/getBlackAiFullConfig']
      
      console.log(`应用${currentPlayer}方AI配置:`, fullConfig)
      aiManager.updateConfig(fullConfig)
    } else {
      // 人机模式，使用通用配置
      const aiConfig = this.config.store.getters['chess/getCurrentAiConfig']
      console.log('应用人机AI配置:', aiConfig)
      aiManager.updateConfig(aiConfig)
    }
  }

  private scheduleNextAIMove(): void {
    const gameSpeed = this.config.store?.getters['chess/getGameSpeed'] || 2000
    
    console.log(`AI走棋完成，等待 ${gameSpeed}ms 后继续`)
    
    this.aiVsAiTimer = window.setTimeout(() => {
      if (this.aiVsAiRunning && this._shouldAIMove()) {
        this.checkAndMakeAIMove()
      }
    }, gameSpeed)
  }

  // 外部接口方法
  async updateGameMode(gameMode: 'pvp' | 'pve' | 'ai-vs-ai'): Promise<void> {
    this.config.gameMode = gameMode
    
    // 停止当前AI活动
    this.stopAiVsAi()
    this.destroyAIManagers()

    // 重新初始化AI（如果需要）
    await this.initializeAIManagers()

    // 检查是否需要立即AI走棋
    setTimeout(() => {
      this.checkAndMakeAIMove()
    }, 100)
  }

  startAiVsAi(): void {
    if (this.config.gameMode !== 'ai-vs-ai') {
      console.error('不是AI对战模式，无法开始AI对战')
      return
    }

    if (!this.redAIManager || !this.blackAIManager) {
      console.error('AI实例未就绪，无法开始AI对战')
      return
    }

    console.log('开始AI对战')
    this.aiVsAiRunning = true
    this.checkAndMakeAIMove()
  }

  stopAiVsAi(): void {
    console.log('停止AI对战')
    this.aiVsAiRunning = false
    if (this.aiVsAiTimer) {
      clearTimeout(this.aiVsAiTimer)
      this.aiVsAiTimer = null
    }
    this.stopAIThinking()
  }

  stopAIThinking(): void {
    this._isAIThinking = false
    if (this.redAIManager) {
      this.redAIManager.stopThinking()
    }
    if (this.blackAIManager) {
      this.blackAIManager.stopThinking()
    }
  }

  setExternalMoveHandler(handler: ((from: Position, to: Position) => boolean) | null): void {
    this.externalMoveHandler = handler
  }

  // 状态查询方法
  isAIEnabled(): boolean {
    return this.config.gameMode !== 'pvp'
  }

  isAIThinking(): boolean {
    return this._isAIThinking
  }

  isAiVsAiRunning(): boolean {
    return this.aiVsAiRunning
  }

  getAIStatus(): any {
    const currentAIManager = this.getCurrentAIManager()
    return {
      enabled: this.isAIEnabled(),
      thinking: this._isAIThinking,
      ready: currentAIManager?.isReady() || false,
      status: currentAIManager?.getStatus() || 'idle',
      stats: currentAIManager?.getStats() || null,
    }
  }

  // 配置相关方法
  getConfig(): any {
    if (!this.config.store) {
      return {
        gameMode: this.config.gameMode,
        playerCamp: this.config.playerCamp,
        enableAI: this.config.enableAI,
        aiConfig: {},
        aiVsAiConfig: {},
      }
    }

    return {
      gameMode: this.config.store.state.chess?.gameConfig?.gameMode || 'pvp',
      playerCamp: this.config.store.state.chess?.gameConfig?.playerCamp || 'red',
      enableAI: this.config.store.state.chess?.gameConfig?.gameMode !== 'pvp',
      aiConfig: this.config.store.state.chess?.gameConfig?.aiConfig || {},
      aiVsAiConfig: this.config.store.state.chess?.gameConfig?.aiVsAiConfig || {},
    }
  }

  // 兼容性方法 - 提供与旧包装器相同的接口
  shouldAIMove(): boolean {
    return this._shouldAIMove()
  }

  async makeAIMove(): Promise<boolean> {
    return await this._makeAIMove()
  }

  async enableAI(aiConfig: any): Promise<void> {
    // 配置会通过store自动应用，这里只需要更新store
    if (this.config.store) {
      this.config.store.commit('chess/updateAiConfig', aiConfig)
    }
  }
}
