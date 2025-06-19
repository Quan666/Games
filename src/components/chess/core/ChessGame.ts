// 中国象棋游戏核心逻辑类

import type {
  PieceType,
  Camp,
  Position,
  ChessPiece,
  Move,
  GameState,
  ChessGameSettings,
  StateUpdateCallback,
  ChessGameConfig,
} from './types'
import { ChessSoundGenerator } from './ChessSound'
import { gameStateToFEN, moveToUCI, uciToMove } from '../ai/fenUtils'

export class ChessGame {
  private state: GameState
  private settings: ChessGameSettings
  private soundGenerator: ChessSoundGenerator | null = null
  private onStateUpdate?: StateUpdateCallback

  constructor(config: ChessGameConfig = {}) {
    // 初始化设置
    this.settings = {
      soundEnabled: true,
      voiceEnabled: true,
      showValidMoves: true,
      moveHints: true,
      highlightLastMove: true,
      ...config.settings,
    }

    // 初始化状态更新回调
    this.onStateUpdate = config.onStateUpdate

    // 初始化游戏状态
    try {
      if (config.initialState) {
        this.state = this.restoreFromState(config.initialState)
      } else {
        this.state = this.initializeGame()
      }
    } catch (error) {
      console.error('游戏初始化失败，创建新游戏:', error)
      this.state = this.initializeGame()
    }

    // 初始化音效系统
    this.initializeSound()

    // 触发初始状态更新
    this.triggerStateUpdate()
  }

  // 初始化音效系统
  private initializeSound(): void {
    this.soundGenerator = new ChessSoundGenerator(
      () => this.settings.soundEnabled,
      () => this.settings.voiceEnabled,
    )
  }

  // 触发状态更新回调
  private triggerStateUpdate(): void {
    if (this.onStateUpdate) {
      this.onStateUpdate(this.getState(), this.getSettings())
    }
  }

