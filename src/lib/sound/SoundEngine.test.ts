import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('SoundEngine initialization fallback', () => {
  it('returns false when Web Audio is unavailable', async () => {
    const { SoundEngine } = await import('./SoundEngine')
    const engine = SoundEngine.getInstance()
    expect(await engine.init()).toBe(false)
    expect(() => engine.playTone({ frequencyHz: 660, durationMs: 100 })).not.toThrow()
    expect(() => engine.playSampleCue('finish', 1)).not.toThrow()
  })

  it('returns false instead of rejecting when audio-context creation fails', async () => {
    vi.stubGlobal('window', {
      AudioContext: class {
        constructor() {
          throw new Error('Audio device unavailable')
        }
      },
    })
    const { SoundEngine } = await import('./SoundEngine')
    const engine = SoundEngine.getInstance()
    await expect(engine.init()).resolves.toBe(false)
    expect(() => engine.playTone({ frequencyHz: 660, durationMs: 100 })).not.toThrow()
    expect(() => engine.playSampleCue('finish', 1)).not.toThrow()
  })

  it('does not create an audio context from a playback request before initialization', async () => {
    vi.stubGlobal('window', {
      AudioContext: class {
        constructor() {
          throw new Error('Initialization required')
        }
      },
    })
    const { SoundEngine } = await import('./SoundEngine')
    const engine = SoundEngine.getInstance()
    expect(() => engine.playTone({ frequencyHz: 660, durationMs: 100 })).not.toThrow()
    expect(() => engine.playSampleCue('finish', 1)).not.toThrow()
  })
})
