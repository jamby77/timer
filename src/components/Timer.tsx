"use client";

import { formatTimeMs, TimerState, useTimer } from "@/lib/timer";

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
  const isRunning = state === TimerState.Running;
  const isPaused = state === TimerState.Paused;
  const isCompleted = state === TimerState.Completed;
  const isIdle = state === TimerState.Idle;

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">{label}</h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          {isRunning && "Running..."}
          {isPaused && "Paused"}
          {isIdle && "Ready"}
          {isCompleted && !!completionMessage && completionMessage}
        </p>
        <div className="mb-8 text-center">
          <div className="font-mono text-6xl text-gray-800">{formatTimeMs(time)}</div>
        </div>
        <div className="flex justify-center space-x-4">
          <TimerButton
            state={state}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
            onRestart={handleRestart}
          />
        </div>
      </div>
    </div>
  );
}
