"use client";

import { useCallback } from "react";
import { formatTime, getStatusMessage, TimerState, useStopwatch } from "@/lib/timer";

import { Card } from "./Card";
import TimerButton from "./TimerButton";

interface StopwatchProps {
  /** Label for the stopwatch */
  label?: string;
  /** Maximum time in seconds the stopwatch will run (default: 1 year) */
  timeLimit?: number;
  /** Optional callback when stopwatch state changes */
  onStateChange?: (state: TimerState) => void;
  /** Optional message to show when timer completes */
  completionMessage?: string;
}

export function Stopwatch({
  label = "Stopwatch",
  timeLimit = 0,
  onStateChange,
  completionMessage,
}: StopwatchProps) {
  const { time, state, start, pause, reset, restart } = useStopwatch({
    timeLimitMs: timeLimit * 1000,
    onStateChange,
  });

  const status = getStatusMessage(state, completionMessage);
  const subtitle = timeLimit ? `(Time limit: ${formatTime(timeLimit * 1000)})` : undefined;
  console.log("SW");
  return (
    <Card label={label} status={status} time={formatTime(time)} subtitle={subtitle}>
      <TimerButton
        state={state}
        onStart={start}
        onPause={pause}
        onReset={reset}
        onRestart={restart}
      />
    </Card>
  );
}
