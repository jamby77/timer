"use client";

import { useCallback } from "react";
import { formatTime, getStatusMessage, TimerState, useStopwatch } from "@/lib/timer";

import { Card } from "./Card";
import { TimerButton } from "./TimerButton";

interface StopwatchProps {
  /** Label for the stopwatch */
  label?: string;
  /** Maximum time in milliseconds the stopwatch will run (default: 1 year) */
  timeLimit?: number;
  /** Optional callback when stopwatch state changes */
  onStateChange?: (state: TimerState) => void;
  /** Optional message to show when timer completes */
  completionMessage?: string;
}

export function Stopwatch({
  label = "Stopwatch",
  timeLimit,
  onStateChange,
  completionMessage,
}: StopwatchProps) {
  const { time, state, start, pause, reset } = useStopwatch({
    timeLimitMs: timeLimit,
    onStateChange,
  });

  const handleStart = useCallback(() => {
    start();
  }, [start]);

  const handlePause = useCallback(() => {
    pause();
  }, [pause]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  const handleRestart = useCallback(() => {
    reset();
    start();
  }, [reset, start]);

  const status = getStatusMessage(state, completionMessage);
  console.log({ state });
  return (
    <Card label={label} status={status} time={formatTime(time)}>
      <TimerButton
        state={state}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        onRestart={handleRestart}
      />
    </Card>
  );
}
