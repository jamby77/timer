"use client";

import { useCallback } from "react";
import { formatTime } from "@/lib/timer";
import { type TimerStep } from "@/lib/timer/TimerManager";
import { useLapHistory } from "@/lib/timer/useLapHistory";
import { useIntervalTimer } from "@/lib/timer/useIntervalTimer";
import { type IntervalConfig } from "@/lib/timer/types";

import { Card } from "./Card";
import { LapHistory } from "./LapHistory";
import PlayIcon from "@/icons/PlayIcon";
import PauseIcon from "@/icons/PauseIcon";
import StopIcon from "@/icons/StopIcon";
import RepeatIcon from "@/icons/Repeat";

interface IntervalProps {
  /** Configuration for the interval timer */
  intervalConfig: IntervalConfig;
  /** Optional callback when interval state changes */
  onStateChange?: (step: TimerStep | null, stepIndex: number) => void;
  /** Optional callback when all intervals complete */
  onSequenceComplete?: () => void;
}

export function Interval({
  intervalConfig,
  onStateChange,
  onSequenceComplete,
}: IntervalProps) {
  const { laps, addLap, clearHistory } = useLapHistory();

  const {
    currentStep,
    currentStepIndex,
    isRunning,
    timeLeft,
    start,
    reset,
    skipCurrentStep,
  } = useIntervalTimer(
    intervalConfig,
    (elapsedTime) => {
      // Add lap with the actual elapsed time
      addLap(elapsedTime);
    },
    onStateChange,
    onSequenceComplete,
  );

  const handleStart = useCallback(() => {
    start();
  }, [start]);

  const handlePause = useCallback(() => {
    // Skip the current interval
    skipCurrentStep();
  }, [skipCurrentStep]);

  const handleReset = useCallback(() => {
    reset();
    clearHistory();
  }, [reset, clearHistory]);

  const handleRestart = useCallback(() => {
    handleReset();
    handleStart();
  }, [handleReset, handleStart]);

  const getStatus = () => {
    if (isRunning) return "Running...";
    if (!currentStep) return "Ready";
    return "Paused";
  };

  const getProgress = () => {
    if (!currentStep) return 0;
    const totalDuration = currentStep.duration;
    const elapsed = totalDuration - timeLeft;
    return (elapsed / totalDuration) * 100;
  };

  const getCurrentIntervalInfo = () => {
    const workSteps = Math.ceil((currentStepIndex + 1) / 2);
    return `${workSteps}/${intervalConfig.intervals}`;
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <Card
        label={currentStep?.label || "Interval Timer"}
        status={getStatus()}
        time={formatTime(timeLeft)}
        subtitle={`Interval ${getCurrentIntervalInfo()}`}
      >
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all duration-100 ${
              currentStep?.isWork ? "bg-green-500" : "bg-blue-500"
            }`}
            style={{ width: `${getProgress()}%` }}
          />
        </div>
        <div className="flex gap-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="bg-green-500 hover:bg-green-600 focus:ring-green-500 focus:ring-opacity-50 rounded-full p-4 text-white transition-colors focus:ring-2 focus:outline-none"
              title="Start intervals"
            >
              <PlayIcon className="h-6 w-6" />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500 focus:ring-opacity-50 rounded-full p-4 text-white transition-colors focus:ring-2 focus:outline-none"
              title="Skip current interval"
            >
              <PauseIcon className="h-6 w-6" />
            </button>
          )}
          <button
            onClick={handleReset}
            disabled={!isRunning}
            className="bg-red-500 hover:bg-red-600 focus:ring-red-500 focus:ring-opacity-50 rounded-full p-4 text-white transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            title="Stop intervals"
          >
            <StopIcon className="h-6 w-6" />
          </button>
          <button
            onClick={handleRestart}
            className="bg-green-500 hover:bg-green-600 focus:ring-green-500 focus:ring-opacity-50 rounded-full p-4 text-white transition-colors focus:ring-2 focus:outline-none"
            title="Restart intervals"
          >
            <RepeatIcon className="h-6 w-6" />
          </button>
        </div>
      </Card>
      <LapHistory laps={laps} onClearHistory={clearHistory} />
    </div>
  );
}
