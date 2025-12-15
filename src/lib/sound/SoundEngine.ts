import { AudioContextState, SoundFrequencyHz, SoundWaveform } from './enums'

export type PlayToneOptions = {
  frequencyHz: number
  durationMs: number
  type?: OscillatorType | SoundWaveform
  gain?: number
  whenMs?: number
}

export type PlayAirHornOptions = {
  durationMs: number
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

  public playAirHorn({ durationMs, gain = 1, whenMs = 0 }: PlayAirHornOptions): void {
    if (!this.isSupported() || !this.enabled) {
      return
    }

    const { ctx, masterGain } = this.ensureContext()
    if (ctx.state !== AudioContextState.Running) {
      return
    }

    const startTime = ctx.currentTime + whenMs / 1000
    const durationS = Math.max(0.01, durationMs / 1000)

    const envelopeTotalS = Math.min(durationS, 1.5)
    const stopTotalS = Math.min(durationS, 1.55)

    const osc1 = ctx.createOscillator()
    osc1.type = SoundWaveform.Sawtooth
    osc1.frequency.setValueAtTime(510, startTime)
    osc1.frequency.exponentialRampToValueAtTime(485, startTime + Math.min(0.18, durationS))

    const osc2 = ctx.createOscillator()
    osc2.type = SoundWaveform.Triangle
    osc2.frequency.setValueAtTime(1020, startTime)
    osc2.detune.setValueAtTime(-6, startTime)

    const oscSub = ctx.createOscillator()
    oscSub.type = SoundWaveform.Sine
    oscSub.frequency.setValueAtTime(255, startTime)

    const oscGain1 = ctx.createGain()
    oscGain1.gain.setValueAtTime(0.6, startTime)

    const oscGain2 = ctx.createGain()
    oscGain2.gain.setValueAtTime(0.22, startTime)

    const oscGainSub = ctx.createGain()
    oscGainSub.gain.setValueAtTime(0.18, startTime)

    const bandpass = ctx.createBiquadFilter()
    bandpass.type = 'bandpass'
    bandpass.frequency.setValueAtTime(650, startTime)
    bandpass.frequency.linearRampToValueAtTime(730, startTime + Math.min(0.06, durationS))
    bandpass.Q.setValueAtTime(3, startTime)

    const saturator = ctx.createWaveShaper()
    saturator.curve = SoundEngine.softSaturationCurve()
    saturator.oversample = '4x'

    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.setValueAtTime(4200, startTime)
    lowpass.frequency.linearRampToValueAtTime(2800, startTime + Math.min(0.35, durationS))
    lowpass.Q.setValueAtTime(0.7, startTime)

    const amp = ctx.createGain()
    const peak = Math.max(0.0001, gain)
    const sustainUntil = startTime + Math.min(1.28, Math.max(0.03, envelopeTotalS - 0.22))
    amp.gain.setValueAtTime(0.0001, startTime)
    amp.gain.exponentialRampToValueAtTime(peak, startTime + Math.min(0.03, envelopeTotalS))
    amp.gain.setValueAtTime(peak, sustainUntil)
    amp.gain.exponentialRampToValueAtTime(0.0001, startTime + envelopeTotalS)

    osc1.connect(oscGain1).connect(bandpass)
    osc2.connect(oscGain2).connect(bandpass)
    oscSub.connect(oscGainSub).connect(bandpass)

    bandpass.connect(saturator)
    saturator.connect(lowpass)
    lowpass.connect(amp)
    amp.connect(masterGain)

    osc1.start(startTime)
    osc2.start(startTime)
    oscSub.start(startTime)

    osc1.stop(startTime + stopTotalS)
    osc2.stop(startTime + stopTotalS)
    oscSub.stop(startTime + stopTotalS)
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

  private static softSaturationCurve(): Float32Array<ArrayBuffer> {
    const n = 44100
    const curve = new Float32Array(
      new ArrayBuffer(n * Float32Array.BYTES_PER_ELEMENT)
    ) as Float32Array<ArrayBuffer>
    for (let i = 0; i < n; i += 1) {
      const x = (i * 2) / n - 1
      curve[i] = x < 0 ? Math.tanh(x * 1.2) : Math.tanh(x * 0.8)
    }
    return curve
  }
}
