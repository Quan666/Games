// 象棋AI引擎核心实现
// 负责引擎的初始化、配置更新、命令发送和消息接收

import type {
  AIEngineConfig,
  AIEngineStatus,
  AIMove,
  AIEngineStats,
  PikafishEngine,
  AIEngine,
  AIEngineEvent,
} from './types'

export class ChessAI implements AIEngine {
  private engine: PikafishEngine | null = null
  private _status: AIEngineStatus = 'idle'
  private currentStats: AIEngineStats | null = null
  private isThinking = false
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map()

  // 思考结果回调
  private moveCallback: ((move: AIMove | null) => void) | null = null

  constructor() {}

  get status(): AIEngineStatus {
    return this._status
  }

  private setStatus(status: AIEngineStatus): void {
    this._status = status
    this.emit('status', status)
  }

  /**
   * 初始化AI引擎
   */
  async init(): Promise<void> {
    if (this._status !== 'idle') {
      console.log(`AI引擎已初始化，当前状态: ${this._status}`)
      return
    }

    this.setStatus('initializing')
    console.log('开始初始化AI引擎...')

    try {
      await this.loadScript()
      console.log('✓ 脚本加载完成')
      
      await this.createEngine()
      console.log('✓ 引擎实例创建完成')
      
      await this.initUCI()
      console.log('✓ UCI协议初始化完成')
      
      this.setStatus('ready')
      console.log('✓ AI引擎初始化成功完成')
    } catch (error) {
      console.error('AI引擎初始化失败:', error)
      this.setStatus('error')
      this.emit('error', error)
      throw error
    }
  }

