// 增强的象棋游戏包装器 - 支持AI对AI模式和配置管理

import {
  ChessGame as CoreChessGame,
  type ChessGameConfig,
  type GameState,
  type Position,
  type ChessPiece,
} from './core'
import { AIManager } from './ai/AIManager'
import { aiConfigManager, type AIConfigWatcher } from './ai/ConfigManager'

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
  store?: any // Vuex store for configuration management
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

    // 恢复AI对AI运行状态（如果从保存状态中恢复）
    if (savedState && this.config.store) {
      const savedAiVsAiRunning = this.config.store.state.chess?.gameState?.aiVsAiRunning
      if (savedAiVsAiRunning && this.config.gameMode === 'ai-vs-ai') {
        console.log('从保存状态恢复AI对AI运行状态')
        this.aiVsAiRunning = true
      }
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

  // 更新游戏配置
  async updateConfig(newConfig: Partial<EnhancedGameConfig>): Promise<void> {
    // 更新本地配置
    this.config = { ...this.config, ...newConfig }

    // 如果游戏模式发生变化，重新初始化AI
    if (newConfig.gameMode) {
      // 清理现有AI
      this.destroyAIManagers()
      // 重新初始化AI
      await this.initializeAIManagers()
    }

    // 如果玩家执棋发生变化，可能需要触发AI思考
    if (newConfig.playerCamp && this.config.gameMode === 'pve') {
      setTimeout(() => {
        this._checkAndMakeAIMove()
      }, 100)
    }
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
      // 走棋成功后，不在这里直接触发AI走棋
      // AI走棋逻辑由外部的onAnimationComplete统一管理
      console.log('走棋成功，等待外部逻辑处理后续AI操作')
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

      this.redAIManager = new AIManager(aiConfig)
      await this.redAIManager.init()
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

      // 初始化红方AI
      this.redAIManager = new AIManager(redConfig)
      await this.redAIManager.init()

      // 初始化黑方AI
      this.blackAIManager = new AIManager(blackConfig)
      await this.blackAIManager.init()
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
    // 首先检查AI是否正在思考
    if (this._isAIThinking) {
      console.log('AI正在思考中，不能重复走棋')
      return false
    }

    // 检查store中的AI思考状态，确保双重保护
    if (this.config.store?.state.chess?.gameState?.aiThinking) {
      console.log('Store中AI思考状态为true，不能重复走棋')
      return false
    }

    const state = this.coreGame.getState()
    if (state.gameStatus !== 'playing') {
      console.log('游戏不在进行中，AI不能走棋')
      return false
    }

    // 优先使用store中的配置，如果没有则使用本地配置
    const gameMode = this.config.store?.state.chess?.gameConfig?.gameMode || this.config.gameMode

    switch (gameMode) {
      case 'pve':
        const shouldMove =
          state.currentPlayer !== this.config.playerCamp && !!this.redAIManager?.isReady()
        console.log(
          `人机模式AI走棋检查: 当前玩家=${state.currentPlayer}, 玩家执棋=${this.config.playerCamp}, AI就绪=${!!this.redAIManager?.isReady()}, 应该走棋=${shouldMove}`,
        )
        return shouldMove
      case 'ai-vs-ai':
        const aiReady = !!this.getCurrentAIManager()?.isReady()
        const shouldMoveAI = this.aiVsAiRunning && aiReady
        console.log(
          `AI对战模式AI走棋检查: AI对战运行=${this.aiVsAiRunning}, AI就绪=${aiReady}, 当前玩家=${state.currentPlayer}, 应该走棋=${shouldMoveAI}`,
        )
        return shouldMoveAI
      default:
        console.log(`${gameMode}模式不需要AI走棋`)
        return false
    }
  }

  private getCurrentAIManager(): AIManager | null {
    const state = this.coreGame.getState()
    // 优先使用store中的配置，如果没有则使用本地配置
    const gameMode = this.config.store?.state.chess?.gameConfig?.gameMode || this.config.gameMode

    if (gameMode === 'pve') {
      return this.redAIManager
    } else if (gameMode === 'ai-vs-ai') {
      return state.currentPlayer === 'red' ? this.redAIManager : this.blackAIManager
    }

    return null
  }

  checkAndMakeAIMove(): Promise<void> {
    return this._checkAndMakeAIMove()
  }

  private async _checkAndMakeAIMove(): Promise<void> {
    // 严格检查AI走棋条件
    if (!this._shouldAIMove()) {
      return
    }

    // 防止并发调用：如果已经在执行AI走棋，则跳过
    if (this._isAIThinking) {
      console.log('AI走棋已在进行中，跳过重复调用')
      return
    }

    try {
      const success = await this._makeAIMove()
      if (success) {
        console.log('AI走棋成功')
      } else {
        console.log('AI走棋失败')
      }
    } catch (error) {
      console.error('AI走棋过程中发生错误:', error)
    }
  }

  /**
   * AI走子，失败自动重试（默认重试2次）
   */
  private async _makeAIMove(retryCount = 2): Promise<boolean> {
    // 双重检查：确保AI可以走棋
    if (!this._shouldAIMove()) {
      console.log('AI走棋条件不满足，取消走棋')
      return false
    }

    const aiManager = this.getCurrentAIManager()
    if (!aiManager) {
      console.error('没有可用的AI管理器')
      return false
    }

    // 防止重复走棋：立即设置思考状态
    if (this._isAIThinking) {
      console.log('AI正在思考中，取消重复走棋')
      return false
    }

    try {
      // 立即设置思考状态，防止重复调用
      this._isAIThinking = true
      // 立即同步AI思考状态到store
      if (this.config.store) {
        this.config.store.commit('chess/setAiThinking', true)
      }

      // 再次检查游戏状态，确保在设置思考状态后游戏仍然可以继续
      const gameState = this.coreGame.getState()
      if (gameState.gameStatus !== 'playing') {
        console.log('游戏已结束，取消AI走棋')
        return false
      }

      console.log(`AI开始思考... 当前玩家: ${gameState.currentPlayer}`)

      const fenWithMoves = this.getCurrentFenWithMoves()
      // 在AI思考前应用当前配置（确保使用最新配置）
      await this.applyCurrentConfigToAI(aiManager, gameState.currentPlayer)
      const move = await aiManager.getAIMove(gameState, fenWithMoves)

      if (move) {
        console.log(`AI找到走法: ${move.from.x},${move.from.y} -> ${move.to.x},${move.to.y}`)
        const success = this.externalMoveHandler
          ? this.externalMoveHandler(move.from, move.to)
          : this.makeMove(move.from, move.to)

        // 移除原来的自动调度逻辑，现在由onAnimationComplete统一处理
        return success
      } else {
        console.warn('AI未返回有效走法')
        // 失败时重试
        if (retryCount > 0) {
          console.log(`AI走棋失败，重试 ${retryCount} 次`)
          return await this._makeAIMove(retryCount - 1)
        }
        return false
      }
    } catch (error) {
      console.error('AI走棋失败:', error)
      // 异常时重试
      if (retryCount > 0) {
        console.log(`AI走棋异常，重试 ${retryCount} 次`)
        return await this._makeAIMove(retryCount - 1)
      }
      return false
    } finally {
      this._isAIThinking = false
      // 立即同步AI思考状态到store
      if (this.config.store) {
        this.config.store.commit('chess/setAiThinking', false)
      }
      console.log('AI思考状态已重置')
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
      const fullConfig =
        currentPlayer === 'red'
          ? this.config.store.getters['chess/getRedAiFullConfig']
          : this.config.store.getters['chess/getBlackAiFullConfig']

      aiManager.updateConfig(fullConfig)
    } else {
      // 人机模式，使用通用配置
      const aiConfig = this.config.store.getters['chess/getCurrentAiConfig']
      aiManager.updateConfig(aiConfig)
    }
  }

  // 外部接口方法
  async updateGameMode(gameMode: 'pvp' | 'pve' | 'ai-vs-ai'): Promise<void> {
    this.config.gameMode = gameMode
    // 停止当前AI活动
    this.stopAiVsAi()
    this.destroyAIManagers()
    // 重新初始化AI（如果需要）
    if (gameMode !== 'pvp') {
      await this.initializeAIManagers()
    }
    // 检查是否需要立即AI走棋
    setTimeout(() => {
      this._checkAndMakeAIMove()
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

    this.aiVsAiRunning = true
    this._checkAndMakeAIMove()
  }

  stopAiVsAi(): void {
    this.aiVsAiRunning = false
    if (this.aiVsAiTimer) {
      clearTimeout(this.aiVsAiTimer)
      this.aiVsAiTimer = null
    }
    this.stopAIThinking()
  }

  stopAIThinking(): void {
    this._isAIThinking = false
    // 立即同步AI思考状态到store
    if (this.config.store) {
      this.config.store.commit('chess/setAiThinking', false)
    }
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

  setAiVsAiRunning(running: boolean): void {
    this.aiVsAiRunning = running
  }

  getAIStatus(): any {
    // pvp模式下AI全部禁用
    if (
      this.config.gameMode === 'pvp' ||
      this.config.store?.state.chess?.gameConfig?.gameMode === 'pvp'
    ) {
      return {
        enabled: false,
        thinking: false,
        ready: false,
        status: 'disabled',
        stats: null,
      }
    }
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

  // 更新AI配置
  updateAIConfig(aiConfig: any): void {
    if (!this.config.store) {
      console.warn('没有store，无法更新AI配置')
      return
    }

    // 更新store中的AI配置
    this.config.store.commit('chess/updateAiConfig', aiConfig)

    // 立即应用配置到当前的AI管理器
    try {
      if (this.config.gameMode === 'pve' && this.redAIManager) {
        this.redAIManager.updateConfig(aiConfig)
      } else if (this.config.gameMode === 'ai-vs-ai') {
        // 在AI对战模式下，根据当前玩家选择对应的AI管理器
        const currentPlayer = this.coreGame.getState().currentPlayer
        const aiManager = currentPlayer === 'red' ? this.redAIManager : this.blackAIManager

        if (aiManager) {
          aiManager.updateConfig(aiConfig)
        }
      }
    } catch (error) {
      console.error('应用AI配置到AI管理器失败:', error)
    }
  }

  // 更新AI对战配置
  updateAIVsAIConfig(aiVsAiConfig: any): void {
    if (!this.config.store) {
      console.warn('没有store，无法更新AI对战配置')
      return
    }

    // 更新store中的AI对战配置
    this.config.store.commit('chess/updateAiVsAiConfig', aiVsAiConfig)

    // 立即应用配置到AI管理器
    try {
      if (this.config.gameMode === 'ai-vs-ai') {
        const currentPlayer = this.coreGame.getState().currentPlayer
        const currentAiConfig = currentPlayer === 'red' ? aiVsAiConfig.redAI : aiVsAiConfig.blackAI
        const aiManager = currentPlayer === 'red' ? this.redAIManager : this.blackAIManager

        if (aiManager && currentAiConfig) {
          aiManager.updateConfig(currentAiConfig)
        }
      }
    } catch (error) {
      console.error('应用AI对战配置到AI管理器失败:', error)
    }
  }
}
