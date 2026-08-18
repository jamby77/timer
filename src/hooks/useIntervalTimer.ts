import { useCallback, useEffect, useRef, useState } from 'react'
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
}: IntervalTimerOptions) => {
  const { setTimerActive } = useTimerContext()
  const [currentStep, setCurrentStep] = useState<TimerStep | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [timerState, setTimerState] = useState<TimerState>(TimerState.Idle)
  const [timeLeft, setTimeLeft] = useState(0)
  const managerRef = useRef<TimerManager | null>(null)

  const onWorkStepCompleteRef = useRef(onWorkStepComplete)
  const onStepChangeRef = useRef(onStepChange)
  const onSequenceCompleteRef = useRef(onSequenceComplete)
  const onStopRef = useRef(onStop)
  onWorkStepCompleteRef.current = onWorkStepComplete
  onStepChangeRef.current = onStepChange
  onSequenceCompleteRef.current = onSequenceComplete
  onStopRef.current = onStop

  useEffect(() => {
    setTimerActive(timerState === TimerState.Running || timerState === TimerState.Paused)
  }, [timerState, setTimerActive])

  useEffect(() => {
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
        // Internal state updates
        setCurrentStep(step)
        setCurrentStepIndex(stepIndex)
        onStepChangeRef.current?.(step, stepIndex)
      },
      onSequenceComplete: () => {
        // Internal state update
        setTimerState(TimerState.Completed)
        setCurrentStep(null)
        setCurrentStepIndex(0)
        onSequenceCompleteRef.current?.()
      },
      onTick: (time) => {
        setTimeLeft(time)
      },
    })

    managerRef.current = manager
    setTimeLeft(manager.getCurrentStep()?.duration || 0)

    return () => {
      managerRef.current = null
    }
  }, [workDuration, restDuration, intervals, workLabel, restLabel, skipLastRest])

  const start = useCallback(() => {
    // If we're in the Completed state, reset first to start fresh
    if (timerState === TimerState.Completed) {
      managerRef.current?.reset()
      setTimerState(TimerState.Idle)
    }

    managerRef.current?.start()
    setTimerState(TimerState.Running)
  }, [timerState])

  const pause = useCallback(() => {
    managerRef.current?.pause()
    setTimerState(TimerState.Paused)
  }, [])

  const reset = useCallback(() => {
    managerRef.current?.reset()
    setTimerState(TimerState.Idle)
    setCurrentStep(null)
    setCurrentStepIndex(0)
    setTimeLeft(0)
    onStopRef.current?.()
  }, [])

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
    manager: managerRef.current,
  }
}