  /**
   * 加载Pikafish脚本
   */
  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window.Pikafish === 'function') {
        console.log('Pikafish 脚本已加载')
        resolve()
        return
      }

      console.log('开始加载 Pikafish 脚本...')

      const script = document.createElement('script')
      const base = import.meta.env.BASE_URL || '/'
      script.src = `${base}chess-ai/pikafish.js`

      const timeout = setTimeout(() => {
        script.remove()
        reject(new Error('脚本加载超时'))
      }, 30000) // 增加到30秒

      script.onload = () => {
        console.log('Pikafish 脚本加载完成')
        clearTimeout(timeout)
        if (typeof window.Pikafish === 'function') {
          resolve()
        } else {
          reject(new Error('脚本加载成功但引擎不可用'))
        }
      }

      script.onerror = (error) => {
        console.error('脚本加载失败:', error)
        clearTimeout(timeout)
        script.remove()
        reject(new Error('脚本加载失败'))
      }

      document.head.appendChild(script)
    })
  }

  /**
   * 创建引擎实例
   */
  private async createEngine(): Promise<void> {
    console.log('开始创建 Pikafish 引擎实例...')

    const base = import.meta.env.BASE_URL || '/'

    this.engine = await new Promise<PikafishEngine>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('引擎初始化超时'))
      }, 45000)

      const config = {
        locateFile: (path: string) => {
          const fullPath = `${base}chess-ai/${path}`
          console.log(`定位文件: ${path} -> ${fullPath}`)
          return fullPath
        },
        wasmBinaryFile: `${base}chess-ai/pikafish.wasm`,
        onReceiveStdout: (text: string) => {
          console.log('Pikafish引擎输出:', text)
          
          // 确保输出处理器已设置后再调用
          if (this.handleEngineOutput) {
            this.handleEngineOutput(text)
          }
        },
        onReceiveStderr: (text: string) => console.error('Pikafish错误:', text),
        onAbort: (what: string) => {
          console.error('Pikafish 中止:', what)
          clearTimeout(timeout)
          reject(new Error(`引擎中止: ${what}`))
        },
      }

      if (typeof window.Pikafish !== 'function') {
        reject(new Error('Pikafish 引擎未加载'))
        return
      }

      try {
        console.log('调用 window.Pikafish...')
        window.Pikafish(config).then((instance: PikafishEngine) => {
          console.log('✓ Pikafish 实例创建完成')
          clearTimeout(timeout)
          resolve(instance)
        }).catch((error: Error) => {
          console.error('Pikafish 初始化失败:', error)
          clearTimeout(timeout)
          reject(error)
        })
      } catch (error) {
        console.error('调用 window.Pikafish 失败:', error)
        clearTimeout(timeout)
        reject(error)
      }
    })

    console.log('Pikafish 引擎实例创建成功')
  }

  /**
   * 初始化UCI协议
   */
  private async initUCI(): Promise<void> {
    if (!this.engine) throw new Error('引擎未初始化')

    console.log('开始 UCI 协议初始化...')

    return new Promise((resolve, reject) => {
      let uciOkReceived = false
      let readyOkReceived = false
      let isResolved = false

      const timeout = setTimeout(() => {
        if (!isResolved) {
          console.error('UCI 初始化超时，当前状态:')
          console.error(`uciOk=${uciOkReceived}, readyOk=${readyOkReceived}`)
          isResolved = true
          reject(new Error('UCI初始化超时'))
        }
      }, 10000) // 减少到10秒

      // 如果收到 uciok 但长时间没有收到 readyok，自动完成初始化
      let readyTimeout: number | null = null

      const originalHandler = this.handleEngineOutput.bind(this)

      this.handleEngineOutput = (text: string) => {
        const trimmedText = text.trim()
        console.log('UCI 初始化阶段收到引擎输出:', trimmedText)

        // 检查 uciok - 可能是单独一行，也可能包含在其他文本中
        if (trimmedText === 'uciok' || trimmedText.includes('uciok')) {
          console.log('✓ 收到 uciok，发送 isready 命令')
          uciOkReceived = true
          
          // 使用 setTimeout 避免阻塞 UI 线程
          setTimeout(() => {
            try {
              this.engine!.sendCommand('isready')
              console.log('✓ 已发送 isready 命令')
              
              // 设置一个备用超时，如果3秒内没有收到 readyok 就自动完成
              readyTimeout = setTimeout(() => {
                console.log('⚠️ 未收到 readyok，但已收到 uciok，自动完成初始化')
                if (!isResolved) {
                  isResolved = true
                  clearTimeout(timeout)
                  this.handleEngineOutput = originalHandler
                  console.log('✓ UCI 协议初始化完成（备用机制）')
                  resolve()
                }
              }, 3000)
              
            } catch (error) {
              console.error('发送 isready 命令失败:', error)
              if (!isResolved) {
                isResolved = true
                clearTimeout(timeout)
                reject(new Error(`发送 isready 命令失败: ${error}`))
              }
            }
          }, 0)
        } 
        // 检查 readyok - 只有在收到 uciok 之后才处理
        else if ((trimmedText === 'readyok' || trimmedText.includes('readyok')) && uciOkReceived) {
          console.log('✓ 收到 readyok，UCI 初始化完成')
          readyOkReceived = true
          
          if (!isResolved) {
            isResolved = true
            clearTimeout(timeout)
            if (readyTimeout) {
              clearTimeout(readyTimeout)
            }
            this.handleEngineOutput = originalHandler
            console.log('✓ UCI 协议初始化成功完成')
            resolve()
          }
        }

        // 调用原始处理器
        originalHandler(text)
      }

      console.log('发送 uci 命令到引擎')
      // 使用 setTimeout 避免阻塞 UI 线程
      setTimeout(() => {
        try {
          this.engine!.sendCommand('uci')
          console.log('✓ 已发送 uci 命令')
        } catch (error) {
          console.error('发送 uci 命令失败:', error)
          isResolved = true
          clearTimeout(timeout)
          reject(new Error(`发送 uci 命令失败: ${error}`))
        }
      }, 0)
    })
  }

  /**
   * 处理引擎输出
   */
  private handleEngineOutput(text: string): void {
    const trimmedText = text.trim()
    if (!trimmedText) return

    // 解析引擎输出，提取统计信息
    if (trimmedText.includes('info')) {
      const stats = this.parseInfoLine(trimmedText)
      if (stats) {
        this.currentStats = stats
        console.log(
          `AI统计更新 - 深度:${stats.depth} 分数:${stats.score} 节点:${stats.nodes} 时间:${stats.time}ms`,
        )

        // 触发 stats 事件
        this.emit('stats', stats)

        // 如果有主变例，显示最佳走法序列
        if (stats.pv && stats.pv.length > 0) {
          console.log(
            `主变例: ${stats.pv.slice(0, 5).join(' ')}${stats.pv.length > 5 ? '...' : ''}`,
          )
        }
      }
    } else if (trimmedText.includes('bestmove')) {
      const move = this.parseBestMove(trimmedText)
      console.log(`AI找到最佳走法: ${move ? move.from + move.to : 'null'}`)

      this.isThinking = false
      this.setStatus('ready')

      if (this.moveCallback) {
        this.moveCallback(move)
        this.moveCallback = null
      }

      // 触发 move 事件
      this.emit('move', move)
    } else if (trimmedText.includes('string')) {
      // 引擎信息字符串，如NNUE评估信息
      console.log(`引擎信息: ${trimmedText}`)
    } else if (trimmedText.includes('id name') || trimmedText.includes('id author')) {
      // 引擎标识信息
      console.log(`引擎标识: ${trimmedText}`)
    } else if (trimmedText.includes('option name')) {
      // 引擎选项信息，不打印详细内容避免日志过多
      // console.log(`引擎选项: ${trimmedText}`)
    } else {
      // 其他引擎输出（包括 uciok, readyok 等）
      console.log(`引擎输出: ${trimmedText}`)
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
        case 'seldepth':
          stats.seldepth = parseInt(tokens[i + 1])
          break
        case 'multipv':
          stats.multipv = parseInt(tokens[i + 1])
          break
        case 'nodes':
          stats.nodes = parseInt(tokens[i + 1])
          break
        case 'nps':
          stats.nps = parseInt(tokens[i + 1])
          break
        case 'hashfull':
          stats.hashfull = parseInt(tokens[i + 1])
          break
        case 'tbhits':
          stats.tbhits = parseInt(tokens[i + 1])
          break
        case 'score':
          if (tokens[i + 1] === 'cp') {
            stats.score = parseInt(tokens[i + 2])
            i += 2 // 跳过 'cp' 和 分数值
          }
          break
        case 'wdl':
          // 解析胜和负概率: wdl 11 914 75
          if (i + 3 < tokens.length) {
            stats.wdl = [
              parseInt(tokens[i + 1]), // win
              parseInt(tokens[i + 2]), // draw
              parseInt(tokens[i + 3]), // lose
            ]
            i += 3
          }
          break
        case 'time':
          stats.time = parseInt(tokens[i + 1])
          break
        case 'pv':
          // 主变例从当前位置到行尾的所有token
          stats.pv = tokens.slice(i + 1)
          break
      }
    }

    // 只要有深度信息就返回统计
    if (stats.depth !== undefined) {
      return {
        depth: stats.depth,
        nodes: stats.nodes || 0,
        score: stats.score || 0,
        time: stats.time || 0,
        pv: stats.pv,
        seldepth: stats.seldepth,
        multipv: stats.multipv,
        nps: stats.nps,
        hashfull: stats.hashfull,
        tbhits: stats.tbhits,
        wdl: stats.wdl,
      } as AIEngineStats
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
   * AI分析接口 - 主要对外接口
   * @param fenWithMoves 格式: "fen moves h2e2 h9g7 ..."
   * @param depth 搜索深度，默认8
   * @param timeLimit 时间限制(秒)，默认5
   */
  async analyze(fenWithMoves: string, depth = 8, timeLimit = 5): Promise<AIMove | null> {
    if (!this.isReady()) {
      throw new Error('AI引擎未就绪')
    }

    if (this.isThinking) {
      throw new Error('AI正在思考中')
    }

    try {
      this.isThinking = true
      this.setStatus('thinking')

      // 解析FEN和走棋历史
      const { fen, moves } = this.parseFENWithMoves(fenWithMoves)

      // 发送position命令
      let positionCommand = `position fen ${fen}`
      if (moves.length > 0) {
        positionCommand += ` moves ${moves.join(' ')}`
      }

      this.engine!.sendCommand(positionCommand)
      await this.delay(50) // 等待命令处理

      // 发送go命令
      const goCommand = `go movetime ${timeLimit * 1000} depth ${depth}`
      this.engine!.sendCommand(goCommand)

      // 等待结果
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(
          () => {
            this.stop()
            reject(new Error('AI分析超时'))
          },
          (timeLimit + 5) * 1000,
        )

        this.moveCallback = (move) => {
          clearTimeout(timeout)
          resolve(move)
        }
      })
    } catch (error) {
      this.isThinking = false
      this.setStatus('ready')
      this.emit('error', error)
      throw error
    }
  }

  /**
   * 解析包含走棋历史的FEN字符串
   */
  private parseFENWithMoves(fenString: string): { fen: string; moves: string[] } {
    const parts = fenString.trim().split(/\s+/)
    const movesIndex = parts.indexOf('moves')

    if (movesIndex === -1) {
      return { fen: fenString.trim(), moves: [] }
    }

    const fenParts = parts.slice(0, movesIndex)
    const fen = fenParts.join(' ')
    const moves = parts.slice(movesIndex + 1)

    return { fen, moves }
  }

  /**
   * 更新引擎配置
   */
  updateConfig(config: AIEngineConfig): void {
    if (!this.engine) return

    // 基础配置
    if (config.threads !== undefined) {
      this.engine.sendCommand(`setoption name Threads value ${config.threads}`)
    }
    if (config.hashSize !== undefined) {
      this.engine.sendCommand(`setoption name Hash value ${config.hashSize}`)
    }

    // Pikafish专用配置
    if (config.ponder !== undefined) {
      this.engine.sendCommand(`setoption name Ponder value ${config.ponder}`)
    }
    if (config.multiPV !== undefined) {
      this.engine.sendCommand(`setoption name MultiPV value ${config.multiPV}`)
    }
    if (config.moveOverhead !== undefined) {
      this.engine.sendCommand(`setoption name Move Overhead value ${config.moveOverhead}`)
    }
    if (config.nodestime !== undefined) {
      this.engine.sendCommand(`setoption name nodestime value ${config.nodestime}`)
    }
    if (config.skillLevel !== undefined) {
      this.engine.sendCommand(`setoption name Skill Level value ${config.skillLevel}`)
    }
    if (config.mateThreatDepth !== undefined) {
      this.engine.sendCommand(`setoption name Mate Threat Depth value ${config.mateThreatDepth}`)
    }
    if (config.repetitionRule !== undefined) {
      this.engine.sendCommand(`setoption name Repetition Rule value ${config.repetitionRule}`)
    }
    if (config.drawRule !== undefined) {
      this.engine.sendCommand(`setoption name Draw Rule value ${config.drawRule}`)
    }
    if (config.sixtyMoveRule !== undefined) {
      this.engine.sendCommand(`setoption name Sixty Move Rule value ${config.sixtyMoveRule}`)
    }
    if (config.rule60MaxPly !== undefined) {
      this.engine.sendCommand(`setoption name Rule60MaxPly value ${config.rule60MaxPly}`)
    }
    if (config.maxCheckCount !== undefined) {
      this.engine.sendCommand(`setoption name MaxCheckCount value ${config.maxCheckCount}`)
    }
    if (config.limitStrength !== undefined) {
      this.engine.sendCommand(`setoption name UCI_LimitStrength value ${config.limitStrength}`)
    }
    if (config.uciElo !== undefined) {
      this.engine.sendCommand(`setoption name UCI_Elo value ${config.uciElo}`)
    }
    if (config.uciWDLCentipawn !== undefined) {
      this.engine.sendCommand(`setoption name UCI_WDLCentipawn value ${config.uciWDLCentipawn}`)
    }
    if (config.luOutput !== undefined) {
      this.engine.sendCommand(`setoption name LU_Output value ${config.luOutput}`)
    }
    if (config.uciShowWDL !== undefined) {
      this.engine.sendCommand(`setoption name UCI_ShowWDL value ${config.uciShowWDL}`)
    }
    if (config.evalFile !== undefined) {
      this.engine.sendCommand(`setoption name EvalFile value ${config.evalFile}`)
    }
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
   * 配置引擎
   */
  configure(config: Partial<AIEngineConfig>): void {
    this.updateConfig(config)
  }

  /**
   * 检查是否就绪
   */
  isReady(): boolean {
    return this._status === 'ready' && !this.isThinking
  }

  /**
   * 获取统计信息
   */
  getStats(): AIEngineStats | null {
    return this.currentStats
  }

  /**
   * 添加事件监听器
   */
  on(event: string, listener: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  /**
   * 添加事件监听器 (别名)
   */
  addEventListener(listener: (event: AIEngineEvent) => void): void {
    this.on('status', (data) => listener({ type: 'status', data }))
    this.on('stats', (data) => listener({ type: 'stats', data }))
    this.on('move', (data) => listener({ type: 'move', data }))
    this.on('error', (data) => listener({ type: 'error', data }))
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: (data: any) => void): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 移除事件监听器 (别名)
   */
  removeEventListener(_listener: (event: { type: string; data: any }) => void): void {
    // 这里实现比较复杂，先简单处理
    // 实际应用中可能需要更精确的移除逻辑
  }

  /**
   * 触发事件
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data)
        } catch (error) {
          console.error('事件监听器错误:', error)
        }
      })
    }
  }

  /**
   * 销毁引擎
   */
  destroy(): void {
    if (this.engine) {
      this.engine.sendCommand('quit')
    }
    this.setStatus('idle')
    this.eventListeners.clear()
  }

  /**
   * 延迟工具函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * AI思考接口 (符合AIEngine接口)
   */
  async think(fen: string, config?: Partial<AIEngineConfig>): Promise<AIMove | null> {
    // 应用配置
    if (config) {
      this.configure(config)
    }

    const depth = config?.depth || 8
    const timeLimit = config?.timeLimit || 5

    return this.analyze(fen, depth, timeLimit)
  }

  /**
   * 兼容旧接口的方法
   */
  getStatus(): AIEngineStatus {
    return this._status
  }

  /**
   * 设置引擎配置
   */
  setConfig(config: Partial<AIEngineConfig>): void {
    this.configure(config)
  }

  /**
   * 设置棋盘位置
   */
  async setPosition(fen: string): Promise<void> {
    if (!this.engine) {
      throw new Error('引擎未初始化')
    }
    this.engine.sendCommand(`position fen ${fen}`)
    await this.delay(50)
  }

  /**
   * 开始思考
   */
  async go(options: { depth?: number; timeLimit?: number }): Promise<AIMove | null> {
    if (!this.engine) {
      throw new Error('引擎未初始化')
    }

    const depth = options.depth || 8
    const timeLimit = options.timeLimit || 5

    return new Promise((resolve) => {
      this.moveCallback = resolve
      const goCommand = `go movetime ${timeLimit * 1000} depth ${depth}`
      this.engine!.sendCommand(goCommand)
    })
  }

  /**
   * 发送位置命令
   */
  async sendPositionCommand(command: string): Promise<void> {
    if (!this.engine) {
      throw new Error('引擎未初始化')
    }
    this.engine.sendCommand(command)
    await this.delay(50)
  }
}