  // 初始化游戏
  private initializeGame(): GameState {
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
      //   console.log(`创建红方棋子: ${type} 在 (${x}, ${y})`)
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
    })

    // 验证棋盘状态
    let boardPieceCount = 0
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 9; x++) {
        if (board[y][x]) boardPieceCount++
      }
    }

    const gameState = {
      board,
      pieces,
      currentPlayer: 'red',
      gameStatus: 'playing',
      moveHistory: [],
      isInCheck: false,
    }

    return gameState as GameState
  }

  // 获取当前游戏状态
  getState(): GameState {
    return { ...this.state }
  }

  // 获取当前设置
  getSettings(): ChessGameSettings {
    return { ...this.settings }
  }

  // 更新设置
  updateSettings(newSettings: Partial<ChessGameSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.triggerStateUpdate()
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

      // 如果目标位置没有棋子，或者是敌方棋子，则可以移动, 且position处的棋子必须是活着的
      if (
        !targetPiece ||
        targetPiece.camp !==
          this.state.pieces.find(
            (p) => p.position.x === position.x && p.position.y === position.y && p.alive,
          )?.camp
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

    //console.log('计算炮的移动:', piece.type, '在位置:', position)

    for (const dir of directions) {
      let hasJumped = false

      for (let i = 1; i < 10; i++) {
        const newPos = { x: position.x + dir.x * i, y: position.y + dir.y * i }

        if (!this.isValidPosition(newPos)) break

        const targetPiece = this.getPieceAt(newPos)

        if (!hasJumped) {
          if (targetPiece) {
            //console.log('炮遇到架子:', targetPiece.type, '在位置:', newPos)
            hasJumped = true
          } else {
            moves.push(newPos) // 炮可以移动到空位
          }
        } else {
          if (targetPiece) {
            if (targetPiece.camp !== piece.camp) {
              //console.log('炮可以吃掉:', targetPiece.type, '在位置:', newPos)
              moves.push(newPos) // 炮可以吃掉敌方棋子
            } else {
              //console.log('炮不能吃掉己方棋子:', targetPiece.type, '在位置:', newPos)
            }
            break
          }
        }
      }
    }

    //console.log('炮的可移动位置:', moves)
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

    if (!piece) {
      return false
    }

    if (piece.camp !== this.state.currentPlayer) {
      return false
    }

    const validMoves = this.getValidMoves(piece)

    const isValidMove = validMoves.some((move) => move.x === to.x && move.y === to.y)

    if (!isValidMove) {
      return false
    }

    const capturedPiece = this.getPieceAt(to)

    // 记录移动，包含FEN和UCI信息
    const move: Move = {
      from: { ...from },
      to: { ...to },
      piece,
      capturedPiece: capturedPiece || undefined,
      timestamp: Date.now(),
      uci: moveToUCI(from, to),
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
    }

    // 全面验证棋盘一致性
    this.validateBoardConsistency()

    // 切换玩家
    this.state.currentPlayer = this.state.currentPlayer === 'red' ? 'black' : 'red'

    // 检查游戏状态，获取将军和将死信息
    this.updateGameStatus()

    // 在走法记录中添加将军和将死信息以及FEN
    move.isCheck = this.state.isInCheck
    move.isCheckmate = this.state.gameStatus === 'checkmate'
    move.fen = this.toFEN()

    this.state.moveHistory.push(move)

    // 播放音效
    this.playMoveSound(move)

    // 触发状态更新
    this.triggerStateUpdate()

    return true
  }

  // 播放移动音效
  private playMoveSound(move: Move): void {
    if (!this.soundGenerator) return

    if (move.capturedPiece) {
      this.soundGenerator.playCaptureSound(move.piece.type, move.capturedPiece.type)
    } else {
      this.soundGenerator.playMoveSound()
    }

    // 如果是将死，只播放将死音效；如果只是将军，播放将军音效
    if (move.isCheckmate) {
      setTimeout(() => {
        const winner = move.piece.camp === 'red' ? '红方' : '黑方'
        this.soundGenerator?.playCheckmateSound(winner, move.capturedPiece?.type)
      }, 400)
    } else if (move.isCheck) {
      setTimeout(() => {
        this.soundGenerator?.playCheckSound()
      }, 200)
    }
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
      } else {
        // 如果在pieces数组中找不到，说明可能被意外删除了，重新添加
        const restoredPiece = { ...lastMove.capturedPiece }
        restoredPiece.alive = true
        restoredPiece.position = { ...lastMove.to }
        this.state.pieces.push(restoredPiece)
        this.state.board[lastMove.to.y][lastMove.to.x] = restoredPiece
      }
    }

    // 切换回上一个玩家
    this.state.currentPlayer = this.state.currentPlayer === 'red' ? 'black' : 'red'

    // 验证棋盘一致性
    this.validateBoardConsistency()

    // 重新检查游戏状态
    this.state.gameStatus = 'playing' // 悔棋后游戏继续
    this.updateGameStatus()

    // 播放悔棋音效
    this.soundGenerator?.playUndoSound()

    // 触发状态更新
    this.triggerStateUpdate()

    return true
  }

  // 更新游戏状态
  private updateGameStatus() {
    const currentCamp = this.state.currentPlayer // 当前要移动的阵营

    try {
      this.state.isInCheck = this.isInCheck(currentCamp)

      // 检查是否有合法移动
      const alivePieces = this.state.pieces.filter((p) => p.camp === currentCamp && p.alive)

      const hasValidMoves = alivePieces.some((p) => {
        const moves = this.getValidMoves(p)
        return moves.length > 0
      })

      if (!hasValidMoves) {
        this.state.gameStatus = this.state.isInCheck ? 'checkmate' : 'stalemate'

        // 注意：将死音效由 playMoveSound 中的 playCheckmateSound 处理
        // 和棋音效在这里播放
        if (this.state.gameStatus === 'stalemate') {
          const isWin = false
          this.soundGenerator?.playGameOverSound(isWin)
        }
      }
    } catch (error) {
      console.error('updateGameStatus 出错:', error)
    }
  }

  // 重置游戏
  reset(): void {
    const hasMoved = this.state.moveHistory && this.state.moveHistory.length > 0
    this.state = this.initializeGame()
    if (hasMoved) {
      this.soundGenerator?.playGameStartSound(true)
    }
    this.triggerStateUpdate()
  }

  // 从保存的状态恢复游戏
  restoreFromState(savedState: GameState): GameState {
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

    // 核心验证：检查pieces数组
    if (!state.pieces || !Array.isArray(state.pieces) || state.pieces.length === 0) {
      console.warn('棋子数组无效或为空，重新创建标准开局')
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

    alivePiecesForBoard.forEach((piece: ChessPiece) => {
      const { x, y } = piece.position
      if (state.board[y][x]) {
        console.warn(`位置冲突 (${x}, ${y}):`, state.board[y][x], 'vs', piece)
      }
      state.board[y][x] = piece
    })

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

  // 将游戏状态转换为FEN字符串
  toFEN(): string {
    return gameStateToFEN(this.state)
  }

  // 获取UCI格式的移动历史
  getUCIMoveHistory(): string[] {
    return this.state.moveHistory.filter((move) => move.uci).map((move) => move.uci!)
  }

  // 根据UCI走法执行移动
  makeMoveFromUCI(uci: string): boolean {
    try {
      const { from, to } = uciToMove(uci)
      return this.makeMove(from, to)
    } catch (error) {
      console.error('UCI走法解析失败:', uci, error)
      return false
    }
  }

  // 获取当前FEN字符串（包含移动历史）
  getCurrentFenWithMoves(): string {
    const fen = this.toFEN()
    const moves = this.getUCIMoveHistory()

    if (moves.length === 0) {
      return fen
    }
    return fen + ' moves ' + moves.join(' ')
  }

  // 销毁游戏实例
  destroy(): void {
    // 销毁音效系统
    this.soundGenerator = null
    this.onStateUpdate = undefined
  }
}
