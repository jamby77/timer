import { useCallback, useEffect, useRef, useState } from "react";

import { Stopwatch, StopwatchOptions as StopwatchOptionsType } from "./Stopwatch";
import { TimerState } from "./types";

type UseStopwatchOptions = Omit<StopwatchOptionsType, "onTick" | "onStateChange" | "onStop"> & {
  onTick?: (elapsedTime: number) => void;
  onStateChange?: (state: TimerState) => void;
  onStop?: (elapsedTime: number) => void;
};

export const useStopwatch = (options: UseStopwatchOptions = {}) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [state, setState] = useState<TimerState>(TimerState.Idle);
  const stopwatchRef = useRef<Stopwatch | null>(null);

  // Initialize stopwatch
  useEffect(() => {
    const stopwatch = new Stopwatch({
      ...options,
      onTick: (time) => {
        setTime(time);
        options.onTick?.(time);
      },
      onStop: (time) => {
        setTime(time);
        setState(TimerState.Completed);
        options.onStop?.(time);
      },
    });

    const handleStateChange = () => {
      const running = stopwatch.isRunning;
      const newState = stopwatch.getState();
      setIsRunning(running);
      setState(newState);
      options.onStateChange?.(newState);
    };

    // Initial state check
    handleStateChange();

    // Store the instance
    stopwatchRef.current = stopwatch;

    // Cleanup on unmount
    return () => {
      stopwatch.destroy();
      stopwatchRef.current = null;
    };
  }, [options.timeLimitMs]); // Only recreate if timeLimit changes

  const start = useCallback(() => {
    stopwatchRef.current?.start();
  }, []);

  const pause = useCallback(() => {
    stopwatchRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    stopwatchRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    stopwatchRef.current?.reset();
    setTime(0);
  }, []);

  return {
    time,
    state,
    isRunning,
    start,
    pause,
    stop,
    reset,
  } as const;
};
