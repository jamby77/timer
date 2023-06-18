"use client";

import { useEffect, useRef } from "react";

import { TimerState } from "@/components/timer/index";
import IntervalDescription from "@/components/timer/IntervalDescription";
import { TimerControlsController } from "@/components/timer/TimerControlsController";
import TimerDisplayController from "@/components/timer/TimerDisplayController";
import TimerProgressController from "@/components/timer/TimerProgressController";
import TimerStateDisplay from "@/components/timer/TimerState";
import useTimer from "@/components/timer/useTimer";

export function Timer({ config }: { config?: Omit<TimerState, "stop" | "start" | "pause"> }) {
  useEffect(() => {
    if (!config) {
      return;
    }
    useTimer.setState(config);
  }, [config]);

  return (
    <div>
      <div className="m-10 flex h-full w-full flex-col items-center justify-center gap-4">
        <TimerControlsController />
        <TimerDisplayController />
        <TimerProgressController />
        <IntervalDescription />
        <TimerStateDisplay />
      </div>
    </div>
  );
}
