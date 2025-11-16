import { TimerState } from "@/lib/timer/types";

/**
 * Format time (seconds or milliseconds) to MM:SS.MS format (with 2-digit milliseconds)
 */
export const formatTime = (time: number): string => {
  const totalSeconds = Math.floor(time / 1000);
  const milliseconds = Math.round((time % 1000) / 10); // Convert to 2-digit (0-99)
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const msStr = milliseconds.toString().padStart(2, "0").slice(0, 2);
  let minStr = mins.toString().padStart(2, "0");
  let secStr = secs.toString().padStart(2, "0");
  return `${minStr}:${secStr}.${msStr}`;
};

export const parseTimeToMs = (timeString: string): number => {
  const [minutes, seconds] = timeString.split(":").map(Number);
  return (minutes * 60 + seconds) * 1000;
};

export function getStatusMessage(state: TimerState, completionMessage?: string): string {
  switch (state) {
    case TimerState.Running:
      return "Running...";
    case TimerState.Paused:
      return "Paused";
    case TimerState.Completed:
      return completionMessage || "Completed";
    case TimerState.Idle:
    default:
      return "Ready";
  }
}
