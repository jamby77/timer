"use client";

import { formatTime, getStatusMessage, TimerState, useTimer } from "@/lib/timer";

import { Card } from "./Card";
import { TimerButton } from "./TimerButton";

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
  const { time, state, start, pause, reset } = useTimer(duration * 1000, {
    onStateChange,
  });

  const handleStart = () => {
    console.log("Start button clicked, current state:", state);
    start();
  };

  const handlePause = () => {
    console.log("Pause button clicked, current state:", state);
    pause();
  };

  const handleReset = () => {
    console.log("Reset button clicked, current state:", state);
    reset();
  };

  const handleRestart = () => {
    console.log("Restart button clicked, current state:", state);
    reset();
    start();
  };
  const status = getStatusMessage(state, completionMessage);

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
