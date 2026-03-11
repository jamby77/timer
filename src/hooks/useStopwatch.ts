import { useCallback, useEffect, useRef, useState } from 'react'
import { useTimerContext } from '@/contexts/TimerContext'

import type { StopwatchOptions as StopwatchOptionsType } from '@/lib/timer/Stopwatch'

import { TimerState } from '@/lib/enums'
import { Stopwatch } from '@/lib/timer/Stopwatch'

type UseStopwatchOptions = Omit<StopwatchOptionsType, 'onTick' | 'onStateChange' | 'onStop'> & {
  onTick?: (elapsedTime: number) => void
  onStateChange?: (state: TimerState) => void
  onStop?: () => void
  onAutoStop?: (elapsedTime: number) => void
}

export const useStopwatch = (options: UseStopwatchOptions = {}) => {
  const { setTimerActive } = useTimerContext()
  const [time, setTime] = useState(0)
  const [state, setState] = useState<TimerState>(TimerState.Idle)
  const stopwatchRef = useRef<Stopwatch | null>(null)

  const onTickRef = useRef(options.onTick)
  const onStateChangeRef = useRef(options.onStateChange)
  const onStopRef = useRef(options.onStop)
  const onAutoStopRef = useRef(options.onAutoStop)
  onTickRef.current = options.onTick
  onStateChangeRef.current = options.onStateChange
  onStopRef.current = options.onStop
  onAutoStopRef.current = options.onAutoStop

  useEffect(() => {
    setTimerActive(state === TimerState.Running || state === TimerState.Paused)
  }, [state, setTimerActive])

  useEffect(() => {
    const stopwatch = new Stopwatch({
      ...options,
      onTick: (time) => {
        setTime(time)
        onTickRef.current?.(time)
      },
      onStop: (time) => {
        setTime(time)
        onAutoStopRef.current?.(time)
      },
      onStateChange: (newState) => {
        setState(newState)
        onStateChangeRef.current?.(newState)
      },
    })

    stopwatchRef.current = stopwatch

    return () => {
      stopwatch.destroy()
      stopwatchRef.current = null
    }
  }, [options.timeLimitMs])

  const start = useCallback(() => {
    stopwatchRef.current?.start()
  }, [])

  const pause = useCallback(() => {
    stopwatchRef.current?.pause()
  }, [])

  const reset = useCallback(() => {
    stopwatchRef.current?.reset()
    onStopRef.current?.()
  }, [])

  const restart = useCallback(() => {
    stopwatchRef.current?.reset()
    stopwatchRef.current?.start()
  }, [])

  return {
    time,
    state,
    start,
    pause,
    reset,
    restart,
  } as const
}
