import { TimerType } from "@/lib/timer/types";
import preview from "#.storybook/preview";
import { expect, fn } from "storybook/test";

import { TimerTypeSelector } from "./TimerTypeSelector";

const meta = preview.meta({
  title: "Configure/TimerTypeSelector",
  component: TimerTypeSelector,
  argTypes: {
    selectedType: {
      control: "select",
      options: [
        null,
        TimerType.COUNTDOWN,
        TimerType.STOPWATCH,
        TimerType.INTERVAL,
        TimerType.WORKREST,
        TimerType.COMPLEX,
      ],
    },
  },
  args: {
    selectedType: null,
    onTypeSelect: fn(),
  },
});

export const Default = meta.story({
  args: {
    selectedType: null,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("Timer Type");
    expect(canvasElement.textContent).toContain("Countdown");
    expect(canvasElement.textContent).toContain("Stopwatch");
    expect(canvasElement.textContent).toContain("Interval");
    expect(canvasElement.textContent).toContain("Work/Rest Ratio");
    expect(canvasElement.textContent).toContain("Complex");
  },
});

export const CountdownSelected = meta.story({
  args: {
    selectedType: TimerType.COUNTDOWN,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("Timer Type");
    expect(canvasElement.textContent).toContain("Countdown");
    // Check that Countdown is highlighted (has ring class)
    const countdownElement = canvasElement.querySelector('[class*="ring-blue-500"]');
    expect(countdownElement).toBeTruthy();
  },
});

export const IntervalSelected = meta.story({
  args: {
    selectedType: TimerType.INTERVAL,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("Timer Type");
    expect(canvasElement.textContent).toContain("Interval");
    // Check that Interval is highlighted
    const intervalElement = canvasElement.querySelector('[class*="ring-blue-500"]');
    expect(intervalElement).toBeTruthy();
  },
});

export const Interactive = meta.story({
  args: {
    selectedType: null,
    onTypeSelect: fn(),
  },
  play: async ({ canvasElement, step, args }) => {
    // Test clicking on different timer types
    const intervalCard = Array.from(canvasElement.querySelectorAll(".cursor-pointer")).find((el) =>
      el.textContent?.includes("Interval"),
    );

    expect(intervalCard).toBeTruthy();

    if (intervalCard) {
      await step("click Interval type", () => {
        (intervalCard as HTMLElement).click();
      });
    }

    expect(canvasElement.textContent).toContain("Work/rest cycles");
  },
});

export const AllDescriptions = meta.story({
  args: {
    selectedType: null,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("Simple countdown timer");
    expect(canvasElement.textContent).toContain("Count-up timer with optional limit");
    expect(canvasElement.textContent).toContain("Work/rest cycles");
    expect(canvasElement.textContent).toContain("Ratio-based timer");
    expect(canvasElement.textContent).toContain("Multi-sequence timer combining different types");
  },
});

export const AllTypeSelections = meta.story({
  args: {
    selectedType: null,
    onTypeSelect: fn(),
  },
  play: async ({ canvasElement, step, args }) => {
    const types = [
      { name: "Countdown", type: TimerType.COUNTDOWN },
      { name: "Stopwatch", type: TimerType.STOPWATCH },
      { name: "Interval", type: TimerType.INTERVAL },
      { name: "Work/Rest Ratio", type: TimerType.WORKREST },
      { name: "Complex", type: TimerType.COMPLEX },
    ];

    for (const { name, type } of types) {
      const card = Array.from(canvasElement.querySelectorAll(".cursor-pointer")).find((el) =>
        el.textContent?.includes(name),
      );

      if (card) {
        await step(`select ${name} type`, () => {
          (card as HTMLElement).click();
        });
      }

      expect(args.onTypeSelect).toHaveBeenCalledWith(type);
    }
  },
});

export const HighlightedSelection = meta.story({
  args: {
    selectedType: TimerType.COUNTDOWN,
  },
  play: async ({ canvasElement }) => {
    const countdownCard = Array.from(canvasElement.querySelectorAll(".cursor-pointer")).find((el) =>
      el.textContent?.includes("Countdown"),
    );

    expect(countdownCard).toBeTruthy();
    expect(countdownCard?.className).toContain("ring-2");
    expect(countdownCard?.className).toContain("ring-blue-500");
  },
});
