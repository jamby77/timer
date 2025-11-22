import { memo, ReactNode } from "react";
import { TimerState } from "@/lib/timer";

import { PauseButton, ResetButton, StartButton, StopButton } from "@/components/ui/timer-buttons";

interface TimerButtonProps {
  state: TimerState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onRestart: () => void;
}

function TimerButton({ state, onStart, onPause, onReset, onRestart }: TimerButtonProps) {
  const isRunning = state === TimerState.Running;
  const isCompleted = state === TimerState.Completed;

  let playButton: ReactNode;
  if (isCompleted) {
    playButton = <ResetButton onClick={onRestart} title="Restart timer" label="Restart timer" />;
  } else if (isRunning) {
    playButton = <PauseButton onClick={onPause} title="Pause" label="Pause timer" />;
  } else {
    playButton = <StartButton onClick={onStart} title="Start" label="Start timer" />;
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {playButton}
      <StopButton onClick={onReset} disabled={!isRunning} title="Stop" label="Stop timer" />
    </div>
  );
}

export default memo(TimerButton);
