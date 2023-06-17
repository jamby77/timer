import cn from "clsx";

interface TimerProgressProps {
  currentInterval?: number;
  phase?: IntervalPhase;
}
export default function TimerProgress({ currentInterval, phase = "work" }: TimerProgressProps) {
  if (!currentInterval) {
    return null;
  }
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-gray-md text-lg">Round: </span>
      <div
        className={cn("text-3xl", {
          "text-green": phase === "rest",
          "text-yellow": phase === "work",
        })}
      >
        {currentInterval}&nbsp;
        {phase}
      </div>
    </div>
  );
}
