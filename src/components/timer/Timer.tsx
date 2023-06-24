"use client";

import { useEffect } from "react";

import { BaseTimerState } from "@/components/timer/index";
import IntervalDescription from "@/components/timer/IntervalDescription";
import { TimerControlsController } from "@/components/timer/TimerControlsController";
import TimerDisplayController from "@/components/timer/TimerDisplayController";
import TimerProgressController from "@/components/timer/TimerProgressController";
import TimerStateDisplay from "@/components/timer/TimerState";
import useTimer from "@/components/timer/useTimer";

export function Timer({ config }: { config?: BaseTimerState }) {
  const init = useTimer((state) => state.init);
  useEffect(() => {
    if (!config) {
      return;
    }
    init(config);
  }, [config, init]);

  return (
    <div>
      <div className="m-10 flex h-full w-full flex-col items-center justify-center gap-4">
        <TimerStateDisplay />
        <TimerControlsController />
        <TimerDisplayController />
        <TimerProgressController />
        <IntervalDescription />
      </div>
    </div>
  );
}
