"use client";

import { useCallback } from "react";
import PauseIcon from "@/icons/PauseIcon";
import PlayIcon from "@/icons/PlayIcon";
import RepeatIcon from "@/icons/Repeat";
import StopIcon from "@/icons/StopIcon";
import { formatTime } from "@/lib/timer";
import { type IntervalConfig } from "@/lib/timer/types";
import { useIntervalTimer } from "@/lib/timer/useIntervalTimer";
import { useLapHistory } from "@/lib/timer/useLapHistory";

import { Card } from "./Card";
import { LapHistory } from "./LapHistory";

interface IntervalProps {
  /** Configuration for the interval timer */
  intervalConfig: IntervalConfig;
}

export function Interval({ intervalConfig }: IntervalProps) {
  const { laps, addLap, clearHistory } = useLapHistory();
  const addLapCallback = useCallback(
    (elapsedTime: number) => {
      // Add lap with the actual elapsed time
      addLap(elapsedTime);
    },
    [addLap],
  );
  const {
    currentStep,
    currentStepIndex,
    isRunning,
    timeLeft,
    start,
    reset,
    pause,
    skipCurrentStep,
  } = useIntervalTimer({
    ...intervalConfig,
    onWorkStepComplete: addLapCallback,
  });

  const handleRestart = useCallback(() => {
    reset();
    start();
  }, [reset, start]);

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
        <div className="mb-4 h-2 w-full rounded-full bg-gray-200">
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
              onClick={start}
              className="focus:ring-opacity-50 rounded-full bg-green-500 p-4 text-white transition-colors hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
              title="Start intervals"
            >
              <PlayIcon className="h-6 w-6" />
            </button>
          ) : (
            <button
              onClick={pause}
              className="focus:ring-opacity-50 rounded-full bg-yellow-500 p-4 text-white transition-colors hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              title="Skip current interval"
            >
              <PauseIcon className="h-6 w-6" />
            </button>
          )}
          <button
            onClick={skipCurrentStep}
            disabled={!isRunning}
            className="focus:ring-opacity-50 rounded-full bg-red-500 p-4 text-white transition-colors hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            title="Stop intervals"
          >
            <StopIcon className="h-6 w-6" />
          </button>
          <button
            onClick={handleRestart}
            className="focus:ring-opacity-50 rounded-full bg-green-500 p-4 text-white transition-colors hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
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
