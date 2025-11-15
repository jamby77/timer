"use client";

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
  const { time, state, start, pause, reset, restart } = useTimer(duration * 1000, {
    onStateChange,
  });

  const status = getStatusMessage(state, completionMessage);

  return (
    <Card label={label} status={status} time={formatTime(time)}>
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
