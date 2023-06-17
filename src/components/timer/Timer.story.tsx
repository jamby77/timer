import type { Meta, StoryObj } from "@storybook/react";

import { IntervalsInterface } from "@/components/timer/index";
import { TimerStateEnum } from "@/components/timer/utilities";
import { Timer } from "./Timer";

const meta: Meta<typeof Timer> = {
  title: "Timer/Timer",
  component: Timer,
};

export default meta;
type Story = StoryObj<typeof Timer>;
const intervals: IntervalsInterface = {
  intervals: [
    {
      work: 10000,
      rest: 20000,
      rounds: 3,
      name: "Tabata",
    },
  ],
};
export const TimerDefault: Story = {};
export const TimerInterval: Story = {
  args: {
    config: {
      currentTime: 0,
      startTime: 0,
      time: 0,
      running: TimerStateEnum.initial,
      intervals,
    },
  },
};
