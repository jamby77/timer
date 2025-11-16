import { ButtonHTMLAttributes, memo, ReactNode } from "react";
import PauseIcon from "@/icons/PauseIcon";
import PlayIcon from "@/icons/PlayIcon";
import RepeatIcon from "@/icons/Repeat";
import StopIcon from "@/icons/StopIcon";
import { TimerState } from "@/lib/timer";

interface TimerButtonProps {
  state: TimerState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onRestart: () => void;
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
};

const BaseButton = ({ onClick, children, label, title, className, disabled, ...rest }: Props) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`focus:ring-opacity-50 rounded-full p-4 text-white transition-colors focus:ring-2 focus:outline-none ${
        className
      }`}
      aria-label={label}
      title={title}
      {...rest}
    >
      {children}
    </button>
  );
};

function TimerButton({ state, onStart, onPause, onReset, onRestart }: TimerButtonProps) {
  const isRunning = state === TimerState.Running;
  const isCompleted = state === TimerState.Completed;
  let playButton: ReactNode;
  if (isCompleted) {
    playButton = (
      <BaseButton
        onClick={onRestart}
        title="Restart timer"
        label="Restart timer"
        className="bg-green-500 hover:bg-green-600 focus:ring-green-500"
      >
        {<RepeatIcon className="h-6 w-6" />}
      </BaseButton>
    );
  } else if (isRunning) {
    playButton = (
      <BaseButton
        onClick={onPause}
        title="Pause"
        label="Pause timer"
        className="bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500"
      >
        {<PauseIcon className="h-6 w-6" />}
      </BaseButton>
    );
  } else {
    playButton = (
      <BaseButton
        onClick={onStart}
        title="Start"
        label="Start timer"
        className="bg-green-500 hover:bg-green-600 focus:ring-green-500"
      >
        {<PlayIcon className="h-6 w-6" />}
      </BaseButton>
    );
  }

  return (
    <>
      {playButton}
      <BaseButton
        onClick={onReset}
        disabled={!isRunning}
        className={`bg-red-500 hover:bg-red-600 focus:ring-red-500 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500`}
        label="Stop timer"
        title="Stop"
      >
        <StopIcon className="h-6 w-6" />
      </BaseButton>
    </>
  );
}

export default memo(TimerButton);
export { BaseButton };
