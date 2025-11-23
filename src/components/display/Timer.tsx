"use client";

import { useCallback } from "react";
import { formatTime, getStatusMessage, TimerState, useTimer } from "@/lib/timer";
import { useLapHistory } from "@/lib/timer/useLapHistory";

import { LapHistory } from "./LapHistory";
import TimerButton from "./TimerButton";
import { TimerCard } from "./TimerCard";

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
  const { laps, addLap, clearHistory } = useLapHistory();

  const handleStateChange = useCallback(
    (newState: TimerState, elapsed: number) => {
      // When timer completes, record the full duration as a lap
      if (newState === TimerState.Completed && elapsed > 0) {
        addLap(duration * 1000);
      }
      onStateChange?.(newState);
    },
    [duration, addLap, onStateChange],
  );

  const { time, state, totalElapsedTime, start, pause, reset, restart } = useTimer(
    duration * 1000,
    {
      onStateChange: handleStateChange,
    },
  );

  const handleReset = () => {
    // Save the total elapsed time as a lap before resetting
    if (totalElapsedTime > 0) {
      addLap(totalElapsedTime);
    }
    reset();
  };

  const handleRestart = () => {
    restart();
  };

  const status = getStatusMessage(state, completionMessage);

  return (
    <div className="flex flex-col items-center gap-8">
      <TimerCard label={label} status={status} time={formatTime(time)}>
        <TimerButton
          state={state}
          onStart={start}
          onPause={pause}
          onReset={handleReset}
          onRestart={handleRestart}
        />
      </TimerCard>
      <LapHistory laps={laps} onClearHistory={clearHistory} />
    </div>
  );
}
