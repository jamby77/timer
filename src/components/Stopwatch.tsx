"use client";

import { useCallback } from "react";
import { formatTime, getStatusMessage, TimerState, useStopwatch } from "@/lib/timer";
import { useLapHistory } from "@/lib/timer/useLapHistory";

import { Card } from "./Card";
import { LapHistory } from "./LapHistory";
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
  const { laps, addLap, clearHistory } = useLapHistory();

  const handleStateChange = useCallback(
    (newState: TimerState) => {
      // When stopwatch completes, record the time limit as a lap
      if (newState === TimerState.Completed && timeLimit > 0) {
        addLap(timeLimit * 1000);
      }
      onStateChange?.(newState);
    },
    [timeLimit, addLap, onStateChange],
  );

  const handleStop = useCallback(
    (elapsedTime: number) => {
      addLap(elapsedTime);
    },
    [addLap],
  );

  const { time, state, start, pause, reset, restart } = useStopwatch({
    timeLimitMs: timeLimit * 1000,
    onStateChange: handleStateChange,
    onStop: handleStop,
  });

  const handleReset = useCallback(() => {
    // Save the current elapsed time as a lap before resetting
    if (time > 0) {
      addLap(time);
    }
    reset();
  }, [time, reset, addLap]);

  const handleRestart = useCallback(() => {
    // Clear history and restart
    clearHistory();
    restart();
  }, [clearHistory, restart]);

  const lastLapTime = laps.length > 0 ? laps[laps.length - 1].lapTime : null;

  const status = getStatusMessage(state, completionMessage);
  const timeLimitDisplay = timeLimit ? `(Time limit: ${formatTime(timeLimit * 1000)})` : undefined;

  return (
    <div className="flex flex-col items-center gap-8">
      <Card label={label} status={status} time={formatTime(time)} subtitle={timeLimitDisplay}>
        <TimerButton
          state={state}
          onStart={start}
          onPause={pause}
          onReset={handleReset}
          onRestart={handleRestart}
        />
      </Card>
      <LapHistory laps={laps} currentLap={lastLapTime} />
    </div>
  );
}
