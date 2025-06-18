// 中国象棋游戏逻辑
// @ts-ignore
import { AIManager, gameStateToFEN, moveToUCI } from './ai'
import type { AIManagerConfig } from './ai'

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

export interface GameState {
  board: (ChessPiece | null)[][]
  pieces: ChessPiece[]
  currentPlayer: Camp
  gameStatus: 'playing' | 'checkmate' | 'stalemate' | 'draw'
  moveHistory: Move[]
  isInCheck: boolean
}

export interface Move {
  from: Position
  to: Position
  piece: ChessPiece
  capturedPiece?: ChessPiece
  timestamp: number // 毫秒时间戳
  isCheck?: boolean // 是否造成将军
  isCheckmate?: boolean // 是否造成将死
}

export interface GameConfig {
  enableAI?: boolean
  aiConfig?: AIManagerConfig
  gameMode?: 'pvp' | 'pve' | 'ai-vs-ai'
  playerCamp?: Camp // 玩家执棋颜色（PVE模式下）
  aiVsAiConfig?: {
    redAI: AIManagerConfig
    blackAI: AIManagerConfig
    gameSpeed?: number
  }
}

export class ChessGame {
  private state: GameState
  private config: GameConfig
  private aiManager: AIManager | null = null
  private isAIThinking = false
  // AI对AI模式控制
  private aiVsAiRunning = false
  private aiVsAiTimer: number | null = null
  // UCI 格式的移动历史，用于与AI引擎通信
  private uciMoveHistory: string[] = []
  // 外部移动处理器（例如调用棋盘组件的移动方法）
  private externalMoveHandler: ((from: Position, to: Position) => boolean) | null = null

  constructor(savedState?: GameState, config: GameConfig = {}) {
    this.config = {
      enableAI: false,
      gameMode: 'pvp',
      playerCamp: 'red',
      ...config,
    }

    try {
      if (savedState) {
        console.log('尝试从保存状态恢复游戏')
        this.state = this.restoreFromState(savedState)
        // 恢复UCI移动历史
        this.rebuildUciMoveHistory()
      } else {
        console.log('创建新游戏')
        this.state = this.initializeGame()
        this.uciMoveHistory = []
      }
    } catch (error) {
      console.error('游戏初始化失败，清除无效状态并创建新游戏:', error)
      // 清除无效的保存状态
      ChessGame.clearInvalidSavedState()
      this.state = this.initializeGame()
      this.uciMoveHistory = []
    }

    // 如果启用AI，立即初始化AI管理器
    if (
      (this.config.gameMode === 'pve' || this.config.gameMode === 'ai-vs-ai') &&
      this.config.aiConfig
    ) {
      this.initAI()
        .then(() => {
          // AI初始化完成后，检查是否需要立即走棋
          this.checkAndMakeAIMove()
        })
        .catch((error) => {
          console.error('AI初始化失败:', error)
        })
    }
  }

