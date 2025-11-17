import { TimerPhase, WorkRestTimerState } from "./types";
import { formatTime } from "./utils";

export interface DisplayData {
  time: string;
  progress: number;
  label: string;
  isWork: boolean;
}

export const getDisplayData = (
  state: WorkRestTimerState,
  getProgress: () => number,
): DisplayData => {
  switch (state.phase) {
    case TimerPhase.Work:
      return {
        time: formatTime(state.currentTime),
        progress: getProgress(),
        label: "WORK",
        isWork: true,
      };
    case TimerPhase.Rest:
      return {
        time: formatTime(state.currentTime),
        progress: getProgress(),
        label: "REST",
        isWork: false,
      };
    default:
      return {
        time: "00:00.00",
        progress: 0,
        label: "READY",
        isWork: false,
      };
  }
};
