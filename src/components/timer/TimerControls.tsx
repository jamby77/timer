import { ReactNode } from "react";
import PauseIcon from "@/icons/PauseIcon";
import PlayIcon from "@/icons/PlayIcon";
import StopIcon from "@/icons/StopIcon";
import cn from "clsx";

import { TimerStateEnum } from "@/components/timer/utilities";

interface TimerControlsProps {
  running?: TimerStateEnum;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
}

const renderButton = (
  kind: "start" | "stop" | "pause",
  handler: () => void,
  children: ReactNode,
) => {
  return (
    <button
      className={cn(
        `flex h-20 w-20 items-center justify-center rounded-full text-xs text-slate-50`,
        {
          "bg-green-500": kind === "start",
          "bg-red-500": kind === "stop",
          "bg-yellow-400": kind === "pause",
        },
      )}
      onClick={handler}
    >
      {kind === "start" && <PlayIcon className="text-white" />}
      {kind === "stop" && <StopIcon className="text-white" />}
      {kind === "pause" && <PauseIcon className="text-white" />}
      <span className="sr-only">{children}</span>
    </button>
  );
};
export const TimerControls = ({
  onStop,
  onPause,
  onStart,
  running = TimerStateEnum.initial,
}: TimerControlsProps) => {
  return (
    <div className="flex flex-row gap-2">
      {running !== TimerStateEnum.running &&
        renderButton("start", onStart, running === TimerStateEnum.paused ? "Resume" : "Start")}
      {running === TimerStateEnum.running && renderButton("stop", onStop, "Stop")}
      {running === TimerStateEnum.running && renderButton("pause", onPause, "Pause")}
    </div>
  );
};

export default TimerControls;
