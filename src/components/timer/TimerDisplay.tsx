import cn from "clsx";

import { msToTime, toFixedDigits } from "@/components/timer/utilities";

/**
 * Format time duration
 * @param time {number} time in milliseconds
 * @param phase {IntervalPhase} are we working or resting
 */
const TimerDisplay = ({ time, phase }: { time: number; phase?: IntervalPhase }) => {
  // if (time > 3000) {
  //   debugger;
  // }
  const { hours: hrs, minutes, seconds, milliseconds: ms } = msToTime(time);

  return (
    <div
      className={cn(
        "timer-container flex flex-row items-baseline gap-1 whitespace-nowrap font-mono text-2xl font-normal",
        {
          "text-green": phase === "rest",
          "text-yellow": phase === "work",
        },
      )}
    >
      <div className={cn("hrs", { "text-ref text-3xl font-bold": hrs > 0 })}>
        {toFixedDigits(hrs)}
      </div>
      :
      <div className={cn("min", { "text-3xl font-bold": minutes > 0 })}>
        {toFixedDigits(minutes % 60)}
      </div>
      :
      <div className={cn("sec", { "text-3xl font-bold": seconds > 0 })}>
        {toFixedDigits(seconds % 60)}
      </div>
      .<div className={cn("ms text-sm", { "font-bold": ms > 0 })}>{toFixedDigits(ms, 3)}</div>
    </div>
  );
};
export default TimerDisplay;
