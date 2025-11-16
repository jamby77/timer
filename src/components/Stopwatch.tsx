"use client";

import { useCallback, useState } from "react";
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
  const [lastLapTime, setLastLapTime] = useState<number | null>(null);

  const handleStateChange = useCallback(
    (newState: TimerState) => {
      onStateChange?.(newState);
    },
    [onStateChange],
  );

  const handleStop = useCallback(
    (elapsedTime: number) => {
      setLastLapTime(elapsedTime);
    },
    [],
  );

  const { time, state, start, pause, reset, restart } = useStopwatch({
    timeLimitMs: timeLimit * 1000,
    onStateChange: handleStateChange,
    onStop: handleStop,
  });

  const handleReset = useCallback(() => {
    // Save the current elapsed time before resetting
    if (time > 0) {
      setLastLapTime(time);
    }
    reset();
  }, [time, reset]);

  const status = getStatusMessage(state, completionMessage);
  const timeLimitDisplay = timeLimit ? `(Time limit: ${formatTime(timeLimit * 1000)})` : undefined;
  const lastLapDisplay = lastLapTime !== null ? `Last lap: ${formatTime(lastLapTime)}` : timeLimitDisplay;

  return (
    <Card label={label} status={status} time={formatTime(time)} subtitle={lastLapDisplay}>
      <TimerButton
        state={state}
        onStart={start}
        onPause={pause}
        onReset={handleReset}
        onRestart={restart}
      />
    </Card>
  );
}
