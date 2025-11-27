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

export const FilteredByCategory = meta.story({
  args: {
    styles: [],
  },
})

export const StrengthStyles = meta.story({
  args: {
    styles: [],
  },
})

export const MixedStyles = meta.story({
  args: {
    styles: [],
  },
})

export const Interactive = meta.story({
  args: {
    styles: mockStyles,
  },
})

export const StyleSelection = meta.story({
  args: {
    styles: mockStyles,
  },
})

export const TimerStart = meta.story({
  args: {
    styles: mockStyles,
  },
})

export const CategoryFiltering = meta.story({
  args: {
    styles: mockStyles,
  },
})

export const BuiltInBadges = meta.story({
  args: {
    styles: mockStyles,
  },
})

export const EventPropagation = meta.story({
  args: {
    styles: mockStyles,
  },
})
