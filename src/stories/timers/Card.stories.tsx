import { Card } from "@/components/Card";
import preview from "../../../.storybook/preview";

const meta = preview.meta({ component: Card });
export const WorkPhase = meta.story({
  args: {
    label: "WORK/REST (r 1.00x)",
    status: "Running",
    time: "01:23.45",
    subtitle: "Round: 1",
    currentStep: { isWork: true } as any,
    children: <div>Control buttons would go here</div>,
  },
});

export const RestPhase = meta.story({
  args: {
    label: "WORK/REST (r 1.00x)",
    status: "Resting",
    time: "01:23.45",
    subtitle: "Round: 1",
    currentStep: { isWork: false } as any,
    children: <div>Control buttons would go here</div>,
  },
});

export const Idle = meta.story({
  args: {
    label: "WORK/REST (r 1.00x)",
    status: "Ready to start",
    time: "00:00.00",
    subtitle: "Round: 0",
    currentStep: null,
    children: <div>Control buttons would go here</div>,
  },
});

export const WithoutSubtitle = meta.story({
  args: {
    label: "WORK/REST (r 2.50x)",
    status: "Paused",
    time: "05:42.30",
    children: <div>Control buttons would go here</div>,
  },
});
