import preview from "#.storybook/preview";
import { expect, fn } from "storybook/test";
import { RecentTimers } from "./RecentTimers";
import { TimerType } from "@/lib/timer/types";
import { AnyTimerConfig, WorkRestMode } from "@/types/configure";
import React from "react";
import { createMockTimerConfig } from "@/testing/utils";

const meta = preview.meta({
  title: "Configure/RecentTimers",
  component: RecentTimers,
  argTypes: {
    timers: { control: "object" },
  },
  args: {
    onStartTimer: fn(),
    onRemoveTimer: fn(),
    onClearAll: fn(),
  },
});

export const Empty = meta.story({
  args: {
    timers: [],
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("No Recent Timers");
    expect(canvasElement.textContent).toContain("Start a timer to see it appear here for quick access");
  },
});

export const WithTimers = meta.story({
  args: {
    timers: [
      {
        id: 'timer-1',
        config: createMockTimerConfig('Tabata', TimerType.INTERVAL),
        startedAt: new Date(),
      }
    ],
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("Recent Timers");
    expect(canvasElement.textContent).toContain("Tabata");
    expect(canvasElement.textContent).toContain("8 rounds: 20s work / 10s rest");
    expect(canvasElement.textContent).toContain("Start Timer");
    expect(canvasElement.textContent).toContain("Clear All");
  },
});

export const MultipleTimers = meta.story({
  args: {
    timers: [],
    onStartTimer: fn(),
    onRemoveTimer: fn(),
    onClearAll: fn(),
  },
  render: (args) => {
    const timers = [
      {
        id: 'timer-1',
        config: createMockTimerConfig('Tabata', TimerType.INTERVAL),
        startedAt: new Date(),
      },
      {
        id: 'timer-2', 
        config: createMockTimerConfig('EMOM', TimerType.INTERVAL),
        startedAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        id: 'timer-3',
        config: createMockTimerConfig('Countdown', TimerType.COUNTDOWN),
        startedAt: new Date(Date.now() - 7200000), // 2 hours ago
      },
    ];
    return React.createElement(RecentTimers, { ...args, timers });
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("Recent Timers");
    expect(canvasElement.textContent).toContain("Tabata");
    expect(canvasElement.textContent).toContain("EMOM");
    expect(canvasElement.textContent).toContain("Countdown");
    expect(canvasElement.textContent).toContain("Clear All");
  },
});

export const ManyTimers = meta.story({
  args: {
    timers: [],
    onStartTimer: fn(),
    onRemoveTimer: fn(),
    onClearAll: fn(),
  },
  render: (args) => {
    const timers = Array.from({ length: 15 }, (_, i) => ({
      id: `timer-${i + 1}`,
      config: createMockTimerConfig(`Timer ${i + 1}`, TimerType.COUNTDOWN),
      startedAt: new Date(Date.now() - i * 60000), // Different times
    }));
    return React.createElement(RecentTimers, { ...args, timers });
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("Recent Timers");
    expect(canvasElement.textContent).toContain("Load More");
    expect(canvasElement.textContent).toContain("5 remaining");
  },
});

export const MixedTypes = meta.story({
  args: {
    timers: [],
    onStartTimer: fn(),
    onRemoveTimer: fn(),
    onClearAll: fn(),
  },
  render: (args) => {
    const timers = [
      {
        id: 'timer-1',
        config: createMockTimerConfig('Countdown', TimerType.COUNTDOWN),
        startedAt: new Date(),
      },
      {
        id: 'timer-2',
        config: createMockTimerConfig('Stopwatch', TimerType.STOPWATCH),
        startedAt: new Date(Date.now() - 1800000),
      },
      {
        id: 'timer-3',
        config: createMockTimerConfig('Interval', TimerType.INTERVAL),
        startedAt: new Date(Date.now() - 3600000),
      },
    ];
    return React.createElement(RecentTimers, { ...args, timers });
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("5m countdown");
    expect(canvasElement.textContent).toContain("Stopwatch with 10m limit");
    expect(canvasElement.textContent).toContain("8 rounds: 20s work / 10s rest");
  },
});

export const TimerStart = meta.story({
  args: {
    timers: [
      {
        id: 'timer-1',
        config: createMockTimerConfig('Test Timer', TimerType.COUNTDOWN),
        startedAt: new Date(),
      }
    ],
    onStartTimer: fn(),
    onRemoveTimer: fn(),
    onClearAll: fn(),
  },
  play: async ({ canvasElement, step, args }) => {
    const startButton = Array.from(canvasElement.querySelectorAll('button')).find(
      el => el.textContent?.includes('Start')
    );
    
    expect(startButton).toBeTruthy();
    
    if (startButton) {
      await step('start timer', () => {
        startButton.click();
      });
    }
    
    expect(args.onStartTimer).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Timer',
        type: TimerType.COUNTDOWN,
        duration: 300,
      })
    );
  },
});

export const TimerRemoval = meta.story({
  args: {
    timers: [
      {
        id: 'timer-1',
        config: createMockTimerConfig('Test Timer', TimerType.COUNTDOWN),
        startedAt: new Date(),
      }
    ],
    onStartTimer: fn(),
    onRemoveTimer: fn(),
    onClearAll: fn(),
  },
  play: async ({ canvasElement, step, args }) => {
    const removeButton = Array.from(canvasElement.querySelectorAll('button')).find(
      el => el.getAttribute('aria-label')?.includes('Remove')
    );
    
    expect(removeButton).toBeTruthy();
    
    if (removeButton) {
      await step('remove timer', () => {
        removeButton.click();
      });
    }
    
    expect(args.onRemoveTimer).toHaveBeenCalledWith('timer-1');
  },
});

export const ClearAllTimers = meta.story({
  args: {
    timers: [
      {
        id: 'timer-1',
        config: createMockTimerConfig('Test Timer', TimerType.COUNTDOWN),
        startedAt: new Date(),
      }
    ],
    onStartTimer: fn(),
    onRemoveTimer: fn(),
    onClearAll: fn(),
  },
  play: async ({ canvasElement, step, args }) => {
    const clearAllButton = Array.from(canvasElement.querySelectorAll('button')).find(
      el => el.textContent?.includes('Clear All')
    );
    
    expect(clearAllButton).toBeTruthy();
    
    if (clearAllButton) {
      await step('clear all timers', () => {
        clearAllButton.click();
      });
    }
    
    expect(args.onClearAll).toHaveBeenCalled();
  },
});
