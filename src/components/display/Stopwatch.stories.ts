import preview from '#.storybook/preview'

import { TimerType } from '@/lib/enums'

import { Stopwatch } from '@/components/display/Stopwatch'

const meta = preview.meta({
  component: Stopwatch,
  args: {
    config: {
      id: 'test',
      type: TimerType.STOPWATCH,
      name: 'Stopwatch',
      timeLimit: 5,
      completionMessage: 'Time limit reached',
    },
  },
  tags: ['autodocs'],
})

export const Default = meta.story()
