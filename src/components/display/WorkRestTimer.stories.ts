import preview from '#.storybook/preview'

import { WorkRestTimer } from '@/components/display/WorkRestTimer'

const meta = preview.meta({
  component: WorkRestTimer,
})

export const Default = meta.story({
  args: {
    className: 'bg-red-800',
  },
})
