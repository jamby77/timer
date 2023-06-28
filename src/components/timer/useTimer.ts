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
  countdown: undefined,
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
        // TODO: 24.06.23 - figure out countdown!!!
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
          if (state.countdown && time < state.countdown * 1000) {
            stateUpdate.phase = "countdown";
          } else if (isIntervalTimer(state.timer)) {
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
        let duration = 0;
        if (isIntervalTimer(state.timer)) {
          // set endTime
          duration = getIntervalDuration(state.timer);
        } else if (isNotIntervalTimer(state.timer)) {
          duration = state.timer.duration;
        }

        if (state.countdown) {
          // add countdown duration to overall duration
          duration += state.countdown * 1000; // countdown is in seconds
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

type TimerListener = {
  onupdate?: Array<(time: number) => void>;
  onstop?: Array<() => void>;
};
export class Timer {
  private readonly duration: number;
  private requestFrameId: number | null = null;
  private startTime: number | null = null;
  private time = 0;
  private listeners: TimerListener = {};

  constructor(duration: number) {
    this.duration = duration;
    this.stop = this.stop.bind(this);
  }

  addUpdateListener(listener: (time: number) => void) {
    if (!this.listeners.onupdate) {
      this.listeners.onupdate = [];
    }
    this.listeners.onupdate.push(listener);
  }
  addStopListener(listener: () => void) {
    if (!this.listeners.onstop) {
      this.listeners.onstop = [];
    }
    this.listeners.onstop.push(listener);
  }

  notifyUpdateListeners() {
    if (!this.listeners.onupdate) {
      return;
    }
    for (const listener of this.listeners.onupdate) {
      if (this.time > this.duration) {
        listener(this.duration);
      } else {
        listener(this.time);
      }
    }
  }
  notifyStopListeners() {
    if (!this.listeners.onstop) {
      return;
    }
    for (const listener of this.listeners.onstop) {
      listener();
    }
  }

  run(): void {
    this.startTime = performance.now();
    const loop = (currentTime: number) => {
      if (!this.startTime) {
        return;
      }
      this.time = currentTime - this.startTime;

      this.notifyUpdateListeners();
      if (this.time >= this.duration) {
        // timer complete
        this.stop();
        return;
      }

      this.requestFrameId = requestAnimationFrame(loop);
    };
    this.requestFrameId = requestAnimationFrame(loop);
  }

  stopTimer() {
    if (this.requestFrameId) {
      cancelAnimationFrame(this.requestFrameId);
    }
  }
  reset(): void {
    this.startTime = null;
    this.time = 0;
  }
  stop(): void {
    // TODO - 29.06.23 - maybe do other things?
    this.stopTimer();
    this.notifyStopListeners();
  }
}
