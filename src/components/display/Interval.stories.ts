import preview from '#.storybook/preview'

import { TimerType } from '@/types/configure'

import { Interval } from './Interval'

const meta = preview.meta({
  component: Interval,
  tags: ['autodocs'],
})

export const Default = meta.story({
  args: {
    intervalConfig: {
      id: 'interval-story-default',
      name: 'Interval (Story)',
      type: TimerType.INTERVAL,
      workDuration: 20,
      restDuration: 10,
      intervals: 8,
      workLabel: 'Work',
      restLabel: 'Rest',
      skipLastRest: true,
    },
  },
})
