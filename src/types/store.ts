// Store 类型定义

export interface GameSettings {
  showMoveOrder: boolean
  showLastMove: boolean
  showCoordinates: boolean
  showStatusPanel: boolean
  boardSize: number
  enableSound: boolean
}

export interface ChessSettings {
  gameMode: string
  playerCamp: string
  showCoordinates: boolean
  showMoveHistory: boolean
  enableSound: boolean
  enableVoice: boolean
}

export interface AIConfig {
  engine: string
  thinkingTime: number
  depth: number
  threads: number
  hashSize: number
  skillLevel: number
  multiPV: number
  moveOverhead: number
  nodestime: number
  mateThreatDepth: number
  repetitionRule: string
  drawRule: string
  maxCheckCount: number
  limitStrength: boolean
  uciElo: number
  ponder: boolean
}

export interface ChessAIVsAIConfig {
  redAI: Partial<AIConfig>
  blackAI: Partial<AIConfig>
  gameSpeed: number
}

export interface ChessGameConfig {
  gameMode: string
  playerCamp: string
  enableAI: boolean
  aiConfig: AIConfig
  aiVsAiConfig: ChessAIVsAIConfig
}

export interface ChessGameState {
  currentGame: any
  savedGames: any[]
  lastPlayTime: string | null
  moveHistory: any[]
  gameOver: boolean
  aiThinking: boolean
  aiVsAiRunning: boolean
}

export interface ChessState {
  settings: ChessSettings
  gameConfig: ChessGameConfig
  gameState: ChessGameState
  ui: {
    showSettings: boolean
    showSaveDialog: boolean
    showGameSettings: boolean
    showAISettings: boolean
  }
}

export interface RootState {
  count: number
  globalSettings: {
    soundEnabled: boolean
    voiceEnabled: boolean
    theme: string
    language: string
  }
  gomoku: any
  chess: ChessState
}
