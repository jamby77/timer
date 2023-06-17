import { IntervalsInterface } from "@/components/timer/index";
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
    <div className="flex flex-col gap-1 text-center">
      <div>&quot;{intervals?.intervals[0].name}&quot;</div>
      <div className="text-sm text-slate-700">
        <strong>{intervals?.intervals[0].rounds}</strong> rounds of: <br />
        <strong>{timeToString(msToTime(intervals?.intervals[0].work ?? 0))}</strong> work,
        <br />
        <strong>{timeToString(msToTime(intervals?.intervals[0].rest ?? 0))}</strong> rest,
        <br />
        total time of <strong>{timeToString(msToTime(endTime))}</strong>
      </div>
    </div>
  );
}
