import { useCallback, useEffect, useRef, useState } from 'react'

import type { StopwatchOptions as StopwatchOptionsType } from '@/lib/timer/Stopwatch'

import { TimerState } from '@/lib/enums'
import { Stopwatch } from '@/lib/timer/Stopwatch'
import { useTimerContext } from '@/contexts/TimerContext'

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

  // Store callbacks in refs to avoid recreating the Stopwatch on every render
  const onTickRef = useRef(options.onTick)
  const onStopRef = useRef(options.onStop)
  const onAutoStopRef = useRef(options.onAutoStop)
  const onStateChangeRef = useRef(options.onStateChange)
  onTickRef.current = options.onTick
  onStopRef.current = options.onStop
  onAutoStopRef.current = options.onAutoStop
  onStateChangeRef.current = options.onStateChange

  // Update context when stopwatch state changes
  useEffect(() => {
    setTimerActive(state === TimerState.Running || state === TimerState.Paused)
  }, [state, setTimerActive])

  // Initialize stopwatch
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
      onStateChange: (newState) => {
        setState(newState)
        onStateChangeRef.current?.(newState)
      },
    })

    // Store the instance
    stopwatchRef.current = stopwatch

    // Cleanup on unmount
    return () => {
      stopwatch.destroy()
      stopwatchRef.current = null
    }
  }, [options.timeLimitMs, options.autoStart])

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
