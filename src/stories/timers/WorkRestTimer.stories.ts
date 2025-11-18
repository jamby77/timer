import { WorkRestTimer } from "@/components/WorkRestTimer";
import preview from "../../../.storybook/preview";

const meta = preview.meta({
  component: WorkRestTimer,
});

export const Default = meta.story({
  args: {
    className: "bg-red-800",
  },
});
