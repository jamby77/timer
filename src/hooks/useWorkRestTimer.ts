import { useCallback, useEffect, useRef, useState } from 'react'

import type {
  WorkRestTimerActions,
  WorkRestTimerOptions,
  WorkRestTimerState,
} from '@/lib/timer/types'

import { TimerPhase, TimerState, WorkRestMode } from '@/lib/enums'
import { Stopwatch } from '@/lib/timer/Stopwatch'
import { Timer } from '@/lib/timer/Timer'

const WORK_TIME_LIMIT_MS = (99 * 60 + 99) * 1000 // 99:99 = // 6,039.000
const DEFAULT_RATIO = 100 // 1.0 stored as integer
const MIN_RATIO = 1 // 0.01 stored as integer
const MAX_RATIO = 10000 // 100.0 stored as integer
const REST_DELAY_MS = 100 // 100ms delay before rest starts
const MAX_ROUNDS = 1000 // Maximum consecutive work/rest cycles

export const useWorkRestTimer = ({ config = {}, onLapRecorded }: WorkRestTimerOptions = {}): [
  WorkRestTimerState,
  WorkRestTimerActions,
] => {
  const [state, setState] = useState<WorkRestTimerState>({
    phase: TimerPhase.Idle,
    ratio: Math.round((config.ratio ?? 1.0) * 100), // Convert to integer * 100
    rounds: 0,
    maxRounds: Math.min(config.maxRounds ?? MAX_ROUNDS, MAX_ROUNDS), // Cap at MAX_ROUNDS
    maxWorkTime: config.maxWorkTime,
    restMode: config.restMode,
    fixedRestDuration: config.fixedRestDuration,
    state: TimerState.Idle,
    currentTime: 0,
  })

  const timerRef = useRef<Timer | null>(null)
  const stopwatchRef = useRef<Stopwatch | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const onLapRecordedRef = useRef(onLapRecorded)

  // Update callback ref when options change
  useEffect(() => {
    onLapRecordedRef.current = onLapRecorded
  }, [onLapRecorded])

  // Clean up current timer and stopwatch
  const cleanupTimer = useCallback(() => {
    if (timerRef.current) {
      timerRef.current.destroy()
      timerRef.current = null
    }
    if (stopwatchRef.current) {
      stopwatchRef.current.destroy()
      stopwatchRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // Create work stopwatch
  const createWorkStopwatch = useCallback(() => {
    cleanupTimer()

    const stopwatch = new Stopwatch({
      timeLimitMs: WORK_TIME_LIMIT_MS,
      onTick: (elapsedTime) => {
        // Update currentTime to trigger re-renders
        setState((prev) => ({ ...prev, currentTime: elapsedTime }))
      },
      onStop: (elapsedTime) => {
        // Record lap - state transitions handled by action functions
        onLapRecordedRef.current?.(elapsedTime)
      },
      onStateChange: (newState) => {
        setState((prev) => ({ ...prev, state: newState }))
      },
    })

    stopwatchRef.current = stopwatch
    return stopwatch
  }, [cleanupTimer])

  // Create rest timer
  const createRestTimer = useCallback(
    (duration: number) => {
      cleanupTimer()

      const restTimer = new Timer(duration, {
        onTick: (timeLeft) => {
          // Update currentTime to trigger re-renders (show remaining time)
          setState((prev) => ({ ...prev, currentTime: timeLeft }))
        },
        onComplete: () => {
          // Rest completed, return to idle state
          setState((prev) => ({
            ...prev,
            phase: TimerPhase.Idle, // Stay in idle, not work
            rounds: prev.rounds + 1,
            state: TimerState.Idle,
            currentTime: 0,
          }))
          // User must manually start next work phase
        },
        onStateChange: (newState) => {
          setState((prev) => ({ ...prev, state: newState }))
        },
      })

      timerRef.current = restTimer
      return restTimer
    },
    [cleanupTimer]
  )

  // Start rest phase
  const startRestPhase = useCallback(
    (workDuration: number, ratio: number) => {
      let restDuration: number

      // Calculate rest duration based on mode
      if (state.restMode === WorkRestMode.FIXED && state.fixedRestDuration) {
        restDuration = state.fixedRestDuration * 1000 // Convert seconds to milliseconds
      } else {
        // Default: ratio-based calculation
        restDuration = Math.round(workDuration * (ratio / 100))
      }

      // Cap rest duration to 99:99 if needed
      const cappedRestDuration = Math.min(restDuration, WORK_TIME_LIMIT_MS)

      timeoutRef.current = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          phase: TimerPhase.Rest,
          state: TimerState.Idle,
        }))

        const restTimer = createRestTimer(cappedRestDuration)
        restTimer.start()
      }, REST_DELAY_MS)
    },
    [createRestTimer, state.restMode, state.fixedRestDuration]
  )

  // Start work
  const startWork = useCallback(() => {
    if (state.phase !== TimerPhase.Idle) return

    setState((prev) => ({
      ...prev,
      phase: TimerPhase.Work,
      state: TimerState.Idle,
    }))

    const stopwatch = createWorkStopwatch()
    stopwatch.start()
  }, [state.phase, createWorkStopwatch])

  // Pause work
  const pauseWork = useCallback(() => {
    if (state.phase !== TimerPhase.Work || state.state !== TimerState.Running) return

    stopwatchRef.current?.pause()
  }, [state.phase, state.state])

  // Resume work
  const resumeWork = useCallback(() => {
    if (state.phase !== TimerPhase.Work || state.state !== TimerState.Paused) return

    stopwatchRef.current?.start()
  }, [state.phase, state.state])

  // Stop work
  const stopWork = useCallback(() => {
    if (state.phase !== TimerPhase.Work) return

    // Stop the stopwatch first to trigger onStop callback and record lap
    stopwatchRef.current?.stop()

    const workDuration = stopwatchRef.current?.getElapsedTime() || 0

    cleanupTimer()

    // Handle zero work duration edge case
    if (workDuration === 0) {
      setState((prev) => ({
        ...prev,
        phase: TimerPhase.Idle,
        state: TimerState.Idle,
        currentTime: 0,
      }))
      return
    }

    startRestPhase(workDuration, state.ratio)
  }, [state.phase, state.ratio, cleanupTimer, startRestPhase])

  // Skip rest - automatically start next work phase
  const skipRest = useCallback(() => {
    if (state.phase !== TimerPhase.Rest) return

    // Check if max rounds reached
    if (state.rounds >= state.maxRounds) {
      cleanupTimer()
      setState((prev) => ({
        ...prev,
        phase: TimerPhase.Idle,
        state: TimerState.Idle,
        currentTime: 0,
      }))
      return
    }

    cleanupTimer()
    setState((prev) => ({
      ...prev,
      phase: TimerPhase.Work,
      rounds: prev.rounds + 1,
      state: TimerState.Idle,
      currentTime: 0,
    }))

    // Automatically start next work phase
    const stopwatch = createWorkStopwatch()
    stopwatch.start()
  }, [state.phase, state.rounds, state.maxRounds, cleanupTimer, createWorkStopwatch])

  // Stop rest (reset completely)
  const stopRest = useCallback(() => {
    if (state.phase !== TimerPhase.Rest) return

    cleanupTimer()
    setState((prev) => ({
      ...prev,
      phase: TimerPhase.Idle,
      state: TimerState.Idle,
      currentTime: 0,
    }))
  }, [state.phase, cleanupTimer])

  // Adjust ratio
  const adjustRatio = useCallback(
    (delta: number) => {
      if (state.phase !== TimerPhase.Idle) return // Only allow when idle

      setState((prev) => {
        const newRatio = Math.max(MIN_RATIO, Math.min(MAX_RATIO, prev.ratio + delta))
        return { ...prev, ratio: newRatio }
      })
    },
    [state.phase]
  )

  // Set ratio directly
  const setRatio = useCallback(
    (ratio: number) => {
      if (state.phase !== TimerPhase.Idle) return // Only allow when idle

      setState((prev) => {
        const internalRatio = Math.max(MIN_RATIO, Math.min(MAX_RATIO, Math.round(ratio * 100)))
        return { ...prev, ratio: internalRatio }
      })
    },
    [state.phase]
  )

  // Reset ratio
  const resetRatio = useCallback(() => {
    if (state.phase !== TimerPhase.Idle) return

    setState((prev) => ({ ...prev, ratio: DEFAULT_RATIO }))
  }, [state.phase])

  // Set max rounds
  const setMaxRounds = useCallback(
    (maxRounds: number) => {
      if (state.phase !== TimerPhase.Idle) return // Only allow when idle

      // Cap at MAX_ROUNDS
      const cappedMaxRounds = Math.max(1, Math.min(maxRounds, MAX_ROUNDS))
      setState((prev) => ({ ...prev, maxRounds: cappedMaxRounds }))
    },
    [state.phase]
  )

  // Reset everything
  const reset = useCallback(() => {
    cleanupTimer()
    setState({
      phase: TimerPhase.Idle,
      ratio: DEFAULT_RATIO,
      rounds: 0,
      maxRounds: MAX_ROUNDS,
      state: TimerState.Idle,
      currentTime: 0,
    })
  }, [cleanupTimer])

  // Get progress
  const getProgress = useCallback(() => {
    if (state.phase === TimerPhase.Rest && timerRef.current) {
      const duration = timerRef.current.getInitialTime()
      const timeLeft = state.currentTime
      return ((duration - timeLeft) / duration) * 100
    }
    // Work phase has no meaningful progress since duration is unknown
    return 0
  }, [state.phase, state.currentTime])

  // Stop entire execution
  const stopExecution = useCallback(() => {
    cleanupTimer()
    setState((prev) => ({
      ...prev,
      phase: TimerPhase.Idle,
      state: TimerState.Idle,
      currentTime: 0,
    }))
  }, [cleanupTimer])

  // Cleanup on unmount
  useEffect(() => {
    return cleanupTimer
  }, [cleanupTimer])

  const actions: WorkRestTimerActions = {
    startWork,
    pauseWork,
    resumeWork,
    stopWork,
    skipRest,
    stopRest,
    adjustRatio,
    setRatio,
    resetRatio,
    setMaxRounds,
    reset,
    stopExecution,
    getProgress,
  }

  return [state, actions]
}
