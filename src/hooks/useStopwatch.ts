import { isRecoverable, useInitialProgress, useSaveProgress } from '@/contexts/TimerRecovery'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTimerContext } from '@/contexts/TimerContext'

import type { StopwatchOptions as StopwatchOptionsType } from '@/lib/timer/Stopwatch'

import { TimerState } from '@/lib/enums'
import { Stopwatch } from '@/lib/timer/Stopwatch'

type UseStopwatchOptions = Omit<StopwatchOptionsType, 'onTick' | 'onStateChange' | 'onStop'> & {
  onTick?: (elapsedTime: number) => void
  onStateChange?: (state: TimerState, endedAt?: number) => void
  onStop?: () => void
  onAutoStop?: (elapsedTime: number) => void
}

export const useStopwatch = (options: UseStopwatchOptions = {}) => {
  const { setTimerActive } = useTimerContext()
  const [time, setTime] = useState(0)
  const [state, setState] = useState<TimerState>(TimerState.Idle)
  const saved = useInitialProgress('stopwatch')
  const stopwatchRef = useRef<Stopwatch | null>(null)
  useSaveProgress('stopwatch', () => {
    const timer = stopwatchRef.current
    return timer && isRecoverable(timer.getState()) ? timer.getElapsedTime() : undefined
  })

  const onTickRef = useRef(options.onTick)
  const onStateChangeRef = useRef(options.onStateChange)
  const onStopRef = useRef(options.onStop)
  const onAutoStopRef = useRef(options.onAutoStop)
  useLayoutEffect(() => {
    onTickRef.current = options.onTick
    onStateChangeRef.current = options.onStateChange
    onStopRef.current = options.onStop
    onAutoStopRef.current = options.onAutoStop
  }, [options.onTick, options.onStateChange, options.onStop, options.onAutoStop])

  useEffect(() => {
    setTimerActive(state === TimerState.Running || state === TimerState.Paused)
  }, [state, setTimerActive])

  useEffect(() => {
    const stopwatch = new Stopwatch({
      timeLimitMs: options.timeLimitMs,
      autoStart: options.autoStart,
      onTick: (time) => {
        setTime(time)
        onTickRef.current?.(time)
      },
      onStop: (time) => {
        setTime(time)
        onAutoStopRef.current?.(time)
      },
      onStateChange: (newState, at) => {
        setState(newState)
        if (newState === TimerState.Completed) onStateChangeRef.current?.(newState, stopwatch.getEndTime())
        else if (at !== undefined) onStateChangeRef.current?.(newState, at)
        else onStateChangeRef.current?.(newState)
      },
    })

    stopwatchRef.current = stopwatch
    if (saved !== undefined) stopwatch.resumeFrom(saved)

    return () => {
      stopwatch.destroy()
      stopwatchRef.current = null
    }
  }, [options.timeLimitMs, options.autoStart, saved])

  const start = useCallback((startsAt?: number) => {
    stopwatchRef.current?.start(startsAt)
  }, [])

  const pause = useCallback(() => {
    stopwatchRef.current?.pause()
  }, [])

  const reset = useCallback(() => {
    stopwatchRef.current?.reset()
    onStopRef.current?.()
  }, [])

  const restart = useCallback((startsAt?: number) => {
    stopwatchRef.current?.reset()
    stopwatchRef.current?.start(startsAt)
  }, [])

  const getElapsedTime = useCallback(() => stopwatchRef.current?.getElapsedTime() ?? 0, [])

  return {
    getElapsedTime,
    time,
    state,
    start,
    pause,
    reset,
    restart,
  } as const
}
