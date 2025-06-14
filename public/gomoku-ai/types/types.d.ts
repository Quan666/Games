export declare enum GameRule {
  FREESTYLE = 0,
  STANDARD = 1,
  RENJU = 2,
}
export type Position = [number, number]
export declare enum PieceColor {
  BLACK = 1,
  WHITE = 2,
}
export interface AIConfig {
  rule?: number
  threads?: number
  candRange?: number
  strength?: number
  turnTime?: number
  matchTime?: number
  maxDepth?: number
  maxNodes?: number
  nbest?: number
  configIndex?: number
  hashSize?: number
  pondering?: boolean
  showDetail?: boolean
}
export interface PVInfo {
  depth: number
  seldepth: number
  nodes: number
  eval: string
  winrate: number
  bestline: Position[]
}
export interface AIOutput {
  pos: Position | null
  swap: boolean
  currentPV: number
  pv: PVInfo[]
  nodes: number
  speed: number
  msg: string | null
  realtime: {
    best: Position[]
    lost: Position[]
    thinking: Position[]
    thought: Position[]
  }
  forbid: Position[]
  error: string | null
}
export interface RealtimeCallback {
  onThinking?: (pos: Position) => void
  onThought?: (pos: Position) => void
  onBest?: (pos: Position) => void
  onLost?: (pos: Position) => void
  onMessage?: (msg: string) => void
  onProgress?: (output: AIOutput) => void
}
export interface AIStatus {
  ready: boolean
  thinking: boolean
  timeUsed: number
}
export interface BalanceMode {
  mode: 1 | 2
  bias?: number
}
