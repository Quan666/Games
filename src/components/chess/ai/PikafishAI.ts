// Pikafish 引擎封装

import type {
  AIEngine,
  AIEngineConfig,
  AIMove,
  AIEngineStats,
  AIEngineStatus,
  AIEngineEvent,
  PikafishEngine,
} from './types'

export class PikafishAI implements AIEngine {
  private engine: PikafishEngine | null = null
  private status: AIEngineStatus = 'idle'
  private currentStats: AIEngineStats | null = null
  private eventListeners: ((event: AIEngineEvent) => void)[] = []
  private isThinking = false

  constructor() {
    this.init = this.init.bind(this)
  }

  /**
   * 添加事件监听器
   */
  addEventListener(listener: (event: AIEngineEvent) => void): void {
    this.eventListeners.push(listener)
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(listener: (event: AIEngineEvent) => void): void {
    const index = this.eventListeners.indexOf(listener)
    if (index > -1) {
      this.eventListeners.splice(index, 1)
    }
  }

  /**
   * 触发事件
   */
  private emit(event: AIEngineEvent): void {
    this.eventListeners.forEach((listener) => listener(event))
  }

  /**
   * 更新状态
   */
  private setStatus(status: AIEngineStatus): void {
    this.status = status
    this.emit({ type: 'status', data: status })
  }

  /**
   * 初始化引擎
   */
  async init(): Promise<void> {
    if (this.status === 'ready') return

    this.setStatus('initializing')

    try {
      // 加载Pikafish脚本
      await this.loadScript()

      // 创建引擎实例
      const base = import.meta.env.BASE_URL || '/'
      this.engine = await new Promise<PikafishEngine>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('引擎初始化超时'))
        }, 30000)

        const config = {
          locateFile: (path: string) => {
            if (path.endsWith('.data') || path.endsWith('.wasm')) {
              return `${base}chess-ai/${path}`
            }
            return path
          },
          mainScriptUrlOrBlob: `${base}chess-ai/pikafish.js`,
          wasmBinaryFile: `${base}chess-ai/pikafish.wasm`,
          print: (text: string) => {
            this.handleEngineOutput(text)
          },
          printErr: (text: string) => {
            console.error('Pikafish错误:', text)
          },
          onRuntimeInitialized: function () {
            clearTimeout(timeout)
            resolve(this as unknown as PikafishEngine)
          },
          onAbort: (what: string) => {
            clearTimeout(timeout)
            reject(new Error(`引擎中止: ${what}`))
          },
        }

        if (typeof window.Pikafish !== 'function') {
          reject(new Error('Pikafish 引擎未加载'))
          return
        }

