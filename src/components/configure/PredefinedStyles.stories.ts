import React from "react";
import { TimerCategory, TimerType, WorkRestMode } from "@/types/configure";
import preview from "#.storybook/preview";
import { expect, fn } from "storybook/test";

import { PredefinedStyles } from "./PredefinedStyles";

// Helper to create mock timer config
const createMockTimerConfig = (name: string, type: TimerType): any => {
  const baseConfig = {
    id: `timer-${name.toLowerCase()}`,
    name,
    createdAt: new Date(),
    lastUsed: new Date(),
  };

  switch (type) {
    case TimerType.COUNTDOWN:
      return {
        ...baseConfig,
        type,
        duration: 300,
        completionMessage: "Time is up!",
      };

    case TimerType.STOPWATCH:
      return {
        ...baseConfig,
        type,
        timeLimit: 600,
      };

    case TimerType.INTERVAL:
      return {
        ...baseConfig,
        type,
        workDuration: 20,
        restDuration: 10,
        intervals: 8,
        workLabel: "Work",
        restLabel: "Rest",
        skipLastRest: true,
      };

    case TimerType.WORKREST:
      return {
        ...baseConfig,
        type,
        ratio: 2.0,
        maxWorkTime: 300,
        maxRounds: 10,
        restMode: WorkRestMode.RATIO,
      };

    case TimerType.COMPLEX:
      return {
        ...baseConfig,
        type,
        phases: [],
      };

    default:
      throw new Error(`Unsupported timer type: ${type}`);
  }
};

// Mock predefined styles
const mockStyles = [
  {
    id: "style-1",
    name: "Tabata",
    description: "High-intensity interval training protocol",
    category: TimerCategory.CARDIO,
    isBuiltIn: true,
    config: createMockTimerConfig("Tabata", TimerType.INTERVAL),
  },
  {
    id: "style-2",
    name: "EMOM",
    description: "Every minute on the minute - 10 minutes",
    category: TimerCategory.CARDIO,
    isBuiltIn: true,
    config: createMockTimerConfig("EMOM", TimerType.INTERVAL),
  },
  {
    id: "style-3",
    name: "Work/Rest Ratio",
    description: "Work/rest timer with equal work and rest periods",
    category: TimerCategory.STRENGTH,
    isBuiltIn: true,
    config: createMockTimerConfig("Work/Rest Ratio", TimerType.WORKREST),
  },
];

const meta = preview.meta({
  title: "Configure/PredefinedStyles",
  component: PredefinedStyles,
  argTypes: {
    styles: { control: "object" },
  },
  args: {
    styles: mockStyles,
    onSelectStyle: fn(),
    onStartTimer: fn(),
  },
});

export const Default = meta.story({
  args: {
    styles: mockStyles,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("Predefined Styles");
    expect(canvasElement.textContent).toContain("Tabata");
    expect(canvasElement.textContent).toContain("EMOM");
    expect(canvasElement.textContent).toContain("Work/Rest Ratio");
    expect(canvasElement.textContent).toContain("Built-in");
  },
});

export const Empty = meta.story({
  args: {
    styles: [],
    onSelectStyle: fn(),
    onStartTimer: fn(),
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("Predefined Styles");
    expect(canvasElement.textContent).toContain("No predefined styles found for this category");
  },
});

export const FilteredByCategory = meta.story({
  args: {
    styles: [],
    onSelectStyle: fn(),
    onStartTimer: fn(),
  },
  render: (args) => {
    // Filter to only show Cardio styles
    const cardioStyles = mockStyles.filter((style) => style.category === TimerCategory.CARDIO);
    return React.createElement(PredefinedStyles, { ...args, styles: cardioStyles });
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("Tabata");
    expect(canvasElement.textContent).toContain("EMOM");
    expect(canvasElement.textContent).not.toContain("Work/Rest Ratio");
  },
});

export const StrengthCategory = meta.story({
  args: {
    styles: [],
    onSelectStyle: fn(),
    onStartTimer: fn(),
  },
  render: (args) => {
    // Filter to only show Strength styles
    const strengthStyles = mockStyles.filter((style) => style.category === TimerCategory.STRENGTH);
    return React.createElement(PredefinedStyles, { ...args, styles: strengthStyles });
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("Work/Rest Ratio");
    expect(canvasElement.textContent).not.toContain("Tabata");
    expect(canvasElement.textContent).not.toContain("EMOM");
  },
});

export const MixedCategories = meta.story({
  args: {
    styles: [],
    onSelectStyle: fn(),
    onStartTimer: fn(),
  },
  render: (args) => {
    // Create styles across different categories
    const mixedStyles = [
      ...mockStyles,
      {
        id: "style-4",
        name: "Countdown",
        description: "Simple 5-minute countdown",
        category: TimerCategory.FLEXIBILITY,
        isBuiltIn: true,
        config: createMockTimerConfig("Countdown", TimerType.COUNTDOWN),
      },
    ];
    return React.createElement(PredefinedStyles, { ...args, styles: mixedStyles });
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("Cardio");
    expect(canvasElement.textContent).toContain("Strength");
    expect(canvasElement.textContent).toContain("Flexibility");
    expect(canvasElement.textContent).toContain("Countdown");
  },
});

