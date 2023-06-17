import { getIntervalDuration, msToTime, timeToString } from "@/components/timer/utilities";

interface IntervalDescriptionProps {
  intervals?: IntervalsInterface;
}
export default function IntervalDescription({ intervals }: IntervalDescriptionProps) {
  if (!intervals) {
    return null;
  }
  const endTime = getIntervalDuration(intervals);
  return (
    <div className="flex flex-col gap-1">
      <div>&quot;{intervals?.intervals[0].name}&quot;</div>
      <div>
        {intervals?.intervals[0].rounds} rounds of:{" "}
        {timeToString(msToTime(intervals?.intervals[0].work ?? 0))} work,{" "}
        {timeToString(msToTime(intervals?.intervals[0].rest ?? 0))} rest, total time of{" "}
        {timeToString(msToTime(endTime))}
      </div>
    </div>
  );
}
