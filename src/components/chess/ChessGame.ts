// 中国象棋游戏逻辑
import type { AIManager, AIManagerConfig } from './ai'

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
  timestamp: Date
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

  constructor(savedState?: GameState, config: GameConfig = {}) {
    this.config = {
      enableAI: false,
      gameMode: 'pvp',
      playerCamp: 'red',
      ...config,
    }

    if (savedState) {
      this.state = this.restoreFromState(savedState)
    } else {
      this.state = this.initializeGame()
    }

    // 如果启用AI，初始化AI管理器
    if (this.config.enableAI && this.config.aiConfig) {
      this.initAI()
    }
  }

  // 初始化游戏
  private initializeGame(): GameState {
    const pieces: ChessPiece[] = []
    const board: (ChessPiece | null)[][] = Array(10)
      .fill(null)
      .map(() => Array(9).fill(null))

    // 创建红方棋子
    const redPieces = [
      {
        type: '車' as PieceType,
        positions: [
          { x: 0, y: 9 },
          { x: 8, y: 9 },
        ],
      },
      {
        type: '馬' as PieceType,
        positions: [
          { x: 1, y: 9 },
          { x: 7, y: 9 },
        ],
      },
      {
        type: '相' as PieceType,
        positions: [
          { x: 2, y: 9 },
          { x: 6, y: 9 },
        ],
      },
      {
        type: '仕' as PieceType,
        positions: [
          { x: 3, y: 9 },
          { x: 5, y: 9 },
        ],
      },
      { type: '帥' as PieceType, positions: [{ x: 4, y: 9 }] },
      {
        type: '炮' as PieceType,
        positions: [
          { x: 1, y: 7 },
          { x: 7, y: 7 },
        ],
      },
      {
        type: '兵' as PieceType,
        positions: [
          { x: 0, y: 6 },
          { x: 2, y: 6 },
          { x: 4, y: 6 },
          { x: 6, y: 6 },
          { x: 8, y: 6 },
        ],
      },
    ]

    // 创建黑方棋子
    const blackPieces = [
      {
        type: '車' as PieceType,
        positions: [
          { x: 0, y: 0 },
          { x: 8, y: 0 },
        ],
      },
      {
        type: '馬' as PieceType,
        positions: [
          { x: 1, y: 0 },
          { x: 7, y: 0 },
        ],
      },
      {
        type: '象' as PieceType,
        positions: [
          { x: 2, y: 0 },
          { x: 6, y: 0 },
        ],
      },
      {
        type: '士' as PieceType,
        positions: [
          { x: 3, y: 0 },
          { x: 5, y: 0 },
        ],
      },
      { type: '將' as PieceType, positions: [{ x: 4, y: 0 }] },
      {
        type: '砲' as PieceType,
        positions: [
          { x: 1, y: 2 },
          { x: 7, y: 2 },
        ],
      },
      {
        type: '卒' as PieceType,
        positions: [
          { x: 0, y: 3 },
          { x: 2, y: 3 },
          { x: 4, y: 3 },
          { x: 6, y: 3 },
          { x: 8, y: 3 },
        ],
      },
    ]

    let pieceId = 1

    // 添加红方棋子
    redPieces.forEach(({ type, positions }) => {
      positions.forEach((position) => {
        const piece: ChessPiece = {
          id: `r${pieceId++}`,
          type,
          camp: 'red',
          position,
          alive: true,
        }
        pieces.push(piece)
        board[position.y][position.x] = piece
      })
    })

    // 添加黑方棋子
    blackPieces.forEach(({ type, positions }) => {
      positions.forEach((position) => {
        const piece: ChessPiece = {
          id: `b${pieceId++}`,
          type,
          camp: 'black',
          position,
          alive: true,
        }
        pieces.push(piece)
        board[position.y][position.x] = piece
      })
    })

    return {
      board,
      pieces,
      currentPlayer: 'red',
      gameStatus: 'playing',
      moveHistory: [],
      isInCheck: false,
    }
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
    const piece = this.getPieceAt(from)
    if (!piece || piece.camp !== this.state.currentPlayer) {
      return false
    }

    const validMoves = this.getValidMoves(piece)
    const isValidMove = validMoves.some((move) => move.x === to.x && move.y === to.y)

    if (!isValidMove) {
      return false
    }

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
      timestamp: new Date(),
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
    this.validateBoardConsistency()

    // 切换玩家
    this.state.currentPlayer = this.state.currentPlayer === 'red' ? 'black' : 'red'

    // 检查游戏状态，获取将军和将死信息
    this.updateGameStatus()

    // 在走法记录中添加将军和将死信息
    move.isCheck = this.state.isInCheck
    move.isCheckmate = this.state.gameStatus === 'checkmate'

    this.state.moveHistory.push(move)

    // 如果游戏还在进行且启用了AI，检查是否需要AI走棋
    if (this.state.gameStatus === 'playing' && this.shouldAIMove()) {
      // 延迟一点时间让UI更新，然后触发AI走棋
      setTimeout(() => {
        this.makeAIMove().catch((error) => {
          console.error('AI走棋出错:', error)
        })
      }, 500)
    }

    return true
  }

  // 悔棋
  undoMove(): boolean {
    if (this.state.moveHistory.length === 0) {
      return false
    }

    // 获取最后一步移动
    const lastMove = this.state.moveHistory.pop()
    if (!lastMove) {
      return false
    }

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
    const currentCamp = this.state.currentPlayer // 当前要移动的阵营

    this.state.isInCheck = this.isInCheck(currentCamp)

    // 检查是否有合法移动
    const hasValidMoves = this.state.pieces
      .filter((p) => p.camp === currentCamp && p.alive)
      .some((p) => this.getValidMoves(p).length > 0)

    if (!hasValidMoves) {
      this.state.gameStatus = this.state.isInCheck ? 'checkmate' : 'stalemate'
    }
  }

  // 重置游戏
  reset() {
    this.state = this.initializeGame()
  }

  // 从保存的状态恢复游戏
  private restoreFromState(savedState: GameState): GameState {
    // 深拷贝状态以避免引用问题
    const state = JSON.parse(JSON.stringify(savedState))

    // 确保棋盘数组正确初始化
    if (!state.board || state.board.length !== 10) {
      state.board = Array(10)
        .fill(null)
        .map(() => Array(9).fill(null))
    }

    // 重建棋盘状态 - 只清空棋盘
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 9; x++) {
        state.board[y][x] = null
      }
    }

    // 保留所有棋子（包括死棋子用于悔棋），但只把活棋子放在棋盘上
    const alivePieces = state.pieces.filter((piece: ChessPiece) => piece.alive)

    for (const piece of alivePieces) {
      const { x, y } = piece.position
      if (x >= 0 && x < 9 && y >= 0 && y < 10) {
        state.board[y][x] = piece
      }
    }

    // 恢复移动历史中的时间戳和棋子引用
    if (state.moveHistory) {
      state.moveHistory = state.moveHistory.map((move: any) => {
        // 重新建立棋子引用关系
        const piece = state.pieces.find((p: ChessPiece) => p.id === move.piece.id)
        const capturedPiece = move.capturedPiece
          ? state.pieces.find((p: ChessPiece) => p.id === move.capturedPiece.id)
          : undefined

        return {
          from: move.from,
          to: move.to,
          piece: piece || move.piece,
          capturedPiece: capturedPiece || move.capturedPiece,
          timestamp: typeof move.timestamp === 'string' ? new Date(move.timestamp) : move.timestamp,
          isCheck: move.isCheck || false,
          isCheckmate: move.isCheckmate || false,
        }
      })
    }

    return state
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
      const { AIManager } = await import('./ai')
      this.aiManager = new AIManager(this.config.aiConfig)
      await this.aiManager.init()
    } catch (error) {
      console.error('AI初始化失败:', error)
    }
  }

  /**
   * 启用AI
   */
  async enableAI(aiConfig: AIManagerConfig): Promise<void> {
    this.config.enableAI = true
    this.config.aiConfig = aiConfig

    if (this.aiManager) {
      this.aiManager.destroy()
    }

    await this.initAI()
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
    if (this.aiManager) {
      this.aiManager.destroy()
      this.aiManager = null
    }
  }

  /**
   * 检查是否应该AI走棋
   */
  shouldAIMove(): boolean {
    if (!this.config.enableAI || !this.aiManager || this.isAIThinking) {
      return false
    }

    switch (this.config.gameMode) {
      case 'pve':
        return this.state.currentPlayer !== this.config.playerCamp
      case 'ai-vs-ai':
        return true
      default:
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
      const move = await this.aiManager!.getAIMove(this.state)
      return move
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
      return this.makeMove(aiMove.from, aiMove.to)
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
      enabled: this.config.enableAI,
      thinking: this.isAIThinking,
      ready: this.aiManager?.isReady() || false,
      status: this.aiManager?.getStatus() || 'idle',
      stats: this.aiManager?.getStats() || null,
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
   * 获取游戏配置
   */
  getConfig(): GameConfig {
    return { ...this.config }
  }

  /**
   * 更新游戏配置
   */
  updateConfig(newConfig: Partial<GameConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}
