// AI引擎相关类型定义

export interface AIEngineConfig {
  threads?: number
  hashSize?: number
  depth?: number
  timeLimit?: number
  // Pikafish完整的UCI选项
  skillLevel?: number // Skill Level: 0-20, 默认20
  multiPV?: number // MultiPV: 1-128, 默认1
  moveOverhead?: number // Move Overhead: 0-5000ms, 默认10
  repetitionRule?: string // Repetition Rule: AsianRule/ChineseRule/ComputerRule
  drawRule?: string // Draw Rule: None/DrawAsBlackWin/DrawAsRedWin
  sixtyMoveRule?: boolean // Sixty Move Rule, 默认true
  maxCheckCount?: number // MaxCheckCount: 0-1000, 默认0 (0=无限制)
  limitStrength?: boolean // UCI_LimitStrength, 默认false
  uciElo?: number // UCI_Elo: 1280-3133, 默认1280
  ponder?: boolean // Ponder, 默认false
}

export interface AIMove {
  from: string
  to: string
  score?: number
  depth?: number
  nodes?: number
  time?: number
}

export interface AIEngineStats {
  nodes: number
  depth: number
  score: number
  time: number
  pv?: string[]
}

export interface AIEngine {
  init(): Promise<void>
  destroy(): void
  isReady(): boolean
  setPosition(fen: string): Promise<void>
  go(options?: { depth?: number; time?: number }): Promise<AIMove>
  stop(): void
  setConfig(config: AIEngineConfig): void
  getStats(): AIEngineStats | null
}

export type AIEngineStatus = 'idle' | 'initializing' | 'ready' | 'thinking' | 'error'

export interface AIEngineEvent {
  type: 'status' | 'stats' | 'move' | 'error'
  data: any
}

// Pikafish 引擎专用类型
export interface PikafishEngine {
  sendCommand: (command: string) => void
  onMessage?: (message: string) => void
  [key: string]: any
}

declare global {
  interface Window {
    Pikafish: (config: any) => Promise<PikafishEngine>
  }
}
