/**
 * 象棋棋盘和棋子尺寸配置
 * 所有与棋盘显示相关的尺寸参数都在这里集中管理
 *
 * 使用方法：
 * 1. 要调整格子大小：修改 CELL_SIZE
 * 2. 要调整棋子大小：修改 PIECE_RADIUS
 * 3. 要调整棋子字体：修改 PIECE_FONT_RATIO
 */

export const BOARD_CONFIG = {
  // ===== 棋盘基础尺寸 =====
  BOARD_WIDTH: 600, // 棋盘容器宽度
  BOARD_HEIGHT: 660, // 棋盘容器高度

  // ===== 主要尺寸参数 (常用修改) =====
  CELL_SIZE: 62, // 棋盘格子大小 - 主要参数 1
  PIECE_RADIUS: 26, // 棋子半径 - 主要参数 2 (棋子直径 = 半径 * 2)

  // ===== 棋子相关尺寸 =====
  PIECE_FONT_RATIO: 1.15, // 棋子字体大小相对于半径的比例
  PIECE_SHADOW_BLUR: 4, // 棋子阴影模糊度
  PIECE_SHADOW_OFFSET: 2, // 棋子阴影偏移
  PIECE_BORDER_WIDTH: 2, // 棋子边框宽度

  // ===== 棋盘线条和标记 =====
  LINE_STROKE_WIDTH: 2, // 棋盘线条粗细
  MARK_SIZE: 12, // 炮位等标记大小 (实际使用 12 * scale)
  MARK_STROKE_WIDTH: 1.5, // 标记线条粗细
  PAWN_MARK_SIZE: 10, // 兵位标记大小 (实际使用 10 * scale)
  PAWN_MARK_OFFSET: 4, // 兵位标记偏移 (实际使用 4 * scale)
  PAWN_MARK_STROKE_WIDTH: 1, // 兵位标记线条粗细

  // ===== 字体大小 =====
  COORD_FONT_SIZE: 14, // 坐标字体大小
  RIVER_FONT_SIZE: 18, // 楚河汉界字体大小

  // ===== 间距和偏移 =====
  COORD_OFFSET: 35, // 坐标与棋盘边缘的距离 (实际使用 30 * scale)
  CELL_CLICK_SIZE: 35, // 点击区域大小 (实际使用 30 * scale)

  // ===== 动画配置 =====
  ANIMATION_BASE_DURATION: 300, // 基础动画时长（毫秒）
  ANIMATION_DISTANCE_FACTOR: 50, // 距离因子：每个格子增加的时长（毫秒）
  ANIMATION_MIN_DURATION: 200, // 最小动画时长（毫秒）
  ANIMATION_MAX_DURATION: 800, // 最大动画时长（毫秒）
  ANIMATION_EASING_POWER: 3, // 缓动函数的幂次 (1=线性, 2=二次, 3=三次)
} as const

// 导出计算函数
export const getBoardDimensions = (scale: number = 1) => ({
  cellSize: BOARD_CONFIG.CELL_SIZE * scale,
  pieceRadius: BOARD_CONFIG.PIECE_RADIUS * scale,
  pieceDiameter: BOARD_CONFIG.PIECE_RADIUS * 2 * scale,
  pieceFontSize: BOARD_CONFIG.PIECE_RADIUS * BOARD_CONFIG.PIECE_FONT_RATIO * scale,
  boardActualWidth: 8 * BOARD_CONFIG.CELL_SIZE * scale,
  boardActualHeight: 9 * BOARD_CONFIG.CELL_SIZE * scale,
  marginX: (BOARD_CONFIG.BOARD_WIDTH * scale - 8 * BOARD_CONFIG.CELL_SIZE * scale) / 2,
  marginY: (BOARD_CONFIG.BOARD_HEIGHT * scale - 9 * BOARD_CONFIG.CELL_SIZE * scale) / 2,
})

// 计算动画时长的函数
export const calculateAnimationDuration = (
  from: { x: number; y: number },
  to: { x: number; y: number },
) => {
  // 计算曼哈顿距离（象棋中棋子移动更接近这种距离）
  const distance = Math.abs(to.x - from.x) + Math.abs(to.y - from.y)

  // 基于距离计算时长
  const calculatedDuration =
    BOARD_CONFIG.ANIMATION_BASE_DURATION + distance * BOARD_CONFIG.ANIMATION_DISTANCE_FACTOR

  // 限制在最小和最大时长之间
  return Math.max(
    BOARD_CONFIG.ANIMATION_MIN_DURATION,
    Math.min(calculatedDuration, BOARD_CONFIG.ANIMATION_MAX_DURATION),
  )
}

// 动画缓动函数
export const getAnimationEasing = (progress: number) => {
  // 使用配置的幂次进行缓动计算
  return 1 - Math.pow(1 - progress, BOARD_CONFIG.ANIMATION_EASING_POWER)
}

// 导出预设配置
export const PRESET_CONFIGS = {
  SMALL: {
    ...BOARD_CONFIG,
    CELL_SIZE: 50,
    PIECE_RADIUS: 20,
  },
  MEDIUM: {
    ...BOARD_CONFIG,
    CELL_SIZE: 62,
    PIECE_RADIUS: 26,
  },
  LARGE: {
    ...BOARD_CONFIG,
    CELL_SIZE: 75,
    PIECE_RADIUS: 32,
  },
} as const

export type BoardConfigType = typeof BOARD_CONFIG
export type PresetConfigKey = keyof typeof PRESET_CONFIGS
