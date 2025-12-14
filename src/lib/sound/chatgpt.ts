export class AirHorn {
  public readonly ctx: AudioContext
  constructor() {
    // @ts-ignore
    this.ctx = new (window.AudioContext || window.webkitAudioContext)()
  }

  play() {
    const ctx = this.ctx
    const now = ctx.currentTime

    // === OSCILLATORS ===
    const osc1 = ctx.createOscillator()
    osc1.type = 'sawtooth'
    osc1.frequency.setValueAtTime(510, now)
    osc1.frequency.exponentialRampToValueAtTime(485, now + 0.18)

    const osc2 = ctx.createOscillator()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(1020, now)
    osc2.detune.value = -6

    const oscSub = ctx.createOscillator()
    oscSub.type = 'sine'
    oscSub.frequency.setValueAtTime(255, now)

    // === MIX ===
    const g1 = ctx.createGain()
    g1.gain.value = 0.6
    const g2 = ctx.createGain()
    g2.gain.value = 0.22
    const gSub = ctx.createGain()
    gSub.gain.value = 0.18

    // === HORN BODY FILTER ===
    const bandpass = ctx.createBiquadFilter()
    bandpass.type = 'bandpass'
    bandpass.frequency.setValueAtTime(650, now)
    bandpass.frequency.linearRampToValueAtTime(730, now + 0.06)
    bandpass.Q.value = 3

    // === SOFT SATURATION ===
    const saturator = ctx.createWaveShaper()
    saturator.curve = AirHorn.softSaturationCurve()
    saturator.oversample = '4x'

    // === HIGH DAMPING ===
    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.setValueAtTime(4200, now)
    lowpass.frequency.linearRampToValueAtTime(2800, now + 0.35)
    lowpass.Q.value = 0.7

    // === ENVELOPE (1.5s total) ===
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(1.15, now + 0.03) // louder peak
    gain.gain.setValueAtTime(1.15, now + 1.28)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5)

    // === ROUTING ===
    osc1.connect(g1).connect(bandpass)
    osc2.connect(g2).connect(bandpass)
    oscSub.connect(gSub).connect(bandpass)

    bandpass.connect(saturator)
    saturator.connect(lowpass)
    lowpass.connect(gain)
    gain.connect(ctx.destination)

    // === START / STOP ===
    osc1.start(now)
    osc2.start(now)
    oscSub.start(now)

    osc1.stop(now + 1.55)
    osc2.stop(now + 1.55)
    oscSub.stop(now + 1.55)
  }

  static makeDistortionCurve(amount: number) {
    const n = 44100
    const curve = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1
      curve[i] = Math.tanh(amount * x)
    }
    return curve
  }

  static softSaturationCurve() {
    const n = 44100
    const curve = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1
      curve[i] = x < 0 ? Math.tanh(x * 1.2) : Math.tanh(x * 0.8)
    }
    return curve
  }
}
