import type { StoryObj } from "@storybook/nextjs-vite";

import { BaseButton } from "@/components/TimerButton";
import preview from "../../../.storybook/preview";

// CSF Factories - Less boilerplate and no type assignments!

const meta = preview.meta({ component: BaseButton });

export const Primary = meta.story({
  args: { children: "Button", title: "true", className: "bg-blue-500 hover:bg-blue-600" },
});

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
// const meta: Meta<typeof BaseButton> = {
//   component: BaseButton,
//   parameters: {
//     layout: "centered",
//   },
//   tags: ["autodocs"],
//   args: { onClick: fn() },
//   argTypes: {
//     disabled: { control: "boolean" },
//     className: { control: "text" },
//   },
// };

export default meta;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
type Story = StoryObj<typeof meta>;

export const Default = meta.story({
  args: {
    children: "Click me",
    title: "Default button",
    className: "bg-gray-500 hover:bg-gray-600",
  },
});

// export const Primary: Story = {
//   args: {
//     children: "Primary Action",
//     title: "Primary button",
//     className: "bg-blue-500 hover:bg-blue-600",
//   },
// };

// export const Success: Story = {
//   args: {
//     children: "Success",
//     title: "Success button",
//     className: "bg-green-500 hover:bg-green-600",
//   },
// };
//
// export const Danger: Story = {
//   args: {
//     children: "Delete",
//     title: "Danger button",
//     className: "bg-red-500 hover:bg-red-600",
//   },
// };
//
// export const Disabled: Story = {
//   args: {
//     children: "Disabled",
//     title: "Disabled button",
//     disabled: true,
//     className: "bg-gray-300 cursor-not-allowed",
//   },
// };
//
// export const WithLabel: Story = {
//   args: {
//     children: "Accessible Button",
//     label: "Accessible button with aria-label",
//     title: "Button with label",
//     className: "bg-purple-500 hover:bg-purple-600",
//   },
// };
