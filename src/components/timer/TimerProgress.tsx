import { useEffect, useState } from "react";
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
    <div className="my-8 flex flex-col items-center gap-1">
      <div
        className={cn(
          "mb-4 flex items-baseline whitespace-nowrap text-6xl font-bold transition-colors duration-700",
          {
            "text-green-500": phase === "rest",
            "text-yellow-700 ": phase === "work",
            after: phase === "work",
          },
        )}
      >
        {currentRound} / {totalRounds}
      </div>
      <div className="text-9xl ">
        <div
          className={cn("transition-all delay-700 duration-700", {
            "animate-none opacity-40": phase === "rest",
            "animate-pulse opacity-100": phase === "work",
          })}
        >
          {phase === "work" && "🚴‍♂️🏋️‍♂️🏊‍♂️🤸‍♂️🏃‍♂️"}
          {phase === "rest" && "🏖"}
        </div>
      </div>
    </div>
  );
}
