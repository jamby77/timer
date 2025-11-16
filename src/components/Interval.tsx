"use client";

import { useCallback } from "react";
import PauseIcon from "@/icons/PauseIcon";
import PlayIcon from "@/icons/PlayIcon";
import RepeatIcon from "@/icons/Repeat";
import StopIcon from "@/icons/StopIcon";
import { formatTime, getStatusMessage } from "@/lib/timer";
import { TimerState, type IntervalConfig } from "@/lib/timer/types";
import { useIntervalTimer } from "@/lib/timer/useIntervalTimer";
import { useLapHistory } from "@/lib/timer/useLapHistory";
import { BaseButton } from "./TimerButton";

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
    timerState,
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

  const status = getStatusMessage(timerState);

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
        status={status}
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
          {timerState === TimerState.Idle || timerState === TimerState.Completed ? (
            <BaseButton
              onClick={start}
              title="Start intervals"
              label="Start intervals"
              className="bg-green-500 hover:bg-green-600 focus:ring-green-500"
            >
              <PlayIcon className="h-6 w-6" />
            </BaseButton>
          ) : (
            <BaseButton
              onClick={pause}
              title="Pause intervals"
              label="Pause intervals"
              className="bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500"
            >
              <PauseIcon className="h-6 w-6" />
            </BaseButton>
          )}
          <BaseButton
            onClick={skipCurrentStep}
            disabled={timerState !== TimerState.Running}
            title="Skip current interval"
            label="Skip current interval"
            className="bg-red-500 hover:bg-red-600 focus:ring-red-500 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            <StopIcon className="h-6 w-6" />
          </BaseButton>
          <BaseButton
            onClick={handleRestart}
            title="Restart intervals"
            label="Restart intervals"
            className="bg-green-500 hover:bg-green-600 focus:ring-green-500"
          >
            <RepeatIcon className="h-6 w-6" />
          </BaseButton>
        </div>
      </Card>
      <LapHistory laps={laps} onClearHistory={clearHistory} />
    </div>
  );
}
