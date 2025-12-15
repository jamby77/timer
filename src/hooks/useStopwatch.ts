import { useCallback, useEffect, useRef, useState } from 'react'

import type { StopwatchOptions as StopwatchOptionsType } from '@/lib/timer/Stopwatch'

import { TimerState } from '@/lib/enums'
import { Stopwatch } from '@/lib/timer/Stopwatch'

type UseStopwatchOptions = Omit<StopwatchOptionsType, 'onTick' | 'onStateChange' | 'onStop'> & {
  onTick?: (elapsedTime: number) => void
  onStateChange?: (state: TimerState) => void
  onStop?: (elapsedTime: number) => void
}

export const useStopwatch = (options: UseStopwatchOptions = {}) => {
  const [time, setTime] = useState(0)
  const [state, setState] = useState<TimerState>(TimerState.Idle)
  const stopwatchRef = useRef<Stopwatch | null>(null)

  // Initialize stopwatch
  useEffect(() => {
    const stopwatch = new Stopwatch({
      ...options,
      onTick: (time) => {
        setTime(time)
        options.onTick?.(time)
      },
      onStop: (time) => {
        setTime(time)
        options.onStop?.(time)
      },
      onStateChange: (newState) => {
        setState(newState)
        options.onStateChange?.(newState)
      },
    })

    // Store the instance
    stopwatchRef.current = stopwatch

    // Cleanup on unmount
    return () => {
      stopwatch.destroy()
      stopwatchRef.current = null
    }
  }, [options.timeLimitMs]) // Only recreate if timeLimit changes

  const start = useCallback(() => {
    stopwatchRef.current?.start()
  }, [])

  const pause = useCallback(() => {
    stopwatchRef.current?.pause()
  }, [])

  const reset = useCallback(() => {
    stopwatchRef.current?.reset()
  }, [])

  const restart = useCallback(() => {
    stopwatchRef.current?.reset()
    stopwatchRef.current?.start()
  }, [reset, start])

  return {
    time,
    state,
    start,
    pause,
    reset,
    restart,
  } as const
}
