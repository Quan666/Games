// FEN字符串和坐标转换工具

import type { Position, ChessPiece, GameState } from '../core'

/**
 * 将游戏状态转换为FEN字符串
 */
export function gameStateToFEN(gameState: GameState): string {
  const { board, currentPlayer } = gameState

  // 棋盘部分 - 从黑方底线(y=0)到红方底线(y=9)，这是标准FEN格式
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
    帥: 'K', // 帅/将
    仕: 'A', // 仕/士
    相: 'B', // 相/象
    馬: 'N', // 马
    車: 'R', // 车
    炮: 'C', // 炮/砲
    兵: 'P', // 兵/卒
  }

  const blackPieceMap: Record<string, string> = {
    將: 'k', // 帅/将
    士: 'a', // 仕/士
    象: 'b', // 相/象
    馬: 'n', // 马
    車: 'r', // 车
    砲: 'c', // 炮/砲
    卒: 'p', // 兵/卒
  }

  if (piece.camp === 'red') {
    return redPieceMap[piece.type] || '?'
  } else {
    return blackPieceMap[piece.type] || '?'
  }
}

/**
 * 将棋盘坐标转换为UCI格式 (如: a0, b1, c2...)
 * 游戏坐标：x=0-8, y=0-9 (y=0是黑方底线，y=9是红方底线)
 * UCI坐标：列a-i, 行0-9 (行0是红方底线，行9是黑方底线)
 */
export function positionToUCI(pos: Position): string {
  const files = 'abcdefghi'
  const uciY = 9 - pos.y // 游戏 y 转换为 UCI y
  return `${files[pos.x]}${uciY}`
}

/**
 * 将UCI格式转换为棋盘坐标
 */
export function uciToPosition(uci: string): Position {
  const files = 'abcdefghi'
  const x = files.indexOf(uci[0]) // a=0, b=1, ..., i=8
  const uciRow = parseInt(uci[1]) // UCI行：0-9

  // 转换：游戏y = 9 - UCI行
  const y = 9 - uciRow

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

/**
 * 为AI引擎准备FEN字符串
 * 解析可能包含走棋历史的FEN字符串
 * 返回格式：{ positionFEN: string, moves: string[] }
 */
export function prepareFENForAI(fenWithMoves: string): { positionFEN: string; moves: string[] } {
  // 基本验证和清理
  const trimmed = fenWithMoves.trim()
  if (!trimmed) {
    throw new Error('空FEN字符串')
  }

  // 检查是否包含 "moves" 关键字
  const movesIndex = trimmed.indexOf(' moves ')

  let positionFEN: string
  let moves: string[] = []

  if (movesIndex !== -1) {
    // 包含走棋历史
    positionFEN = trimmed.substring(0, movesIndex)
    const movesStr = trimmed.substring(movesIndex + 7) // 跳过 " moves "
    moves = movesStr.split(/\s+/).filter((move) => move.length > 0)
  } else {
    // 只有FEN，没有走棋历史
    positionFEN = trimmed
  }

  // 验证FEN格式
  const parts = positionFEN.split(' ')
  if (parts.length < 2) {
    throw new Error('无效的FEN格式')
  }

  // 如果FEN字符串不完整，添加默认值
  if (parts.length === 2) {
    // 添加默认的移动数等信息
    parts.push('1') // 半回合数
    parts.push('1') // 回合数
  }

  return {
    positionFEN: parts.join(' '),
    moves,
  }
}
