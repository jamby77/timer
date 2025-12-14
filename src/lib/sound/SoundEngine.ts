import { AudioContextState, SoundFrequencyHz, SoundWaveform } from './enums'

export type PlayToneOptions = {
  frequencyHz: number
  durationMs: number
  type?: OscillatorType | SoundWaveform
  gain?: number
  whenMs?: number
}

type AudioWindow = Window & {
  AudioContext?: typeof AudioContext
  webkitAudioContext?: typeof AudioContext
}

const hasWindow = () => {
  if (typeof window === 'undefined') {
    return !!(globalThis && 'window' in globalThis)
  }
  return true
}

const getAudioContextCtor = (): typeof AudioContext | undefined => {
  if (!hasWindow()) {
    return undefined
  }
  const w = window as AudioWindow
  return w.AudioContext ?? w.webkitAudioContext
}

export class SoundEngine {
  private static instance: SoundEngine | null = null

  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null

  private enabled = true
  private volume = 0.7

  private constructor() {}

  public static getInstance(): SoundEngine {
    if (!SoundEngine.instance) {
      SoundEngine.instance = new SoundEngine()
    }
    return SoundEngine.instance
  }

  public isSupported(): boolean {
    return hasWindow() && typeof getAudioContextCtor() !== 'undefined'
  }

  public async init(): Promise<boolean> {
    if (!this.isSupported()) {
      return false
    }

    const { ctx, masterGain } = this.ensureContext()

    try {
      if (ctx.state === AudioContextState.Suspended) {
        await ctx.resume()
      }

      const startTime = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, startTime)
      osc.connect(gain)
      gain.connect(masterGain)
      osc.start(startTime)
      osc.stop(startTime + 0.01)

      return ctx.state === AudioContextState.Running
    } catch {
      return false
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled
    this.updateMasterGain()
  }

  public setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume))
    this.updateMasterGain()
  }

  public playTone({
    frequencyHz,
    durationMs,
    type = SoundWaveform.Sine,
    gain = 1,
    whenMs = 0,
  }: PlayToneOptions): void {
    if (!this.isSupported() || !this.enabled) {
      return
    }

    const { ctx, masterGain } = this.ensureContext()
    if (ctx.state !== AudioContextState.Running) {
      return
    }

    const startTime = ctx.currentTime + whenMs / 1000
    const durationS = Math.max(0.01, durationMs / 1000)

    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(frequencyHz, startTime)

    const amp = ctx.createGain()
    const peak = Math.max(0, gain)

    amp.gain.setValueAtTime(0.0001, startTime)
    amp.gain.linearRampToValueAtTime(Math.max(0.0001, peak), startTime + 0.005)
    amp.gain.exponentialRampToValueAtTime(0.0001, startTime + durationS)

    osc.connect(amp)
    amp.connect(masterGain)

    osc.start(startTime)
    osc.stop(startTime + durationS + 0.02)
  }

  public playClick(
    options: Omit<PlayToneOptions, 'frequencyHz' | 'type'> & { frequencyHz?: number }
  ): void {
    this.playTone({
      frequencyHz: options.frequencyHz ?? SoundFrequencyHz.Click,
      durationMs: options.durationMs,
      type: SoundWaveform.Square,
      gain: options.gain,
      whenMs: options.whenMs,
    })
  }

  private ensureContext(): { ctx: AudioContext; masterGain: GainNode } {
    if (!this.ctx) {
      const AudioContextCtor = getAudioContextCtor()
      if (!AudioContextCtor) {
        throw new Error('AudioContext unsupported')
      }
      this.ctx = new AudioContextCtor()
    }

    const ctx = this.ctx
    if (!ctx) {
      throw new Error('AudioContext unavailable')
    }

    if (!this.masterGain) {
      this.masterGain = ctx.createGain()
      this.masterGain.connect(ctx.destination)
      this.updateMasterGain()
    }

    const masterGain = this.masterGain
    if (!masterGain) {
      throw new Error('Master gain node unavailable')
    }

    return { ctx, masterGain }
  }

  private updateMasterGain(): void {
    if (!this.masterGain) {
      return
    }
    if (this.enabled) {
      this.masterGain.gain.value = this.volume
    } else {
      this.masterGain.gain.value = 0
    }
  }
}
