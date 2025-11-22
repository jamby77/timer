import React from "react";
import { TimerType } from "@/lib/timer/types";
import { AnyTimerConfig, WorkRestMode } from "@/types/configure";
import preview from "#.storybook/preview";
import { expect, fn } from "storybook/test";

import { TimerConfigForm } from "./TimerConfigForm";

const meta = preview.meta({
  title: "Configure/TimerConfigForm",
  component: TimerConfigForm,
  argTypes: {
    type: {
      control: "select",
      options: [
        TimerType.COUNTDOWN,
        TimerType.STOPWATCH,
        TimerType.INTERVAL,
        TimerType.WORKREST,
        TimerType.COMPLEX,
      ],
    },
  },
  args: {
    onStartTimer: fn(),
    onSaveAsPredefined: fn(),
    onSave: fn(),
  },
});

export const Countdown = meta.story({
  args: {
    type: TimerType.COUNTDOWN,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("Configure Countdown Timer");
    expect(canvasElement.textContent).toContain("Timer Name");
    expect(canvasElement.textContent).toContain("Duration (seconds)");
    expect(canvasElement.textContent).toContain("Completion Message (optional)");
    expect(canvasElement.textContent).toContain("Start Timer");
    expect(canvasElement.textContent).toContain("Save as Predefined");
  },
});

export const Interval = meta.story({
  args: {
    type: TimerType.INTERVAL,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("Configure Interval Timer");
    expect(canvasElement.textContent).toContain("Work Duration (seconds)");
    expect(canvasElement.textContent).toContain("Rest Duration (seconds)");
    expect(canvasElement.textContent).toContain("Number of Intervals");
    expect(canvasElement.textContent).toContain("Work Label (optional)");
    expect(canvasElement.textContent).toContain("Rest Label (optional)");
    expect(canvasElement.textContent).toContain("Skip last rest period");
  },
});

export const Stopwatch = meta.story({
  args: {
    type: TimerType.STOPWATCH,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("Configure Stopwatch Timer");
    expect(canvasElement.textContent).toContain("Time Limit (seconds, optional)");
    expect(canvasElement.textContent).toContain("Completion Message (optional)");
  },
});

export const WorkRestRatio = meta.story({
  args: {
    type: TimerType.WORKREST,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("Configure Work/Rest Ratio Timer");
    expect(canvasElement.textContent).toContain("Rest Mode");
    expect(canvasElement.textContent).toContain("Work/Rest Ratio");
    expect(canvasElement.textContent).toContain("Maximum Work Time (seconds)");
    expect(canvasElement.textContent).toContain("Maximum Rounds");
  },
});

export const WorkRestFixed = meta.story({
  args: {
    type: TimerType.WORKREST,
  },
  render: (args) => {
    const initialConfig = {
      id: "fixed-rest-timer",
      name: "Fixed Rest Timer",
      type: TimerType.WORKREST,
      restMode: WorkRestMode.FIXED,
      fixedRestDuration: 30,
      ratio: 2.0,
      maxWorkTime: 300,
      maxRounds: 10,
      createdAt: new Date(),
      lastUsed: new Date(),
    } as AnyTimerConfig;
    return <TimerConfigForm {...args} initialConfig={initialConfig} />;
  },
  play: async ({ canvas }) => {
    const title = canvas.getByRole('heading', { name: /configure work/i });
    const fixedRestLabel = canvas.getByLabelText(/fixed rest duration/i);
    const ratioOption = canvas.queryByRole('option', { name: /work\/rest ratio/i });
    
    expect(title).toBeInTheDocument();
    expect(fixedRestLabel).toBeInTheDocument();
    expect(ratioOption).not.toBeInTheDocument();
  },
});

export const Complex = meta.story({
  args: {
    type: TimerType.COMPLEX,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("Configure Complex Timer");
    expect(canvasElement.textContent).toContain(
      "Complex timers allow you to combine multiple timer types",
    );
    expect(canvasElement.textContent).toContain(
      "This feature will be implemented in a future update",
    );
  },
});

export const PredefinedStyle = meta.story({
  args: {
    type: TimerType.COUNTDOWN,
    isPredefined: true,
    initialConfig: {
      id: "tabata-config",
      name: "Tabata",
      type: TimerType.INTERVAL,
      workDuration: 20,
      restDuration: 10,
      intervals: 8,
      workLabel: "Work",
      restLabel: "Rest",
      skipLastRest: true,
      createdAt: new Date(),
      lastUsed: new Date(),
    } as AnyTimerConfig,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("Configure Interval Timer");
    expect(canvasElement.textContent).toContain("Customizing a predefined style");
  },
});

export const WithInitialData = meta.story({
  args: {
    type: TimerType.COUNTDOWN,
    initialConfig: {
      id: "countdown-5min",
      name: "5 Minute Timer",
      type: TimerType.COUNTDOWN,
      duration: 300,
      completionMessage: "Time is up!",
      createdAt: new Date(),
      lastUsed: new Date(),
    } as AnyTimerConfig,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain("5 Minute Timer");
    expect(canvasElement.textContent).toContain("300");
    expect(canvasElement.textContent).toContain("Time is up!");
  },
});

