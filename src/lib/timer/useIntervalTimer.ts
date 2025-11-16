import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { StepState, TimerManager, type TimerStep } from "./TimerManager";
import { TimerState, type IntervalConfig } from "./types";

function generateSteps(
  skipLastRest: boolean,
  intervals: number,
  workDuration: number,
  workLabel: string,
  restDuration: number,
  restLabel: string,
  onWorkStepComplete?: { (elapsedTime: number): void | undefined },
) {
  const steps: TimerStep[] = [];
  const restIntervals = skipLastRest ? intervals - 1 : intervals;

  for (let i = 0; i < intervals; i++) {
    // Work interval with lap tracking
    steps.push({
      id: `work-${i}`,
      duration: workDuration * 1000,
      label: workLabel,
      isWork: true,
      onStepStateChange: (state, data) => {
        const elapsedTime = data.elapsed;
        if (state === StepState.Complete) {
          // Use full duration when completed naturally
          const fullDuration = workDuration * 1000;
          onWorkStepComplete?.(fullDuration);
        } else if (state === StepState.Skip) {
          // Use actual elapsed time when skipped
          onWorkStepComplete?.(elapsedTime);
        }
      },
    });

    // Rest interval (except after the last work interval)
    if (i < restIntervals) {
      steps.push({
        id: `rest-${i}`,
        duration: restDuration * 1000,
        label: restLabel,
        isWork: false,
      });
    }
  }
  return steps;
}

export const useIntervalTimer = (intervalConfig: IntervalConfig) => {
  const [currentStep, setCurrentStep] = useState<TimerStep | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timerState, setTimerState] = useState<TimerState>(TimerState.Idle);
  const [timeLeft, setTimeLeft] = useState(0);
  const managerRef = useRef<TimerManager | null>(null);

  const {
    workDuration,
    restDuration,
    intervals,
    workLabel = "Work",
    restLabel = "Rest",
    skipLastRest = true,
    onWorkStepComplete,
    onStepChange,
    onSequenceComplete,
  } = intervalConfig;

  const timerManager = useMemo(() => {
    console.log("// Generate steps directly in the hook");
    const steps = generateSteps(
      skipLastRest,
      intervals,
      workDuration,
      workLabel,
      restDuration,
      restLabel,
      onWorkStepComplete,
    );

    // Create single timer manager with step change handling
    return new TimerManager({
      steps,
      repeat: 1,
      onStepChange: (step, stepIndex) => {
        // Internal state updates
        setCurrentStep(step);
        setCurrentStepIndex(stepIndex);
        // setTimeLeft(step.duration);
        // External callback
        onStepChange?.(step, stepIndex);
      },
      onSequenceComplete: () => {
        // Internal state update
        setTimerState(TimerState.Completed);
        // External callback
        onSequenceComplete?.();
      },
      onTick: (time, _totalElapsedTime, _step) => {
        setTimeLeft(time);
      },
    });
  }, [
    workDuration,
    restDuration,
    intervals,
    workLabel,
    restLabel,
    skipLastRest,
    onStepChange,
    onSequenceComplete,
  ]);

  managerRef.current = timerManager;

  // Update the timer manager when dependencies change
  useEffect(() => {
    if (!managerRef.current) {
      return;
    }
    // Set initial state
    const initialStep = managerRef.current.getCurrentStep();
    if (initialStep) {
      setCurrentStep(initialStep);
      setTimeLeft(initialStep.duration);
    }

    return () => {
      // Cleanup the old timer manager
      managerRef.current = null;
    };
  }, [managerRef.current]);

  // Create stable callbacks
  const start = useCallback(() => {
    // If we're in Completed state, reset first to start fresh
    if (timerState === TimerState.Completed) {
      managerRef.current?.reset();
      setTimerState(TimerState.Idle);
      const initialStep = managerRef.current?.getCurrentStep();
      if (initialStep) {
        setCurrentStep(initialStep);
        setCurrentStepIndex(0);
        setTimeLeft(initialStep.duration);
      }
    }
    managerRef.current?.start();
    setTimerState(TimerState.Running);
  }, [timerState]);

  const pause = useCallback(() => {
    managerRef.current?.pause();
    setTimerState(TimerState.Paused);
  }, []);

  const reset = useCallback(() => {
    managerRef.current?.reset();
    setTimerState(TimerState.Idle);
    const initialStep = managerRef.current?.getCurrentStep();
    if (initialStep) {
      setCurrentStep(initialStep);
      setCurrentStepIndex(0);
      setTimeLeft(initialStep.duration);
    }
  }, []);

  const skipCurrentStep = useCallback(() => {
    managerRef.current?.skipCurrentStep();
    // State stays Running unless sequence completes (handled by onSequenceComplete)
  }, []);

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
  };
};
