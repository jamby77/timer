import { Stopwatch } from "@/components/Stopwatch";
import preview from "../../../.storybook/preview";

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
