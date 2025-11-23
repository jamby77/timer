"use client";

import { useCallback } from "react";
import { formatTime, getStatusMessage } from "@/lib/timer";
import { TimerState, type IntervalConfig } from "@/lib/timer/types";
import { useIntervalTimer } from "@/lib/timer/useIntervalTimer";
import { useLapHistory } from "@/lib/timer/useLapHistory";
import cx from "clsx";

import { Progress } from "@/components/ui/progress";
import {
  PauseButton,
  ResetButton,
  SkipButton,
  StartButton,
  StopButton,
} from "@/components/ui/timer-buttons";
import { LapHistory } from "./LapHistory";
import { TimerCard } from "./TimerCard";

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

  const handleStop = useCallback(() => {
    // Record current lap if timer is running and we're in a work step
    if (timerState === TimerState.Running && currentStep?.isWork) {
      const elapsed = currentStep.duration - timeLeft;
      addLap(elapsed);
    }
    // Stop and reset the timer
    reset();
  }, [timerState, currentStep, timeLeft, reset, addLap]);

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

  const showPlayButton =
    timerState === TimerState.Idle ||
    timerState === TimerState.Completed ||
    timerState === TimerState.Paused;
  return (
    <TimerCard
      label={currentStep?.label || "Interval Timer"}
      status={status}
      time={formatTime(timeLeft)}
      subtitle={currentStep ? `${getCurrentIntervalInfo()}` : undefined}
      currentStep={currentStep}
    >
      <Progress
        value={getProgress()}
        className={cx("mb-4", {
          invisible: !currentStep,
          "[--progress-indicator-color:var(--tm-pr-work-bg)]": currentStep?.isWork,
          "[--progress-indicator-color:var(--tm-pr-rest-bg)]": !currentStep?.isWork,
        })}
      />
      <div className="flex items-center justify-center gap-4">
        {showPlayButton ? (
          <StartButton
            onClick={start}
            title={timerState === TimerState.Paused ? "Resume intervals" : "Start intervals"}
            label={timerState === TimerState.Paused ? "Resume intervals" : "Start intervals"}
          />
        ) : (
          <PauseButton onClick={pause} title="Pause intervals" label="Pause intervals" />
        )}
        <SkipButton
          onClick={skipCurrentStep}
          disabled={timerState !== TimerState.Running}
          title="Skip current interval"
          label="Skip current interval"
        />
        <StopButton
          onClick={handleStop}
          disabled={timerState !== TimerState.Running}
          title="Stop intervals"
          label="Stop intervals"
        />
        <ResetButton onClick={handleRestart} title="Restart intervals" label="Restart intervals" />
      </div>
      <LapHistory laps={laps} onClearHistory={clearHistory} />
    </TimerCard>
  );
}
