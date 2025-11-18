import { fn } from "storybook/test";

import { LapHistory } from "@/components/LapHistory";
import preview from "../../../.storybook/preview";

const meta = preview.meta({
  component: LapHistory,
  argTypes: {
    laps: { control: "object" },
  },
  args: {
    onClearHistory: fn(),
  },
});
const now = Date.now();

export const Empty = meta.story({
  args: {
    laps: [],
  },
});

export const SingleLap = meta.story({
  args: {
    laps: [
      {
        id: "1",
        lapTime: 65432,
        timestamp: now,
      },
    ],
  },
});

export const MultipleLaps = meta.story({
  args: {
    laps: [
      {
        id: "1",
        lapTime: 65432,
        timestamp: now - 3000,
      },
      {
        id: "2",
        lapTime: 72150,
        timestamp: now - 2000,
      },
      {
        id: "3",
        lapTime: 58900,
        timestamp: now,
      },
    ],
  },
});

export const ManyLaps = meta.story({
  args: {
    laps: Array.from({ length: 10 }, (_, i) => ({
      id: String(i + 1),
      lapTime: 60000 + Math.random() * 20000,
      timestamp: now - (10 - i) * 1000,
    })),
  },
});
