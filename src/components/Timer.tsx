"use client";

import { useEffect } from "react";
import PauseIcon from "@/icons/PauseIcon";
import PlayIcon from "@/icons/PlayIcon";
import StopIcon from "@/icons/StopIcon";
import { formatTime, TimerState, useTimer } from "@/lib/timer";

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

  // Show completion message when timer finishes
  useEffect(() => {
    if (isCompleted && completionMessage) {
      alert(completionMessage);
    }
  }, [isCompleted, completionMessage]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">{label}</h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          {isRunning && "Running..."}
          {isPaused && "Paused"}
          {!isRunning && !isPaused && "Ready"}
        </p>
        <div className="mb-8 text-center">
          <div className="font-mono text-6xl text-gray-800">{formatTime(time)}</div>
        </div>
        <div className="flex justify-center space-x-4">
          {!isRunning ? (
            <button
              onClick={start}
              className="focus:ring-opacity-50 rounded-full bg-green-500 p-4 text-white transition-colors hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
              aria-label="Start timer"
            >
              <PlayIcon className="h-6 w-6" />
            </button>
          ) : (
            <button
              onClick={pause}
              className="focus:ring-opacity-50 rounded-full bg-yellow-500 p-4 text-white transition-colors hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              aria-label="Pause timer"
            >
              <PauseIcon className="h-6 w-6" />
            </button>
          )}
          <button
            onClick={reset}
            className="focus:ring-opacity-50 rounded-full bg-red-500 p-4 text-white transition-colors hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none"
            aria-label="Stop timer"
          >
            <StopIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
