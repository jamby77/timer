import { useCallback, useEffect, useRef, useState } from "react";

import { Timer as TimerClass } from "./Timer";
import { TimerOptions, TimerState } from "./types";

export const useTimer = (
  initialTime: number,
  { onTick, onStateChange, onComplete }: TimerOptions = {},
) => {
  const [time, setTime] = useState(initialTime);
  const [state, setState] = useState<TimerState>(TimerState.Idle);
  const timerRef = useRef<TimerClass | null>(null);

  // Initialize timer instance
  useEffect(() => {
    const timer = new TimerClass(initialTime, {
      onTick: (currentTime) => {
        setTime(currentTime);
        onTick?.(currentTime);
      },
      onStateChange: (newState) => {
        setState(newState);
        onStateChange?.(newState);
      },
      onComplete,
    });

    timerRef.current = timer;

    // Cleanup timer on unmount
    return () => {
      timer.destroy();
      timerRef.current = null;
    };
  }, [initialTime, onTick, onStateChange, onComplete]);

  const start = useCallback(() => {
    timerRef.current?.start();
  }, []);

  const pause = useCallback(() => {
    timerRef.current?.pause();
  }, []);

  const reset = useCallback(() => {
    timerRef.current?.reset();
  }, []);

  const getState = useCallback((): TimerState => {
    return timerRef.current?.getState() ?? TimerState.Idle;
  }, []);

  const getTime = useCallback((): number => {
    return timerRef.current?.getTime() ?? initialTime;
  }, [initialTime]);

  return {
    time,
    state,
    start,
    pause,
    reset,
    getState,
    getTime,
  } as const;
};
