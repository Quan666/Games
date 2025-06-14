// 音效生成器与开关判断

export class SoundGenerator {
  private audioContext: AudioContext | null = null
  private isSoundEnabled: () => boolean

  constructor(isSoundEnabled: () => boolean) {
    this.isSoundEnabled = isSoundEnabled
    this.initAudioContext()
  }

  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (e) {
      console.warn('Web Audio API not supported')
    }
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

  async playPlaceSound(isBlack: boolean): Promise<void> {
    if (!this.isSoundEnabled()) return
    await this.ensureAudioContext()
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    const duration = 0.08
    if (isBlack) {
      oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(
        300,
        this.audioContext.currentTime + duration,
      )
      gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime)
      oscillator.type = 'triangle'
    } else {
      oscillator.frequency.setValueAtTime(900, this.audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(
        700,
        this.audioContext.currentTime + duration,
      )
      gainNode.gain.setValueAtTime(0.45, this.audioContext.currentTime)
      oscillator.type = 'sine'
    }
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  async playWinSound(): Promise<void> {
    if (!this.isSoundEnabled()) return
    await this.ensureAudioContext()
    if (!this.audioContext) return

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]
    for (let i = 0; i < notes.length; i++) {
      setTimeout(() => {
        if (!this.audioContext) return
        const oscillator = this.audioContext.createOscillator()
        const gainNode = this.audioContext.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(this.audioContext.destination)
        oscillator.frequency.setValueAtTime(notes[i], this.audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4)
        oscillator.type = 'triangle'
        oscillator.start(this.audioContext.currentTime)
        oscillator.stop(this.audioContext.currentTime + 0.4)
      }, i * 120)
    }
  }

  async playUndoSound(): Promise<void> {
    if (!this.isSoundEnabled()) return
    await this.ensureAudioContext()
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.2)
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2)
    oscillator.type = 'sawtooth'
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.2)
  }

  async playOpenSound(): Promise<void> {
    if (!this.isSoundEnabled()) return
    await this.ensureAudioContext()
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2)
    oscillator.type = 'sine'
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.2)
  }
}
