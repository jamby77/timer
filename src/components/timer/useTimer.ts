import { create } from "zustand";

import {
  getCurrentIntervalAndPhase,
  getIntervalDuration,
  TimerStateEnum,
} from "@/components/timer/utilities";

const useTimer = create<TimerState>()((set, get) => {
  return {
    startTime: 0,
    running: TimerStateEnum.initial,
    currentTime: 0,
    timerId: -1,
    time: 0,
    intervals: undefined,
    pause: () => {
      set((state) => {
        clearInterval(state.timerId);
        return {
          timerId: -1,
          running: TimerStateEnum.paused,
          startTime: 0,
          currentTime: 0,
        };
      });
    },
    start: () => {
      const timerId = setInterval(() => {
        let currentTime = Date.now();

        set((state) => {
          const time = currentTime - state.startTime;
          if (state.endTime && time > state.endTime) {
            get().stop();
          }
          const stateUpdate = { time, currentTime, currentInterval: undefined, phase: undefined };
          if (state.intervals?.intervals && state.intervals?.intervals?.length > 0) {
            // we have intervals
            const { currentInterval, phase } = getCurrentIntervalAndPhase(time, state.intervals);
            // @ts-ignore
            stateUpdate.currentInterval = currentInterval;
            // @ts-ignore
            stateUpdate.phase = phase;
          }
          return stateUpdate;
        });
      }, 50);
      set((state) => {
        let startTime = Date.now();
        if (state.running === TimerStateEnum.paused) {
          // timer is paused, not stopped
          startTime = startTime - state.time;
        }
        let duration;
        if (state.intervals?.intervals && state.intervals?.intervals?.length > 0) {
          // set endTime
          duration = getIntervalDuration(state.intervals);
          console.log({ duration });
        }
        return {
          startTime,
          endTime: duration,
          running: TimerStateEnum.running,
          timerId: Number(timerId),
        };
      });
    },
    stop: () => {
      set((state) => {
        clearInterval(state.timerId);
        return {
          timerId: -1,
          running: TimerStateEnum.stopped,
          startTime: 0,
          currentTime: 0,
        };
      });
    },
  };
});

export default useTimer;
