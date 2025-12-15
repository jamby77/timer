import { sleep } from '@/testing/utils'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { TimerState } from '@/lib/enums'

import { useTimer } from './useTimer'

describe('useTimer', () => {
  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useTimer(5000))

    expect(result.current.time).toBe(5000)
    expect(result.current.state).toBe(TimerState.Idle)
    expect(result.current.totalElapsedTime).toBe(0)
    expect(result.current.getState()).toBe(TimerState.Idle)
    expect(result.current.getTime()).toBe(5000)
  })

  it('should start timer and update state', async () => {
    const { result } = renderHook(() => useTimer(1000))

    act(() => {
      result.current.start()
    })

    expect(result.current.state).toBe(TimerState.Running)
    expect(result.current.time).toBe(1000)

    // Wait for timer to count down
    await act(async () => {
      await sleep(200)
    })

    expect(result.current.time).toBeLessThan(1000)
    expect(result.current.time).toBeGreaterThan(700)
    expect(result.current.totalElapsedTime).toBeGreaterThan(0)
  })

  it('should pause timer and stop counting', async () => {
    const { result } = renderHook(() => useTimer(5000))

    act(() => {
      result.current.start()
    })

    // Let it run a bit
    await act(async () => {
      await sleep(100)
    })

    const timeBeforePause = result.current.time

    act(() => {
      result.current.pause()
    })

    expect(result.current.state).toBe(TimerState.Paused)
    expect(result.current.time).toBe(timeBeforePause)

    // Wait to ensure it doesn't continue counting
    await act(async () => {
      await sleep(100)
    })

    expect(result.current.time).toBe(timeBeforePause)
  })

  it('should resume counting from paused state', async () => {
    const { result } = renderHook(() => useTimer(5000))

    act(() => {
      result.current.start()
    })

    await act(async () => {
      await sleep(200)
    })

    act(() => {
      result.current.pause()
    })

    const pausedTime = result.current.time

    act(() => {
      result.current.start() // Resume
    })

    expect(result.current.state).toBe(TimerState.Running)

    await act(async () => {
      await sleep(200)
    })

    expect(result.current.time).toBeLessThan(pausedTime)
    expect(result.current.time).toBeGreaterThan(pausedTime - 250)
  })

  it('should reset timer to initial state', async () => {
    const { result } = renderHook(() => useTimer(3000))

    act(() => {
      result.current.start()
    })

    await act(async () => {
      await sleep(100)
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.time).toBe(3000)
    expect(result.current.state).toBe(TimerState.Idle)
    expect(result.current.totalElapsedTime).toBe(0)
  })

  it('should restart timer (reset and start)', async () => {
    const { result } = renderHook(() => useTimer(2000))

    act(() => {
      result.current.start()
    })

    await act(async () => {
      await sleep(100)
    })

    act(() => {
      result.current.restart()
    })

    expect(result.current.state).toBe(TimerState.Running)
    expect(result.current.time).toBe(2000)

    await act(async () => {
      await sleep(200)
    })

    expect(result.current.time).toBeLessThan(2000)
  })

  it('should call onTick callback', async () => {
    const onTick = vi.fn()
    const { result } = renderHook(() => useTimer(1000, { onTick }))

    act(() => {
      result.current.start()
    })

    await act(async () => {
      await sleep(200)
    })

    expect(onTick).toHaveBeenCalled()
    expect(onTick).toHaveBeenCalledWith(expect.any(Number), expect.any(Number))
  })

  it('should call onStateChange callback', async () => {
    const onStateChange = vi.fn()
    const { result } = renderHook(() => useTimer(1000, { onStateChange }))

    act(() => {
      result.current.start()
    })

    expect(onStateChange).toHaveBeenCalledWith(TimerState.Running, expect.any(Number))

    act(() => {
      result.current.pause()
    })

    expect(onStateChange).toHaveBeenCalledWith(TimerState.Paused, expect.any(Number))
  })

  it('should call onComplete callback when timer reaches zero', async () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useTimer(100, { onComplete }))

    act(() => {
      result.current.start()
    })

    await act(async () => {
      await sleep(200)
    })

    expect(result.current.state).toBe(TimerState.Completed)
    expect(result.current.time).toBe(0)
    expect(onComplete).toHaveBeenCalled()
  })

  it('should handle multiple start calls (double click)', () => {
    const { result } = renderHook(() => useTimer(5000))

    act(() => {
      result.current.start()
    })

    expect(result.current.state).toBe(TimerState.Running)

    act(() => {
      result.current.start() // Second call
    })

    expect(result.current.state).toBe(TimerState.Running)
  })

  it('should handle multiple pause calls (double click)', async () => {
    const { result } = renderHook(() => useTimer(5000))

    act(() => {
      result.current.start()
    })

    await act(async () => {
      await sleep(100)
    })

    act(() => {
      result.current.pause()
    })

    expect(result.current.state).toBe(TimerState.Paused)

    act(() => {
      result.current.pause() // Second call
    })

    expect(result.current.state).toBe(TimerState.Paused)
  })

  it('should cleanup timer on unmount', () => {
    const { unmount } = renderHook(() => useTimer(5000))

    // Should not throw any errors during unmount
    expect(() => unmount()).not.toThrow()
  })

  it('should handle rapid start-pause-start sequence', async () => {
    const { result } = renderHook(() => useTimer(5000))

    act(() => {
      result.current.start()
    })

    act(() => {
      result.current.pause()
    })

    act(() => {
      result.current.start() // Resume
    })

    expect(result.current.state).toBe(TimerState.Running)

    await act(async () => {
      await sleep(200)
    })

    expect(result.current.time).toBeLessThan(5000)
  })

  it('should update when initialTime changes', () => {
    const { result, rerender } = renderHook(({ initialTime }) => useTimer(initialTime), {
      initialProps: { initialTime: 3000 },
    })

    expect(result.current.time).toBe(3000)

    // When initialTime changes, a new timer is created but the state
    // doesn't automatically update until we check the timer directly
    rerender({ initialTime: 5000 })

    // The hook creates a new timer instance, so getTime() reflects the new time
    expect(result.current.getTime()).toBe(5000)
    expect(result.current.state).toBe(TimerState.Idle)
  })

  it('should handle zero initial time', async () => {
    const { result } = renderHook(() => useTimer(0))

    expect(result.current.time).toBe(0)
    expect(result.current.state).toBe(TimerState.Idle)

    act(() => {
      result.current.start()
    })

    // With zero time, the timer might start running briefly before completing
    // Let's wait a bit to see the final state
    await act(async () => {
      await sleep(50)
    })

    expect(result.current.state).toBe(TimerState.Completed)
  })

  it('should handle negative initial time', () => {
    const { result } = renderHook(() => useTimer(-1000))

    expect(result.current.time).toBe(-1000)
    expect(result.current.state).toBe(TimerState.Idle)
  })

  it('should maintain correct time after completion', async () => {
    const { result } = renderHook(() => useTimer(50))

    act(() => {
      result.current.start()
    })

    await act(async () => {
      await sleep(100)
    })

    expect(result.current.state).toBe(TimerState.Completed)
    expect(result.current.time).toBe(0)

    // Time should remain at 0 even after more waiting
    await act(async () => {
      await sleep(100)
    })

    expect(result.current.time).toBe(0)
  })
})
