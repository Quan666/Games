// 中国象棋核心类型定义

export type PieceType =
  | '帥'
  | '將'
  | '仕'
  | '士'
  | '相'
  | '象'
  | '馬'
  | '車'
  | '炮'
  | '砲'
  | '兵'
  | '卒'

export type Camp = 'red' | 'black'

export interface Position {
  x: number
  y: number
}

export interface ChessPiece {
  id: string
  type: PieceType
  camp: Camp
  position: Position
  alive: boolean
}

export interface Move {
  from: Position
  to: Position
  piece: ChessPiece
  capturedPiece?: ChessPiece
  timestamp: number // 毫秒时间戳
  isCheck?: boolean // 是否造成将军
  isCheckmate?: boolean // 是否造成将死
  fen?: string // 移动后的FEN字符串
  uci?: string // UCI格式的移动
}

export interface GameState {
  board: (ChessPiece | null)[][]
  pieces: ChessPiece[]
  currentPlayer: Camp
  gameStatus: 'playing' | 'checkmate' | 'stalemate' | 'draw'
  moveHistory: Move[]
  isInCheck: boolean
}

export interface ChessGameSettings {
  soundEnabled: boolean
  voiceEnabled: boolean
  showValidMoves: boolean
  moveHints: boolean
  highlightLastMove: boolean
}

// 游戏状态更新回调
export type StateUpdateCallback = (state: GameState, settings: ChessGameSettings) => void

// 游戏初始化配置
export interface ChessGameConfig {
  initialState?: GameState
  settings?: Partial<ChessGameSettings>
  onStateUpdate?: StateUpdateCallback
}
