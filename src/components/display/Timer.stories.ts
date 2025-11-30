import preview from '#.storybook/preview'
import { fn } from 'storybook/test'

import { Timer } from '@/components/display/Timer'
import { TimerType } from '@/lib/enums'

const meta = preview.meta({
  component: Timer,
})

export const Default = meta.story({
  args: {
    config: {
      id: 'test-timer',
      type: TimerType.COUNTDOWN,
      name: 'Timer',
      duration: 10,
      completionMessage: 'On completion',
    },
    onStateChange: fn(),
  },
})
