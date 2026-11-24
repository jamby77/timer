import cueSamples from './cue-samples.json'
import { AudioContextState, SoundFrequencyHz, SoundWaveform } from './enums'

type SampleCue = 'countdown' | 'start' | 'finish'

export type PlayToneOptions = {
  frequencyHz: number
  durationMs: number
  type?: OscillatorType | SoundWaveform
  gain?: number
  whenMs?: number
}

type BrowserAudioSession = { type: string }

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

  private readonly activeCues = new Set<AudioScheduledSourceNode>()
  private readonly sampleBuffers = new Map<SampleCue, AudioBuffer>()
  private previousSession: { session: BrowserAudioSession; type: string } | null = null

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

    try {
      const { ctx, masterGain } = this.ensureContext()
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

  public playSampleCue(cue: SampleCue, gain: number): void {
    const { ctx, masterGain } = this
    if (!this.enabled || !ctx || !masterGain || ctx.state !== AudioContextState.Running) return

    let buffer = this.sampleBuffers.get(cue)
    if (!buffer) {
      const bytes = Uint8Array.from(atob(cueSamples[cue]), (char) => char.charCodeAt(0))
      const pcm = new DataView(bytes.buffer)
      buffer = ctx.createBuffer(1, pcm.byteLength / 2, cueSamples.sampleRate)
      const channel = buffer.getChannelData(0)
      for (let i = 0; i < channel.length; i++) {
        channel[i] = pcm.getInt16(i * 2, true) / 32768
      }
      this.sampleBuffers.set(cue, buffer)
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    const amp = ctx.createGain()
    amp.gain.value = gain
    source.connect(amp).connect(masterGain)
    source.start()
    this.holdPlaybackUntilEnded(source, gain)
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

    const { ctx, masterGain } = this
    if (!ctx || !masterGain || ctx.state !== AudioContextState.Running) {
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
    this.holdPlaybackUntilEnded(osc, gain)
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

  private holdPlaybackUntilEnded(source: AudioScheduledSourceNode, gain: number): void {
    if (this.volume === 0 || gain <= 0) return

    if (!this.previousSession) {
      try {
        const session = (window.navigator as Navigator & { audioSession?: BrowserAudioSession })
          .audioSession
        if (!session || session.type === 'playback') return
        const type = session.type
        session.type = 'playback'
        this.previousSession = { session, type }
      } catch {
        return
      }
    }

    this.activeCues.add(source)
    source.onended = () => {
      this.activeCues.delete(source)
      if (!this.activeCues.size) this.releasePlayback()
    }
  }

  private releasePlayback(): void {
    const previous = this.previousSession
    this.previousSession = null
    this.activeCues.clear()
    if (!previous) return
    try {
      if (previous.session.type === 'playback') previous.session.type = previous.type
    } catch {
      return
    }
  }

  private ensureContext(): { ctx: AudioContext; masterGain: GainNode } {
    if (!this.ctx) {
      const AudioContextCtor = getAudioContextCtor()
      if (!AudioContextCtor) {
        throw new Error('AudioContext unsupported')
      }
      const context = new AudioContextCtor()
      context.onstatechange = () => {
        if (context.state !== AudioContextState.Running) this.releasePlayback()
      }
      this.ctx = context
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
    if (!this.enabled || this.volume === 0) this.releasePlayback()
    if (this.enabled) {
      this.masterGain.gain.value = this.volume
    } else {
      this.masterGain.gain.value = 0
    }
  }
}
