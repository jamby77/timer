import { useCallback, useEffect, useRef, useState } from "react";

import { Stopwatch, StopwatchOptions as StopwatchOptionsType } from "./Stopwatch";

type UseStopwatchOptions = Omit<StopwatchOptionsType, "onTick" | "onStateChange" | "onStop"> & {
  onTick?: (elapsedTime: number) => void;
  onStateChange?: (isRunning: boolean) => void;
  onStop?: (elapsedTime: number) => void;
};

export const useStopwatch = (options: UseStopwatchOptions = {}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const stopwatchRef = useRef<Stopwatch | null>(null);

  // Initialize stopwatch
  useEffect(() => {
    const stopwatch = new Stopwatch({
      ...options,
      onTick: (time) => {
        setElapsedTime(time);
        options.onTick?.(time);
      },
      onStop: (time) => {
        setElapsedTime(time);
        options.onStop?.(time);
      },
    });

    const handleStateChange = () => {
      const running = stopwatch.isRunning;
      setIsRunning(running);
      options.onStateChange?.(running);
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
  }, [options.timeLimitMs]); // Only recreate if timeLimitMs changes

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
    setElapsedTime(0);
  }, []);

  const formatTime = useCallback((includeMilliseconds: boolean = true) => {
    return stopwatchRef.current?.formatTime(includeMilliseconds) || "00:00:00";
  }, []);

  return {
    elapsedTime,
    isRunning,
    start,
    pause,
    stop,
    reset,
    formatTime,
  } as const;
};
