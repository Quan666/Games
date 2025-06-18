// AI管理器 - 统一管理象棋AI引擎

import { ChessAI } from './ChessAI'
import { gameStateToFEN, uciToMove, prepareFENForAI } from './fenUtils'
import type {
  AIEngine,
  AIEngineConfig,
  AIMove,
  AIEngineStats,
  AIEngineStatus,
  AIEngineEvent,
} from './types'
import type { GameState, Move } from '../core'

export interface AIManagerConfig {
  engine: 'pikafish'
  thinkingTime?: number
  depth?: number
  threads?: number
  hashSize?: number
  // Pikafish特有的UCI选项
  // 棋力相关
  skillLevel?: number // Skill Level: 0-20
  limitStrength?: boolean // UCI_LimitStrength
  uciElo?: number // UCI_Elo: 1280-3133
  ponder?: boolean // Ponder
  // 其他UCI选项
  multiPV?: number // MultiPV: 1-128
  moveOverhead?: number // Move Overhead: 0-5000
  repetitionRule?: string // Repetition Rule
  drawRule?: string // Draw Rule
  sixtyMoveRule?: boolean // Sixty Move Rule
  maxCheckCount?: number // MaxCheckCount: 0-1000
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
    if (this.engine instanceof ChessAI) {
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
    // 注意：由于类型问题，暂时不调用engine的removeEventListener
    // if (this.engine instanceof ChessAI) {
    //   this.engine.removeEventListener(listener)
    // }
  }

  /**
   * 初始化AI引擎
   */
  async init(): Promise<void> {
    if (this.engine) {
      return
    }

    try {
      switch (this.config.engine) {
        case 'pikafish':
          this.engine = new ChessAI()
          break
        default:
          throw new Error(`不支持的引擎: ${this.config.engine}`)
      }

      // 添加已有的事件监听器
      this.eventListeners.forEach((listener) => {
        if (this.engine instanceof ChessAI) {
          this.engine.addEventListener(listener)
        }
      })

      console.log('开始初始化AI引擎...')

      // 使用Promise包装，确保异步执行
      await new Promise<void>((resolve, reject) => {
        setTimeout(async () => {
          try {
            await this.engine!.init()
            console.log('AI引擎初始化成功')
            this.applyConfig()
            resolve()
          } catch (error) {
            reject(error)
          }
        }, 10)
      })
    } catch (error) {
      console.error('AI引擎初始化失败:', error)
      if (this.engine) {
        this.engine.destroy()
        this.engine = null
      }
      throw error
    }
  }

  /**
   * 应用配置
   */
  private applyConfig(): void {
    if (!this.engine) return

    const engineConfig: AIEngineConfig = {
      threads: this.config.threads,
      hashSize: this.config.hashSize,
      depth: this.config.depth || 8,
      timeLimit: this.config.thinkingTime,
      // 棋力相关配置
      skillLevel: this.config.skillLevel,
      limitStrength: this.config.limitStrength,
      uciElo: this.config.uciElo,
      ponder: this.config.ponder,
      // 其他UCI选项
      multiPV: this.config.multiPV,
      moveOverhead: this.config.moveOverhead,
      repetitionRule: this.config.repetitionRule,
      drawRule: this.config.drawRule,
      sixtyMoveRule: this.config.sixtyMoveRule,
      maxCheckCount: this.config.maxCheckCount,
    }

    if (this.engine instanceof ChessAI) {
      this.engine.setConfig(engineConfig)
    }
  }

