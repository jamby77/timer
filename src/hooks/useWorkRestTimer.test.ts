import { sleep } from '@/testing/utils'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { TimerPhase, TimerState, WorkRestMode } from '@/lib/enums'

import { useWorkRestTimer } from './useWorkRestTimer'

describe('useWorkRestTimer', () => {
  // Helper functions to reduce code duplication
  const startWork = async (result: any) => {
    act(() => {
      result.current[1].startWork()
    })
  }

  const stopWorkAndWaitForRest = async (result: any) => {
    act(() => {
      result.current[1].stopWork()
    })

    // Wait for REST_DELAY_MS (100ms) + small buffer for rest phase to start
    await act(() => sleep(150))
  }

  const sleepAndWait = async (ms: number) => {
    await act(async () => {
      await sleep(ms)
    })
  }

  const workAndRestCycle = async (result: any, workMs: number = 200) => {
    await startWork(result)
    await sleepAndWait(workMs)
    await stopWorkAndWaitForRest(result)
  }

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useWorkRestTimer())

    expect(result.current[0].phase).toBe(TimerPhase.Idle)
    expect(result.current[0].state).toBe(TimerState.Idle)
    expect(result.current[0].ratio).toBe(100) // 1.0 * 100
    expect(result.current[0].rounds).toBe(0)
    expect(result.current[0].maxRounds).toBe(1000)
    expect(result.current[0].currentTime).toBe(0)
  })

  it('should initialize with custom configuration', () => {
    const { result } = renderHook(() =>
      useWorkRestTimer({
        config: {
          ratio: 1.5,
          maxRounds: 5,
          maxWorkTime: 300,
          restMode: WorkRestMode.FIXED,
          fixedRestDuration: 30,
        },
      })
    )

    expect(result.current[0].phase).toBe(TimerPhase.Idle)
    expect(result.current[0].state).toBe(TimerState.Idle)
    expect(result.current[0].ratio).toBe(150) // 1.5 * 100
    expect(result.current[0].rounds).toBe(0)
    expect(result.current[0].maxRounds).toBe(5)
    expect(result.current[0].maxWorkTime).toBe(300)
    expect(result.current[0].restMode).toBe(WorkRestMode.FIXED)
    expect(result.current[0].fixedRestDuration).toBe(30)
    expect(result.current[0].currentTime).toBe(0)
  })

  it('should start work phase', async () => {
    const { result } = renderHook(() => useWorkRestTimer())

    await startWork(result)

    expect(result.current[0].phase).toBe(TimerPhase.Work)
    expect(result.current[0].state).toBe(TimerState.Running)
    expect(result.current[0].currentTime).toBe(0)

    // Let work run for a bit
    await sleepAndWait(200)

    expect(result.current[0].currentTime).toBeGreaterThan(100)
    expect(result.current[0].currentTime).toBeLessThan(300)
  })

  it('should pause work phase', async () => {
    const { result } = renderHook(() => useWorkRestTimer())

    await startWork(result)

    // Let work run for a bit
    await sleepAndWait(200)

    const pausedTime = result.current[0].currentTime

    act(() => {
      result.current[1].pauseWork()
    })

    expect(result.current[0].phase).toBe(TimerPhase.Work)
    expect(result.current[0].state).toBe(TimerState.Paused)
    expect(result.current[0].currentTime).toBe(pausedTime)

    // Ensure time doesn't continue while paused
    await sleepAndWait(200)

    expect(result.current[0].currentTime).toBe(pausedTime)
  })

  it('should resume work phase', async () => {
    const { result } = renderHook(() => useWorkRestTimer())

    await startWork(result)

    await sleepAndWait(200)

    act(() => {
      result.current[1].pauseWork()
    })

    const pausedTime = result.current[0].currentTime

    act(() => {
      result.current[1].resumeWork()
    })

    expect(result.current[0].phase).toBe(TimerPhase.Work)
    expect(result.current[0].state).toBe(TimerState.Running)

    await sleepAndWait(200)

    expect(result.current[0].currentTime).toBeGreaterThan(pausedTime)
  })

  it('should stop work and start rest phase with ratio-based duration', async () => {
    const { result } = renderHook(() =>
      useWorkRestTimer({
        config: { ratio: 2.0 }, // 2x rest duration
      })
    )

    await startWork(result)

    // Let work run for 500ms
    await sleepAndWait(500)

    const workDuration = result.current[0].currentTime

    await stopWorkAndWaitForRest(result)

    expect(result.current[0].phase).toBe(TimerPhase.Rest)
    expect(result.current[0].state).toBe(TimerState.Running)

    // Rest duration should be approximately 2x work duration
    // Since currentTime shows remaining time, it should be less than the full duration
    const expectedRestDuration = workDuration * 2
    expect(result.current[0].currentTime).toBeLessThan(expectedRestDuration)
    expect(result.current[0].currentTime).toBeGreaterThan(0)
  })

  it('should stop work and start rest phase with fixed duration', async () => {
    const { result } = renderHook(() =>
      useWorkRestTimer({
        config: {
          restMode: WorkRestMode.FIXED,
          fixedRestDuration: 10, // 10 seconds
        },
      })
    )

    await startWork(result)

    // Let work run for 500ms
    await sleepAndWait(500)

    await stopWorkAndWaitForRest(result)

    expect(result.current[0].phase).toBe(TimerPhase.Rest)
    expect(result.current[0].state).toBe(TimerState.Running)

    // Wait a bit more for the rest timer to properly initialize
    await sleepAndWait(100)

    // Rest duration should be exactly 10 seconds (10000ms)
    // Since currentTime shows remaining time, it should be close to the full duration
    expect(result.current[0].currentTime).toBeGreaterThan(9500)
    expect(result.current[0].currentTime).toBeLessThan(10500)
  })

  it('should skip rest phase', async () => {
    const { result } = renderHook(() => useWorkRestTimer())

    await workAndRestCycle(result, 200)

    expect(result.current[0].phase).toBe(TimerPhase.Rest)

    // Wait a bit more to ensure rest phase is fully established
    await sleepAndWait(50)

    act(() => {
      result.current[1].skipRest()
    })

    expect(result.current[0].phase).toBe(TimerPhase.Work)
    expect(result.current[0].state).toBe(TimerState.Running)
    expect(result.current[0].rounds).toBe(1) // Should have completed one round and started next
  })

  it('should stop rest phase', async () => {
    const { result } = renderHook(() => useWorkRestTimer())

    act(() => {
      result.current[1].startWork()
    })

    await act(async () => {
      await sleep(200)
    })

    act(() => {
      result.current[1].stopWork()
    })

    // Wait for REST_DELAY_MS (100ms) + small buffer for rest phase to start
    await act(async () => {
      await sleep(150)
    })

    expect(result.current[0].phase).toBe(TimerPhase.Rest)

    act(() => {
      result.current[1].stopRest()
    })

    expect(result.current[0].phase).toBe(TimerPhase.Idle)
    expect(result.current[0].state).toBe(TimerState.Idle)
    expect(result.current[0].rounds).toBe(0) // Should not have completed the round since we stopped manually
  })

  it('should reset to initial state', async () => {
    const { result } = renderHook(() =>
      useWorkRestTimer({
        config: { ratio: 1.5, maxRounds: 5 },
      })
    )

    await act(async () => {
      result.current[1].startWork()
    })

    await act(async () => {
      await sleep(200)
    })

    act(() => {
      result.current[1].stopWork()
    })

    // Wait for REST_DELAY_MS (100ms) + small buffer for rest phase to start
    await act(async () => {
      await sleep(150)
    })

    expect(result.current[0].phase).toBe(TimerPhase.Rest)
    expect(result.current[0].rounds).toBe(0) // Round not incremented until rest completes naturally

    act(() => {
      result.current[1].reset()
    })

    expect(result.current[0].phase).toBe(TimerPhase.Idle)
    expect(result.current[0].state).toBe(TimerState.Idle)
    expect(result.current[0].ratio).toBe(100) // Should reset to default ratio
    expect(result.current[0].rounds).toBe(0)
    expect(result.current[0].currentTime).toBe(0)
  })

  it('should stop execution completely', async () => {
    const { result } = renderHook(() => useWorkRestTimer())

    act(() => {
      result.current[1].startWork()
    })

    await act(async () => {
      await sleep(200)
    })

    act(() => {
      result.current[1].stopWork()
    })

    // Wait for REST_DELAY_MS (100ms) + small buffer for rest phase to start
    await act(async () => {
      await sleep(150)
    })

    expect(result.current[0].phase).toBe(TimerPhase.Rest)

    act(() => {
      result.current[1].stopExecution()
    })

    expect(result.current[0].phase).toBe(TimerPhase.Idle)
    expect(result.current[0].state).toBe(TimerState.Idle)
  })

  it('should update ratio', () => {
    const { result } = renderHook(() => useWorkRestTimer())

    expect(result.current[0].ratio).toBe(100)

    act(() => {
      result.current[1].setRatio(2.5)
    })

    expect(result.current[0].ratio).toBe(250) // 2.5 * 100
  })

  it('should reset ratio to default', () => {
    const { result } = renderHook(() =>
      useWorkRestTimer({
        config: { ratio: 2.0 },
      })
    )

    expect(result.current[0].ratio).toBe(200)

    act(() => {
      result.current[1].resetRatio()
    })

    expect(result.current[0].ratio).toBe(100) // Reset to 1.0
  })

  it('should update max rounds', () => {
    const { result } = renderHook(() => useWorkRestTimer())

    expect(result.current[0].maxRounds).toBe(1000)

    act(() => {
      result.current[1].setMaxRounds(10)
    })

    expect(result.current[0].maxRounds).toBe(10)
  })

  it('should cap max rounds at maximum', () => {
    const { result } = renderHook(() => useWorkRestTimer())

    act(() => {
      result.current[1].setMaxRounds(2000) // Try to set above max
    })

    expect(result.current[0].maxRounds).toBe(1000) // Should be capped at MAX_ROUNDS
  })

  it('should calculate progress correctly for rest phase', async () => {
    const { result } = renderHook(() => useWorkRestTimer())

    act(() => {
      result.current[1].startWork()
    })

    await act(async () => {
      await sleep(500)
    })

    act(() => {
      result.current[1].stopWork()
    })

    // Wait for REST_DELAY_MS (100ms) + small buffer for rest phase to start
    await act(async () => {
      await sleep(150)
    })

    expect(result.current[0].phase).toBe(TimerPhase.Rest)

    // Progress should be 0% at start of rest (just started)
    const initialProgress = result.current[1].getProgress()
    expect(initialProgress).toBeLessThan(20) // Should be close to 0, allowing some time to pass

    // Let rest run for a bit
    await act(async () => {
      await sleep(200)
    })

    // Progress should be less than 100%
    const laterProgress = result.current[1].getProgress()
    expect(laterProgress).toBeLessThan(100)
    expect(laterProgress).toBeGreaterThan(0)
  })

  it('should return 0 progress for work phase', async () => {
    const { result } = renderHook(() => useWorkRestTimer())

    act(() => {
      result.current[1].startWork()
    })

    expect(result.current[0].phase).toBe(TimerPhase.Work)
    expect(result.current[1].getProgress()).toBe(0)
  })

  it('should return 0 progress for idle phase', () => {
    const { result } = renderHook(() => useWorkRestTimer())

    expect(result.current[0].phase).toBe(TimerPhase.Idle)
    expect(result.current[1].getProgress()).toBe(0)
  })

  it('should call onLapRecorded callback when work completes', async () => {
    const onLapRecorded = vi.fn()
    const { result } = renderHook(() => useWorkRestTimer({ onLapRecorded }))

    act(() => {
      result.current[1].startWork()
    })

    await act(async () => {
      await sleep(200)
    })

    act(() => {
      result.current[1].stopWork()
    })

    // onLapRecorded should be called when work phase completes
    expect(onLapRecorded).toHaveBeenCalledWith(expect.any(Number))
  })

  it('should handle multiple work phases and increment rounds', async () => {
    const { result } = renderHook(() => useWorkRestTimer())

    // First work phase
    act(() => {
      result.current[1].startWork()
    })

    await act(async () => {
      await sleep(200)
    })

    act(() => {
      result.current[1].stopWork()
    })

    // Wait for REST_DELAY_MS (100ms) + small buffer for rest phase to start
    await act(async () => {
      await sleep(150)
    })

    // Skip rest to continue to next work phase
    act(() => {
      result.current[1].skipRest()
    })

    expect(result.current[0].rounds).toBe(1)

    // Second work phase
    act(() => {
      result.current[1].startWork()
    })

    await act(async () => {
      await sleep(200)
    })

    act(() => {
      result.current[1].stopWork()
    })

    // Wait for REST_DELAY_MS (100ms) + small buffer for rest phase to start
    await act(() => sleep(150))

    act(() => {
      result.current[1].skipRest()
    })

    expect(result.current[0].rounds).toBe(2)
  })

  it('should cleanup timers on unmount', () => {
    const { unmount } = renderHook(() => useWorkRestTimer())

    // Should not throw any errors during unmount
    expect(() => unmount()).not.toThrow()
  })

  it('should handle rapid work-pause-work sequence', async () => {
    const { result } = renderHook(() => useWorkRestTimer())

    act(() => {
      result.current[1].startWork()
    })

    act(() => {
      result.current[1].pauseWork()
    })

    act(() => {
      result.current[1].resumeWork()
    })

    expect(result.current[0].phase).toBe(TimerPhase.Work)
    expect(result.current[0].state).toBe(TimerState.Running)

    await act(async () => {
      await sleep(200)
    })

    expect(result.current[0].currentTime).toBeGreaterThan(95)
  })

  it('should maintain state when configuration changes', () => {
    const { result, rerender } = renderHook(({ config }) => useWorkRestTimer({ config }), {
      initialProps: { config: { ratio: 1.5 } },
    })

    expect(result.current[0].ratio).toBe(150)

    // Start work to change state
    act(() => {
      result.current[1].startWork()
    })

    expect(result.current[0].phase).toBe(TimerPhase.Work)

    // Change configuration
    rerender({ config: { ratio: 2.0 } })

    // State should remain the same (configuration changes don't affect running timer)
    expect(result.current[0].phase).toBe(TimerPhase.Work)
    expect(result.current[0].ratio).toBe(150) // Original ratio maintained
  })
})
