import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTimerContext } from '@/contexts/TimerContext'

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

export const useWorkRestTimer = ({
  config = {},
  onLapRecorded,
  onStop,
  onStateChange,
}: WorkRestTimerOptions = {}): [WorkRestTimerState, WorkRestTimerActions] => {
  const { setTimerActive } = useTimerContext()
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

  const onRestCompleteRef = useRef<() => void>(() => {})
  const timerRef = useRef<Timer | null>(null)
  const stopwatchRef = useRef<Stopwatch | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const onLapRecordedRef = useRef(onLapRecorded)
  const onStopRef = useRef(onStop)
  const onStateChangeRef = useRef(onStateChange)

  // Update the callback ref when options change
  useEffect(() => {
    onLapRecordedRef.current = onLapRecorded
    onStopRef.current = onStop
    onStateChangeRef.current = onStateChange
  }, [onLapRecorded, onStop, onStateChange])

  // Update context when work/rest timer state changes
  useEffect(() => {
    setTimerActive(state.state === TimerState.Running || state.state === TimerState.Paused)
    onStateChangeRef.current?.(state.state)
  }, [state.state, setTimerActive])

  // Clean up the current timer and stopwatch
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

  // Create a rest timer
  const createRestTimer = useCallback(
    (duration: number) => {
      cleanupTimer()

      const restTimer = new Timer(duration, {
        onTick: (timeLeft) => {
          // Update currentTime to trigger re-renders (show remaining time)
          setState((prev) => ({ ...prev, currentTime: timeLeft }))
        },
        onComplete: () => onRestCompleteRef.current(),
        onStateChange: (newState) => {
          if (newState === TimerState.Completed) return
          setState((prev) => ({ ...prev, state: newState }))
        },
      })

      timerRef.current = restTimer
      return restTimer
    },
    [cleanupTimer]
  )

  // Start the rest phase
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

  const createWorkStopwatch = useCallback(() => {
    cleanupTimer()
    const workLimit =
      state.maxWorkTime && state.maxWorkTime > 0
        ? Math.min(state.maxWorkTime * 1000, WORK_TIME_LIMIT_MS)
        : WORK_TIME_LIMIT_MS

    const stopwatch = new Stopwatch({
      timeLimitMs: workLimit,
      onTick: (elapsedTime) => {
        setState((prev) => ({ ...prev, currentTime: elapsedTime }))
      },
      onStop: (elapsedTime) => {
        onLapRecordedRef.current?.(elapsedTime)
        startRestPhase(elapsedTime, state.ratio)
      },
      onStateChange: (newState) => {
        if (newState === TimerState.Completed) return
        setState((prev) => ({ ...prev, state: newState }))
      },
    })

    stopwatchRef.current = stopwatch
    return stopwatch
  }, [cleanupTimer, startRestPhase, state.maxWorkTime, state.ratio])

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

  const finishWork = useCallback(() => {
    if (state.phase !== TimerPhase.Work || timeoutRef.current) return

    stopwatchRef.current?.pause()
    const workDuration = stopwatchRef.current?.getElapsedTime() || 0
    onLapRecordedRef.current?.(workDuration)

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

  const stopWork = useCallback(() => {
    if (state.phase !== TimerPhase.Work) return
    finishWork()
    onStopRef.current?.()
  }, [state.phase, finishWork])

  const finishRest = useCallback((continueWork: boolean) => {
    cleanupTimer()
    const rounds = state.rounds + 1
    const completed = rounds >= state.maxRounds
    const startNext = !completed && continueWork
    const phase = completed ? TimerPhase.Completed : startNext ? TimerPhase.Work : TimerPhase.Idle
    setState((prev) => ({
      ...prev,
      rounds,
      phase,
      state: completed ? TimerState.Completed : TimerState.Idle,
      currentTime: 0,
    }))
    if (startNext) createWorkStopwatch().start()
  }, [state.rounds, state.maxRounds, cleanupTimer, createWorkStopwatch])

  useLayoutEffect(() => {
    onRestCompleteRef.current = () => finishRest(config.autoContinue === true)
  }, [config.autoContinue, finishRest])

  const skipRest = useCallback(() => {
    if (state.phase === TimerPhase.Rest) finishRest(true)
  }, [state.phase, finishRest])

  // Stop rest (reset completely)
  const stopRest = useCallback(() => {
    if (state.phase !== TimerPhase.Rest) return

    cleanupTimer()
    onStopRef.current?.()
    setState((prev) => ({
      ...prev,
      phase: TimerPhase.Idle,
      state: TimerState.Idle,
      currentTime: 0,
    }))
  }, [state.phase, cleanupTimer])

  // Adjust the ratio
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
      ratio: Math.round((config.ratio ?? 1.0) * 100),
      rounds: 0,
      maxRounds: Math.min(config.maxRounds ?? MAX_ROUNDS, MAX_ROUNDS),
      maxWorkTime: config.maxWorkTime,
      restMode: config.restMode,
      fixedRestDuration: config.fixedRestDuration,
      state: TimerState.Idle,
      currentTime: 0,
    })
  }, [
    cleanupTimer,
    config.ratio,
    config.maxRounds,
    config.maxWorkTime,
    config.restMode,
    config.fixedRestDuration,
  ])

  const restart = useCallback(() => {
    reset()
    setState((prev) => ({ ...prev, phase: TimerPhase.Work }))
    createWorkStopwatch().start()
  }, [reset, createWorkStopwatch])

  // Get progress
  const getProgress = useCallback(() => {
    if (state.phase === TimerPhase.Rest && timerRef.current) {
      const duration = timerRef.current.getInitialTime()
      const timeLeft = state.currentTime
      return ((duration - timeLeft) / duration) * 100
    }
    // The work phase has no meaningful progress since the duration is unknown
    return 0
  }, [state.phase, state.currentTime])

  // Stop the entire execution
  const stopExecution = useCallback(() => {
    cleanupTimer()
    onStopRef.current?.()
    setState((prev) => ({
      ...prev,
      phase: TimerPhase.Idle,
      state: TimerState.Idle,
      currentTime: 0,
      rounds: 0,
    }))
  }, [cleanupTimer])

  // Cleanup on unmounting
  useEffect(() => {
    return cleanupTimer
  }, [cleanupTimer])

  const actions: WorkRestTimerActions = {
    startWork,
    pauseWork,
    resumeWork,
    stopWork,
    finishWork,
    skipRest,
    stopRest,
    adjustRatio,
    setRatio,
    resetRatio,
    setMaxRounds,
    reset,
    restart,
    stopExecution,
    getProgress,
  }

  return [state, actions]
}
