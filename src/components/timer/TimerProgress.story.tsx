import type { Meta, StoryObj } from "@storybook/react";

import TimerProgress from "./TimerProgress";

const meta: Meta<typeof TimerProgress> = {
  title: "Timer/Timer/Progress",
  component: TimerProgress,
};

export default meta;
type Story = StoryObj<typeof TimerProgress>;

export const TimerProgressDefault: Story = {};
export const TimerProgressWorkPhase: Story = {
  args: {
    currentRound: 1,
    totalRounds: 3,
    phase: 'work'
  },
};
export const TimerProgressRestPhase: Story = {
  args: {
    currentRound: 1,
    totalRounds: 3,
    phase: 'rest'
  },
};