  /**
   * 获取AI走法
   */
  async getAIMove(gameState: GameState, fenWithMoves?: string): Promise<Move | null> {
    if (!this.engine || !(this.engine instanceof ChessAI) || !this.engine.isReady()) {
      throw new Error('AI引擎未就绪')
    }

    try {
      console.log('获取AI走法，当前玩家:', gameState.currentPlayer)

      if (fenWithMoves) {
        // 使用提供的FEN+moves格式
        console.log('使用FEN+moves格式:', fenWithMoves)
        return await this.getAIMoveFromFENWithMoves(fenWithMoves, gameState)
      } else {
        // 使用传统的gameState转FEN方式
        const fen = gameStateToFEN(gameState)
        console.log('棋盘FEN:', fen)
        console.log('当前棋盘状态:')
        for (let y = 0; y < 10; y++) {
          const row = gameState.board[y]
            .map((piece) => (piece ? `${piece.type}${piece.camp[0]}` : '--'))
            .join(' ')
          console.log(`Y${y}: ${row}`)
        }

        // 设置棋盘位置并获取AI走法
        const aiMove = await this.engine.think(fen, {
          depth: this.config.depth || 8,
          timeLimit: this.config.thinkingTime,
        })

        console.log('AI返回的走法:', aiMove)

        // 转换为游戏内部格式
        if (aiMove) {
          const gameMove = this.convertAIMoveToGameMove(aiMove, gameState)
          console.log('转换后的游戏走法:', gameMove)
          return gameMove
        } else {
          console.log('AI没有找到有效走法')
          return null
        }
      }
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
      console.log('转换AI走法:', aiMove)

      const { from, to } = uciToMove(`${aiMove.from}${aiMove.to}`)
      console.log('转换后的坐标:', { from, to })

      // 查找起始位置的棋子
      const piece = gameState.board[from.y]?.[from.x]
      if (!piece) {
        console.error('起始位置没有棋子:', from, '棋盘状态:', gameState.board[from.y])
        return null
      }

      console.log('找到棋子:', piece.type, piece.camp, '在位置:', from)

      // 检查是否有被吃的棋子
      const capturedPiece = gameState.board[to.y]?.[to.x] || undefined
      if (capturedPiece) {
        console.log('目标位置有棋子:', capturedPiece.type, capturedPiece.camp)
      }

      return {
        from,
        to,
        piece,
        capturedPiece,
        timestamp: Date.now(),
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
    return this.engine?.status || 'idle'
  }

  /**
   * 获取引擎统计信息
   */
  getStats(): AIEngineStats | null {
    if (this.engine instanceof ChessAI) {
      return this.engine.getStats()
    }
    return null
  }

  /**
   * 检查是否就绪
   */
  isReady(): boolean {
    if (this.engine instanceof ChessAI) {
      return this.engine.isReady()
    }
    return false
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

  /**
   * 使用包含走棋历史的FEN字符串获取AI走法
   * 格式：fen [moves move1 move2 ...]
   */
  async getAIMoveFromFENWithMoves(
    fenWithMoves: string,
    gameState: GameState,
  ): Promise<Move | null> {
    if (!this.engine || !(this.engine instanceof ChessAI) || !this.engine.isReady()) {
      throw new Error('AI引擎未就绪')
    }

    try {
      console.log('处理包含走棋历史的FEN:', fenWithMoves)

      // 解析FEN和走棋历史
      const { positionFEN, moves } = prepareFENForAI(fenWithMoves)
      console.log('解析结果 - FEN:', positionFEN)
      console.log('解析结果 - 走棋历史:', moves)

      // 构建完整的FEN字符串（包含走棋历史）
      let fullFEN = positionFEN
      if (moves.length > 0) {
        fullFEN += ` moves ${moves.join(' ')}`
      }

      // 使用think方法获取AI走法
      const aiMove = await this.engine.think(fullFEN, {
        depth: this.config.depth || 8,
        timeLimit: this.config.thinkingTime,
      })

      console.log('AI返回的走法:', aiMove)

      // 转换为游戏内部格式
      if (aiMove) {
        const gameMove = this.convertAIMoveToGameMove(aiMove, gameState)
        console.log('转换后的游戏走法:', gameMove)
        return gameMove
      } else {
        console.log('AI没有找到有效走法')
        return null
      }
    } catch (error) {
      console.error('从FEN获取AI走法失败:', error)
      return null
    }
  }
}
