import { create } from "zustand";

import { BaseTimerState, StopwatchTimerInterface, TimerState } from "@/components/timer/index";
import {
  getCurrentIntervalAndPhase,
  getIntervalDuration,
  isIntervalTimer,
  isNotIntervalTimer,
  TimerStateEnum,
  TimerTypeEnum,
} from "@/components/timer/utilities";

export const defaultTimer: StopwatchTimerInterface = {
  type: TimerTypeEnum.stopwatch,
  // 99 minutes
  duration: 99 * 60 * 1000,
};

const defaultTimerConfig: BaseTimerState = {
  startTime: 0,
  running: TimerStateEnum.initial,
  currentTime: 0,
  timerId: -1,
  time: 0,
  timer: defaultTimer,
  phase: undefined,
  endTime: undefined,
  currentRound: undefined,
  totalRounds: undefined,
};

const useTimer = create<TimerState>()((set, get) => {
  return {
    ...defaultTimerConfig,
    init(config) {
      if (get().running !== TimerStateEnum.initial) {
        get().stop();
      }
      set({ ...defaultTimerConfig, ...config });
    },
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
        // TODO - 24.06.23 - figure out countdown!!!
        let currentTime = Date.now();
        const startTime = get().startTime;
        const endTime = get().endTime;
        const time = currentTime - startTime;
        if (endTime && time > endTime) {
          get().stop(true);
          return;
        }
        set((state) => {
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

          // if timer is countdown, time should be duration - time
          if (state.timer?.type === TimerTypeEnum.countdown) {
            stateUpdate.time = state.timer?.duration - stateUpdate.time!;
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
    stop: (complete = false) => {
      set((state) => {
        if (state.timerId) {
          clearInterval(state.timerId);
        }
        let stateUpdate = {
          timerId: -1,
          running: TimerStateEnum.stopped,
          startTime: 0,
          currentTime: 0,
          time: 0,
        };

        if (complete) {
          stateUpdate.running = TimerStateEnum.complete;
          // display better end time
          if (state.timer?.type !== TimerTypeEnum.countdown) {
            stateUpdate.time = state.endTime!;
          }
        }
        return stateUpdate;
      });
    },
  };
});

export default useTimer;
