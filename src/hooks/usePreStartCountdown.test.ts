import { sleep } from '@/testing/utils'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { TimerState } from '@/lib/enums'

import { usePreStartCountdown } from './usePreStartCountdown'

describe('usePreStartCountdown', () => {
  it('should be disabled when seconds is undefined or 0', () => {
    const { result: undefinedResult } = renderHook(() =>
      usePreStartCountdown({ seconds: undefined })
    )
    expect(undefinedResult.current.isEnabled).toBe(false)
    expect(undefinedResult.current.secondsLeft).toBe(0)

    const { result: zeroResult } = renderHook(() => usePreStartCountdown({ seconds: 0 }))
    expect(zeroResult.current.isEnabled).toBe(false)
    expect(zeroResult.current.secondsLeft).toBe(0)
  })

  it('should clamp seconds to 60', () => {
    const { result } = renderHook(() => usePreStartCountdown({ seconds: 999 }))
    expect(result.current.isEnabled).toBe(true)
    expect(result.current.countdownSeconds).toBe(60)
    expect(result.current.durationMs).toBe(60000)
  })

  it('should start and count down, then call onComplete once', async () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => usePreStartCountdown({ seconds: 1, onComplete }))

    act(() => {
      result.current.start()
    })

    expect(result.current.isActive).toBe(true)
    expect(result.current.state).toBe(TimerState.Running)

    await act(async () => {
      await sleep(1200)
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(result.current.isActive).toBe(false)
    expect(result.current.state).toBe(TimerState.Idle)
  })

  it('should pause and resume', async () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => usePreStartCountdown({ seconds: 2, onComplete }))

    act(() => {
      result.current.start()
    })

    await act(async () => {
      await sleep(600)
    })

    act(() => {
      result.current.pause()
    })

    const timeLeftAfterPause = result.current.timeLeftMs

    await act(async () => {
      await sleep(600)
    })

    expect(result.current.timeLeftMs).toBe(timeLeftAfterPause)

    act(() => {
      result.current.start()
    })

    await act(async () => {
      await sleep(2000)
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
