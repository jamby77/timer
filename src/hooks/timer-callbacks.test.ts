import { renderHook } from '@/testing/utils'
import { act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { TimerState } from '@/lib/enums'

import { useIntervalTimer } from './useIntervalTimer'
import { usePreStartCountdown } from './usePreStartCountdown'
import { useStopwatch } from './useStopwatch'
import { useTimer } from './useTimer'

const hooks = [
  { name: 'Countdown', useTimerHook: (onStop: () => void) => useTimer(10000, { onStop }) },
  { name: 'Stopwatch', useTimerHook: (onStop: () => void) => useStopwatch({ onStop }) },
  {
    name: 'Interval',
    useTimerHook: (onStop: () => void) =>
      useIntervalTimer({ workDuration: 10, restDuration: 5, intervals: 3, onStop }),
  },
]

describe('committed timer callbacks', () => {
  for (const { name, useTimerHook } of hooks) {
    it(`${name} uses the newest callback without recreating a paused timer`, () => {
      const previous = vi.fn()
      const latest = vi.fn()
      const { result, rerender } = renderHook(({ onStop }) => useTimerHook(onStop), {
        initialProps: { onStop: previous },
      })
      act(() => {
        result.current.start()
        result.current.pause()
      })
      rerender({ onStop: latest })
      const state =
        'timerState' in result.current ? result.current.timerState : result.current.state
      expect(state).toBe(TimerState.Paused)
      act(() => result.current.reset())
      expect(previous).not.toHaveBeenCalled()
      expect(latest).toHaveBeenCalledTimes(1)
    })
  }

  it('resets a paused pre-start countdown when its duration changes', () => {
    const { result, rerender } = renderHook(({ seconds }) => usePreStartCountdown({ seconds }), {
      initialProps: { seconds: 5 },
    })
    act(() => {
      result.current.start()
      result.current.pause()
    })
    rerender({ seconds: 2 })
    expect(result.current.state).toBe(TimerState.Idle)
    expect(result.current.timeLeftMs).toBe(2000)
    expect(result.current.isActive).toBe(false)
  })

  it('replaces a paused interval sequence when configuration changes', () => {
    const { result, rerender } = renderHook(
      ({ workDuration }) => useIntervalTimer({ workDuration, restDuration: 2, intervals: 3 }),
      { initialProps: { workDuration: 5 } }
    )
    act(() => {
      result.current.start()
      result.current.pause()
    })
    rerender({ workDuration: 8 })
    expect(result.current.timerState).toBe(TimerState.Idle)
    expect(result.current.timeLeft).toBe(8000)
    expect(result.current.currentStepIndex).toBe(0)
  })
})

it('reports Interval state changes to the current parent callback', () => {
  const onStateChange = vi.fn()
  const { result } = renderHook(() =>
    useIntervalTimer({
      workDuration: 10,
      restDuration: 5,
      intervals: 2,
      onStateChange,
    })
  )
  act(() => result.current.start())
  expect(onStateChange).toHaveBeenLastCalledWith(TimerState.Running)
  act(() => result.current.pause())
  expect(onStateChange).toHaveBeenLastCalledWith(TimerState.Paused)
})
