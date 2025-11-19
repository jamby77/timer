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
    lastLap: null,
    bestLap: null,
  },
});
const now = Date.now();

export const Empty = meta.story({
  args: {
    laps: [],
  },
});

export const Default = meta.story({
  args: {
    lastLap: {
      id: "1",
      lapTime: 65432,
      timestamp: now,
    },
    bestLap: {
      id: "1",
      lapTime: 65432,
      timestamp: now,
    },
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
  render: () => {
    const laps = [
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
    ];
    const bestLap = laps.reduce((best, lap) => {
      if (!best) return lap;
      return lap.lapTime < best.lapTime ? lap : best;
    });
    return <LapHistory laps={laps} lastLap={laps[laps.length - 1]} bestLap={bestLap} />;
  },
});

export const ManyLaps = meta.story({
  render: () => {
    const laps = Array.from({ length: 10 }, (_, i) => ({
      id: String(i + 1),
      lapTime: 60000 + Math.random() * 20000,
      timestamp: now - (10 - i) * 1000,
    }));
    const bestLap = laps.reduce((best, lap) => {
      if (!best) return lap;
      return lap.lapTime < best.lapTime ? lap : best;
    });
    return <LapHistory laps={laps} lastLap={laps[laps.length - 1]} bestLap={bestLap} />;
  },
});
