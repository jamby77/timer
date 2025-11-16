import { useCallback, useState } from "react";

export interface LapEntry {
  id: string;
  lapTime: number;
  timestamp: number;
}

export const useLapHistory = () => {
  const [laps, setLaps] = useState<LapEntry[]>([]);

  const addLap = useCallback((time: number) => {
    setLaps((prev) => [
      ...prev,
      {
        id: `lap-${Date.now()}-${Math.random()}`,
        lapTime: time,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const clearHistory = useCallback(() => {
    setLaps([]);
  }, []);

  return {
    laps,
    addLap,
    clearHistory,
  };
};
