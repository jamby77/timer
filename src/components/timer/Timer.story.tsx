import type { Meta, StoryObj } from "@storybook/react";

import { Timer } from "./Timer";

const meta: Meta<typeof Timer> = {
  title: "Timer/Timer",
  component: Timer,
};

export default meta;
type Story = StoryObj<typeof Timer>;

export const TimerStory: Story = {};
