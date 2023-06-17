import { ReactNode } from "react";
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
      className={cn(`rounded-xl px-4 py-2 text-slate-50`, {
        "bg-green-400": kind === "start",
        "bg-red-400": kind === "stop",
        "bg-yellow-400": kind === "pause",
      })}
      onClick={handler}
    >
      {children}
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
