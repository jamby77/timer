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

export const Default: Story = {
  render: () => {
    const [seconds, setSeconds] = useState<number>(0)

    return (
      <div className="p-8">
        <TimePicker 
          initialSeconds={seconds} 
          onTimeChange={setSeconds} 
        />
        <div className="mt-4 text-sm text-gray-600">
          Current time: {seconds} seconds
        </div>
      </div>
    )
  },
}

export const WithInitialTime: Story = {
  render: () => {
    const initialTime = 4500 // 1 hour, 15 minutes, 0 seconds
    const [seconds, setSeconds] = useState<number>(initialTime)

    return (
      <div className="p-8">
        <TimePicker 
          initialSeconds={seconds} 
          onTimeChange={setSeconds} 
        />
        <div className="mt-4 text-sm text-gray-600">
          Current time: {seconds} seconds
        </div>
      </div>
    )
  },
}

export const ThirtyMinutes: Story = {
  render: () => {
    const initialTime = 1800 // 30 minutes
    const [seconds, setSeconds] = useState<number>(initialTime)

    return (
      <div className="p-8">
        <TimePicker 
          initialSeconds={seconds} 
          onTimeChange={setSeconds} 
        />
        <div className="mt-4 text-sm text-gray-600">
          Current time: {seconds} seconds
        </div>
      </div>
    )
  },
}
