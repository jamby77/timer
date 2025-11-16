import { formatTime } from "@/lib/timer";
import { LapEntry } from "@/lib/timer/useLapHistory";

interface LapHistoryProps {
  laps: LapEntry[];
  onClearHistory?: () => void;
}

export function LapHistory({ laps, onClearHistory }: LapHistoryProps) {
  if (laps.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 w-full max-w-5xl rounded-lg bg-gray-50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Lap History</h3>
        {laps.length > 0 && onClearHistory && (
          <button
            onClick={onClearHistory}
            className="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
          >
            Clear
          </button>
        )}
      </div>
      <div className="space-y-2">
        {/* Previous laps */}
        {[...laps].reverse().map((lap, index) => {
          const isLastLap = index === 0;
          const lapNumber = laps.length - index;
          return (
            <div
              key={lap.id}
              className={`flex items-center justify-between rounded px-4 py-2 text-sm ${
                isLastLap ? "bg-blue-50 text-blue-700" : "bg-white text-gray-500"
              }`}
            >
              <span className="font-medium">{isLastLap ? "Last lap" : `Lap ${lapNumber}`}</span>
              <span className="font-mono">{formatTime(lap.lapTime)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
