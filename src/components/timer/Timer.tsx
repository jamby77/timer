"use client";

import { useEffect } from "react";

import { TimerState } from "@/components/timer/index";
import IntervalDescription from "@/components/timer/IntervalDescription";
import TimerControls from "@/components/timer/TimerControls";
import TimerDisplay from "@/components/timer/TimerDisplay";
import TimerProgress from "@/components/timer/TimerProgress";
import useTimer from "@/components/timer/useTimer";
import { TimerStateEnum } from "@/components/timer/utilities";

export function Timer({ config }: { config?: Omit<TimerState, "stop" | "start" | "pause"> }) {
  const time = useTimer((state) => state.time);
  const running = useTimer((state) => state.running);
  const phase = useTimer((state) => state.phase);
  const start = useTimer((state) => state.start);
  const stop = useTimer((state) => state.stop);
  const pause = useTimer((state) => state.pause);
  const currentInterval = useTimer((state) => state.currentInterval);
  const intervals = useTimer((state) => state.intervals);

  useEffect(() => {
    if (!config) {
      return;
    }
    useTimer.setState(config);
  }, [config]);
  return (
    <div>
      <div className="m-10 flex h-full w-full flex-col items-center justify-center gap-4">
        <TimerControls running={running} onStart={start} onPause={pause} onStop={stop} />
        <TimerDisplay time={time} phase={phase} />

        <TimerProgress currentInterval={currentInterval} phase={phase} />
        <IntervalDescription intervals={intervals} />
        <div className="text-sm uppercase text-slate-400">
          {running === TimerStateEnum.running && "running"}
          {running === TimerStateEnum.initial && "Press start"}
          {running === TimerStateEnum.stopped && "stopped"}
          {running === TimerStateEnum.paused && "paused"}
        </div>
      </div>
    </div>
  );
}
