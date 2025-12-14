import preview from '#.storybook/preview'
import { fn } from 'storybook/test'

import { TimerType } from '@/lib/enums'

import { Timer } from '@/components/display/Timer'

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
      completionMessage: 'Done',

      sound: {
        enabled: true,
        volume: 0.7,
        countdownBeeps: 3,
        startBeep: true,
        finishBeep: true,
        intervalStartBeep: true,
        intervalEndBeep: true,
        tick: true,
        tickEverySeconds: 1,
      },
    },
    onStateChange: fn(),
  },
})
