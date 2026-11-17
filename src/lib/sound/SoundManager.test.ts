import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TimerPhase, TimerState } from '@/lib/enums'

import { SoundEngine } from './SoundEngine'
import { SoundManager } from './SoundManager'

const engine = SoundEngine.getInstance()

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(0)
  vi.spyOn(engine, 'playTone').mockImplementation(() => {})
  vi.spyOn(engine, 'playAirHorn').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('SoundManager cue scheduling', () => {
  it('does not initialize audio or schedule cues when disabled', async () => {
    const init = vi.spyOn(engine, 'init')
    const manager = new SoundManager({ volume: 0.7, enabled: false })
    expect(await manager.init()).toBe(false)
    manager.onStart()
    vi.setSystemTime(1000)
    manager.onCountdownTick(2000)
    vi.setSystemTime(2000)
    manager.onFinish()
    expect(init).not.toHaveBeenCalled()
    expect(engine.playTone).not.toHaveBeenCalled()
    expect(engine.playAirHorn).not.toHaveBeenCalled()
  })

  it('plays start once, stays quiet on pause/resume, and plays finish once', () => {
    const manager = new SoundManager({ volume: 0.7, enabled: true })
    manager.syncStopwatch(TimerState.Idle, 0)
    manager.syncStopwatch(TimerState.Running, 0)
    manager.syncStopwatch(TimerState.Running, 200)
    vi.setSystemTime(1000)
    manager.syncStopwatch(TimerState.Paused, 200)
    manager.syncStopwatch(TimerState.Running, 200)
    expect(engine.playAirHorn).toHaveBeenCalledExactlyOnceWith({ durationMs: 463, gain: 0.7 })
    vi.setSystemTime(2000)
    manager.syncStopwatch(TimerState.Completed, 1000)
    manager.syncStopwatch(TimerState.Completed, 1000)
    expect(engine.playAirHorn).toHaveBeenCalledTimes(2)
    expect(engine.playAirHorn).toHaveBeenLastCalledWith({ durationMs: 1850, gain: 0.95 })
  })

  it('only counts down within the configured threshold and never repeats a second', () => {
    const manager = new SoundManager({ volume: 0.7, enabled: true, countdownBeeps: 2 })
    manager.syncPreStartCountdown(3000)
    expect(engine.playTone).not.toHaveBeenCalled()
    manager.syncPreStartCountdown(2000)
    manager.syncPreStartCountdown(1900)
    vi.setSystemTime(1000)
    manager.syncPreStartCountdown(1500)
    expect(engine.playTone).toHaveBeenCalledTimes(1)
    manager.syncPreStartCountdown(1000)
    vi.setSystemTime(2000)
    manager.syncPreStartCountdown(0)
    expect(engine.playTone).toHaveBeenCalledTimes(2)
    expect(engine.playTone).toHaveBeenLastCalledWith({
      frequencyHz: 660,
      durationMs: 160,
      type: 'square',
      gain: 1,
    })
  })

  it('suppresses competing cues within a wall-clock second', () => {
    const manager = new SoundManager({ volume: 0.7, enabled: true })
    manager.onStart()
    manager.onCountdownTick(1000)
    manager.onIntervalEnd()
    expect(engine.playTone).not.toHaveBeenCalled()
    vi.setSystemTime(1000)
    manager.onCountdownTick(1000)
    expect(engine.playTone).toHaveBeenCalledTimes(1)
  })

  it('reset permits a fresh countdown and start cue immediately', () => {
    const manager = new SoundManager({ volume: 0.7, enabled: true })
    manager.syncPreStartCountdown(1000)
    manager.reset()
    manager.syncPreStartCountdown(1000)
    expect(engine.playTone).toHaveBeenCalledTimes(2)
    manager.reset()
    manager.syncCountdown(TimerState.Running, 10000)
    expect(engine.playAirHorn).toHaveBeenCalledExactlyOnceWith({ durationMs: 463, gain: 0.7 })
  })

  it('honors individual cue settings and resets playback when settings change', () => {
    const manager = new SoundManager({
      volume: 0.7,
      enabled: true,
      startBeep: false,
      finishBeep: false,
      intervalStartBeep: false,
      intervalEndBeep: false,
    })
    manager.onStart()
    manager.onFinish()
    manager.onIntervalStart()
    manager.onIntervalEnd()
    expect(engine.playTone).not.toHaveBeenCalled()
    expect(engine.playAirHorn).not.toHaveBeenCalled()
    manager.setConfig({ volume: 0.7, enabled: true })
    manager.onStart()
    expect(engine.playAirHorn).toHaveBeenCalledTimes(1)
    manager.setConfig({ volume: 0.7, enabled: true })
    manager.onStart()
    expect(engine.playAirHorn).toHaveBeenCalledTimes(2)
  })

  it('schedules distinct interval cues for work-to-rest and rest-to-work transitions', () => {
    const manager = new SoundManager({ volume: 0.7, enabled: true })
    manager.syncInterval(TimerState.Running, 20000, true, 0)
    vi.setSystemTime(1000)
    manager.syncInterval(TimerState.Running, 10000, false, 1)
    manager.syncInterval(TimerState.Running, 9900, false, 1)
    expect(engine.playTone).toHaveBeenCalledExactlyOnceWith({
      frequencyHz: 523,
      durationMs: 130,
      type: 'square',
      gain: 0.5,
    })
    vi.setSystemTime(2000)
    manager.syncInterval(TimerState.Running, 20000, true, 2)
    expect(engine.playTone).toHaveBeenCalledTimes(2)
    expect(engine.playTone).toHaveBeenLastCalledWith({
      frequencyHz: 784,
      durationMs: 110,
      type: 'square',
      gain: 0.5,
    })
  })

  it('schedules Work/Rest transitions without repeating cues on rest ticks', () => {
    const manager = new SoundManager({ volume: 0.7, enabled: true })
    manager.syncWorkRest(TimerState.Running, TimerPhase.Work, 0, 0)
    vi.setSystemTime(1000)
    manager.syncWorkRest(TimerState.Running, TimerPhase.Rest, 10000, 0)
    manager.syncWorkRest(TimerState.Running, TimerPhase.Rest, 9900, 0)
    expect(engine.playTone).toHaveBeenCalledExactlyOnceWith({
      frequencyHz: 523,
      durationMs: 130,
      type: 'square',
      gain: 0.5,
    })
    vi.setSystemTime(2000)
    manager.syncWorkRest(TimerState.Running, TimerPhase.Work, 0, 1)
    expect(engine.playTone).toHaveBeenCalledTimes(2)
    expect(engine.playTone).toHaveBeenLastCalledWith({
      frequencyHz: 784,
      durationMs: 110,
      type: 'square',
      gain: 0.5,
    })
  })
  it('keeps intermediate rest completion silent and permits the next start in the same second', () => {
    const manager = new SoundManager({ volume: 0.7, enabled: true })
    manager.syncWorkRest(TimerState.Running, TimerPhase.Work, 0, 0)
    vi.setSystemTime(1000)
    manager.syncWorkRest(TimerState.Running, TimerPhase.Rest, 4000, 0)
    vi.setSystemTime(5000)
    manager.syncWorkRest(TimerState.Idle, TimerPhase.Idle, 0, 1)
    expect(engine.playAirHorn).toHaveBeenCalledTimes(1)
    manager.syncWorkRest(TimerState.Running, TimerPhase.Work, 0, 1)
    expect(engine.playAirHorn).toHaveBeenCalledTimes(2)
    expect(engine.playAirHorn).toHaveBeenLastCalledWith({ durationMs: 463, gain: 0.7 })
    vi.setSystemTime(6000)
    manager.syncWorkRest(TimerState.Running, TimerPhase.Rest, 4000, 1)
    vi.setSystemTime(10000)
    manager.syncWorkRest(TimerState.Completed, TimerPhase.Completed, 0, 2)
    manager.syncWorkRest(TimerState.Completed, TimerPhase.Completed, 0, 2)
    expect(engine.playAirHorn).toHaveBeenCalledTimes(3)
    expect(engine.playAirHorn).toHaveBeenLastCalledWith({ durationMs: 1850, gain: 0.95 })
  })
})
