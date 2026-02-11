import { renderHook, sleep } from '@/testing/utils'
import { act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { TimerState } from '@/lib/enums'

import { useIntervalTimer } from './useIntervalTimer'

const defaultConfig = {
  workDuration: 1, // 1 second
  restDuration: 1, // 1 second
  intervals: 2,
  workLabel: 'Work',
  restLabel: 'Rest',
  skipLastRest: true,
}

describe('useIntervalTimer', () => {
  // --- Initialization ---

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useIntervalTimer(defaultConfig))

    expect(result.current.timerState).toBe(TimerState.Idle)
    expect(result.current.currentStepIndex).toBe(0)
    expect(result.current.currentStep).toBeNull()
  })

  it('should initialize timeLeft to first step duration', () => {
    const { result } = renderHook(() =>
      useIntervalTimer({ ...defaultConfig, workDuration: 5 })
    )

    // First step is work, 5 seconds = 5000ms
    expect(result.current.timeLeft).toBe(5000)
  })

  // --- Start / Pause ---

  it('should start timer and update state', () => {
    const { result } = renderHook(() => useIntervalTimer(defaultConfig))

    act(() => {
      result.current.start()
    })

    expect(result.current.timerState).toBe(TimerState.Running)
  })

  it('should pause timer', () => {
    const { result } = renderHook(() => useIntervalTimer(defaultConfig))

    act(() => {
      result.current.start()
    })

    act(() => {
      result.current.pause()
    })

    expect(result.current.timerState).toBe(TimerState.Paused)
  })

  it('should resume from paused state', async () => {
    const { result } = renderHook(() => useIntervalTimer(defaultConfig))

    act(() => {
      result.current.start()
    })

    await act(() => sleep(100))

    act(() => {
      result.current.pause()
    })
    expect(result.current.timerState).toBe(TimerState.Paused)

    act(() => {
      result.current.start()
    })
    expect(result.current.timerState).toBe(TimerState.Running)
  })

  // --- Reset ---

  it('should reset to initial state', async () => {
    const { result } = renderHook(() => useIntervalTimer(defaultConfig))

    act(() => {
      result.current.start()
    })
    await act(() => sleep(150))

    act(() => {
      result.current.reset()
    })

    expect(result.current.timerState).toBe(TimerState.Idle)
    expect(result.current.currentStepIndex).toBe(0)
    expect(result.current.currentStep).toBeNull()
    expect(result.current.timeLeft).toBe(0)
  })

  it('should call onStop when reset', () => {
    const onStop = vi.fn()
    const { result } = renderHook(() =>
      useIntervalTimer({ ...defaultConfig, onStop })
    )

    act(() => {
      result.current.start()
    })

    act(() => {
      result.current.reset()
    })

    expect(onStop).toHaveBeenCalledTimes(1)
  })

  // --- Step progression ---

  it('should update currentStep when timer starts', () => {
    const { result } = renderHook(() => useIntervalTimer(defaultConfig))

    act(() => {
      result.current.start()
    })

    expect(result.current.currentStep).not.toBeNull()
    expect(result.current.currentStep?.isWork).toBe(true)
    expect(result.current.currentStep?.label).toBe('Work')
  })

  it('should advance through work and rest steps', async () => {
    const onStepChange = vi.fn()
    const { result } = renderHook(() =>
      useIntervalTimer({
        ...defaultConfig,
        workDuration: 0.2, // 200ms
        restDuration: 0.2,
        intervals: 2,
        skipLastRest: false,
        onStepChange,
      })
    )

    act(() => {
      result.current.start()
    })

    // Wait for first work step to complete and rest to start
    await act(() => sleep(350))

    // Should have progressed past step 0
    expect(onStepChange.mock.calls.length).toBeGreaterThanOrEqual(2)

    // First call: work step (index 0)
    expect(onStepChange.mock.calls[0][1]).toBe(0)
    expect(onStepChange.mock.calls[0][0].isWork).toBe(true)

    // Second call: rest step (index 1)
    expect(onStepChange.mock.calls[1][1]).toBe(1)
    expect(onStepChange.mock.calls[1][0].isWork).toBe(false)
  })

  // --- Skip ---

  it('should skip current step', async () => {
    const onStepChange = vi.fn()
    const { result } = renderHook(() =>
      useIntervalTimer({
        ...defaultConfig,
        workDuration: 5,
        restDuration: 5,
        onStepChange,
      })
    )

    act(() => {
      result.current.start()
    })

    await act(() => sleep(50))

    act(() => {
      result.current.skipCurrentStep()
    })

    // Should have advanced to step index 1 (rest)
    await act(() => sleep(50))
    expect(onStepChange.mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  // --- Sequence completion ---

  it('should complete and call onSequenceComplete', async () => {
    const onSequenceComplete = vi.fn()
    const { result } = renderHook(() =>
      useIntervalTimer({
        ...defaultConfig,
        workDuration: 0.1, // 100ms
        restDuration: 0.1,
        intervals: 1,
        skipLastRest: true,
        onSequenceComplete,
      })
    )

    act(() => {
      result.current.start()
    })

    // Wait for single work step to complete (no rest due to skipLastRest)
    await act(() => sleep(250))

    expect(result.current.timerState).toBe(TimerState.Completed)
    expect(onSequenceComplete).toHaveBeenCalledTimes(1)
  })

  it('should restart after completion', async () => {
    const { result } = renderHook(() =>
      useIntervalTimer({
        ...defaultConfig,
        workDuration: 0.1,
        intervals: 1,
        skipLastRest: true,
      })
    )

    act(() => {
      result.current.start()
    })

    await act(() => sleep(250))
    expect(result.current.timerState).toBe(TimerState.Completed)

    // Start again after completion
    act(() => {
      result.current.start()
    })
    expect(result.current.timerState).toBe(TimerState.Running)
  })

  // --- Work step complete callback ---

  it('should call onWorkStepComplete when work step finishes', async () => {
    const onWorkStepComplete = vi.fn()
    const { result } = renderHook(() =>
      useIntervalTimer({
        ...defaultConfig,
        workDuration: 0.1, // 100ms
        restDuration: 0.1,
        intervals: 1,
        skipLastRest: true,
        onWorkStepComplete,
      })
    )

    act(() => {
      result.current.start()
    })

    await act(() => sleep(250))

    expect(onWorkStepComplete).toHaveBeenCalledTimes(1)
    // Should be called with the full duration (100ms)
    expect(onWorkStepComplete.mock.calls[0][0]).toBe(100)
  })

  it('should call onWorkStepComplete with elapsed time when skipped', async () => {
    const onWorkStepComplete = vi.fn()
    const { result } = renderHook(() =>
      useIntervalTimer({
        ...defaultConfig,
        workDuration: 5,
        restDuration: 1,
        intervals: 2,
        onWorkStepComplete,
      })
    )

    act(() => {
      result.current.start()
    })

    await act(() => sleep(100))

    act(() => {
      result.current.skipCurrentStep()
    })

    await act(() => sleep(50))

    expect(onWorkStepComplete).toHaveBeenCalledTimes(1)
    // Elapsed should be close to 100ms, not 5000ms
    expect(onWorkStepComplete.mock.calls[0][0]).toBeLessThan(1000)
    expect(onWorkStepComplete.mock.calls[0][0]).toBeGreaterThan(0)
  })

  // --- Config changes ---

  it('should recreate manager when config changes', () => {
    const { result, rerender } = renderHook(
      ({ config }) => useIntervalTimer(config),
      { initialProps: { config: { ...defaultConfig, workDuration: 1 } } }
    )

    const initialTimeLeft = result.current.timeLeft
    expect(initialTimeLeft).toBe(1000) // 1s = 1000ms

    rerender({ config: { ...defaultConfig, workDuration: 3 } })

    expect(result.current.timeLeft).toBe(3000) // 3s = 3000ms
  })

  // --- Cleanup ---

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useIntervalTimer(defaultConfig))
    expect(() => unmount()).not.toThrow()
  })
})
