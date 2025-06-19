// 中国象棋音效与语音生成器

export class ChessSoundGenerator {
  private audioContext: AudioContext | null = null
  private isSoundEnabled: () => boolean
  private isVoiceEnabled: () => boolean
  private speechSynth: SpeechSynthesis | null = null

  private static lastSpeakTimestamps: Map<string, number> = new Map()
  private speakDebounceInterval = 1000 // ms，防抖间隔，可根据需要调整

  constructor(isSoundEnabled: () => boolean, isVoiceEnabled?: () => boolean) {
    this.isSoundEnabled = isSoundEnabled
    this.isVoiceEnabled = isVoiceEnabled || (() => true)
    this.initAudioContext()
    this.initSpeechSynth()
  }

  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (e) {
      console.warn('Web Audio API not supported')
    }
  }

  private initSpeechSynth(): void {
    if ('speechSynthesis' in window) {
      this.speechSynth = window.speechSynthesis
    } else {
      console.warn('Speech Synthesis not supported')
    }
  }

  // 语音播放功能
  private async speak(text: string, volume: number = 0.8, rate: number = 1.0): Promise<void> {
    if (!this.isSoundEnabled() || !this.isVoiceEnabled() || !this.speechSynth) return

    // 防抖：同样内容短时间内只播一次
    const now = Date.now()
    const lastTime = ChessSoundGenerator.lastSpeakTimestamps.get(text)
    if (lastTime && now - lastTime < this.speakDebounceInterval) {
      return
    }
    ChessSoundGenerator.lastSpeakTimestamps.set(text, now)

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      utterance.volume = volume
      utterance.rate = rate
      utterance.pitch = 1.0

      // 尝试选择中文语音，优先选择女声或标准中文语音
      const voices = this.speechSynth!.getVoices()
      const chineseVoices = voices.filter(
        (voice) => voice.lang.includes('zh') || voice.lang.includes('CN'),
      )

      // 优先选择女声或包含特定关键词的中文语音
      const preferredVoice =
        chineseVoices.find(
          (voice) =>
            voice.name.includes('Female') ||
            voice.name.includes('女') ||
            voice.name.includes('Xiaoxiao') ||
            voice.name.includes('Huihui'),
        ) || chineseVoices[0]

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.onend = () => resolve()
      utterance.onerror = () => resolve()

      this.speechSynth!.speak(utterance)
    })
  }

  // 设置语音开关（已废弃，现在使用外部函数控制）
  public setVoiceEnabled(_enabled: boolean): void {
    console.warn('setVoiceEnabled is deprecated, voice state is now controlled externally')
  }

  public getVoiceEnabled(): boolean {
    return this.isVoiceEnabled()
  }

  private async ensureAudioContext(): Promise<void> {
    if (!this.audioContext) return
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  public async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  // 移动棋子音效（普通移动不播放语音）
  async playMoveSound(): Promise<void> {
    if (!this.isSoundEnabled()) return
    await this.ensureAudioContext()

    // 播放音效
    if (this.audioContext) {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      const duration = 0.15
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(
        400,
        this.audioContext.currentTime + duration,
      )

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

      oscillator.start()
      oscillator.stop(this.audioContext.currentTime + duration)
    }

    // 普通移动不播放语音
  }

  // 标准化棋子名称，用于语音播报
  private normalizePieceName(pieceType: string): string {
    // 确保输入是字符串类型
    if (typeof pieceType !== 'string') {
      console.warn('normalizePieceName 接收到非字符串类型:', pieceType, '类型:', typeof pieceType)
      pieceType = String(pieceType)
    }

    // 去除可能的空白字符
    pieceType = pieceType.trim()

    const normalizeMap: { [key: string]: string } = {
      帥: '帅',
      將: '将',
      仕: '士',
      士: '士',
      相: '相',
      象: '象',
      馬: '马',
      車: '车',
      炮: '炮',
      砲: '炮', // 统一读作"炮"
      兵: '兵',
      卒: '卒', // 统一读作"卒"
    }

    const normalized = normalizeMap[pieceType]
    if (!normalized) {
      console.warn('未找到棋子类型的映射:', pieceType)
      // 如果找不到映射，尝试基本的转换
      if (pieceType.includes('馬') || pieceType.includes('马')) return '马'
      if (pieceType.includes('車') || pieceType.includes('车')) return '车'
      if (pieceType.includes('炮') || pieceType.includes('砲')) return '炮'
      if (pieceType.includes('帥') || pieceType.includes('帅')) return '帅'
      if (pieceType.includes('將') || pieceType.includes('将')) return '将'
      if (pieceType.includes('仕') || pieceType.includes('士')) return '士'
      if (pieceType.includes('相') || pieceType.includes('象'))
        return pieceType.includes('相') ? '相' : '象'
      if (pieceType.includes('兵')) return '兵'
      if (pieceType.includes('卒')) return '卒'

      // 如果都不匹配，返回原始字符串
      return pieceType
    }

    return normalized
  }

  // 吃子音效 + 语音
  //@ts-ignore
  async playCaptureSound(movingPiece?: string, capturedPiece?: string): Promise<void> {
    if (!this.isSoundEnabled()) return
    await this.ensureAudioContext()

    // 播放音效
    if (this.audioContext) {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      const duration = 0.25
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(
        200,
        this.audioContext.currentTime + duration,
      )

      gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

      oscillator.start()
      oscillator.stop(this.audioContext.currentTime + duration)
    }

    // 播放语音
    if (this.isVoiceEnabled()) {
      setTimeout(() => {
        if (capturedPiece) {
          console.log('原始棋子类型:', capturedPiece, '类型:', typeof capturedPiece)
          const normalizedPiece = this.normalizePieceName(capturedPiece)
          console.log('标准化后的棋子:', normalizedPiece)
          this.speak(`吃${normalizedPiece}`)
        } else {
          this.speak('吃子')
        }
      }, 150)
    }
  }

  // 将军音效 + 语音
  async playCheckSound(): Promise<void> {
    if (!this.isSoundEnabled()) return
    await this.ensureAudioContext()

    // 播放音效 - 两个快速的高音调音符
    if (this.audioContext) {
      for (let i = 0; i < 2; i++) {
        setTimeout(async () => {
          if (!this.audioContext) return
          const oscillator = this.audioContext.createOscillator()
          const gainNode = this.audioContext.createGain()

          oscillator.connect(gainNode)
          gainNode.connect(this.audioContext.destination)

          const duration = 0.1
          oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(
            1200,
            this.audioContext.currentTime + duration,
          )

          gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

          oscillator.start()
          oscillator.stop(this.audioContext.currentTime + duration)
        }, i * 150)
      }
    }

    // 播放语音
    if (this.isVoiceEnabled()) {
      setTimeout(() => this.speak('将军', 0.9, 0.9), 300)
    }
  }

  // 游戏结束音效 + 语音
  async playGameOverSound(isWin: boolean): Promise<void> {
    if (!this.isSoundEnabled()) return
    await this.ensureAudioContext()

    if (isWin) {
      // 胜利音效 - 上升音调
      if (this.audioContext) {
        const frequencies = [400, 500, 600, 800]
        for (let i = 0; i < frequencies.length; i++) {
          setTimeout(() => {
            if (!this.audioContext) return
            const oscillator = this.audioContext.createOscillator()
            const gainNode = this.audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(this.audioContext.destination)

            const duration = 0.3
            oscillator.frequency.setValueAtTime(frequencies[i], this.audioContext.currentTime)

            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(
              0.01,
              this.audioContext.currentTime + duration,
            )

            oscillator.start()
            oscillator.stop(this.audioContext.currentTime + duration)
          }, i * 200)
        }
      }

      // 播放语音
      if (this.isVoiceEnabled()) {
        setTimeout(() => this.speak('胜利', 0.9, 0.8), 500)
      }
    } else {
      // 失败音效 - 下降音调
      if (this.audioContext) {
        const oscillator = this.audioContext.createOscillator()
        const gainNode = this.audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(this.audioContext.destination)

        const duration = 0.5
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(
          200,
          this.audioContext.currentTime + duration,
        )

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

        oscillator.start()
        oscillator.stop(this.audioContext.currentTime + duration)
      }

      // 播放语音
      if (this.isVoiceEnabled()) {
        setTimeout(() => this.speak('失败', 0.9, 0.8), 200)
      }
    }
  }

  // 选中棋子音效
  async playSelectSound(): Promise<void> {
    if (!this.isSoundEnabled()) return
    await this.ensureAudioContext()
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    const duration = 0.08
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)

    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  // 按钮点击音效
  async playButtonClick(): Promise<void> {
    if (!this.isSoundEnabled()) return
    await this.ensureAudioContext()
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    const duration = 0.05
    oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime)

    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  // 特殊棋谱语音播报
  async playMoveAnnouncement(
    from: string,
    to: string,
    pieceType: string,
    isCapture: boolean = false,
  ): Promise<void> {
    if (!this.isVoiceEnabled()) return

    let announcement = `${pieceType}`
    if (isCapture) {
      announcement += '吃'
    }
    announcement += `${from}到${to}`

    await this.speak(announcement, 0.7, 1.0)
  }

  // 将死语音
  async playCheckmateSound(winner: string, capturedPiece?: string): Promise<void> {
    if (!this.isSoundEnabled()) return
    await this.ensureAudioContext()

    // 播放特殊音效
    if (this.audioContext) {
      const frequencies = [200, 150, 100]
      for (let i = 0; i < frequencies.length; i++) {
        setTimeout(() => {
          if (!this.audioContext) return
          const oscillator = this.audioContext.createOscillator()
          const gainNode = this.audioContext.createGain()

          oscillator.connect(gainNode)
          gainNode.connect(this.audioContext.destination)

          const duration = 0.5
          oscillator.frequency.setValueAtTime(frequencies[i], this.audioContext.currentTime)
          gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

          oscillator.start()
          oscillator.stop(this.audioContext.currentTime + duration)
        }, i * 300)
      }
    }

    // 播放语音
    if (this.isVoiceEnabled()) {
      setTimeout(() => {
        let announcement = ''
        if (capturedPiece) {
          announcement = `吃${capturedPiece}将死，${winner}获胜`
        } else {
          announcement = `将死，${winner}获胜`
        }
        this.speak(announcement, 0.9, 0.8)
      }, 800)
    }
  }

  // 游戏开始音效 + 语音
  async playGameStartSound(reset: boolean = false): Promise<void> {
    if (!this.isSoundEnabled()) return
    await this.ensureAudioContext()

    // 播放音效 - 上升音调表示游戏开始
    if (this.audioContext) {
      const frequencies = [300, 400, 500, 600]
      for (let i = 0; i < frequencies.length; i++) {
        setTimeout(() => {
          if (!this.audioContext) return
          const oscillator = this.audioContext.createOscillator()
          const gainNode = this.audioContext.createGain()

          oscillator.connect(gainNode)
          gainNode.connect(this.audioContext.destination)

          const duration = 0.2
          oscillator.frequency.setValueAtTime(frequencies[i], this.audioContext.currentTime)

          gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

          oscillator.start()
          oscillator.stop(this.audioContext.currentTime + duration)
        }, i * 150)
      }
    }

    // 播放语音
    if (this.isVoiceEnabled()) {
      setTimeout(() => this.speak(reset ? '重新开始' : '游戏开始', 0.9, 0.8), 600)
    }
  }

  // 选择/放置棋子音效
  async playPiecePlaceSound(pieceType?: string): Promise<void> {
    if (!this.isSoundEnabled()) return
    await this.ensureAudioContext()
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    const duration = 0.1
    // 根据棋子类型调整音调
    let frequency = 800
    if (pieceType === '帥' || pieceType === '將') {
      frequency = 1000 // 帅/将用更高音调
    } else if (pieceType === '車') {
      frequency = 700 // 车用较低音调
    } else if (pieceType === '馬') {
      frequency = 900 // 马用较高音调
    } else if (pieceType === '炮' || pieceType === '砲') {
      frequency = 750 // 炮用中等音调
    }

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)

    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  // 悔棋音效 + 语音
  async playUndoSound(): Promise<void> {
    if (!this.isSoundEnabled()) return
    await this.ensureAudioContext()
    if (!this.audioContext) return

    // 播放音效 - 下降音调表示撤销操作
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    const duration = 0.3
    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + duration)

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + duration)

    // 播放语音
    if (this.isVoiceEnabled()) {
      setTimeout(() => this.speak('悔棋', 0.9, 0.8), 100)
    }
  }
}

export function createChessSoundGenerator(
  isSoundEnabled: () => boolean,
  isVoiceEnabled?: () => boolean,
) {
  return new ChessSoundGenerator(isSoundEnabled, isVoiceEnabled)
}
