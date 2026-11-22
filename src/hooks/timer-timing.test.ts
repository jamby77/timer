import { renderHook } from '@/testing/utils'
import { act, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TimerPhase, TimerState } from '@/lib/enums'

import { useTimer } from './useTimer'
import { useWorkRestTimer } from './useWorkRestTimer'

const frames = vi.hoisted(() => ({
  nextId: 0,
  callbacks: new Map<number, FrameRequestCallback>(),
}))

vi.mock('@/lib/timer/requestAnimationFramePolyfill', () => ({
  requestAnimationFrame: (callback: FrameRequestCallback) => {
    const id = ++frames.nextId
    frames.callbacks.set(id, callback)
    return id
  },
  cancelAnimationFrame: (id: number) => frames.callbacks.delete(id),
}))

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms)
    const callbacks = [...frames.callbacks.values()]
    frames.callbacks.clear()
    callbacks.forEach((callback) => callback(performance.now()))
  })
}

describe('timer timing with a controlled clock', () => {
  beforeEach(() => {
    frames.nextId = 0
    frames.callbacks.clear()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance', 'Date'] })
  })

  afterEach(() => {
    cleanup()
    const pendingFrames = frames.callbacks.size
    const pendingTimeouts = vi.getTimerCount()
    frames.callbacks.clear()
    vi.useRealTimers()
    expect(pendingFrames).toBe(0)
    expect(pendingTimeouts).toBe(0)
  })

  it('resumes Countdown from the paused time without counting the pause', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useTimer(5000, { onComplete }))
    act(() => result.current.start())
    advance(0)
    advance(200)
    expect(result.current.time).toBe(4800)

    act(() => result.current.pause())
    advance(10000)
    expect(result.current.state).toBe(TimerState.Paused)
    expect(result.current.time).toBe(4800)
    expect(result.current.totalElapsedTime).toBe(200)
    expect(onComplete).not.toHaveBeenCalled()

    act(() => result.current.start())
    advance(0)
    advance(200)
    expect(result.current.state).toBe(TimerState.Running)
    expect(result.current.time).toBe(4600)
    expect(result.current.totalElapsedTime).toBe(400)

    advance(4600)
    expect(result.current.state).toBe(TimerState.Completed)
    expect(result.current.time).toBe(0)
    expect(onComplete).toHaveBeenCalledExactlyOnceWith(5000)
  })

  it('calculates Work/Rest progress from elapsed rest time', () => {
    const { result } = renderHook(() => useWorkRestTimer())
    act(() => result.current[1].startWork())
    advance(0)
    advance(500)
    expect(result.current[0].currentTime).toBe(500)
    act(() => result.current[1].finishWork())
    advance(100)

    expect(result.current[0].phase).toBe(TimerPhase.Rest)
    expect(result.current[0].currentTime).toBe(500)
    expect(result.current[1].getProgress()).toBe(0)

    advance(200)
    expect(result.current[0].currentTime).toBe(300)
    expect(result.current[1].getProgress()).toBeCloseTo(40)
    advance(200)
    expect(result.current[0].currentTime).toBe(100)
    expect(result.current[1].getProgress()).toBeCloseTo(80)
    advance(100)
    expect(result.current[0].phase).toBe(TimerPhase.Idle)
    expect(result.current[0].rounds).toBe(1)
  })
})
