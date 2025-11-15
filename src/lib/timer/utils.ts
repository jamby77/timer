import { TimerState } from "@/lib/timer/types";

/**
 * Format time (seconds or milliseconds) to MM:SS.MS format (with 2-digit milliseconds)
 */
export const formatTime = (time: number): string => {
  const totalSeconds = Math.floor(time / 1000);
  const milliseconds = Math.round((time % 1000) / 10); // Convert to 2-digit (0-99)
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
};

export const parseTimeToMs = (timeString: string): number => {
  const [minutes, seconds] = timeString.split(":").map(Number);
  return (minutes * 60 + seconds) * 1000;
};

export function getStatusMessage(state: TimerState, completionMessage?: string) {
  return state === TimerState.Running
    ? "Running..."
    : state === TimerState.Paused
      ? "Paused"
      : state === TimerState.Idle
        ? "Ready"
        : state === TimerState.Completed && !!completionMessage
          ? completionMessage
          : null;
}
