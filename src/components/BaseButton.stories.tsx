import preview from "#.storybook/preview";
import PauseIcon from "@/icons/PauseIcon";
import PlayIcon from "@/icons/PlayIcon";
import RepeatIcon from "@/icons/Repeat";
import SkipIcon from "@/icons/SkipIcon";
import StopIcon from "@/icons/StopIcon";
import { expect } from "storybook/test";

import { BaseButton } from "@/components/TimerButton";

// CSF Factories - Less boilerplate and no type assignments!

const meta = preview.meta({ component: BaseButton });

export default meta;

export const Start = meta.story({
  render: () => (
    <BaseButton
      onClick={() => {}}
      title="Start"
      label="Start timer"
      className="bg-green-500 hover:bg-green-600 focus:ring-green-500"
    >
      <PlayIcon className="h-6 w-6" />
    </BaseButton>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button");
    expect(button?.getAttribute("title")).toBe("Start");
    expect(button?.getAttribute("aria-label")).toBe("Start timer");
  },
});

export const Pause = meta.story({
  render: () => (
    <BaseButton
      onClick={() => {}}
      title="Pause"
      label="Pause timer"
      className="bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500"
    >
      <PauseIcon className="h-6 w-6" />
    </BaseButton>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button");
    expect(button?.getAttribute("title")).toBe("Pause");
    expect(button?.getAttribute("aria-label")).toBe("Pause timer");
  },
});

export const Stop = meta.story({
  render: () => (
    <BaseButton
      onClick={() => {}}
      title="Stop"
      label="Stop timer"
      className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
    >
      <StopIcon className="h-6 w-6" />
    </BaseButton>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button");
    expect(button?.getAttribute("title")).toBe("Stop");
    expect(button?.getAttribute("aria-label")).toBe("Stop timer");
  },
});

export const Skip = meta.story({
  render: () => (
    <BaseButton
      onClick={() => {}}
      title="Skip rest"
      label="Skip rest"
      className="bg-orange-500 hover:bg-orange-600 focus:ring-orange-500"
    >
      <SkipIcon className="h-6 w-6" />
    </BaseButton>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button");
    expect(button?.getAttribute("title")).toBe("Skip rest");
    expect(button?.getAttribute("aria-label")).toBe("Skip rest");
  },
});

export const RatioControl = meta.story({
  args: {
    children: "+1.0",
    title: "Increase ratio",
    className: "bg-gray-500 px-2 py-1 text-xs hover:bg-gray-600 disabled:bg-gray-300",
  },
  play: async ({ canvas }) => {
    expect(canvas.getByRole("button").textContent).toContain("+1.0");
  },
});

export const Restart = meta.story({
  render: () => (
    <BaseButton
      onClick={() => {}}
      title="Restart timer"
      label="Restart timer"
      className="bg-green-500 hover:bg-green-600 focus:ring-green-500"
    >
      <RepeatIcon className="h-6 w-6" />
    </BaseButton>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button");
    expect(button?.getAttribute("title")).toBe("Restart timer");
    expect(button?.getAttribute("aria-label")).toBe("Restart timer");
  },
});

export const ResetRatio = meta.story({
  args: {
    children: "Reset 1x",
    title: "Reset ratio to 1.0",
    className: "bg-purple-700 px-2 py-1 text-xs hover:bg-purple-800 disabled:bg-gray-300",
  },
  play: async ({ canvasElement, canvas }) => {
    const htmlElement = await canvas.findByText("Reset 1x");
    console.log(htmlElement);
    expect(htmlElement).toContainHTML("Reset 1x");
  },
});
