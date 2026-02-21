import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TimePicker } from './TimePicker'

const meta: Meta<typeof TimePicker> = {
  component: TimePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// Helper component for stories with state
function TimePickerWithState({ initialTime = 0 }: { initialTime?: number }) {
  const [seconds, setSeconds] = useState<number>(initialTime)

  return (
    <div className="p-8">
      <TimePicker value={seconds} onTimeChange={setSeconds} />
      <div className="mt-4 text-sm text-gray-600">Current time: {seconds} seconds</div>
    </div>
  )
}

export const Default: Story = {
  render: () => <TimePickerWithState />,
}

export const WithInitialTime: Story = {
  render: () => <TimePickerWithState initialTime={4500} />,
}

export const ThirtyMinutes: Story = {
  render: () => <TimePickerWithState initialTime={1800} />,
}
