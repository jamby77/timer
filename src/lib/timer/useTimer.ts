import { useCallback, useEffect, useRef, useState } from "react";

import { TimerControls, TimerOptions, TimerState } from "./types";

export const useTimer = (initialTime: number, options?: TimerOptions) => {
  const [time, setTime] = useState(initialTime);
  const [state, setState] = useState<TimerState>("idle");
  const startTimeRef = useRef<number | null>(null);
  const remainingTimeRef = useRef(initialTime);
  const animationFrameRef = useRef<number | undefined>(undefined);

  const updateTime = useCallback(
    (timestamp: number) => {
      if (startTimeRef.current === null) return;

      const elapsed = timestamp - startTimeRef.current;
      const newTime = Math.max(0, remainingTimeRef.current - elapsed);

      setTime(newTime);
      options?.onTick?.(newTime);

      if (newTime <= 0) {
        setState("idle");
        options?.onComplete?.();
        return;
      }

      animationFrameRef.current = requestAnimationFrame(updateTime);
    },
    [options],
  );

  const start = useCallback(() => {
    if (state === "running") return;

    startTimeRef.current = performance.now();
    setState("running");
    options?.onStateChange?.("running");

    animationFrameRef.current = requestAnimationFrame(updateTime);
  }, [state, updateTime, options]);

  const pause = useCallback(() => {
    if (state !== "running") return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }

    remainingTimeRef.current = time;
    setState("paused");
    options?.onStateChange?.("paused");
  }, [state, time, options]);

  const reset = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }

    setTime(initialTime);
    remainingTimeRef.current = initialTime;
    startTimeRef.current = null;
    setState("idle");
    options?.onStateChange?.("idle");
  }, [initialTime, options]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const getState = useCallback(() => state, [state]);
  const getTime = useCallback(() => time, [time]);

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
