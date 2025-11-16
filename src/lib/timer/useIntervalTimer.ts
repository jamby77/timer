import { useCallback, useEffect, useRef, useState } from "react";

import { StepState, TimerManager, type TimerStep } from "./TimerManager";
import { type IntervalConfig } from "./types";

export const useIntervalTimer = (
  intervalConfig: IntervalConfig,
  onWorkStepComplete?: (elapsedTime: number) => void,
  onStepChange?: (step: TimerStep, stepIndex: number) => void,
  onSequenceComplete?: () => void,
) => {
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
  } = intervalConfig;

  // Update the timer manager when dependencies change
  useEffect(() => {
    // Generate steps directly in the hook
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

    // Create single timer manager with step change handling
    const timerManager = new TimerManager({
      steps,
      repeat: 1,
      onStepChange: (step, stepIndex) => {
        // Internal state updates
        setCurrentStep(step);
        setCurrentStepIndex(stepIndex);
        setTimeLeft(step.duration);

        // External callback
        onStepChange?.(step, stepIndex);
      },
      onSequenceComplete: () => {
        // Internal state update
        setIsRunning(false);

        // External callback
        onSequenceComplete?.();
      },
    });

    managerRef.current = timerManager;

    // Set initial state
    const initialStep = timerManager.getCurrentStep();
    if (initialStep) {
      setCurrentStep(initialStep);
      setTimeLeft(initialStep.duration);
    }

    return () => {
      // Cleanup the old timer manager
      managerRef.current = null;
    };
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

  // Update time left
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (managerRef.current) {
        const timer = managerRef.current["timer"] as any; // Accessing internal timer for time left
        if (timer) {
          setTimeLeft(timer.getTime());
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning]);

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
