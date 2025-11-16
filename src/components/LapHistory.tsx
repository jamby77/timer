import { useState } from "react";
import { formatTime } from "@/lib/timer";
import { LapEntry } from "@/lib/timer/useLapHistory";
import cx from "clsx";

interface LapHistoryProps {
  laps: LapEntry[];
  onClearHistory?: () => void;
}

export function LapHistory({ laps, onClearHistory }: LapHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const handleClearHistory = () => {
    onClearHistory?.();
    setIsExpanded(false);
  };

  return (
    <div
      className={cx("mt-6 w-full transition-all duration-300 ease-in-out", {
        invisible: laps.length === 0,
      })}
    >
      {!isExpanded && laps.length > 0 ? (
        // Compact view - show only last lap
        <div className="flex items-center justify-between rounded bg-gray-50/50 px-4 py-2 text-sm transition-all duration-300 ease-in-out">
          <span className="font-medium text-gray-700">Last lap</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-gray-800">
              {formatTime(laps[laps.length - 1].lapTime)}
            </span>
            <button
              onClick={toggleExpand}
              className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
              aria-label="Expand lap history"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4 transition-transform duration-300 ease-in-out"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      ) : laps.length > 0 ? (
        // Expanded view - show full list (only when laps exist)
        <div className="w-full max-w-5xl rounded-lg bg-gray-50 p-6 transition-all duration-300 ease-in-out">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Lap History</h3>
            <div className="flex items-center gap-2">
              {onClearHistory && (
                <button
                  onClick={handleClearHistory}
                  className="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
                >
                  Clear
                </button>
              )}
              <button
                onClick={toggleExpand}
                className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
                aria-label="Collapse lap history"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4 rotate-90 transition-transform duration-300 ease-in-out"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {[...laps].reverse().map((lap, index) => {
              const isLastLap = index === 0;
              const lapNumber = laps.length - index;
              return (
                <div
                  key={lap.id}
                  className={`flex items-center justify-between rounded px-4 py-2 text-sm transition-all duration-300 ease-in-out ${
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
      ) : null}
    </div>
  );
}
