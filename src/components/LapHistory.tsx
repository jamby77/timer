import { useState } from "react";
import { formatTime } from "@/lib/timer";
import { LapEntry } from "@/lib/timer/useLapHistory";
import cx from "clsx";

interface LapHistoryProps {
  laps: LapEntry[];
  onClearHistory?: () => void;
}

const ExpandButton = ({
  label,
  opened = false,
  onClick,
}: {
  label?: string;
  opened?: boolean;
  onClick?: () => void;
}) => {
  return (
    <button
      className="cursor-pointer rounded p-1 text-gray-500 transition-colors hover:text-gray-700"
      aria-label={label}
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={cx("h-4 w-4 transition-transform duration-300 ease-in-out", {
          "rotate-90": opened,
        })}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  );
};

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
        <div
          className="flex cursor-pointer items-center justify-between gap-4 rounded bg-gray-50/50 px-4 py-2 text-sm transition-all duration-300 ease-in-out"
          role="button"
          onClick={toggleExpand}
        >
          <span className="font-medium text-gray-700">Last lap</span>
          <div className="flex items-center gap-4">
            <span className="font-mono text-gray-800">
              {formatTime(laps[laps.length - 1].lapTime)}
            </span>
            <ExpandButton label="Expand lap history" onClick={toggleExpand} />
          </div>
        </div>
      ) : laps.length > 0 ? (
        // Expanded view - show full list (only when laps exist)
        <div className="w-full max-w-5xl rounded-lg bg-gray-50 p-6 transition-all duration-300 ease-in-out">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-800">Lap History</h3>
            <div className="flex items-center gap-2">
              {onClearHistory && (
                <button
                  onClick={handleClearHistory}
                  className="cursor-pointer rounded bg-red-50 px-3 py-1 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
                >
                  Clear
                </button>
              )}
              <ExpandButton label="Collapse lap history" opened onClick={toggleExpand} />
            </div>
          </div>
          <div className="space-y-2">
            {[...laps].reverse().map((lap, index) => {
              const isLastLap = index === 0;
              const lapNumber = laps.length - index;
              return (
                <div
                  key={lap.id}
                  className={cx(
                    "flex items-center justify-between rounded px-4 py-2 text-sm transition-all duration-300 ease-in-out",
                    {
                      "bg-blue-50 text-blue-700 hover:bg-blue-100": isLastLap,
                      "bg-white text-gray-500 hover:bg-gray-100": !isLastLap,
                    },
                  )}
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
