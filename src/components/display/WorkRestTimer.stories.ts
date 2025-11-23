import preview from '#.storybook/preview'

import { WorkRestMode } from '@/lib/enums'

import { WorkRestTimer } from '@/components/display/WorkRestTimer'

const meta = preview.meta({
  component: WorkRestTimer,
})

export const RatioRest = meta.story({
  args: {
    className: 'bg-red-800',
    config: {
      ratio: 1.5,
      maxRounds: 5,
      maxWorkTime: 300,
      restMode: WorkRestMode.RATIO,
    },
  },
})

export const FixedRest = meta.story({
  args: {
    className: 'bg-red-800',
    config: {
      ratio: 1.5,
      maxRounds: 5,
      maxWorkTime: 300,
      fixedRestDuration: 10,
      restMode: WorkRestMode.FIXED,
    },
  },
})