export const Interactive = meta.story({
  args: {
    type: TimerType.INTERVAL,
    onStartTimer: fn(),
    onSaveAsPredefined: fn(),
    onSave: fn(),
  },
  play: async ({ canvasElement, step }) => {
    const nameInput = canvasElement.querySelector('input[placeholder*="name"]') as HTMLInputElement;
    const workDurationInput = canvasElement.querySelector(
      'input[placeholder*="20"]',
    ) as HTMLInputElement;

    expect(nameInput).toBeTruthy();
    expect(workDurationInput).toBeTruthy();

    if (nameInput && workDurationInput) {
      await step("fill in timer name", () => {
        nameInput.value = "Custom Interval";
        nameInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      await step("fill in work duration", () => {
        workDurationInput.value = "45";
        workDurationInput.dispatchEvent(new Event("input", { bubbles: true }));
      });
    }

    expect(canvasElement.textContent).toContain("Custom Interval");
  },
});

export const FormValidation = meta.story({
  args: {
    type: TimerType.COUNTDOWN,
    onStartTimer: fn(),
    onSaveAsPredefined: fn(),
    onSave: fn(),
  },
  play: async ({ canvasElement, step }) => {
    const submitButton = Array.from(canvasElement.querySelectorAll("button")).find((el) =>
      el.textContent?.includes("Start Timer"),
    );

    if (submitButton) {
      await step("submit empty form to trigger validation", () => {
        submitButton.click();
      });
    }

    expect(canvasElement.textContent).toContain("Please fix the following errors");
    expect(canvasElement.textContent).toContain("Timer name is required");
  },
});

export const ValidFormSubmission = meta.story({
  args: {
    type: TimerType.COUNTDOWN,
    onStartTimer: fn(),
    onSaveAsPredefined: fn(),
    onSave: fn(),
  },
  play: async ({ canvasElement, step, args }) => {
    const nameInput = canvasElement.querySelector('input[placeholder*="name"]') as HTMLInputElement;
    const durationInput = canvasElement.querySelector(
      'input[placeholder*="300"]',
    ) as HTMLInputElement;
    const submitButton = Array.from(canvasElement.querySelectorAll("button")).find((el) =>
      el.textContent?.includes("Start Timer"),
    );

    if (nameInput && durationInput && submitButton) {
      await step("fill valid timer configuration", () => {
        nameInput.value = "Test Timer";
        nameInput.dispatchEvent(new Event("input", { bubbles: true }));

        durationInput.value = "300";
        durationInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      await step("submit valid form", () => {
        submitButton.click();
      });
    }

    expect(args.onStartTimer).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Test Timer",
        type: TimerType.COUNTDOWN,
        duration: 300,
        createdAt: expect.any(Date),
        lastUsed: expect.any(Date),
      }),
    );
  },
});

export const SaveAsPredefined = meta.story({
  args: {
    type: TimerType.COUNTDOWN,
    onStartTimer: fn(),
    onSaveAsPredefined: fn(),
    onSave: fn(),
  },
  play: async ({ canvasElement, step, args }) => {
    const nameInput = canvasElement.querySelector('input[placeholder*="name"]') as HTMLInputElement;
    const durationInput = canvasElement.querySelector(
      'input[placeholder*="300"]',
    ) as HTMLInputElement;
    const saveButton = Array.from(canvasElement.querySelectorAll("button")).find((el) =>
      el.textContent?.includes("Save as Predefined"),
    );

    if (nameInput && durationInput && saveButton) {
      await step("fill timer configuration for saving", () => {
        nameInput.value = "Custom Timer";
        nameInput.dispatchEvent(new Event("input", { bubbles: true }));

        durationInput.value = "300";
        durationInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      await step("save as predefined", () => {
        saveButton.click();
      });
    }

    expect(args.onSaveAsPredefined).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Custom Timer",
        type: TimerType.COUNTDOWN,
        duration: 300,
      }),
    );
  },
});

export const WorkRestModeToggle = meta.story({
  args: {
    type: TimerType.WORKREST,
    onStartTimer: fn(),
    onSaveAsPredefined: fn(),
    onSave: fn(),
  },
  play: async ({ canvasElement, step }) => {
    // Initially shows ratio mode
    expect(canvasElement.textContent).toContain("Work/Rest Ratio");
    expect(canvasElement.textContent).not.toContain("Fixed Rest Duration");

    const restModeSelect = canvasElement.querySelector("select") as HTMLSelectElement;

    if (restModeSelect) {
      await step("switch to fixed rest mode", () => {
        restModeSelect.value = "FIXED";
        restModeSelect.dispatchEvent(new Event("change", { bubbles: true }));
      });
    }

    expect(canvasElement.textContent).toContain("Fixed Rest Duration");
    expect(canvasElement.textContent).not.toContain("Work/Rest Ratio");
  },
});

export const IntervalFieldValidation = meta.story({
  args: {
    type: TimerType.INTERVAL,
    onStartTimer: fn(),
    onSaveAsPredefined: fn(),
    onSave: fn(),
  },
  play: async ({ canvasElement, step }) => {
    const nameInput = canvasElement.querySelector('input[placeholder*="name"]') as HTMLInputElement;
    const submitButton = Array.from(canvasElement.querySelectorAll("button")).find((el) =>
      el.textContent?.includes("Start Timer"),
    );

    if (nameInput && submitButton) {
      await step("fill only name, leave work duration empty", () => {
        nameInput.value = "Test Timer";
        nameInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      await step("submit incomplete form", () => {
        submitButton.click();
      });
    }

    expect(canvasElement.textContent).toContain("Work duration must be greater than 0");
  },
});
