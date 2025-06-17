// AI管理器 - 统一管理象棋AI引擎

import { PikafishAI } from './PikafishAI'
import { gameStateToFEN, uciToMove } from './fenUtils'
import type {
  AIEngine,
  AIEngineConfig,
  AIMove,
  AIEngineStats,
  AIEngineStatus,
  AIEngineEvent,
} from './types'
import type { GameState, Move } from '../ChessGame'

export interface AIManagerConfig {
  engine: 'pikafish'
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  thinkingTime?: number
  depth?: number
  threads?: number
  hashSize?: number
  // Pikafish特有的UCI选项
  skillLevel?: number // Skill Level: 0-20
  multiPV?: number // MultiPV: 1-128
  moveOverhead?: number // Move Overhead: 0-5000
  repetitionRule?: string // Repetition Rule
  drawRule?: string // Draw Rule
  sixtyMoveRule?: boolean // Sixty Move Rule
  maxCheckCount?: number // MaxCheckCount: 0-1000
  limitStrength?: boolean // UCI_LimitStrength
  uciElo?: number // UCI_Elo: 1280-3133
  ponder?: boolean // Ponder
}

export class AIManager {
  private engine: AIEngine | null = null
  private config: AIManagerConfig
  private eventListeners: ((event: AIEngineEvent) => void)[] = []

  constructor(config: AIManagerConfig) {
    this.config = {
      thinkingTime: 5,
      depth: 8,
      threads: 1,
      hashSize: 16,
      ...config,
    }
  }

  /**
   * 添加事件监听器
   */
  addEventListener(listener: (event: AIEngineEvent) => void): void {
    this.eventListeners.push(listener)
    if (this.engine instanceof PikafishAI) {
      this.engine.addEventListener(listener)
    }
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(listener: (event: AIEngineEvent) => void): void {
    const index = this.eventListeners.indexOf(listener)
    if (index > -1) {
      this.eventListeners.splice(index, 1)
    }
    if (this.engine instanceof PikafishAI) {
      this.engine.removeEventListener(listener)
    }
  }

  /**
   * 初始化AI引擎
   */
  async init(): Promise<void> {
    if (this.engine) {
      return
    }

    switch (this.config.engine) {
      case 'pikafish':
        this.engine = new PikafishAI()
        break
      default:
        throw new Error(`不支持的引擎: ${this.config.engine}`)
    }

    // 添加已有的事件监听器
    this.eventListeners.forEach((listener) => {
      if (this.engine instanceof PikafishAI) {
        this.engine.addEventListener(listener)
      }
    })

    await this.engine.init()
    this.applyConfig()
  }

  /**
   * 应用配置
   */
  private applyConfig(): void {
    if (!this.engine) return

    const engineConfig: AIEngineConfig = {
      threads: this.config.threads,
      hashSize: this.config.hashSize,
      depth: this.getDifficultyDepth(),
      timeLimit: this.config.thinkingTime,
    }

    this.engine.setConfig(engineConfig)
  }

  /**
   * 根据难度获取搜索深度
   */
  private getDifficultyDepth(): number {
    switch (this.config.difficulty) {
      case 'easy':
        return 4
      case 'medium':
        return 6
      case 'hard':
        return 8
      case 'expert':
        return 12
      default:
        return 8
    }
  }

  /**
   * 获取AI走法
   */
  async getAIMove(gameState: GameState): Promise<Move | null> {
    if (!this.engine || !this.engine.isReady()) {
      throw new Error('AI引擎未就绪')
    }

    try {
      // 转换为FEN格式
      const fen = gameStateToFEN(gameState)

      // 设置棋盘位置
      await this.engine.setPosition(fen)

      // 获取AI走法
      const aiMove = await this.engine.go({
        depth: this.getDifficultyDepth(),
        time: this.config.thinkingTime,
      })

      // 转换为游戏内部格式
      return this.convertAIMoveToGameMove(aiMove, gameState)
    } catch (error) {
      console.error('获取AI走法失败:', error)
      return null
    }
  }

  /**
   * 将AI走法转换为游戏走法
   */
  private convertAIMoveToGameMove(aiMove: AIMove, gameState: GameState): Move | null {
    try {
      const { from, to } = uciToMove(`${aiMove.from}${aiMove.to}`)

      // 查找起始位置的棋子
      const piece = gameState.board[from.y]?.[from.x]
      if (!piece) {
        console.error('起始位置没有棋子:', from)
        return null
      }

      // 检查是否有被吃的棋子
      const capturedPiece = gameState.board[to.y]?.[to.x] || undefined

      return {
        from,
        to,
        piece,
        capturedPiece,
        timestamp: new Date(),
        isCheck: false, // 将在makeMove中更新
        isCheckmate: false, // 将在makeMove中更新
      }
    } catch (error) {
      console.error('转换AI走法失败:', error)
      return null
    }
  }

  /**
   * 停止AI思考
   */
  stopThinking(): void {
    if (this.engine) {
      this.engine.stop()
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<AIManagerConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.applyConfig()
  }

  /**
   * 获取引擎状态
   */
  getStatus(): AIEngineStatus {
    if (this.engine instanceof PikafishAI) {
      return this.engine.getStatus()
    }
    return 'idle'
  }

  /**
   * 获取引擎统计信息
   */
  getStats(): AIEngineStats | null {
    return this.engine?.getStats() || null
  }

  /**
   * 检查是否就绪
   */
  isReady(): boolean {
    return this.engine?.isReady() || false
  }

  /**
   * 销毁AI管理器
   */
  destroy(): void {
    if (this.engine) {
      this.engine.destroy()
      this.engine = null
    }
    this.eventListeners = []
  }
}
