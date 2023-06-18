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
    time: 1,
  },
};
export const TimerDisplayWithTime: Story = {
  args: {
    time: 232311,
  },
};

export const TimerDisplayWithTimeInWorkPhase: Story = {
  args: {
    phase: "work",
    time: 232311,
  },
};

export const TimerDisplayWithTimeInRestPhase: Story = {
  args: {
    phase: "rest",
    time: 232311,
  },
};
