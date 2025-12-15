import preview from '#.storybook/preview'

import { Sounds } from './Sounds'

const meta = preview.meta({
  component: Sounds,
})

export const Default = meta.story({
  args: {},
})
