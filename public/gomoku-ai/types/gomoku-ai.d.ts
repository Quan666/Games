import { Position, AIConfig, AIOutput, RealtimeCallback, AIStatus, BalanceMode } from './types'
export declare class GomokuAI {
  private engine
  private ready
  private thinking
  private timeUsed
  private lastThinkTime
  private lastThinkPosition
  private currentConfig
  private hashSize
  private startSize
  private needRestart
  private outputs
  private messages
  private posCallback
  private realtimeCallback
  private config
  constructor(assetsPath?: string)
  /**
   * 初始化AI引擎
   */
  init(callback?: RealtimeCallback): Promise<void>
  /**
   * 设置AI配置
   */
  setConfig(config: Partial<AIConfig>): void
  /**
   * 获取当前AI状态
   */
  getStatus(): AIStatus
  /**
   * 获取AI输出信息
   */
  getOutput(): AIOutput
  /**
   * 获取消息列表
   */
  getMessages(): string[]
  /**
   * 获取最佳线路的字符串表示
   */
  getBestlineString(pvIdx?: number): string
  /**
   * AI思考下一步
   */
  think(position: Position[], boardSize?: number, balanceMode?: BalanceMode): Promise<Position>
  /**
   * 停止思考
   */
  stop(): boolean
  /**
   * 重启AI
   */ restartAI(): void
  /**
   * 检查禁手
   */
  checkForbid(position: Position[], boardSize?: number): Promise<Position[]>
  /**
   * 销毁AI实例
   */
  destroy(): void
  private handleEngineResponse
  private handleRealtimeResponse
  private sendInfo
  private sendBoard
  private reloadConfig
  private updateHashSize
  private getTurnTime
  private getMatchTime
  private getDepth
  private getNodes
  private getGameRule
  private clearUsedTime
  private addUsedTime
  private setThinkStartTime
  private addMessage
  private clearMessages
  private setPVOutput
  private clearOutput
  private addRealtime
  private clearRealtime
  private sortPV
}
