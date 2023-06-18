import { create } from "zustand";

import { StopwatchTimerInterface, TimerState } from "@/components/timer/index";
import {
  getCurrentIntervalAndPhase,
  getIntervalDuration,
  isIntervalTimer,
  isNotIntervalTimer,
  TimerStateEnum,
  TimerTypeEnum,
} from "@/components/timer/utilities";

const timer: StopwatchTimerInterface = {
  type: TimerTypeEnum.stopwatch,
  // 99 minutes
  duration: 99 * 60 * 1000,
};

const defaultTimerConfig = {
  startTime: 0,
  running: TimerStateEnum.initial,
  currentTime: 0,
  timerId: -1,
  time: 0,
  timer,
  phase: undefined,
};

const useTimer = create<TimerState>()((set, get) => {
  return {
    ...defaultTimerConfig,
    pause: () => {
      set((state) => {
        if (state.timerId) {
          clearInterval(state.timerId);
        }
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
          const stateUpdate: Partial<TimerState> = {
            time,
            currentTime,
            currentRound: undefined,
            phase: undefined,
          };
          if (isIntervalTimer(state.timer)) {
            // we have intervals
            const { currentRound, phase, totalRounds } = getCurrentIntervalAndPhase(
              time,
              state.timer,
            );
            stateUpdate.currentRound = currentRound;
            stateUpdate.totalRounds = totalRounds;
            stateUpdate.phase = phase;
          } else {
            stateUpdate.phase = "work";
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
        if (isIntervalTimer(state.timer)) {
          // set endTime
          duration = getIntervalDuration(state.timer);
        } else if (isNotIntervalTimer(state.timer)) {
          duration = state.timer.duration;
        }
        return {
          startTime,
          endTime: duration,
          running: TimerStateEnum.running,
          timerId: Number(timerId),
          time: 0,
        };
      });
    },
    stop: () => {
      set((state) => {
        if (state.timerId) {
          clearInterval(state.timerId);
        }
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
