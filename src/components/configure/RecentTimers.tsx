"use client";

import { useState } from "react";
import { PlayIcon } from "@/icons/PlayIcon";
import { Repeat } from "@/icons/Repeat";
import { formatDuration, formatRelativeTime, getConfigSummary } from "@/lib/configure/utils";
import { RecentTimersProps } from "@/types/configure";
import cx from "clsx";

import { Button } from "@/components/Button";
import { Card } from "@/components/UI/Card";

export const RecentTimers = ({
  timers,
  onStartTimer,
  onRemoveTimer,
  onClearAll,
}: RecentTimersProps) => {
  const [visibleCount, setVisibleCount] = useState(10);

  const displayTimers = timers.slice(0, visibleCount);
  const hasMore = timers.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 10, timers.length));
  };

  if (timers.length === 0) {
    return (
      <Card>
        <div className="py-8 text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">No Recent Timers</h2>
          <p className="text-gray-600">Start a timer to see it appear here for quick access.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Recent Timers</h2>
        {timers.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="text-red-600 hover:border-red-300 hover:text-red-700"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Desktop: Grid layout */}
      <div className="mb-6 hidden gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-3">
        {displayTimers.map((timer) => (
          <TimerCard
            key={timer.id}
            timer={timer}
            onStartTimer={onStartTimer}
            onRemoveTimer={onRemoveTimer}
            compact={false}
          />
        ))}
      </div>

      {/* Mobile: Horizontal scroll layout */}
      <div className="lg:hidden">
        <div
          className={cx(
            "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4",
            "scrollbar-width-none [&::-webkit-scrollbar]:hidden",
          )}
        >
          {displayTimers.map((timer) => (
            <div key={timer.id} className="w-80 flex-none snap-start">
              <TimerCard
                timer={timer}
                onStartTimer={onStartTimer}
                onRemoveTimer={onRemoveTimer}
                compact={true}
              />
            </div>
          ))}
        </div>

        {/* Scroll indicators for mobile */}
        <div className="mt-2 flex justify-center gap-1 lg:hidden">
          {timers.map((_, index) => (
            <div
              key={index}
              className={cx("h-1 w-8 rounded-full transition-colors", {
                "bg-blue-500": index < 3,
                "bg-gray-300": index >= 3,
              })}
            />
          ))}
        </div>
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={handleLoadMore} className="w-full sm:w-auto">
            Load More ({timers.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </Card>
  );
};

interface TimerCardProps {
  timer: RecentTimersProps["timers"][0];
  onStartTimer: RecentTimersProps["onStartTimer"];
  onRemoveTimer: RecentTimersProps["onRemoveTimer"];
  compact: boolean;
}

const TimerCard = ({ timer, onStartTimer, onRemoveTimer, compact }: TimerCardProps) => {
  const handleStart = () => {
    onStartTimer(timer.config);
  };

  const handleRemove = () => {
    onRemoveTimer(timer.id);
  };

  return (
    <Card
      className={cx("group relative transition-shadow hover:shadow-md", {
        "p-4": compact,
        "p-6": !compact,
      })}
    >
      {/* Remove button */}
      <button
        onClick={handleRemove}
        className="absolute top-2 right-2 p-1 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
        aria-label="Remove timer"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="mb-4">
        <h3 className="mb-1 font-semibold text-gray-900">{timer.config.name}</h3>
        <p className="text-sm text-gray-600">{getConfigSummary(timer.config)}</p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{formatRelativeTime(timer.startedAt)}</span>
        <Button size="sm" onClick={handleStart} className="flex items-center gap-2">
          <PlayIcon className="h-4 w-4" />
          Start
        </Button>
      </div>
    </Card>
  );
};
