import { createMockTimerConfig } from '@/testing/utils'
import preview from '#.storybook/preview'
import { expect, fn } from 'storybook/test'

import { TimerType } from '@/lib/timer/types'

import { RecentTimers } from './RecentTimers'

const meta = preview.meta({
  component: RecentTimers,
  argTypes: {
    timers: { control: 'object' },
  },
  args: {
    onStartTimer: fn(),
    onRemoveTimer: fn(),
  },
})

export const Empty = meta.story({
  args: {
    timers: [],
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain('No Recent Timers')
    expect(canvasElement.textContent).toContain(
      'Start a timer to see it appear here for quick access'
    )
  },
})

export const WithTimers = meta.story({
  args: {
    timers: [
      {
        id: 'timer-1',
        config: createMockTimerConfig('Tabata', TimerType.INTERVAL),
        startedAt: new Date(),
      },
    ],
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain('Recent Timers')
    expect(canvasElement.textContent).toContain('Tabata')
    expect(canvasElement.textContent).toContain('8 rounds: 20s work / 10s rest')
    expect(canvasElement.textContent).toContain('Start Timer')
    expect(canvasElement.textContent).toContain('Clear All')
  },
})

export const MultipleTimers = meta.story({
  args: {
    timers: [
      {
        id: 'timer-1',
        config: createMockTimerConfig('Tabata', TimerType.INTERVAL),
        startedAt: new Date(),
      },
      {
        id: 'timer-2',
        config: createMockTimerConfig('EMOM', TimerType.INTERVAL),
        startedAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        id: 'timer-3',
        config: createMockTimerConfig('Countdown', TimerType.COUNTDOWN),
        startedAt: new Date(Date.now() - 7200000), // 2 hours ago
      },
    ],
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain('Recent Timers')
    expect(canvasElement.textContent).toContain('Tabata')
    expect(canvasElement.textContent).toContain('EMOM')
    expect(canvasElement.textContent).toContain('Countdown')
    expect(canvasElement.textContent).toContain('Clear All')
  },
})

export const ManyTimers = meta.story({
  args: {
    timers: Array.from({ length: 15 }, (_, i) => ({
      id: `timer-${i + 1}`,
      config: createMockTimerConfig(`Timer ${i + 1}`, TimerType.COUNTDOWN),
      startedAt: new Date(Date.now() - i * 60000), // Different times
    })),
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain('Recent Timers')
    expect(canvasElement.textContent).toContain('Load More')
    expect(canvasElement.textContent).toContain('5 remaining')
  },
})

export const TimerStart = meta.story({
  args: {
    timers: [
      {
        id: 'timer-1',
        config: createMockTimerConfig('Test Timer', TimerType.COUNTDOWN),
        startedAt: new Date(),
      },
    ],
  },
  play: async ({ canvas, step, args }) => {
    const startButton = canvas.getByRole('button', { name: 'Start' })
    expect(startButton).toBeTruthy()

    if (startButton) {
      await step('start timer', () => {
        startButton.click()
      })
    }

    expect(args.onStartTimer).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Timer',
        type: TimerType.COUNTDOWN,
        duration: 300,
      })
    )
  },
})

export const TimerRemoval = meta.story({
  args: {
    timers: [
      {
        id: 'timer-1',
        config: createMockTimerConfig('Test Timer', TimerType.COUNTDOWN),
        startedAt: new Date(),
      },
    ],
  },
  play: async ({ canvas, step, args }) => {
    const removeButton = canvas.getByRole('button', { name: 'Remove timer' })
    expect(removeButton).toBeTruthy()

    if (removeButton) {
      await step('remove timer', () => {
        removeButton.click()
      })
    }

    expect(args.onRemoveTimer).toHaveBeenCalledWith('timer-1')
  },
})