        window.Pikafish(config).catch(reject)
      })

      // 初始化UCI协议
      await this.initUCI()

      this.setStatus('ready')
    } catch (error) {
      this.setStatus('error')
      this.emit({ type: 'error', data: error })
      throw error
    }
  }

  /**
   * 加载Pikafish脚本
   */
  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window.Pikafish === 'function') {
        resolve()
        return
      }

      const script = document.createElement('script')
      const base = import.meta.env.BASE_URL || '/'
      script.src = `${base}chess-ai/pikafish.js`

      const timeout = setTimeout(() => {
        script.remove()
        reject(new Error('脚本加载超时'))
      }, 15000)

      script.onload = () => {
        clearTimeout(timeout)
        if (typeof window.Pikafish === 'function') {
          resolve()
        } else {
          reject(new Error('脚本加载成功但引擎不可用'))
        }
      }

      script.onerror = () => {
        clearTimeout(timeout)
        script.remove()
        reject(new Error('脚本加载失败'))
      }

      document.head.appendChild(script)
    })
  }

  /**
   * 初始化UCI协议
   */
  private async initUCI(): Promise<void> {
    if (!this.engine) throw new Error('引擎未初始化')

    return new Promise((resolve, reject) => {
      let uciOkReceived = false
      const timeout = setTimeout(() => {
        if (!uciOkReceived) {
          reject(new Error('UCI初始化超时'))
        }
      }, 10000)

      const originalOnMessage = this.engine!.onMessage
      this.engine!.onMessage = (message: string) => {
        if (originalOnMessage) originalOnMessage(message)

        if (message.includes('uciok')) {
          uciOkReceived = true
          clearTimeout(timeout)
          this.engine!.sendCommand('isready')
        } else if (message.includes('readyok') && uciOkReceived) {
          resolve()
        }
      }

      this.engine?.sendCommand('uci')
    })
  }

  /**
   * 处理引擎输出
   */
  private handleEngineOutput(text: string): void {
    // 解析引擎输出，提取统计信息
    if (text.includes('info')) {
      const stats = this.parseInfoLine(text)
      if (stats) {
        this.currentStats = stats
        this.emit({ type: 'stats', data: stats })
      }
    } else if (text.includes('bestmove')) {
      const move = this.parseBestMove(text)
      if (move) {
        this.isThinking = false
        this.emit({ type: 'move', data: move })
      }
    }
  }

  /**
   * 解析info行
   */
  private parseInfoLine(line: string): AIEngineStats | null {
    const tokens = line.split(' ')
    let stats: Partial<AIEngineStats> = {}

    for (let i = 0; i < tokens.length; i++) {
      switch (tokens[i]) {
        case 'depth':
          stats.depth = parseInt(tokens[i + 1])
          break
        case 'nodes':
          stats.nodes = parseInt(tokens[i + 1])
          break
        case 'score':
          if (tokens[i + 1] === 'cp') {
            stats.score = parseInt(tokens[i + 2])
          }
          break
        case 'time':
          stats.time = parseInt(tokens[i + 1])
          break
        case 'pv':
          stats.pv = tokens.slice(i + 1)
          break
      }
    }

    if (stats.depth !== undefined && stats.nodes !== undefined) {
      return stats as AIEngineStats
    }

    return null
  }

  /**
   * 解析最佳走法
   */
  private parseBestMove(line: string): AIMove | null {
    const tokens = line.split(' ')
    const moveIndex = tokens.indexOf('bestmove')

    if (moveIndex !== -1 && tokens[moveIndex + 1]) {
      const moveStr = tokens[moveIndex + 1]
      return {
        from: moveStr.substring(0, 2),
        to: moveStr.substring(2, 4),
        score: this.currentStats?.score,
        depth: this.currentStats?.depth,
        nodes: this.currentStats?.nodes,
        time: this.currentStats?.time,
      }
    }

    return null
  }

  /**
   * 销毁引擎
   */
  destroy(): void {
    if (this.engine) {
      this.engine.sendCommand('quit')
      this.engine = null
    }
    this.setStatus('idle')
    this.eventListeners = []
  }

  /**
   * 检查引擎是否就绪
   */
  isReady(): boolean {
    return this.status === 'ready'
  }

  /**
   * 设置棋盘位置
   */
  async setPosition(fen: string): Promise<void> {
    if (!this.isReady() || !this.engine) {
      throw new Error('引擎未就绪')
    }

    // 设置棋盘位置
    this.engine.sendCommand(`position fen ${fen}`)
  }

  /**
   * 开始思考
   */
  async go(options: { depth?: number; time?: number } = {}): Promise<AIMove> {
    if (!this.isReady() || !this.engine) {
      throw new Error('引擎未就绪')
    }

    if (this.isThinking) {
      throw new Error('引擎正在思考中')
    }

    this.isThinking = true
    this.setStatus('thinking')

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => {
          this.stop()
          reject(new Error('思考超时'))
        },
        (options.time || 30) * 1000,
      )

      const listener = (event: AIEngineEvent) => {
        if (event.type === 'move') {
          clearTimeout(timeout)
          this.removeEventListener(listener)
          this.setStatus('ready')
          resolve(event.data)
        } else if (event.type === 'error') {
          clearTimeout(timeout)
          this.removeEventListener(listener)
          this.setStatus('ready')
          reject(event.data)
        }
      }

      this.addEventListener(listener)

      // 构建go命令
      let command = 'go'
      if (options.depth) {
        command += ` depth ${options.depth}`
      } else if (options.time) {
        command += ` movetime ${options.time * 1000}`
      } else {
        command += ' depth 8' // 默认深度
      }

      this.engine!.sendCommand(command)
    })
  }

  /**
   * 停止思考
   */
  stop(): void {
    if (this.engine && this.isThinking) {
      this.engine.sendCommand('stop')
      this.isThinking = false
      this.setStatus('ready')
    }
  }

  /**
   * 设置配置
   */
  setConfig(config: AIEngineConfig): void {
    if (!this.engine) return

    // 基础配置
    if (config.threads) {
      this.engine.sendCommand(`setoption name Threads value ${config.threads}`)
    }
    if (config.hashSize) {
      this.engine.sendCommand(`setoption name Hash value ${config.hashSize}`)
    }

    // Pikafish特有的UCI选项
    if (config.skillLevel !== undefined) {
      this.engine.sendCommand(`setoption name Skill Level value ${config.skillLevel}`)
    }
    if (config.multiPV) {
      this.engine.sendCommand(`setoption name MultiPV value ${config.multiPV}`)
    }
    if (config.moveOverhead !== undefined) {
      this.engine.sendCommand(`setoption name Move Overhead value ${config.moveOverhead}`)
    }
    if (config.repetitionRule) {
      this.engine.sendCommand(`setoption name Repetition Rule value ${config.repetitionRule}`)
    }
    if (config.drawRule) {
      this.engine.sendCommand(`setoption name Draw Rule value ${config.drawRule}`)
    }
    if (config.sixtyMoveRule !== undefined) {
      this.engine.sendCommand(`setoption name Sixty Move Rule value ${config.sixtyMoveRule}`)
    }
    if (config.maxCheckCount !== undefined) {
      this.engine.sendCommand(`setoption name MaxCheckCount value ${config.maxCheckCount}`)
    }
    if (config.limitStrength !== undefined) {
      this.engine.sendCommand(`setoption name UCI_LimitStrength value ${config.limitStrength}`)
    }
    if (config.uciElo) {
      this.engine.sendCommand(`setoption name UCI_Elo value ${config.uciElo}`)
    }
    if (config.ponder !== undefined) {
      this.engine.sendCommand(`setoption name Ponder value ${config.ponder}`)
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): AIEngineStats | null {
    return this.currentStats
  }

  /**
   * 获取当前状态
   */
  getStatus(): AIEngineStatus {
    return this.status
  }
}
