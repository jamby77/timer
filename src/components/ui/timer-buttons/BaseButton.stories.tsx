import preview from '#.storybook/preview'
import { expect, fn } from 'storybook/test'

import { BaseButton, PauseButton, ResetButton, SkipButton, StartButton, StopButton } from './index'

// CSF Factories - Less boilerplate and no type assignments!

const meta = preview.meta({
  component: BaseButton,
  args: {
    label: 'Button',
    onClick: fn(),
  },
})

export default meta

export const Default = meta.story({
  args: {
    label: 'Start timer',
    className: 'bg-green-500 hover:bg-green-600 focus:ring-green-500',
    title: 'Start',
    children: 'BBC',
    onClick: fn(),
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button')
    expect(button?.getAttribute('title')).toBe('Start')
    expect(button?.getAttribute('aria-label')).toBe('Start timer')
  },
})

export const Start = meta.story({
  render: () => <StartButton onClick={fn()} />,
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button')
    expect(button?.getAttribute('title')).toBe('Start')
    expect(button?.getAttribute('aria-label')).toBe('Start timer')
  },
})
export const Pause = meta.story({
  render: () => <PauseButton onClick={fn()} />,
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button')
    expect(button?.getAttribute('title')).toBe('Pause')
    expect(button?.getAttribute('aria-label')).toBe('Pause timer')
  },
})

export const Stop = meta.story({
  render: () => <StopButton onClick={fn()} />,
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button')
    expect(button?.getAttribute('title')).toBe('Stop')
    expect(button?.getAttribute('aria-label')).toBe('Stop timer')
  },
})

export const Skip = meta.story({
  render: () => <SkipButton onClick={fn()} />,
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button')
    expect(button?.getAttribute('title')).toBe('Skip')
    expect(button?.getAttribute('aria-label')).toBe('Skip to next')
  },
})

export const Reset = meta.story({
  render: () => <ResetButton onClick={fn()} />,
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button')
    expect(button?.getAttribute('title')).toBe('Reset')
    expect(button?.getAttribute('aria-label')).toBe('Reset timer')
  },
})
