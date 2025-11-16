"use client";

import { useCallback, useState } from "react";
import { formatTime, getStatusMessage, TimerState, useTimer } from "@/lib/timer";

import { Card } from "./Card";
import TimerButton from "./TimerButton";

interface TimerProps {
  /** Duration in seconds */
  duration: number;
  /** Label for the timer (e.g., "Work", "Rest", "On", "Off") */
  label?: string;
  /** Optional message to show when timer completes */
  completionMessage?: string;
  /** Optional callback when timer state changes */
  onStateChange?: (state: TimerState) => void;
}

export function Timer({ duration, label = "Timer", completionMessage, onStateChange }: TimerProps) {
  const [lastLapTime, setLastLapTime] = useState<number | null>(null);

  const handleStateChange = useCallback(
    (newState: TimerState, elapsed: number) => {
      // Show last lap when timer completes
      if (newState === TimerState.Completed && elapsed > 0) {
        setLastLapTime(elapsed);
      }
      onStateChange?.(newState);
    },
    [onStateChange],
  );

  const { time, state, totalElapsedTime, start, pause, reset, restart } = useTimer(duration * 1000, {
    onStateChange: handleStateChange,
  });

  const handleReset = () => {
    // Save the total elapsed time before resetting
    if (totalElapsedTime > 0) {
      setLastLapTime(totalElapsedTime);
    }
    reset();
  };

  const status = getStatusMessage(state, completionMessage);
  const lastLapDisplay = lastLapTime !== null ? `Last lap: ${formatTime(lastLapTime)}` : null;

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
