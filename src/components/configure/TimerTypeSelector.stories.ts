import preview from '#.storybook/preview'
import { expect, fn } from 'storybook/test'

import { TimerType } from '@/lib/timer/types'

import { TimerTypeSelector } from './TimerTypeSelector'

const meta = preview.meta({
  component: TimerTypeSelector,
  argTypes: {
    selectedTimer: {
      control: 'select',
      options: [
        TimerType.COUNTDOWN,
        TimerType.STOPWATCH,
        TimerType.INTERVAL,
        TimerType.WORKREST,
        TimerType.COMPLEX,
      ],
    },
    onTimerSelect: {
      control: false,
    },
  },
  args: {
    selectedTimer: null,
    onTimerSelect: fn(),
  },
})

export const Default = meta.story({
  args: {
    selectedTimer: null,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain('Timer Type')
    expect(canvasElement.textContent).toContain('Countdown')
    expect(canvasElement.textContent).toContain('Stopwatch')
    expect(canvasElement.textContent).toContain('Interval')
    expect(canvasElement.textContent).toContain('Work/Rest Ratio')
    expect(canvasElement.textContent).toContain('Complex')
    expect(canvasElement.textContent).toContain('Simple countdown timer')
    expect(canvasElement.textContent).toContain('Count-up timer with optional limit')
    expect(canvasElement.textContent).toContain('Work/rest cycles')
    expect(canvasElement.textContent).toContain('Ratio-based timer')
    expect(canvasElement.textContent).toContain('Multi-sequence timer combining different types')
  },
})

export const CountdownSelected = meta.story({
  args: {
    selectedTimer: TimerType.COUNTDOWN,
  },
  play: async ({ canvasElement }) => {
    // Check that Countdown is highlighted (has ring class)
    const countdownElement = canvasElement.querySelector('[data-selected="true"]')
    expect(countdownElement).toBeTruthy()
    expect(countdownElement?.textContent).toContain('Countdown')
    expect(countdownElement?.className).toContain('ring')
  },
})
