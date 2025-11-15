import { useCallback, useEffect, useRef, useState } from 'react';
import { Timer as TimerClass } from './Timer';
import { TimerOptions, TimerState } from './types';

export const useTimer = (initialTime: number, options?: TimerOptions) => {
  const [time, setTime] = useState(initialTime);
  const [state, setState] = useState<TimerState>('idle');
  const timerRef = useRef<TimerClass | null>(null);

  // Initialize timer instance
  useEffect(() => {
    const timer = new TimerClass(initialTime, {
      ...options,
      onTick: (currentTime) => {
        setTime(currentTime);
        options?.onTick?.(currentTime);
      },
      onStateChange: (newState) => {
        setState(newState);
        options?.onStateChange?.(newState);
      },
    });

    timerRef.current = timer;

    // Cleanup timer on unmount
    return () => {
      timer.destroy();
      timerRef.current = null;
    };
  }, [initialTime]); // Only recreate when initialTime changes

  // Update timer options when they change
  useEffect(() => {
    if (!timerRef.current) return;

    // Update callbacks using the public method
    timerRef.current.updateOptions({
      ...options,
      onTick: (currentTime) => {
        options?.onTick?.(currentTime);
      },
      onStateChange: (newState) => {
        options?.onStateChange?.(newState);
      },
    });
  }, [options]);

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
    return timerRef.current?.getState() ?? 'idle';
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
