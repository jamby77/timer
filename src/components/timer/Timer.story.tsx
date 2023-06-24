import type { Meta, StoryObj } from "@storybook/react";

import {
  CountdownTimerInterface,
  IntervalInterface,
  StopwatchTimerInterface,
} from "@/components/timer/index";
import { defaultTimer } from "@/components/timer/useTimer";
import { TimerStateEnum, TimerTypeEnum } from "@/components/timer/utilities";
import { Timer } from "./Timer";

const meta: Meta<typeof Timer> = {
  title: "Timer/Timer",
  component: Timer,
};

export default meta;
type Story = StoryObj<typeof Timer>;
const intervalTimerConfig: IntervalInterface = {
  type: TimerTypeEnum.interval,
  intervals: [
    {
      work: 10000,
      rest: 20000,
      rounds: 3,
      name: "Tabata",
    },
  ],
};

const swTimerConfig: StopwatchTimerInterface = {
  duration: 5000,
  type: TimerTypeEnum.stopwatch,
};

const cdTimerConfig: CountdownTimerInterface = {
  duration: 5000,
  type: TimerTypeEnum.countdown,
};

export const TimerDefault: Story = {
  args: {
    config: {
      currentTime: 0,
      startTime: 0,
      time: 0,
      running: TimerStateEnum.initial,
      timer: defaultTimer,
    },
  },
};

export const TimerStopWatch: Story = {
  args: {
    config: {
      currentTime: 0,
      startTime: 0,
      time: 0,
      running: TimerStateEnum.initial,
      timer: swTimerConfig,
    },
  },
};

export const TimerCountdown: Story = {
  args: {
    config: {
      currentTime: 0,
      startTime: 0,
      time: 0,
      running: TimerStateEnum.initial,
      timer: cdTimerConfig,
    },
  },
};

export const TimerInterval: Story = {
  args: {
    config: {
      currentTime: 0,
      startTime: 0,
      time: 0,
      running: TimerStateEnum.initial,
      timer: intervalTimerConfig,
    },
  },
};
