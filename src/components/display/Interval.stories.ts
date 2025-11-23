import preview from '#.storybook/preview'

import { Interval } from './Interval'

const meta = preview.meta({
  component: Interval,
  tags: ['autodocs'],
})

export const Default = meta.story({
  args: {
    intervalConfig: {
      workDuration: 20,
      restDuration: 10,
      intervals: 8,
      workLabel: 'Work',
      restLabel: 'Rest',
      skipLastRest: true,
    },
  },
})
