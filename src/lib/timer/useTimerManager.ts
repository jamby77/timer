import { useCallback, useEffect, useRef, useState } from "react";

import { TimerManager, type TimerSequenceOptions, type TimerStep } from "./TimerManager";

export const useTimerManager = (options: TimerSequenceOptions) => {
  const [currentStep, setCurrentStep] = useState<TimerStep | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const managerRef = useRef<TimerManager | null>(null);

  // Initialize the timer manager
  useEffect(() => {
    managerRef.current = new TimerManager({
      ...options,
      onStepChange: (step, index) => {
        setCurrentStep(step);
        setCurrentStepIndex(index);
        setTimeLeft(step.duration);
        options.onStepChange?.(step, index);
      },
      onSequenceComplete: () => {
        setIsRunning(false);
        options.onSequenceComplete?.();
      },
    });

    // Set initial state
    const initialStep = options.steps[0];
    if (initialStep) {
      setCurrentStep(initialStep);
      setTimeLeft(initialStep.duration);
    }

    return () => {
      // Cleanup
      managerRef.current = null;
    };
  }, [options]);

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
    const initialStep = options.steps[0];
    if (initialStep) {
      setCurrentStep(initialStep);
      setCurrentStepIndex(0);
      setTimeLeft(initialStep.duration);
    }
  }, [options.steps]);

  return {
    currentStep,
    currentStepIndex,
    isRunning,
    timeLeft,
    start,
    pause,
    reset,
    manager: managerRef.current,
  };
};

// Helper function to create an interval timer
export const useIntervalTimer = (
  workDuration: number,
  restDuration: number,
  intervals: number,
  workLabel: string = "Work",
  restLabel: string = "Rest",
  skipLastRest: boolean = true,
) => {
  const [manager, setManager] = useState<TimerManager | undefined>();

  // Update the timer manager when dependencies change
  useEffect(() => {
    const newManager = TimerManager.createIntervalTimer(
      workDuration,
      restDuration,
      intervals,
      workLabel,
      restLabel,
      skipLastRest,
    );

    // Update the manager reference
    setManager(newManager);

    return () => {
      // Cleanup the old timer manager
    };
  }, [workDuration, restDuration, intervals, workLabel, restLabel, skipLastRest, manager]);

  // Create stable callbacks
  const start = useCallback(() => manager?.start(), [manager]);
  const pause = useCallback(() => manager?.pause(), [manager]);
  const reset = useCallback(() => manager?.reset(), [manager]);
  const getCurrentStep = useCallback(() => manager?.getCurrentStep(), [manager]);
  const getCurrentStepIndex = useCallback(() => manager?.getCurrentStepIndex(), [manager]);
  const isRunning = useCallback(() => manager?.isRunning(), [manager]);

  return {
    start,
    pause,
    reset,
    getCurrentStep,
    getCurrentStepIndex,
    isRunning,
  };
};
