"use client";

import { TimerType, TIMER_TYPE_LABELS } from "@/lib/enums";
import type { TimerTypeSelectorProps } from "@/types/configure";
import cx from "clsx";

import { CardContainer } from "@/components/ui";

export const TimerTypeSelector = ({ selectedType, onTypeSelect }: TimerTypeSelectorProps) => {
  const TIMER_TYPES = [
    { type: TimerType.COUNTDOWN, name: TIMER_TYPE_LABELS[TimerType.COUNTDOWN], description: "Simple countdown timer" },
    {
      type: TimerType.STOPWATCH,
      name: TIMER_TYPE_LABELS[TimerType.STOPWATCH],
      description: "Count-up timer with optional limit",
    },
    { type: TimerType.INTERVAL, name: TIMER_TYPE_LABELS[TimerType.INTERVAL], description: "Work/rest cycles" },
    { type: TimerType.WORKREST, name: TIMER_TYPE_LABELS[TimerType.WORKREST], description: "Ratio-based timer" },
    {
      type: TimerType.COMPLEX,
      name: TIMER_TYPE_LABELS[TimerType.COMPLEX],
      description: "Multi-sequence timer combining different types",
    },
  ] as const;

  return (
    <CardContainer>
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Timer Type</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {TIMER_TYPES.map(({ type, name, description }) => (
          <CardContainer
            key={type}
            className={cx("cursor-pointer transition-colors", {
              "ring-2 ring-blue-500": selectedType === type,
            })}
            onClick={() => onTypeSelect(type)}
          >
            <h3>{name}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </CardContainer>
        ))}
      </div>
    </CardContainer>
  );
};
