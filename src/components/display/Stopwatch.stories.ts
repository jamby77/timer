import preview from "#.storybook/preview";

import { Stopwatch } from "@/components/display/Stopwatch";

const meta = preview.meta({
  component: Stopwatch,
  args: {
    label: "Stopwatch",
    timeLimit: 5,
    completionMessage: "Time limit reached",
  },
  tags: ["autodocs"],
});

export const Default = meta.story();