  // 初始化游戏
  private initializeGame(): GameState {
    console.log('=== 开始初始化游戏 ===')
    const pieces: ChessPiece[] = []
    const board: (ChessPiece | null)[][] = Array(10)
      .fill(null)
      .map(() => Array(9).fill(null))

    // 标准象棋开局棋子位置
    // Y坐标：0=黑方底线，9=红方底线
    // X坐标：0-8从左到右

    let pieceId = 1

    // 创建红方棋子（下方，Y=6,7,9）
    const redPiecesConfig = [
      // 底线棋子 (Y=9)
      { type: '車', x: 0, y: 9 },
      { type: '車', x: 8, y: 9 },
      { type: '馬', x: 1, y: 9 },
      { type: '馬', x: 7, y: 9 },
      { type: '相', x: 2, y: 9 },
      { type: '相', x: 6, y: 9 },
      { type: '仕', x: 3, y: 9 },
      { type: '仕', x: 5, y: 9 },
      { type: '帥', x: 4, y: 9 },
      // 炮 (Y=7)
      { type: '炮', x: 1, y: 7 },
      { type: '炮', x: 7, y: 7 },
      // 兵 (Y=6)
      { type: '兵', x: 0, y: 6 },
      { type: '兵', x: 2, y: 6 },
      { type: '兵', x: 4, y: 6 },
      { type: '兵', x: 6, y: 6 },
      { type: '兵', x: 8, y: 6 },
    ]

    // 创建黑方棋子（上方，Y=0,2,3）
    const blackPiecesConfig = [
      // 底线棋子 (Y=0)
      { type: '車', x: 0, y: 0 },
      { type: '車', x: 8, y: 0 },
      { type: '馬', x: 1, y: 0 },
      { type: '馬', x: 7, y: 0 },
      { type: '象', x: 2, y: 0 },
      { type: '象', x: 6, y: 0 },
      { type: '士', x: 3, y: 0 },
      { type: '士', x: 5, y: 0 },
      { type: '將', x: 4, y: 0 },
      // 炮 (Y=2)
      { type: '砲', x: 1, y: 2 },
      { type: '砲', x: 7, y: 2 },
      // 卒 (Y=3)
      { type: '卒', x: 0, y: 3 },
      { type: '卒', x: 2, y: 3 },
      { type: '卒', x: 4, y: 3 },
      { type: '卒', x: 6, y: 3 },
      { type: '卒', x: 8, y: 3 },
    ]

    // 添加红方棋子
    redPiecesConfig.forEach(({ type, x, y }) => {
      const piece: ChessPiece = {
        id: `red_${pieceId++}`,
        type: type as PieceType,
        camp: 'red',
        position: { x, y },
        alive: true,
      }
      pieces.push(piece)
      board[y][x] = piece
      console.log(`创建红方棋子: ${type} 在 (${x}, ${y})`)
    })

    // 添加黑方棋子
    blackPiecesConfig.forEach(({ type, x, y }) => {
      const piece: ChessPiece = {
        id: `black_${pieceId++}`,
        type: type as PieceType,
        camp: 'black',
        position: { x, y },
        alive: true,
      }
      pieces.push(piece)
      board[y][x] = piece
      console.log(`创建黑方棋子: ${type} 在 (${x}, ${y})`)
    })

    console.log(`=== 游戏初始化完成，共创建 ${pieces.length} 个棋子 ===`)
    console.log('红方棋子数量:', pieces.filter((p) => p.camp === 'red').length)
    console.log('黑方棋子数量:', pieces.filter((p) => p.camp === 'black').length)

    // 验证棋盘状态
    let boardPieceCount = 0
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 9; x++) {
        if (board[y][x]) boardPieceCount++
      }
    }
    console.log('棋盘上的棋子数量:', boardPieceCount)

    const gameState = {
      board,
      pieces,
      currentPlayer: 'red',
      gameStatus: 'playing',
      moveHistory: [],
      isInCheck: false,
    }

    // 验证标准开局棋盘
    // 临时设置state以便验证方法能访问
    const tempState = this.state
    this.state = gameState as GameState
    this.validateStandardSetup()
    this.state = tempState

    return gameState as GameState
  }

  // 获取当前游戏状态
  getState(): GameState {
    return { ...this.state }
  }

  // 获取指定位置的棋子
  getPieceAt(position: Position): ChessPiece | null {
    if (!this.isValidPosition(position)) return null
    return this.state.board[position.y][position.x]
  }

  // 检查位置是否在棋盘范围内
  private isValidPosition(position: Position): boolean {
    return position.x >= 0 && position.x < 9 && position.y >= 0 && position.y < 10
  }

  // 检查位置是否在九宫格内
  private isInPalace(position: Position, camp: Camp): boolean {
    if (camp === 'red') {
      return position.x >= 3 && position.x <= 5 && position.y >= 7 && position.y <= 9
    } else {
      return position.x >= 3 && position.x <= 5 && position.y >= 0 && position.y <= 2
    }
  }

  // 检查是否过河
  private hasCrossedRiver(position: Position, camp: Camp): boolean {
    if (camp === 'red') {
      return position.y < 5
    } else {
      return position.y > 4
    }
  }

  // 获取棋子的合法移动位置
  getValidMoves(piece: ChessPiece): Position[] {
    if (!piece.alive) return []

    const moves: Position[] = []
    const { position, type, camp } = piece

    switch (type) {
      case '帥':
      case '將':
        moves.push(...this.getKingMoves(position, camp))
        break
      case '仕':
      case '士':
        moves.push(...this.getAdvisorMoves(position, camp))
        break
      case '相':
      case '象':
        moves.push(...this.getElephantMoves(position, camp))
        break
      case '馬':
        moves.push(...this.getHorseMoves(position))
        break
      case '車':
        moves.push(...this.getChariotMoves(position))
        break
      case '炮':
      case '砲':
        moves.push(...this.getCannonMoves(position))
        break
      case '兵':
      case '卒':
        moves.push(...this.getSoldierMoves(position, camp))
        break
    }

    // 过滤掉会导致自己被将军的移动
    return moves.filter((to) => !this.wouldBeInCheck(piece, to))
  }

  // 帥/将的移动规则
  private getKingMoves(position: Position, camp: Camp): Position[] {
    const moves: Position[] = []
    const directions = [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
    ]

    for (const dir of directions) {
      const newPos = { x: position.x + dir.x, y: position.y + dir.y }
      if (this.isInPalace(newPos, camp)) {
        const targetPiece = this.getPieceAt(newPos)
        if (!targetPiece || targetPiece.camp !== camp) {
          moves.push(newPos)
        }
      }
    }

    // 检查飞将规则（帅将直接对面）
    const enemyKing = this.findEnemyKing(camp)
    if (enemyKing && position.x === enemyKing.position.x) {
      let hasObstacle = false
      const start = Math.min(position.y, enemyKing.position.y) + 1
      const end = Math.max(position.y, enemyKing.position.y)
      for (let y = start; y < end; y++) {
        if (this.getPieceAt({ x: position.x, y })) {
          hasObstacle = true
          break
        }
      }
      if (!hasObstacle) {
        moves.push(enemyKing.position)
      }
    }

    return moves
  }

  // 仕/士的移动规则
  private getAdvisorMoves(position: Position, camp: Camp): Position[] {
    const moves: Position[] = []
    const directions = [
      { x: 1, y: 1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
      { x: -1, y: -1 },
    ]

    for (const dir of directions) {
      const newPos = { x: position.x + dir.x, y: position.y + dir.y }
      if (this.isInPalace(newPos, camp)) {
        const targetPiece = this.getPieceAt(newPos)
        if (!targetPiece || targetPiece.camp !== camp) {
          moves.push(newPos)
        }
      }
    }

    return moves
  }

  // 相/象的移动规则
  private getElephantMoves(position: Position, camp: Camp): Position[] {
    const moves: Position[] = []
    const directions = [
      { x: 2, y: 2 },
      { x: 2, y: -2 },
      { x: -2, y: 2 },
      { x: -2, y: -2 },
    ]

    for (const dir of directions) {
      const newPos = { x: position.x + dir.x, y: position.y + dir.y }
      const blockPos = { x: position.x + dir.x / 2, y: position.y + dir.y / 2 }

      // 检查是否过河
      if (this.hasCrossedRiver(newPos, camp)) continue

      // 检查是否在棋盘范围内
      if (!this.isValidPosition(newPos)) continue

      // 检查象眼是否被堵
      if (this.getPieceAt(blockPos)) continue

      const targetPiece = this.getPieceAt(newPos)
      if (!targetPiece || targetPiece.camp !== camp) {
        moves.push(newPos)
      }
    }

    return moves
  }

  // 马的移动规则
  private getHorseMoves(position: Position): Position[] {
    const moves: Position[] = []
    const horseMoves = [
      { move: { x: 2, y: 1 }, block: { x: 1, y: 0 } },
      { move: { x: 2, y: -1 }, block: { x: 1, y: 0 } },
      { move: { x: -2, y: 1 }, block: { x: -1, y: 0 } },
      { move: { x: -2, y: -1 }, block: { x: -1, y: 0 } },
      { move: { x: 1, y: 2 }, block: { x: 0, y: 1 } },
      { move: { x: -1, y: 2 }, block: { x: 0, y: 1 } },
      { move: { x: 1, y: -2 }, block: { x: 0, y: -1 } },
      { move: { x: -1, y: -2 }, block: { x: 0, y: -1 } },
    ]

    for (const { move, block } of horseMoves) {
      const newPos = { x: position.x + move.x, y: position.y + move.y }
      const blockPos = { x: position.x + block.x, y: position.y + block.y }

      if (!this.isValidPosition(newPos)) continue
      if (this.getPieceAt(blockPos)) continue // 马腿被绊

      const targetPiece = this.getPieceAt(newPos)
      if (
        !targetPiece ||
        targetPiece.camp !==
          this.state.pieces.find((p) => p.position.x === position.x && p.position.y === position.y)
            ?.camp
      ) {
        moves.push(newPos)
      }
    }

    return moves
  }

  // 车的移动规则
  private getChariotMoves(position: Position): Position[] {
    const moves: Position[] = []
    const directions = [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
    ]

    const piece = this.getPieceAt(position)
    if (!piece) return moves

    for (const dir of directions) {
      for (let i = 1; i < 10; i++) {
        const newPos = { x: position.x + dir.x * i, y: position.y + dir.y * i }

        if (!this.isValidPosition(newPos)) break

        const targetPiece = this.getPieceAt(newPos)
        if (targetPiece) {
          if (targetPiece.camp !== piece.camp) {
            moves.push(newPos)
          }
          break
        } else {
          moves.push(newPos)
        }
      }
    }

    return moves
  }

  // 炮的移动规则
  private getCannonMoves(position: Position): Position[] {
    const moves: Position[] = []
    const directions = [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
    ]

    const piece = this.getPieceAt(position)
    if (!piece) return moves

    console.log('计算炮的移动:', piece.type, '在位置:', position)

    for (const dir of directions) {
      let hasJumped = false

      for (let i = 1; i < 10; i++) {
        const newPos = { x: position.x + dir.x * i, y: position.y + dir.y * i }

        if (!this.isValidPosition(newPos)) break

        const targetPiece = this.getPieceAt(newPos)

        if (!hasJumped) {
          if (targetPiece) {
            console.log('炮遇到架子:', targetPiece.type, '在位置:', newPos)
            hasJumped = true
          } else {
            moves.push(newPos) // 炮可以移动到空位
          }
        } else {
          if (targetPiece) {
            if (targetPiece.camp !== piece.camp) {
              console.log('炮可以吃掉:', targetPiece.type, '在位置:', newPos)
              moves.push(newPos) // 炮可以吃掉敌方棋子
            } else {
              console.log('炮不能吃掉己方棋子:', targetPiece.type, '在位置:', newPos)
            }
            break
          }
        }
      }
    }

    console.log('炮的可移动位置:', moves)
    return moves
  }

  // 兵/卒的移动规则
  private getSoldierMoves(position: Position, camp: Camp): Position[] {
    const moves: Position[] = []
    const piece = this.getPieceAt(position)
    if (!piece) return moves

    const forward = camp === 'red' ? -1 : 1
    const hasCrossed = this.hasCrossedRiver(position, camp)

    // 向前移动
    const forwardPos = { x: position.x, y: position.y + forward }
    if (this.isValidPosition(forwardPos)) {
      const targetPiece = this.getPieceAt(forwardPos)
      if (!targetPiece || targetPiece.camp !== camp) {
        moves.push(forwardPos)
      }
    }

    // 过河后可以左右移动
    if (hasCrossed) {
      const leftPos = { x: position.x - 1, y: position.y }
      const rightPos = { x: position.x + 1, y: position.y }

      if (this.isValidPosition(leftPos)) {
        const targetPiece = this.getPieceAt(leftPos)
        if (!targetPiece || targetPiece.camp !== camp) {
          moves.push(leftPos)
        }
      }

      if (this.isValidPosition(rightPos)) {
        const targetPiece = this.getPieceAt(rightPos)
        if (!targetPiece || targetPiece.camp !== camp) {
          moves.push(rightPos)
        }
      }
    }

    return moves
  }

  // 找到敌方的王
  private findEnemyKing(camp: Camp): ChessPiece | null {
    const enemyCamp = camp === 'red' ? 'black' : 'red'
    const kingType = enemyCamp === 'red' ? '帥' : '將'
    return this.state.pieces.find((p) => p.type === kingType && p.alive) || null
  }

  // 检查移动是否会导致自己被将军
  private wouldBeInCheck(piece: ChessPiece, to: Position): boolean {
    // 模拟移动
    const originalPos = piece.position
    const capturedPiece = this.getPieceAt(to)

    // 临时移动
    this.state.board[originalPos.y][originalPos.x] = null
    this.state.board[to.y][to.x] = piece
    piece.position = to
    if (capturedPiece) capturedPiece.alive = false

    // 检查是否被将军
    const inCheck = this.isInCheck(piece.camp)

    // 恢复原状
    this.state.board[to.y][to.x] = capturedPiece
    this.state.board[originalPos.y][originalPos.x] = piece
    piece.position = originalPos
    if (capturedPiece) capturedPiece.alive = true

    return inCheck
  }

  // 检查指定阵营是否被将军
  private isInCheck(camp: Camp): boolean {
    const king = this.state.pieces.find(
      (p) => p.camp === camp && (p.type === '帥' || p.type === '將') && p.alive,
    )

    if (!king) return false

    // 检查是否有敌方棋子可以攻击到王
    const enemyPieces = this.state.pieces.filter((p) => p.camp !== camp && p.alive)

    for (const enemyPiece of enemyPieces) {
      const moves = this.getValidMovesWithoutCheckValidation(enemyPiece)
      if (moves.some((move) => move.x === king.position.x && move.y === king.position.y)) {
        return true
      }
    }

    return false
  }

  // 获取合法移动（不进行将军检查，避免递归）
  private getValidMovesWithoutCheckValidation(piece: ChessPiece): Position[] {
    const moves: Position[] = []
    const { position, type, camp } = piece
    switch (type) {
      case '帥':
      case '將':
        moves.push(...this.getKingMoves(position, camp))
        break
      case '仕':
      case '士':
        moves.push(...this.getAdvisorMoves(position, camp))
        break
      case '相':
      case '象':
        moves.push(...this.getElephantMoves(position, camp))
        break
      case '馬':
        moves.push(...this.getHorseMoves(position))
        break
      case '車':
        moves.push(...this.getChariotMoves(position))
        break
      case '炮':
      case '砲':
        moves.push(...this.getCannonMoves(position))
        break
      case '兵':
      case '卒':
        moves.push(...this.getSoldierMoves(position, camp))
        break
    }

    return moves
  }

  // 执行移动
  makeMove(from: Position, to: Position): boolean {
    console.log('=== 开始执行makeMove ===')
    console.log('尝试移动从:', from, '到:', to)

    const piece = this.getPieceAt(from)
    console.log('起始位置的棋子:', piece)

    if (!piece || piece.camp !== this.state.currentPlayer) {
      console.log('无效移动：棋子不存在或不是当前玩家的棋子')
      console.log('当前玩家:', this.state.currentPlayer, '棋子阵营:', piece?.camp)
      return false
    }

    console.log('=== 棋子验证通过，检查有效移动 ===')
    const validMoves = this.getValidMoves(piece)
    console.log('有效移动位置:', validMoves)

    const isValidMove = validMoves.some((move) => move.x === to.x && move.y === to.y)
    console.log('移动是否有效:', isValidMove)

    if (!isValidMove) {
      console.log('无效移动：目标位置不在有效移动范围内')
      return false
    }

    console.log('=== 移动验证通过，开始执行移动 ===')
    const capturedPiece = this.getPieceAt(to)

    console.log('执行移动:', piece.type, piece.camp, '从', from, '到', to)
    if (capturedPiece) {
      console.log('吃掉棋子:', capturedPiece.type, capturedPiece.camp)
    }

    // 记录移动
    const move: Move = {
      from: { ...from },
      to: { ...to },
      piece,
      capturedPiece: capturedPiece || undefined,
      timestamp: Date.now(),
    }

    // 执行移动
    this.state.board[from.y][from.x] = null

    // 如果有被吃的棋子，先将其设为不活跃
    if (capturedPiece) {
      capturedPiece.alive = false
    }

    // 将棋子移动到新位置
    this.state.board[to.y][to.x] = piece
    piece.position = { ...to }

    // 强制清理棋盘状态，确保被吃的棋子不会残留
    if (capturedPiece) {
      // 清理棋盘上的死棋子
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 9; x++) {
          const boardPiece = this.state.board[y][x]
          if (boardPiece && !boardPiece.alive) {
            this.state.board[y][x] = null
          }
        }
      }

      // 注意：不要从pieces数组中移除死棋子，保留用于悔棋
      // this.state.pieces = this.state.pieces.filter(p => p.alive)
    }

    // 全面验证棋盘一致性
    console.log('=== 准备验证棋盘一致性 ===')
    this.validateBoardConsistency()
    console.log('=== 棋盘一致性验证完成 ===')

    // 切换玩家
    console.log('=== 准备切换玩家 ===')
    const oldPlayer = this.state.currentPlayer
    this.state.currentPlayer = this.state.currentPlayer === 'red' ? 'black' : 'red'
    console.log('玩家切换: ' + oldPlayer + ' -> ' + this.state.currentPlayer)
    console.log('=== 玩家切换完成 ===')

    // 检查游戏状态，获取将军和将死信息
    console.log('=== 准备更新游戏状态 ===')
    this.updateGameStatus()
    console.log('=== 游戏状态更新完成 ===')

    // 在走法记录中添加将军和将死信息
    move.isCheck = this.state.isInCheck
    move.isCheckmate = this.state.gameStatus === 'checkmate'

    this.state.moveHistory.push(move)

    // 更新UCI移动历史
    const uciMove = moveToUCI(move.from, move.to)
    this.uciMoveHistory.push(uciMove)
    console.log('UCI移动历史已更新:', this.uciMoveHistory)

    console.log('=== 走法已添加到历史记录 ===')

    // 如果游戏还在进行，检查是否需要AI走棋
    if (this.state.gameStatus === 'playing') {
      if (this.config.gameMode === 'ai-vs-ai' && this.aiVsAiRunning) {
        // AI对AI模式下，安排下一次走棋
        this.scheduleNextAiMove()
      } else if (this.shouldAIMove()) {
        console.log('满足AI走棋条件，准备启动AI')
        // 其他模式下的AI走棋，稍微延迟让界面更新
        setTimeout(() => {
          this.makeAIMove().catch((error) => {
            console.error('AI走棋出错:', error)
          })
        }, 800)
      }
    }

    console.log('=== makeMove 执行完成，返回 true ===')
    return true
  }

  // 悔棋
  undoMove(): boolean {
    if (this.state.moveHistory.length === 0) {
      return false
    }

    // 停止AI思考
    this.stopAIThinking()

    // 获取最后一步移动
    const lastMove = this.state.moveHistory.pop()
    if (!lastMove) {
      return false
    }

    // 同时移除UCI移动历史中的最后一步
    this.uciMoveHistory.pop()
    console.log('悔棋后UCI移动历史:', this.uciMoveHistory)

    // 找到实际的棋子对象（通过ID查找）
    const piece = this.state.pieces.find((p) => p.id === lastMove.piece.id)
    if (!piece) {
      console.error('找不到要悔棋的棋子:', lastMove.piece.id)
      return false
    }

    // 将棋子移回原位置
    this.state.board[lastMove.to.y][lastMove.to.x] = null
    this.state.board[lastMove.from.y][lastMove.from.x] = piece
    piece.position = { ...lastMove.from }

    // 如果有被吃的棋子，恢复它
    if (lastMove.capturedPiece) {
      const capturedPiece = this.state.pieces.find((p) => p.id === lastMove.capturedPiece!.id)
      if (capturedPiece) {
        // 恢复被吃棋子的状态
        capturedPiece.alive = true
        capturedPiece.position = { ...lastMove.to }
        this.state.board[lastMove.to.y][lastMove.to.x] = capturedPiece
        console.log('恢复被吃棋子:', capturedPiece.type, '在位置:', capturedPiece.position)
      } else {
        // 如果在pieces数组中找不到，说明可能被意外删除了，重新添加
        const restoredPiece = { ...lastMove.capturedPiece }
        restoredPiece.alive = true
        restoredPiece.position = { ...lastMove.to }
        this.state.pieces.push(restoredPiece)
        this.state.board[lastMove.to.y][lastMove.to.x] = restoredPiece
        console.log('重新创建被吃棋子:', restoredPiece.type, '在位置:', restoredPiece.position)
      }
    }

    // 切换回上一个玩家
    this.state.currentPlayer = this.state.currentPlayer === 'red' ? 'black' : 'red'

    // 验证棋盘一致性
    this.validateBoardConsistency()

    // 重新检查游戏状态
    this.state.gameStatus = 'playing' // 悔棋后游戏继续
    this.updateGameStatus()

    console.log('悔棋成功，恢复到:', lastMove.from, '从:', lastMove.to)
    return true
  }

  // 更新游戏状态
  private updateGameStatus() {
    console.log('=== updateGameStatus 开始 ===')
    const currentCamp = this.state.currentPlayer // 当前要移动的阵营
    console.log('当前阵营:', currentCamp)

    try {
      this.state.isInCheck = this.isInCheck(currentCamp)
      console.log('将军检查结果:', this.state.isInCheck)

      // 检查是否有合法移动
      const alivePieces = this.state.pieces.filter((p) => p.camp === currentCamp && p.alive)
      console.log('当前阵营活着的棋子数量:', alivePieces.length)

      const hasValidMoves = alivePieces.some((p) => {
        const moves = this.getValidMoves(p)
        console.log(
          `棋子 ${p.type} 在 (${p.position.x},${p.position.y}) 有 ${moves.length} 个有效移动`,
        )
        return moves.length > 0
      })

      console.log('是否有有效移动:', hasValidMoves)

      if (!hasValidMoves) {
        this.state.gameStatus = this.state.isInCheck ? 'checkmate' : 'stalemate'
        console.log('游戏结束，状态:', this.state.gameStatus)
      } else {
        console.log('游戏继续进行')
      }
    } catch (error) {
      console.error('updateGameStatus 出错:', error)
    }

    console.log('=== updateGameStatus 结束 ===')
  }

  // 重置游戏
  reset() {
    console.log('重置游戏，保留AI配置')
    const currentConfig = this.config // 保存当前配置
    this.state = this.initializeGame()
    this.config = currentConfig // 恢复配置
    console.log('游戏重置完成，配置:', this.config)
  }

  // 从保存的状态恢复游戏
  private restoreFromState(savedState: GameState): GameState {
    console.log('=== 开始恢复游戏状态 ===')
    console.log('savedState:', savedState)

    // 检查savedState的基本有效性
    if (!savedState) {
      console.warn('savedState为空，创建新游戏')
      return this.initializeGame()
    }

    // 深拷贝状态以避免引用问题
    let state: any
    try {
      state = JSON.parse(JSON.stringify(savedState))
    } catch (error) {
      console.error('JSON解析savedState失败:', error)
      return this.initializeGame()
    }

    console.log('深拷贝后的状态:', state)
    console.log('pieces类型:', typeof state.pieces, 'isArray:', Array.isArray(state.pieces))

    // 核心验证：检查pieces数组
    if (!state.pieces || !Array.isArray(state.pieces) || state.pieces.length === 0) {
      console.warn('棋子数组无效或为空，重新创建标准开局')
      console.log('- pieces存在:', !!state.pieces)
      console.log('- 是数组:', Array.isArray(state.pieces))
      console.log('- 数组长度:', state.pieces ? state.pieces.length : 'N/A')
      return this.initializeGame()
    }

    // 验证棋子数量是否符合标准象棋
    const alivePieces = state.pieces.filter((p: any) => p && p.alive === true)
    if (alivePieces.length < 10) {
      // 至少应该有两个将帅
      console.warn(`存活棋子数量过少 (${alivePieces.length})，重新创建标准开局`)
      return this.initializeGame()
    }

    // 验证必须存在的棋子（将帅）
    const redKing = alivePieces.find((p: any) => p.type === '帥' && p.camp === 'red')
    const blackKing = alivePieces.find((p: any) => p.type === '將' && p.camp === 'black')

    if (!redKing || !blackKing) {
      console.warn('缺少必要棋子（将帅），重新创建标准开局')
      return this.initializeGame()
    }

    // 验证其他基本属性
    if (
      !state.currentPlayer ||
      (state.currentPlayer !== 'red' && state.currentPlayer !== 'black')
    ) {
      console.warn('当前玩家状态无效，设置为红方')
      state.currentPlayer = 'red'
    }

    if (!state.moveHistory || !Array.isArray(state.moveHistory)) {
      console.warn('移动历史格式错误，设置为空数组')
      state.moveHistory = []
    }

    if (!state.gameStatus) {
      console.warn('游戏状态缺失，设置为playing')
      state.gameStatus = 'playing'
    }

    if (typeof state.isInCheck !== 'boolean') {
      console.warn('将军状态格式错误，设置为false')
      state.isInCheck = false
    }

    // 重建棋盘
    console.log('=== 重建棋盘 ===')
    state.board = Array(10)
      .fill(null)
      .map(() => Array(9).fill(null))

    // 验证并清理棋子数据
    const validPieces = state.pieces.filter((piece: any) => {
      if (!piece) return false

      const isValid =
        typeof piece.type === 'string' &&
        typeof piece.camp === 'string' &&
        piece.position &&
        typeof piece.position.x === 'number' &&
        typeof piece.position.y === 'number' &&
        typeof piece.alive === 'boolean' &&
        piece.position.x >= 0 &&
        piece.position.x < 9 &&
        piece.position.y >= 0 &&
        piece.position.y < 10

      if (!isValid) {
        console.warn('发现无效棋子:', piece)
      }

      return isValid
    })

    if (validPieces.length !== state.pieces.length) {
      console.warn(`过滤无效棋子: ${state.pieces.length} -> ${validPieces.length}`)
    }

    state.pieces = validPieces

    // 将存活的棋子放置到棋盘上
    const alivePiecesForBoard = state.pieces.filter((piece: ChessPiece) => piece.alive)
    console.log('将', alivePiecesForBoard.length, '个存活棋子放置到棋盘上')

    alivePiecesForBoard.forEach((piece: ChessPiece) => {
      const { x, y } = piece.position
      if (state.board[y][x]) {
        console.warn(`位置冲突 (${x}, ${y}):`, state.board[y][x], 'vs', piece)
      }
      state.board[y][x] = piece
    })

    console.log('=== 游戏状态恢复完成 ===')
    console.log('最终棋子数量:', state.pieces.length)
    console.log('存活棋子数量:', alivePiecesForBoard.length)

    return state as GameState
  }

  // 获取当前状态的深拷贝（用于保存）
  getStateForSaving(): GameState {
    return JSON.parse(JSON.stringify(this.state))
  }

  // 验证棋盘一致性
  private validateBoardConsistency(): void {
    // 清空棋盘
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 9; x++) {
        this.state.board[y][x] = null
      }
    }

    // 只把活着的棋子放在棋盘上
    const alivePieces = this.state.pieces.filter((p) => p.alive)
    for (const piece of alivePieces) {
      const { x, y } = piece.position
      if (x >= 0 && x < 9 && y >= 0 && y < 10) {
        this.state.board[y][x] = piece
      }
    }
  }

  // AI相关方法

  /**
   * 初始化AI管理器
   */
  private async initAI(): Promise<void> {
    if (!this.config.aiConfig) return

    try {
      this.aiManager = new AIManager(this.config.aiConfig)

      // 使用异步初始化，避免阻塞主线程
      await new Promise<void>((resolve, reject) => {
        setTimeout(async () => {
          try {
            await this.aiManager!.init()
            // 配置已在构造函数中应用，无需再次更新
            resolve()
          } catch (error) {
            reject(error)
          }
        }, 50) // 延迟50ms开始初始化
      })
    } catch (error) {
      console.error('AI初始化失败:', error)
      throw error
    }
  }

  /**
   * 启用AI
   */
  async enableAI(aiConfig: AIManagerConfig): Promise<void> {
    console.log('启用AI，配置:', aiConfig)
    this.config.enableAI = true
    this.config.aiConfig = aiConfig

    if (this.aiManager) {
      console.log('销毁现有AI管理器')
      this.aiManager.destroy()
    }

    console.log('初始化新的AI管理器')
    await this.initAI()

    console.log('AI启用完成，状态:', this.getAIStatus())
  }

  /**
   * 禁用AI
   */
  disableAI(): void {
    this.config.enableAI = false
    if (this.aiManager) {
      this.aiManager.destroy()
      this.aiManager = null
    }
  }

  /**
   * 销毁游戏实例
   */
  destroy(): void {
    // 停止AI对AI模式
    this.stopAiVsAi()

    // 销毁AI管理器
    if (this.aiManager) {
      this.aiManager.destroy()
      this.aiManager = null
    }
  }

  /**
   * 检查是否应该AI走棋
   */
  shouldAIMove(): boolean {
    console.log('shouldAIMove 检查:', {
      hasAIManager: !!this.aiManager,
      isAIThinking: this.isAIThinking,
      gameStatus: this.state.gameStatus,
      aiReady: this.aiManager?.isReady(),
      gameMode: this.config.gameMode,
      aiVsAiRunning: this.aiVsAiRunning,
      currentPlayer: this.state.currentPlayer,
    })

    // 基础条件检查
    if (!this.aiManager || this.isAIThinking) {
      console.log('AI基础条件不满足:', {
        hasAIManager: !!this.aiManager,
        isAIThinking: this.isAIThinking,
      })
      return false
    }

    // 游戏必须在进行中
    if (this.state.gameStatus !== 'playing') {
      console.log('游戏状态不是playing:', this.state.gameStatus)
      return false
    }

    // AI必须已准备好
    if (!this.aiManager.isReady()) {
      console.log('AI未准备好')
      return false
    }

    switch (this.config.gameMode) {
      case 'pve':
        // 人机对战：只有当轮到AI阵营且玩家不能操作AI棋子时
        const isAITurn = this.state.currentPlayer !== this.config.playerCamp
        console.log('PVE模式 AI走棋检查:', {
          currentPlayer: this.state.currentPlayer,
          playerCamp: this.config.playerCamp,
          isAITurn,
          isAIThinking: this.isAIThinking,
        })
        return isAITurn
      case 'ai-vs-ai':
        // AI对战：总是让AI走棋，但要检查是否正在运行
        console.log('AI vs AI模式检查:', { aiVsAiRunning: this.aiVsAiRunning })
        return this.aiVsAiRunning
      default:
        console.log('未知游戏模式:', this.config.gameMode)
        return false
    }
  }

  /**
   * 请求AI走棋
   */
  async requestAIMove(): Promise<Move | null> {
    if (!this.shouldAIMove()) {
      return null
    }

    try {
      this.isAIThinking = true
      console.log('开始请求AI走棋...')

      // 构建包含移动历史的FEN字符串
      const fenWithMoves = this.getFenWithMoves()
      console.log('发送给AI的位置信息:', fenWithMoves)

      // 使用新的AI接口
      const aiMove = await this.aiManager!.getAIMove(this.state, fenWithMoves)

      if (aiMove) {
        console.log('AI返回移动:', aiMove)

        // AI已经返回了游戏格式的移动，直接使用
        const { from, to } = aiMove

        // 查找起始位置的棋子
        const piece = this.state.board[from.y]?.[from.x]
        if (!piece) {
          console.error('起始位置没有棋子:', from)
          return null
        }

        // 检查是否有被吃的棋子
        const capturedPiece = this.state.board[to.y]?.[to.x] || undefined

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

  /**
   * 执行AI走棋
   */
  async makeAIMove(): Promise<boolean> {
    const aiMove = await this.requestAIMove()
    if (aiMove) {
      // 如果存在外部移动处理器，优先使用它
      if (this.externalMoveHandler) {
        return this.externalMoveHandler(aiMove.from, aiMove.to)
      } else {
        return this.makeMove(aiMove.from, aiMove.to)
      }
    }
    return false
  }

  /**
   * 停止AI思考
   */
  stopAIThinking(): void {
    if (this.aiManager) {
      this.aiManager.stopThinking()
    }
    this.isAIThinking = false
  }

  /**
   * 获取AI状态
   */
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

  /**
   * 更新AI配置
   */
  updateAIConfig(newConfig: Partial<AIManagerConfig>): void {
    if (this.aiManager && this.config.aiConfig) {
      this.config.aiConfig = { ...this.config.aiConfig, ...newConfig }
      this.aiManager.updateConfig(newConfig)
    }
  }

  /**
   * 设置外部移动处理器（例如棋盘组件的移动方法）
   */
  setExternalMoveHandler(handler: ((from: Position, to: Position) => boolean) | null): void {
    this.externalMoveHandler = handler
  }

  /**
   * 获取游戏配置
   */
  getConfig(): GameConfig {
    return { ...this.config }
  }

  /**
   * 更新游戏配置
   */
  async updateConfig(newConfig: Partial<GameConfig>): Promise<void> {
    console.log('更新游戏配置:', { old: this.config, new: newConfig })

    const oldConfig = { ...this.config }
    this.config = { ...this.config, ...newConfig }

    // 如果游戏模式变化，处理AI状态
    if (oldConfig.gameMode !== this.config.gameMode) {
      await this.handleGameModeChange(oldConfig.gameMode, this.config.gameMode)
    }
  }

  /**
   * 更新游戏模式
   */
  async updateGameMode(gameMode: 'pvp' | 'pve' | 'ai-vs-ai'): Promise<void> {
    console.log('更新游戏模式:', gameMode)
    await this.updateConfig({ gameMode })
  }

  /**
   * 处理游戏模式变化
   */
  private async handleGameModeChange(oldMode?: string, newMode?: string): Promise<void> {
    console.log('游戏模式变化:', oldMode, '->', newMode)

    // 停止AI对AI自动模式
    this.stopAiVsAi()

    // 根据新模式调整AI设置
    switch (newMode) {
      case 'pvp':
        this.disableAI()
        break
      case 'pve':
        if (this.config.aiConfig) {
          const success = await this.safeEnableAI(this.config.aiConfig)
          if (!success) {
            console.warn('AI启用失败，回退到PVP模式')
            this.config.gameMode = 'pvp'
          } else {
            // AI启用成功，检查是否需要立即走棋
            console.log('AI启用成功，检查是否需要立即走棋')
            this.checkAndMakeAIMove()
          }
        }
        break
      case 'ai-vs-ai':
        // AI vs AI 模式需要特殊处理，使用默认配置或者从aiConfig中获取基础配置
        const aiVsAiConfig = this.config.aiConfig || {
          engine: 'pikafish',
          thinkingTime: 5,
          depth: 8,
          threads: 1,
          hashSize: 16,
          skillLevel: 20,
          multiPV: 1,
          moveOverhead: 10,
          repetitionRule: 'AsianRule',
          drawRule: 'None',
          sixtyMoveRule: true,
          maxCheckCount: 0,
          limitStrength: false,
          uciElo: 1280,
          ponder: false,
        }

        const success = await this.safeEnableAI(aiVsAiConfig)
        if (!success) {
          console.warn('AI启用失败，回退到PVP模式')
          this.config.gameMode = 'pvp'
        } else {
          console.log('AI vs AI 模式启用成功，AI Manager 状态:', {
            hasAIManager: !!this.aiManager,
            isReady: this.aiManager?.isReady(),
            status: this.aiManager?.getStatus(),
          })
          // 确保AI完全准备好后再尝试启动对战
          if (this.aiManager?.isReady()) {
            console.log('AI已准备就绪，可以开始对战')
          } else {
            console.log('AI尚未准备就绪，等待初始化完成')
          }
        }
        break
    }
  }

  /**
   * 开始AI对AI自动对战
   */
  startAiVsAi(): void {
    console.log('startAiVsAi 被调用:', {
      gameMode: this.config.gameMode,
      hasAIManager: !!this.aiManager,
      aiReady: this.aiManager?.isReady(),
      currentAiVsAiRunning: this.aiVsAiRunning,
    })

    if (this.config.gameMode !== 'ai-vs-ai' || !this.aiManager) {
      console.warn('无法启动AI对AI：模式不正确或AI未初始化', {
        gameMode: this.config.gameMode,
        hasAIManager: !!this.aiManager,
      })
      return
    }

    if (!this.aiManager.isReady()) {
      console.warn('AI尚未准备好，无法启动AI对AI')
      return
    }

    this.aiVsAiRunning = true
    console.log('启动AI对AI自动对战，aiVsAiRunning设置为:', this.aiVsAiRunning)

    // 立即检查并开始第一步
    setTimeout(() => {
      console.log('延迟调用 checkAndMakeAIMove')
      this.checkAndMakeAIMove()
    }, 100)
  }

  /**
   * 停止AI对AI自动对战
   */
  stopAiVsAi(): void {
    this.aiVsAiRunning = false
    if (this.aiVsAiTimer) {
      clearTimeout(this.aiVsAiTimer)
      this.aiVsAiTimer = null
    }
    // 停止当前AI思考
    this.stopAIThinking()
    console.log('停止AI对AI自动对战')
  }

  /**
   * 安排下一次AI走棋
   */
  private scheduleNextAiMove(): void {
    if (!this.aiVsAiRunning || this.state.gameStatus !== 'playing') {
      return
    }

    // 设置延迟，让用户能看到走棋过程
    const delay = this.config.aiVsAiConfig?.gameSpeed || 1500

    this.aiVsAiTimer = setTimeout(() => {
      if (this.aiVsAiRunning && this.shouldAIMove()) {
        this.makeAIMove()
          .then((success) => {
            if (success && this.aiVsAiRunning) {
              // 继续下一轮
              this.scheduleNextAiMove()
            }
          })
          .catch((error) => {
            console.error('AI对AI走棋失败:', error)
            this.stopAiVsAi()
          })
      }
    }, delay)
  }

  /**
   * 切换AI对AI模式开关
   */
  toggleAiVsAi(): void {
    if (this.aiVsAiRunning) {
      this.stopAiVsAi()
    } else {
      this.startAiVsAi()
    }
  }

  /**
   * 设置AI对AI运行状态（用于与外部状态同步）
   */
  setAiVsAiRunning(running: boolean): void {
    console.log('设置AI对AI运行状态:', running)
    this.aiVsAiRunning = running
  }

  /**
   * 获取AI对AI运行状态
   */
  getAiVsAiStatus(): boolean {
    return this.aiVsAiRunning
  }

  /**
   * 验证标准开局棋盘是否正确初始化
   */
  private validateStandardSetup(): boolean {
    console.log('=== 验证标准开局棋盘 ===')

    // 期望的棋子数量
    const expectedCounts = {
      red: { 車: 2, 馬: 2, 相: 2, 仕: 2, 帥: 1, 炮: 2, 兵: 5 },
      black: { 車: 2, 馬: 2, 象: 2, 士: 2, 將: 1, 砲: 2, 卒: 5 },
    }

    // 统计实际棋子数量
    const actualCounts = {
      red: {} as Record<string, number>,
      black: {} as Record<string, number>,
    }

    this.state.pieces.forEach((piece) => {
      if (piece.alive) {
        const camp = piece.camp
        const type = piece.type
        actualCounts[camp][type] = (actualCounts[camp][type] || 0) + 1
      }
    })

    // 验证红方棋子
    let isValid = true
    for (const [type, expectedCount] of Object.entries(expectedCounts.red)) {
      const actualCount = actualCounts.red[type] || 0
      if (actualCount !== expectedCount) {
        console.error(`红方 ${type} 数量错误: 期望 ${expectedCount}, 实际 ${actualCount}`)
        isValid = false
      }
    }

    // 验证黑方棋子
    for (const [type, expectedCount] of Object.entries(expectedCounts.black)) {
      const actualCount = actualCounts.black[type] || 0
      if (actualCount !== expectedCount) {
        console.error(`黑方 ${type} 数量错误: 期望 ${expectedCount}, 实际 ${actualCount}`)
        isValid = false
      }
    }

    // 验证重要位置的棋子
    const keyPositions = [
      // 红方
      { x: 4, y: 9, expected: '帥', camp: 'red' },
      { x: 0, y: 9, expected: '車', camp: 'red' },
      { x: 8, y: 9, expected: '車', camp: 'red' },
      // 黑方
      { x: 4, y: 0, expected: '將', camp: 'black' },
      { x: 0, y: 0, expected: '車', camp: 'black' },
      { x: 8, y: 0, expected: '車', camp: 'black' },
    ]

    keyPositions.forEach(({ x, y, expected, camp }) => {
      const piece = this.state.board[y][x]
      if (!piece || piece.type !== expected || piece.camp !== camp) {
        console.error(
          `位置 (${x}, ${y}) 错误: 期望 ${camp} ${expected}, 实际 ${piece ? `${piece.camp} ${piece.type}` : '空'}`,
        )
        isValid = false
      }
    })

    if (isValid) {
      console.log('✓ 标准开局棋盘验证通过')
    } else {
      console.error('✗ 标准开局棋盘验证失败')
    }

    return isValid
  }

  /**
   * 强制重新初始化为标准开局
   */
  forceStandardSetup(): void {
    console.log('=== 强制重新初始化为标准开局 ===')

    // 停止AI思考
    if (this.aiManager) {
      this.aiManager.stopThinking()
    }

    // 重新初始化游戏状态
    this.state = this.initializeGame()

    console.log('=== 标准开局初始化完成 ===')
  }

  /**
   * 清除无效的保存状态
   */
  static clearInvalidSavedState(): void {
    console.log('=== 清除无效的保存状态 ===')

    // 如果在浏览器环境中且有store可用
    if (typeof window !== 'undefined' && (window as any).store) {
      try {
        const store = (window as any).store
        if (store.state?.chess?.gameState) {
          store.state.chess.gameState.currentGame = null
          console.log('已清除store中的无效游戏状态')
        }
      } catch (error) {
        console.error('清除store状态失败:', error)
      }
    }

    // 清除localStorage中的相关数据
    try {
      const keys = ['chess_game_state', 'vuex', 'chess_current_game']
      keys.forEach((key) => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key)
          console.log(`已清除localStorage中的 ${key}`)
        }
      })
    } catch (error) {
      console.error('清除localStorage失败:', error)
    }
  }

  /**
   * 安全地启用AI（带错误处理）
   */
  async safeEnableAI(aiConfig: AIManagerConfig): Promise<boolean> {
    try {
      await this.enableAI(aiConfig)
      return true
    } catch (error) {
      console.error('启用AI失败:', error)
      return false
    }
  }

  /**
   * 安全地执行AI走棋（带错误处理）
   */
  async safeMakeAIMove(): Promise<boolean> {
    try {
      return await this.makeAIMove()
    } catch (error) {
      console.error('AI走棋失败:', error)
      // 在AI失败时停止AI对AI模式
      if (this.config.gameMode === 'ai-vs-ai') {
        this.stopAiVsAi()
      }
      return false
    }
  }

  // 重建UCI移动历史
  private rebuildUciMoveHistory(): void {
    this.uciMoveHistory = []
    this.state.moveHistory.forEach((move) => {
      const uciMove = moveToUCI(move.from, move.to)
      this.uciMoveHistory.push(uciMove)
    })
    console.log('重建UCI移动历史:', this.uciMoveHistory)
  }

  // 在makeMove中需要更新，将原来的uciMove计算替换为新函数
  // 这个方法现在已经不需要了，因为我们使用了fenUtils中的moveToUCI

  // 这个方法现在已经不需要了，因为我们使用了fenUtils中的uciToPosition

  /**
   * 获取UCI格式的移动历史
   */
  getUciMoveHistory(): string[] {
    return [...this.uciMoveHistory]
  }

  /**
   * 获取当前FEN字符串（包含移动历史）
   */
  getCurrentFenWithMoves(): string {
    return this.getFenWithMoves()
  }

  // 获取当前FEN字符串包含移动历史
  private getFenWithMoves(): string {
    // 使用gameStateToFEN获取当前棋盘状态
    // const fen = gameStateToFEN(this.state)
    //不应该使用 gameStateToFEN，因为要包含移动历史，应该发默认的
    let fen = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1'

    if (this.uciMoveHistory.length === 0) {
      return fen
    }
    return fen + ' moves ' + this.uciMoveHistory.join(' ')
  }

  // 检查是否轮到AI走棋并执行
  checkAndMakeAIMove(): void {
    console.log('checkAndMakeAIMove 被调用')
    const shouldMove = this.shouldAIMove()
    console.log('shouldAIMove 返回:', shouldMove, '是否AI思考中:', this.isAIThinking)

    if (shouldMove && !this.isAIThinking) {
      console.log('检测到需要AI走棋，准备执行')
      setTimeout(() => {
        console.log('延迟执行 makeAIMove')
        this.makeAIMove().catch((error) => {
          console.error('AI走棋失败:', error)
        })
      }, 500) // 稍微延迟，让界面更新
    } else {
      console.log('不需要AI走棋:', { shouldMove, isAIThinking: this.isAIThinking })
    }
  }

  /**
   * 检查玩家是否可以移动指定棋子
   * 在AI思考期间，玩家不能移动AI阵营的棋子
   */
  canPlayerMovePiece(piece: ChessPiece): boolean {
    // 游戏不在进行中
    if (this.state.gameStatus !== 'playing') {
      return false
    }

    // 不是该棋子阵营的回合
    if (piece.camp !== this.state.currentPlayer) {
      return false
    }

    switch (this.config.gameMode) {
      case 'pvp':
        // 玩家对战模式，玩家可以移动任何阵营的棋子
        return true
      case 'pve':
        // 人机对战模式
        if (this.isAIThinking && piece.camp !== this.config.playerCamp) {
          // AI思考期间，玩家不能移动AI阵营的棋子
          return false
        }
        // 玩家只能移动自己阵营的棋子
        return piece.camp === this.config.playerCamp
      case 'ai-vs-ai':
        // AI对AI模式，玩家不能移动任何棋子
        return false
      default:
        return false
    }
  }

  /**
   * 检查玩家是否可以进行移动操作
   */
  canPlayerMove(): boolean {
    if (this.state.gameStatus !== 'playing') {
      return false
    }

    switch (this.config.gameMode) {
      case 'pvp':
        return true
      case 'pve':
        // 人机对战：如果AI正在思考，玩家不能操作
        if (this.isAIThinking) {
          return false
        }
        // 只有轮到玩家时才能操作
        return this.state.currentPlayer === this.config.playerCamp
      case 'ai-vs-ai':
        return false
      default:
        return false
    }
  }
}
