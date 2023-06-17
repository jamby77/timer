import cn from "clsx";

import { IntervalPhase } from "@/components/timer/index";

interface TimerProgressProps {
  currentRound?: number;
  totalRounds?: number;
  phase?: IntervalPhase;
}
export default function TimerProgress({
  currentRound,
  totalRounds,
  phase = "work",
}: TimerProgressProps) {
  if (!currentRound) {
    return null;
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn("flex items-baseline whitespace-nowrap text-3xl", {
          "text-green-500": phase === "rest",
          "text-yellow-700 ": phase === "work",
          after: phase === "work",
        })}
      >
        {currentRound} / {totalRounds}
      </div>
      <div className="text-6xl ">
        <span
          className={cn("block transition-all", {
            "animation-none collapse opacity-0": phase === "rest",
            "animate-pulse": phase === "work",
          })}
        >
          🚴‍♂️🏋️‍♂️🏊‍♂️🤸‍♂️🏃‍♂️
        </span>
        <span className={cn("block transition-all", { "collapse opacity-0": phase === "work" })}>
          🩴🏖🌊
        </span>
      </div>
    </div>
  );
}
