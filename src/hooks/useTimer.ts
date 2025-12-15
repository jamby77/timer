import { useCallback, useEffect, useReducer, useRef } from 'react'

import type { TimerOptions } from '@/lib/timer/types'

import { TimerState } from '@/lib/enums'
import { Timer as TimerClass } from '@/lib/timer/Timer'

interface UseTimerState {
  time: number
  state: TimerState
  totalElapsedTime: number
}

type TimerAction =
  | { type: 'TICK'; payload: { time: number; elapsed: number } }
  | { type: 'STATE_CHANGE'; payload: { state: TimerState; elapsed: number } }
  | { type: 'RESET'; payload: { initialTime: number } }

export const timerReducer = (state: UseTimerState, action: TimerAction): UseTimerState => {
  switch (action.type) {
    case 'TICK':
      return {
        ...state,
        time: action.payload.time,
        totalElapsedTime: action.payload.elapsed,
      }
    case 'STATE_CHANGE':
      return {
        ...state,
        state: action.payload.state,
        totalElapsedTime: action.payload.elapsed,
      }
    case 'RESET':
      return {
        time: action.payload.initialTime,
        state: TimerState.Idle,
        totalElapsedTime: 0,
      }
    default:
      return state
  }
}

export const useTimer = (
  initialTime: number,
  { onTick, onStateChange, onComplete }: TimerOptions = {}
) => {
  const [{ state, time, totalElapsedTime }, dispatch] = useReducer(timerReducer, {
    time: initialTime,
    state: TimerState.Idle,
    totalElapsedTime: 0,
  })
  const timerRef = useRef<TimerClass | null>(null)

  // Initialize timer instance
  useEffect(() => {
    const timer = new TimerClass(initialTime, {
      onTick: (currentTime, elapsed) => {
        dispatch({ type: 'TICK', payload: { time: currentTime, elapsed } })
        onTick?.(currentTime, elapsed)
      },
      onStateChange: (newState, elapsed) => {
        dispatch({ type: 'STATE_CHANGE', payload: { state: newState, elapsed } })
        onStateChange?.(newState, elapsed)
      },
      onComplete: (elapsed) => {
        dispatch({ type: 'STATE_CHANGE', payload: { state: TimerState.Completed, elapsed } })
        onComplete?.(elapsed)
      },
    })

    timerRef.current = timer

    // Cleanup timer on unmount
    return () => {
      timer.destroy()
      timerRef.current = null
    }
  }, [initialTime, onTick, onStateChange, onComplete])

  const start = useCallback(() => {
    timerRef.current?.start()
  }, [])

  const pause = useCallback(() => {
    timerRef.current?.pause()
  }, [])

  const reset = useCallback(() => {
    timerRef.current?.reset()
  }, [])

  const restart = useCallback(() => {
    timerRef.current?.reset()
    timerRef.current?.start()
  }, [])

  const getState = useCallback((): TimerState | undefined => {
    return timerRef.current?.getState()
  }, [])

  const getTime = useCallback((): number => {
    return timerRef.current?.getTime() ?? initialTime
  }, [initialTime])

  return {
    time,
    state,
    totalElapsedTime,
    start,
    pause,
    reset,
    restart,
    getState,
    getTime,
  } as const
}
