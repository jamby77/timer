import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { StepState, TimerManager, type TimerStep } from "./TimerManager";
import { type IntervalConfig } from "./types";

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
        if (state === StepState.Complete) {
          // Use full duration when completed naturally
          onWorkStepComplete?.(workDuration * 1000);
        } else if (state === StepState.Skip) {
          // Use actual elapsed time when skipped
          onWorkStepComplete?.(data.elapsed);
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
  const [isRunning, setIsRunning] = useState(false);
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
        setIsRunning(false);
        // External callback
        onSequenceComplete?.();
      },
      onTick: (time, _totalElapsedTime, step) => {
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
    onWorkStepComplete,
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
    managerRef.current?.start();
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    managerRef.current?.pause();
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    managerRef.current?.reset();
    setIsRunning(false);
    const initialStep = managerRef.current?.getCurrentStep();
    if (initialStep) {
      setCurrentStep(initialStep);
      setCurrentStepIndex(0);
      setTimeLeft(initialStep.duration);
    }
  }, []);

  const skipCurrentStep = useCallback(() => {
    managerRef.current?.skipCurrentStep();
  }, []);

  return {
    currentStep,
    currentStepIndex,
    isRunning,
    timeLeft,
    start,
    pause,
    reset,
    skipCurrentStep,
    manager: managerRef.current,
  };
};
