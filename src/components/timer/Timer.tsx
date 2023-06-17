"use client";

import cn from "clsx";

import TimerDisplay from "@/components/timer/TimerDisplay";
import useTimer from "@/components/timer/useTimer";
import {
  getIntervalDuration,
  msToTime,
  TimerStateEnum,
  timeToString,
  toFixedDigits,
} from "@/components/timer/utilities";

const intervals: IntervalsInterface = {
  intervals: [
    {
      work: 10000,
      rest: 20000,
      rounds: 3,
      name: "Tabata",
    },
  ],
};

export function Timer({}) {
  const time = useTimer((state) => state.time);
  const start = useTimer((state) => state.start);
  const stop = useTimer((state) => state.stop);
  const pause = useTimer((state) => state.pause);
  const running = useTimer((state) => state.running);
  const currentInterval = useTimer((state) => state.currentInterval);
  const phase = useTimer((state) => state.phase);
  const intervals = useTimer((state) => state.intervals);
  const endTime = getIntervalDuration(intervals);
  return (
    <div>
      <h1>timer</h1>
      <div className="m-10 flex h-full w-full flex-col items-center justify-center gap-4  font-bold">
        <div className="flex flex-row gap-2">
          {running !== TimerStateEnum.running && (
            <button className="bg-green-light rounded-xl p-4" onClick={() => start()}>
              {running !== TimerStateEnum.paused && "Start"}
              {running === TimerStateEnum.paused && "Resume"}
            </button>
          )}
          {running === TimerStateEnum.running && (
            <button className="bg-red rounded-xl p-4" onClick={() => stop()}>
              Stop
            </button>
          )}
          {running === TimerStateEnum.running && (
            <button className="bg-yellow rounded-xl p-4" onClick={() => pause()}>
              Pause
            </button>
          )}
        </div>

        <TimerDisplay time={time} phase={phase} />

        {currentInterval && (
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
        )}

        <div>&quot;{intervals?.intervals[0].name}&quot;</div>
        <div>
          {intervals?.intervals[0].rounds} rounds of:{" "}
          {timeToString(msToTime(intervals?.intervals[0].work ?? 0))} work,{" "}
          {timeToString(msToTime(intervals?.intervals[0].rest ?? 0))} rest, total time of{" "}
          {timeToString(msToTime(endTime))}
        </div>
        {running === TimerStateEnum.running && "Timer running"}
        {running === TimerStateEnum.initial && "Press start"}
        {running === TimerStateEnum.stopped && "Timer stopped"}
        {running === TimerStateEnum.paused && "Timer paused"}
      </div>
    </div>
  );
}
