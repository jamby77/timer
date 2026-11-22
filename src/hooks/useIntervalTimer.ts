import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTimerContext } from '@/contexts/TimerContext'

import type { TimerStep } from '@/lib/timer/TimerManager'
import type { IntervalTimerOptions } from '@/lib/timer/types'

import { TimerState } from '@/lib/enums'
import { StepState, TimerManager } from '@/lib/timer/TimerManager'

function generateSteps(
  skipLastRest: boolean,
  intervals: number,
  workDuration: number,
  workLabel: string,
  restDuration: number,
  restLabel: string,
  onWorkStepCompleteRef: React.RefObject<((elapsedTime: number) => void) | undefined>
) {
  const steps: TimerStep[] = []
  const restIntervals = skipLastRest ? intervals - 1 : intervals

  for (let i = 0; i < intervals; i++) {
    // Work interval with lap tracking
    steps.push({
      id: `work-${i}`,
      duration: workDuration * 1000,
      label: workLabel,
      isWork: true,
      onStepStateChange: (state, data) => {
        const elapsedTime = data.elapsed
        if (state === StepState.Complete) {
          // Use full duration when completed naturally
          const fullDuration = workDuration * 1000
          onWorkStepCompleteRef.current?.(fullDuration)
        } else if (state === StepState.Skip) {
          // Use actual elapsed time when skipped
          onWorkStepCompleteRef.current?.(elapsedTime)
        }
      },
    })

    // Rest interval (except after the last work interval)
    if (i < restIntervals) {
      steps.push({
        id: `rest-${i}`,
        duration: restDuration * 1000,
        label: restLabel,
        isWork: false,
      })
    }
  }
  return steps
}

export const useIntervalTimer = ({
  workDuration,
  restDuration,
  intervals,
  workLabel = 'Work',
  restLabel = 'Rest',
  skipLastRest = true,
  onWorkStepComplete,
  onStepChange,
  onSequenceComplete,
  onStop,
  onStateChange,
}: IntervalTimerOptions) => {
  const { setTimerActive } = useTimerContext()
  const [currentStep, setCurrentStep] = useState<TimerStep | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [timerState, setTimerState] = useState<TimerState>(TimerState.Idle)
  const [timeLeft, setTimeLeft] = useState(workDuration * 1000)
  const managerRef = useRef<TimerManager | null>(null)

  const configurationKey = JSON.stringify([
    workDuration,
    restDuration,
    intervals,
    workLabel,
    restLabel,
    skipLastRest,
  ])
  const [previousConfiguration, setPreviousConfiguration] = useState(configurationKey)
  if (previousConfiguration !== configurationKey) {
    setPreviousConfiguration(configurationKey)
    setTimeLeft(workDuration * 1000)
    setTimerState(TimerState.Idle)
    setCurrentStep(null)
    setCurrentStepIndex(0)
  }

  const onWorkStepCompleteRef = useRef(onWorkStepComplete)
  const onStepChangeRef = useRef(onStepChange)
  const onSequenceCompleteRef = useRef(onSequenceComplete)
  const onStopRef = useRef(onStop)
  const onStateChangeRef = useRef(onStateChange)
  useLayoutEffect(() => {
    onWorkStepCompleteRef.current = onWorkStepComplete
    onStepChangeRef.current = onStepChange
    onSequenceCompleteRef.current = onSequenceComplete
    onStopRef.current = onStop
    onStateChangeRef.current = onStateChange
  }, [onWorkStepComplete, onStepChange, onSequenceComplete, onStop, onStateChange])

  const updateTimerState = useCallback((state: TimerState) => {
    setTimerState(state)
    onStateChangeRef.current?.(state)
  }, [])

  useEffect(() => {
    setTimerActive(timerState === TimerState.Running || timerState === TimerState.Paused)
  }, [timerState, setTimerActive])

  useEffect(() => {
    let disposed = false
    const steps = generateSteps(
      skipLastRest,
      intervals,
      workDuration,
      workLabel,
      restDuration,
      restLabel,
      onWorkStepCompleteRef
    )

    const manager = new TimerManager({
      steps,
      repeat: 1,
      onStepChange: (step, stepIndex) => {
        if (disposed) return
        // Internal state updates
        setCurrentStep(step)
        setTimeLeft(step.duration)
        setCurrentStepIndex(stepIndex)
        onStepChangeRef.current?.(step, stepIndex)
      },
      onSequenceComplete: () => {
        if (disposed) return
        // Internal state update
        updateTimerState(TimerState.Completed)
        setTimeLeft(0)
        setCurrentStep(null)
        setCurrentStepIndex(0)
        onSequenceCompleteRef.current?.()
      },
      onTick: (time) => {
        if (disposed) return
        setTimeLeft(time)
      },
    })

    managerRef.current = manager

    return () => {
      disposed = true
      manager.reset()
      managerRef.current = null
    }
  }, [workDuration, restDuration, intervals, workLabel, restLabel, skipLastRest, updateTimerState])

  const start = useCallback(() => {
    // If we're in the Completed state, reset first to start fresh
    if (timerState === TimerState.Completed) {
      managerRef.current?.reset()
      updateTimerState(TimerState.Idle)
    }

    managerRef.current?.start()
    updateTimerState(TimerState.Running)
  }, [timerState, updateTimerState])

  const pause = useCallback(() => {
    if (managerRef.current?.pause()) updateTimerState(TimerState.Paused)
  }, [updateTimerState])

  const reset = useCallback(
    (notifyStop = true) => {
      managerRef.current?.reset()
      updateTimerState(TimerState.Idle)
      setCurrentStep(null)
      setCurrentStepIndex(0)
      setTimeLeft(managerRef.current?.getCurrentStep()?.duration ?? 0)
      if (notifyStop) onStopRef.current?.()
    },
    [updateTimerState]
  )

  const skipCurrentStep = useCallback(() => {
    managerRef.current?.skipCurrentStep()
    // State stays Running unless the sequence completes (handled by onSequenceComplete)
  }, [])

  return {
    currentStep,
    currentStepIndex,
    timerState,
    timeLeft,
    start,
    pause,
    reset,
    skipCurrentStep,
  }
}
