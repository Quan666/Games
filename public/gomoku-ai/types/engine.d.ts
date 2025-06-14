import { Position } from './types'
interface EngineResponse {
  ok?: boolean
  pos?: Position
  swap?: boolean
  msg?: string
  error?: string
  depth?: number
  seldepth?: number
  nodes?: number
  totalnodes?: number
  speed?: number
  eval?: string
  winrate?: number
  bestline?: Position[]
  forbid?: Position[]
  multipv?: string
  realtime?: {
    type: string
    pos?: Position
  }
}
type EngineCallback = (response: EngineResponse) => void
export declare class AIEngine {
  private callback
  private engineInstance
  private engineType
  private assetsPath
  constructor(assetsPath?: string)
  /**
   * 初始化引擎
   */
  init(callback: EngineCallback): Promise<void>
  private initWebAssembly
  private initWebAssemblyWorker
  /**
   * 发送命令到引擎
   */
  sendCommand(cmd: string): void
  /**
   * 停止思考
   */
  stopThinking(): boolean
  /**
   * 处理引擎输出
   */
  private processOutput
  /**
   * 销毁引擎
   */
  destroy(): void
}
export {}
