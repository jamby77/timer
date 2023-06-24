import type { Meta, StoryObj } from "@storybook/react";

import TimerDisplay from "./TimerDisplay";

const meta: Meta<typeof TimerDisplay> = {
  title: "Timer/Timer/Display",
  component: TimerDisplay,
};

export default meta;
type Story = StoryObj<typeof TimerDisplay>;

export const TimerDisplayDefault: Story = {};
export const TimerDisplayWithMinTime: Story = {
  args: {
    milliseconds: 1,
  },
};
export const TimerDisplayWithTime: Story = {
  args: {
    milliseconds: 311,
    seconds: 52,
    minutes: 3,
  },
};

export const TimerDisplayWithTimeInWorkPhase: Story = {
  args: {
    phase: "work",
    milliseconds: 311,
    seconds: 52,
    minutes: 3,
  },
};

export const TimerDisplayWithTimeInRestPhase: Story = {
  args: {
    phase: "rest",
    milliseconds: 311,
    seconds: 52,
    minutes: 3,
  },
};
