import { formatTime } from "@/lib/timer";
import { LapEntry } from "@/lib/timer/useLapHistory";

interface LapHistoryProps {
  laps: LapEntry[];
  currentLap?: number | null;
}

export function LapHistory({ laps, currentLap }: LapHistoryProps) {
  if (laps.length === 0 && currentLap === null) {
    return null;
  }

  return (
    <div className="mt-8 w-full max-w-5xl rounded-lg bg-gray-50 p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Lap History</h3>
      <div className="space-y-2">
        {/* Previous laps */}
        {laps.map((lap, index) => (
          <div
            key={lap.id}
            className="flex items-center justify-between rounded bg-white px-4 py-2 text-sm text-gray-700"
          >
            <span className="font-medium">Lap {index + 1}</span>
            <span className="font-mono text-gray-600">{formatTime(lap.lapTime)}</span>
          </div>
        ))}

        {/* Current lap */}
        {currentLap !== null && (
          <div className="flex items-center justify-between rounded bg-blue-50 px-4 py-2 text-sm text-gray-700">
            <span className="font-medium text-blue-700">Last lap</span>
            <span className="font-mono text-blue-700">{formatTime(currentLap || 0)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
