import preview from '#.storybook/preview'
import { fn } from 'storybook/test'

import { Timer } from '@/components/display/Timer'

const meta = preview.meta({
  component: Timer,
})

export const Default = meta.story({
  args: {
    duration: 10000,
    label: 'Timer',
    completionMessage: 'On completion',
    onStateChange: fn(),
  },
})
