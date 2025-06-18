// AI引擎相关类型定义
// > option name Debug Log File type string default
// > option name NumaPolicy type string default auto
// > option name Threads type spin default 1 min 1 max 1024
// > option name Hash type spin default 16 min 1 max 33554432
// > option name Clear Hash type button
// > option name Ponder type check default false
// > option name MultiPV type spin default 1 min 1 max 128
// > option name Move Overhead type spin default 10 min 0 max 5000
// > option name nodestime type spin default 0 min 0 max 10000
// > option name Skill Level type spin default 20 min 0 max 20
// > option name Mate Threat Depth type spin default 1 min 0 max 10
// > option name Repetition Rule type combo default AsianRule var AsianRule var ChineseRule var SkyRule var ComputerRule var AllowChase
// > option name Draw Rule type combo default None var None var DrawAsBlackWin var DrawAsRedWin var DrawRepAsBlackWin var DrawRepAsRedWin
// > option name Sixty Move Rule type check default true
// > option name Rule60MaxPly type spin default 120 min 1 max 150
// > option name MaxCheckCount type spin default 0 min 0 max 1000
// > option name UCI_LimitStrength type check default false
// > option name UCI_Elo type spin default 1280 min 1280 max 3133
// > option name UCI_WDLCentipawn type check default true
// > option name LU_Output type check default true
// > option name UCI_ShowWDL type check default false
// > option name EvalFile type string default pikafish.nnue
export interface AIEngineConfig {
  // 基础配置
  engine?: string // 引擎名称，默认 pikafish
  threads?: number // Threads: 1-1024, 默认1
  hashSize?: number // Hash: 1-33554432MB, 默认16MB
  depth?: number // 搜索深度
  timeLimit?: number // 思考时间限制(秒) - 兼容旧版本
  thinkingTime?: number // 思考时间限制(秒) - 新版本

  // Pikafish专用选项
  ponder?: boolean // Ponder, 默认false
  multiPV?: number // MultiPV: 1-128, 默认1
  moveOverhead?: number // Move Overhead: 0-5000ms, 默认10
  nodestime?: number // nodestime: 0-10000, 默认0
  skillLevel?: number // Skill Level: 0-20, 默认20
  mateThreatDepth?: number // Mate Threat Depth: 0-10, 默认1
  repetitionRule?: 'AsianRule' | 'ChineseRule' | 'SkyRule' | 'ComputerRule' | 'AllowChase' // 默认AsianRule
  drawRule?: 'None' | 'DrawAsBlackWin' | 'DrawAsRedWin' | 'DrawRepAsBlackWin' | 'DrawRepAsRedWin' // 默认None
  sixtyMoveRule?: boolean // Sixty Move Rule, 默认true
  rule60MaxPly?: number // Rule60MaxPly: 1-150, 默认120
  maxCheckCount?: number // MaxCheckCount: 0-1000, 默认0 (0=无限制)
  limitStrength?: boolean // UCI_LimitStrength, 默认false
  uciElo?: number // UCI_Elo: 1280-3133, 默认1280
  uciWDLCentipawn?: boolean // UCI_WDLCentipawn, 默认true
  luOutput?: boolean // LU_Output, 默认true
  uciShowWDL?: boolean // UCI_ShowWDL, 默认false
  evalFile?: string // EvalFile, 默认pikafish.nnue
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
  depth: number
  nodes: number
  score: number
  time: number
  pv?: string[] // 主变例
  seldepth?: number // 选择深度
  multipv?: number // 当前主变例编号
  nps?: number // 每秒节点数
  hashfull?: number // 哈希表使用率 (千分比)
  tbhits?: number // 残局库命中次数
  wdl?: [number, number, number] // 胜和负概率 [win, draw, lose]
}

export type AIEngineStatus = 'idle' | 'initializing' | 'ready' | 'thinking' | 'error'

// AI引擎事件类型
export interface AIEngineEvent {
  type: 'status' | 'stats' | 'move' | 'error'
  data: any
}

// AI引擎基础接口
export interface AIEngine {
  status: AIEngineStatus
  init(): Promise<void>
  destroy(): void
  think(fen: string, config?: Partial<AIEngineConfig>): Promise<AIMove | null>
  stop(): void
  configure(config: Partial<AIEngineConfig>): void
  on(event: string, listener: (data: any) => void): void
  off(event: string, listener: (data: any) => void): void
}

// Pikafish 引擎接口
export interface PikafishEngine {
  sendCommand: (command: string) => void
  [key: string]: any
}

declare global {
  interface Window {
    Pikafish: (config: any) => Promise<PikafishEngine>
  }
}
