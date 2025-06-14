// 中国象棋音效与语音生成器

export class ChessSoundGenerator {
  private audioContext: AudioContext | null = null
  private isSoundEnabled: () => boolean
  private isVoiceEnabled: () => boolean
  private speechSynth: SpeechSynthesis | null = null

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
  private async speak(text: string, volume: number = 0.8, rate: number = 1.2): Promise<void> {
    if (!this.isSoundEnabled() || !this.isVoiceEnabled() || !this.speechSynth) return

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      utterance.volume = volume
      utterance.rate = rate
      utterance.pitch = 1.0

      // 尝试选择中文语音
      const voices = this.speechSynth!.getVoices()
      const chineseVoice = voices.find(
        (voice) => voice.lang.includes('zh') || voice.lang.includes('CN'),
      )
      if (chineseVoice) {
        utterance.voice = chineseVoice
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
          this.speak(`吃${capturedPiece}`)
        } else {
          this.speak('吃')
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
      setTimeout(() => this.speak('将军'), 300)
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
        setTimeout(() => this.speak('胜利'), 500)
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
        setTimeout(() => this.speak('失败'), 200)
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
  async playCheckmateSound(winner: string): Promise<void> {
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
        this.speak(`${winner === 'red' ? '红方' : '黑方'}胜利`)
      }, 800)
    }
  }

  // 游戏开始音效 + 语音
  async playGameStartSound(): Promise<void> {
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
      setTimeout(() => this.speak('游戏开始'), 600)
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
      setTimeout(() => this.speak('悔棋'), 100)
    }
  }
}

export function createChessSoundGenerator(
  isSoundEnabled: () => boolean,
  isVoiceEnabled?: () => boolean,
) {
  return new ChessSoundGenerator(isSoundEnabled, isVoiceEnabled)
}
