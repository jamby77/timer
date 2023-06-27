import { useEffect, useState } from "react";
import cn from "clsx";

import { IntervalPhase } from "@/components/timer/index";
import { TimerStateEnum, toFixedDigits } from "@/components/timer/utilities";

const emphasisInit = {
  emphasisMs: false,
  emphasisSe: false,
  emphasisMin: false,
  emphasisHrs: false,
};
const TimerDisplay = ({
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
  phase,
  running,
}: {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  phase?: IntervalPhase;
  running?: TimerStateEnum;
}) => {
  const [emphasis, setEmphasis] = useState(emphasisInit);
  useEffect(() => {
    const update = { ...emphasis };
    if (running === TimerStateEnum.stopped || running === TimerStateEnum.initial) {
      setEmphasis(emphasisInit);
      return;
    }
    let hasChange = false;
    if (milliseconds > 0 && !update.emphasisMs) {
      update.emphasisMs = true;
      hasChange = true;
    }
    if (seconds > 0 && !update.emphasisSe) {
      update.emphasisSe = true;
      hasChange = true;
    }
    if (minutes > 0 && !update.emphasisMin) {
      update.emphasisMin = true;
      hasChange = true;
    }
    if (hours > 0 && !update.emphasisHrs) {
      update.emphasisHrs = true;
      hasChange = true;
    }
    if (hasChange) {
      setEmphasis(update);
    }
  }, [emphasis, hours, milliseconds, minutes, running, seconds]);
  return (
    <div
      className={cn(
        "timer-container flex h-10 flex-row items-baseline gap-1 whitespace-nowrap font-mono text-2xl font-normal tabular-nums",
        {
          "text-green-500": phase === "rest",
          "text-yellow-700": phase === "work",
        },
      )}
    >
      <div className={cn("hrs", { "text-6xl font-bold": emphasis.emphasisHrs })}>
        {toFixedDigits(hours)}
      </div>
      :
      <div className={cn("min", { "text-6xl font-bold": emphasis.emphasisMin })}>
        {toFixedDigits(minutes % 60)}
      </div>
      :
      <div className={cn("sec", { "text-6xl font-bold": emphasis.emphasisSe })}>
        <span>{toFixedDigits(seconds % 60)}</span>
      </div>
      .
      <div className={cn("ms text-sm", { "font-bold": emphasis.emphasisMs })}>
        <span>{toFixedDigits(milliseconds, 3)}</span>
      </div>
    </div>
  );
};
export default TimerDisplay;
