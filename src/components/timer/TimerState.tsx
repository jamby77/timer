"use client";

import useTimer from "@/components/timer/useTimer";
import {
  msToTime,
  TimerStateEnum,
  TimerTypeEnum,
  timeToString,
} from "@/components/timer/utilities";

export default function TimerStateDisplay() {
  const running = useTimer((state) => state.running);
  const timer = useTimer((state) => state.timer);
  const endTime = useTimer((state) => state.endTime);
  let timeCapString = timeToString(msToTime(endTime));
  return (
    <div className="mt-4 flex flex-col items-center">
      <div className="text-sm uppercase text-slate-400">
        {running === TimerStateEnum.running && "running"}
        {running === TimerStateEnum.initial && "Press start"}
        {running === TimerStateEnum.stopped && "stopped"}
        {running === TimerStateEnum.paused && "paused"}
      </div>
      {timer?.type === TimerTypeEnum.stopwatch && endTime !== undefined && (
        <div className="text-sm text-slate-600">({timeCapString} cap)</div>
      )}
    </div>
  );
}
