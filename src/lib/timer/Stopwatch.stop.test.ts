import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { TimerState } from '@/lib/enums'
import { Stopwatch } from './Stopwatch'

const frames = vi.hoisted(() => ({ nextId: 0, callbacks: new Map<number, FrameRequestCallback>() }))
vi.mock('./requestAnimationFramePolyfill', () => ({
  requestAnimationFrame: (callback: FrameRequestCallback) => {
    const id = ++frames.nextId
    frames.callbacks.set(id, callback)
    return id
  },
  cancelAnimationFrame: (id: number) => frames.callbacks.delete(id),
}))

function advance(ms: number) {
  vi.advanceTimersByTime(ms)
  const callbacks = [...frames.callbacks.values()]
  frames.callbacks.clear()
  callbacks.forEach(callback => callback(performance.now()))
}

beforeEach(() => {
  frames.callbacks.clear()
  vi.useFakeTimers({ toFake: ['performance', 'Date'] })
})
afterEach(() => {
  frames.callbacks.clear()
  vi.useRealTimers()
})

it.each([900, 950, 999])('stops at %i ms of a one-second limit exactly once', elapsed => {
  const onStop = vi.fn()
  const stopwatch = new Stopwatch({ timeLimitMs: 1000, onStop })
  try {
    stopwatch.start()
    advance(0)
    advance(elapsed)
    stopwatch.stop()
    expect(stopwatch.getState()).toBe(TimerState.Paused)
    expect(stopwatch.getElapsedTime()).toBe(elapsed)
    expect(onStop).toHaveBeenCalledExactlyOnceWith(elapsed)
    expect(frames.callbacks.size).toBe(0)
    stopwatch.stop()
    advance(2000)
    expect(onStop).toHaveBeenCalledTimes(1)
    expect(stopwatch.getElapsedTime()).toBe(elapsed)
  } finally {
    stopwatch.destroy()
  }
})

it('allows stopping a limit shorter than 100 ms', () => {
  const onStop = vi.fn()
  const stopwatch = new Stopwatch({ timeLimitMs: 50, onStop })
  try {
    stopwatch.start()
    advance(0)
    advance(20)
    stopwatch.stop()
    expect(stopwatch.isRunning).toBe(false)
    expect(onStop).toHaveBeenCalledExactlyOnceWith(20)
    expect(frames.callbacks.size).toBe(0)
  } finally {
    stopwatch.destroy()
  }
})

it('does not repeat natural completion when stop is called at the limit', () => {
  const onStop = vi.fn()
  const stopwatch = new Stopwatch({ timeLimitMs: 1000, onStop })
  try {
    stopwatch.start()
    advance(0)
    advance(1000)
    stopwatch.stop()
    advance(1000)
    expect(stopwatch.getState()).toBe(TimerState.Completed)
    expect(onStop).toHaveBeenCalledExactlyOnceWith(1000)
    expect(frames.callbacks.size).toBe(0)
  } finally {
    stopwatch.destroy()
  }
})
