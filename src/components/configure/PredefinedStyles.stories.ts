import { mockStyles } from '@/testing/storybook-mocks'
import preview from '#.storybook/preview'

import { PredefinedStyles } from './PredefinedStyles'

const meta = preview.meta({
  component: PredefinedStyles,
  argTypes: {
    styles: { control: 'object' },
  },
  args: {
    styles: mockStyles,
    onSelectStyle: () => {},
    onStartTimer: () => {},
  },
})

export const Default = meta.story({
  args: {
    styles: mockStyles,
  },
})

export const Empty = meta.story({
  args: {
    styles: [],
  },
})
