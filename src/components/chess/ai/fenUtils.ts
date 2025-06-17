// FEN字符串和坐标转换工具

import type { Position, ChessPiece, GameState } from '../ChessGame'

/**
 * 将游戏状态转换为FEN字符串
 */
export function gameStateToFEN(gameState: GameState): string {
  const { board, currentPlayer } = gameState

  // 棋盘部分
  let fenBoard = ''
  for (let y = 0; y < 10; y++) {
    let emptyCount = 0
    let rowStr = ''

    for (let x = 0; x < 9; x++) {
      const piece = board[y][x]
      if (piece) {
        if (emptyCount > 0) {
          rowStr += emptyCount.toString()
          emptyCount = 0
        }
        rowStr += pieceToFENChar(piece)
      } else {
        emptyCount++
      }
    }

    if (emptyCount > 0) {
      rowStr += emptyCount.toString()
    }

    fenBoard += rowStr
    if (y < 9) fenBoard += '/'
  }

  // 当前玩家
  const activeColor = currentPlayer === 'red' ? 'w' : 'b'

  // 王车易位权利(象棋没有，用 - 表示)
  const castling = '-'

  // 过路兵(象棋没有，用 - 表示)
  const enPassant = '-'

  // 半回合计数器(简化为0)
  const halfmove = '0'

  // 全回合数
  const fullmove = Math.floor(gameState.moveHistory.length / 2) + 1

  return `${fenBoard} ${activeColor} ${castling} ${enPassant} ${halfmove} ${fullmove}`
}

/**
 * 将棋子转换为FEN字符
 */
function pieceToFENChar(piece: ChessPiece): string {
  // 根据阵营和棋子类型确定字符
  const redPieceMap: Record<string, string> = {
    帥: 'K',
    仕: 'A',
    相: 'B',
    馬: 'N',
    車: 'R',
    炮: 'C',
    兵: 'P',
  }

  const blackPieceMap: Record<string, string> = {
    將: 'k',
    士: 'a',
    象: 'b',
    馬: 'n',
    車: 'r',
    砲: 'c',
    卒: 'p',
  }

  if (piece.camp === 'red') {
    return redPieceMap[piece.type] || '?'
  } else {
    return blackPieceMap[piece.type] || '?'
  }
}

/**
 * 从FEN字符串解析游戏状态（简化版）
 */
export function fenToGameState(fen: string): Partial<GameState> {
  const parts = fen.split(' ')
  const activeColor = parts[1]

  // 这里可以根据需要实现完整的FEN解析
  // 目前主要用于AI引擎，所以简化处理

  return {
    currentPlayer: activeColor === 'w' ? 'red' : 'black',
  }
}

/**
 * 将棋盘坐标转换为UCI格式 (如: a0, b1, c2...)
 */
export function positionToUCI(pos: Position): string {
  const files = 'abcdefghi'
  return `${files[pos.x]}${pos.y}`
}

/**
 * 将UCI格式转换为棋盘坐标
 */
export function uciToPosition(uci: string): Position {
  const files = 'abcdefghi'
  const x = files.indexOf(uci[0])
  const y = parseInt(uci[1])
  return { x, y }
}

/**
 * 将走棋转换为UCI格式
 */
export function moveToUCI(from: Position, to: Position): string {
  return `${positionToUCI(from)}${positionToUCI(to)}`
}

/**
 * 从UCI字符串解析走棋
 */
export function uciToMove(uci: string): { from: Position; to: Position } {
  const from = uciToPosition(uci.substring(0, 2))
  const to = uciToPosition(uci.substring(2, 4))
  return { from, to }
}