export const Interactive = meta.story({
  args: {
    styles: mockStyles,
    onSelectStyle: fn(),
    onStartTimer: fn(),
  },
  play: async ({ canvasElement, step }) => {
    // Test category filtering
    const strengthButton = Array.from(canvasElement.querySelectorAll("button")).find((el) =>
      el.textContent?.includes("Strength"),
    );

    expect(strengthButton).toBeTruthy();

    if (strengthButton) {
      await step("filter to Strength category", () => {
        strengthButton.click();
      });
    }

    expect(canvasElement.textContent).toContain("Work/Rest Ratio");
    expect(canvasElement.textContent).not.toContain("Tabata");
  },
});

export const StyleSelection = meta.story({
  args: {
    styles: mockStyles,
    onSelectStyle: fn(),
    onStartTimer: fn(),
  },
  play: async ({ canvasElement, step, args }) => {
    const tabataCard = Array.from(canvasElement.querySelectorAll(".cursor-pointer")).find((el) =>
      el.textContent?.includes("Tabata"),
    );

    expect(tabataCard).toBeTruthy();

    if (tabataCard) {
      await step("select Tabata style", () => {
        (tabataCard as HTMLElement).click();
      });
    }

    // Verify onSelectStyle was called
    expect(args.onSelectStyle).toHaveBeenCalledWith(mockStyles[0]);
  },
});

export const TimerStart = meta.story({
  args: {
    styles: mockStyles,
    onSelectStyle: fn(),
    onStartTimer: fn(),
  },
  play: async ({ canvasElement, step, args }) => {
    const startButtons = Array.from(canvasElement.querySelectorAll("button")).filter((el) =>
      el.textContent?.includes("Start"),
    );

    expect(startButtons.length).toBeGreaterThan(0);

    if (startButtons[0]) {
      await step("start timer from style", () => {
        (startButtons[0] as HTMLElement).click();
      });
    }

    // Verify onStartTimer was called with the correct config
    expect(args.onStartTimer).toHaveBeenCalledWith(mockStyles[0].config);
  },
});

export const CategoryFiltering = meta.story({
  args: {
    styles: mockStyles,
    onSelectStyle: fn(),
    onStartTimer: fn(),
  },
  play: async ({ canvasElement, step }) => {
    // Initially show all styles
    expect(canvasElement.textContent).toContain("Tabata");
    expect(canvasElement.textContent).toContain("EMOM");
    expect(canvasElement.textContent).toContain("Work/Rest Ratio");

    // Filter to Cardio
    const cardioButton = Array.from(canvasElement.querySelectorAll("button")).find((el) =>
      el.textContent?.includes("Cardio"),
    );

    if (cardioButton) {
      await step("filter to Cardio category", () => {
        cardioButton.click();
      });
    }

    expect(canvasElement.textContent).toContain("Tabata");
    expect(canvasElement.textContent).toContain("EMOM");
    expect(canvasElement.textContent).not.toContain("Work/Rest Ratio");

    // Filter back to All
    const allButton = Array.from(canvasElement.querySelectorAll("button")).find((el) =>
      el.textContent?.includes("All"),
    );

    if (allButton) {
      await step("show all categories", () => {
        allButton.click();
      });
    }

    expect(canvasElement.textContent).toContain("Tabata");
    expect(canvasElement.textContent).toContain("EMOM");
    expect(canvasElement.textContent).toContain("Work/Rest Ratio");
  },
});

export const BuiltInBadges = meta.story({
  args: {
    styles: mockStyles,
    onSelectStyle: fn(),
    onStartTimer: fn(),
  },
  play: async ({ canvasElement }) => {
    // Verify all styles show "Built-in" badge
    const builtInBadges = Array.from(canvasElement.querySelectorAll(".text-blue-800")).filter(
      (el) => el.textContent?.includes("Built-in"),
    );

    expect(builtInBadges.length).toBe(mockStyles.length);
  },
});

export const EventPropagation = meta.story({
  args: {
    styles: mockStyles,
    onSelectStyle: fn(),
    onStartTimer: fn(),
  },
  play: async ({ canvasElement, step, args }) => {
    const startButtons = Array.from(canvasElement.querySelectorAll("button")).filter((el) =>
      el.textContent?.includes("Start"),
    );

    if (startButtons[0]) {
      await step("click start button (should not trigger style selection)", () => {
        (startButtons[0] as HTMLElement).click();
      });
    }

    // Should only call onStartTimer, not onSelectStyle
    expect(args.onStartTimer).toHaveBeenCalled();
    expect(args.onSelectStyle).not.toHaveBeenCalled();
  },
});
