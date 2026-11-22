import { renderHook } from '@/testing/utils'
import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useWorkoutClock } from './useWorkoutClock'

describe('workout clock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })
  const advance = (ms: number) =>
    act(() => {
      vi.advanceTimersByTime(ms)
    })

  it('counts only running time across pauses and phase changes', () => {
    const { result } = renderHook(() => useWorkoutClock(3))
    advance(1000)
    expect(result.current.elapsedMs).toBe(0)
    act(() => result.current.setRunning(true))
    advance(1000)
    act(() => result.current.setRunning(false))
    advance(5000)
    expect(result.current.elapsedMs).toBe(1000)
    expect(result.current.promptOpen).toBe(false)
    act(() => result.current.setRunning(true))
    advance(2000)
    expect(result.current.elapsedMs).toBe(3000)
    expect(result.current.promptOpen).toBe(true)
  })

  it('catches up delayed ticks and does not reset repeated running signals', () => {
    const { result } = renderHook(() => useWorkoutClock(3))
    act(() => result.current.setRunning(true))
    advance(1000)
    act(() => result.current.setRunning(true))
    act(() => {
      vi.setSystemTime(Date.now() + 9900)
      vi.advanceTimersByTime(100)
    })
    expect(result.current.elapsedMs).toBe(11000)
    expect(result.current.promptOpen).toBe(true)
  })

  it('continues after acknowledgement and resets the budget on workout restart', () => {
    const { result } = renderHook(() => useWorkoutClock(1))
    act(() => result.current.setRunning(true))
    advance(1000)
    act(() => result.current.acknowledge())
    advance(1000)
    expect(result.current.promptOpen).toBe(false)
    expect(result.current.elapsedMs).toBe(2000)
    act(() => result.current.reset())
    advance(1000)
    expect(result.current.elapsedMs).toBe(0)
    act(() => result.current.setRunning(true))
    advance(1000)
    expect(result.current.promptOpen).toBe(true)
  })

  it('completion closes the prompt and freezes elapsed time', () => {
    const { result } = renderHook(() => useWorkoutClock(1))
    act(() => result.current.setRunning(true))
    advance(1000)
    act(() => result.current.finish())
    advance(5000)
    expect(result.current.promptOpen).toBe(false)
    expect(result.current.elapsedMs).toBe(1000)
  })

  it('has no prompt or elapsed updates without a configured limit', () => {
    const { result } = renderHook(() => useWorkoutClock())
    act(() => result.current.setRunning(true))
    advance(10000)
    expect(result.current.promptOpen).toBe(false)
    expect(result.current.elapsedMs).toBe(0)
  })
})
