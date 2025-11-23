import preview from '#.storybook/preview'
import { expect, fn } from 'storybook/test'

import { LapHistory } from '@/components/display/LapHistory'

const meta = preview.meta({
  component: LapHistory,
  argTypes: {
    laps: { control: 'object' },
  },
  args: {
    laps: [],
    onClearHistory: fn(),
    lastLap: null,
    bestLap: null,
  },
})
const now = Date.now()

export const Empty = meta.story({
  args: {
    laps: [],
  },
  play: async ({ canvas }) => {
    expect(canvas.queryByText('Last lap')).not.toBeInTheDocument()
  },
})

export const SingleLap = meta.story({
  args: {
    lastLap: {
      id: '1',
      lapTime: 65432,
      timestamp: now,
    },
    bestLap: {
      id: '1',
      lapTime: 65432,
      timestamp: now,
    },
    laps: [
      {
        id: '1',
        lapTime: 65432,
        timestamp: now,
      },
    ],
  },
  play: async ({ canvas }) => {
    expect(canvas.queryByText('Last lap')).toBeInTheDocument()
    expect(canvas.queryByText('Best lap')).toBeInTheDocument()
    expect(canvas.getAllByText('01:05.43').length).toBeGreaterThanOrEqual(2)
  },
})

export const SingleLapExpanded = meta.story({
  args: {
    initialExpanded: true,
    ...SingleLap.input.args,
  },
  play: async ({ canvas }) => {
    expect(canvas.queryByText(/Last lap/)).toBeInTheDocument()
    expect(canvas.queryByText(/Best lap/)).toBeInTheDocument()
    expect(canvas.getAllByText('01:05.43').length).toBeGreaterThanOrEqual(2)
  },
})

export const MultipleLaps = meta.story({
  args: {
    laps: [
      {
        id: '1',
        lapTime: 65432,
        timestamp: now - 3000,
      },
      {
        id: '2',
        lapTime: 72150,
        timestamp: now - 2000,
      },
      {
        id: '3',
        lapTime: 58900,
        timestamp: now,
      },
    ],
  },
  render: (args) => {
    const laps = args.laps
    const bestLap = laps.reduce((best, lap) => {
      if (!best) return lap
      return lap.lapTime < best.lapTime ? lap : best
    })
    return <LapHistory laps={laps} lastLap={laps[laps.length - 1]} bestLap={bestLap} />
  },
  play: async ({ canvas }) => {
    expect(canvas.queryByText('Last lap')).toBeInTheDocument()
    expect(canvas.queryByText('Best lap')).toBeInTheDocument()
    expect(canvas.getAllByText('00:58.90').length).toBeGreaterThanOrEqual(2)
  },
})

export const MultipleLapsExpanded = meta.story({
  args: {
    initialExpanded: true,
    ...MultipleLaps.input.args,
  },
  render: (args) => {
    const laps = args.laps
    const bestLap = laps.reduce((best, lap) => {
      if (!best) return lap
      return lap.lapTime < best.lapTime ? lap : best
    })
    return <LapHistory {...args} laps={laps} lastLap={laps[laps.length - 1]} bestLap={bestLap} />
  },
  play: async ({ canvas }) => {
    expect(canvas.queryByText(/Last lap/)).toBeInTheDocument()
    expect(canvas.queryByText(/Best lap/)).toBeInTheDocument()
    expect(canvas.getAllByText('00:58.90').length).toBeGreaterThanOrEqual(2)
  },
})

export const ManyLaps = meta.story({
  args: {
    laps: Array.from({ length: 10 }, (_, i) => ({
      id: String(i + 1),
      lapTime: 60000 + Math.random() * 20000,
      timestamp: now - (10 - i) * 1000,
    })),
  },
  render: (args) => {
    const laps = args.laps
    const bestLap = laps.reduce((best, lap) => {
      if (!best) return lap
      return lap.lapTime < best.lapTime ? lap : best
    })
    return <LapHistory laps={laps} lastLap={laps[laps.length - 1]} bestLap={bestLap} />
  },
  play: async ({ canvas }) => {
    expect(canvas.queryByText('Last lap')).toBeInTheDocument()
    expect(canvas.queryByText('Best lap')).toBeInTheDocument()
  },
})
export const ManyLapsExpanded = meta.story({
  args: {
    initialExpanded: true,
    ...ManyLaps.input.args,
  },
  render: (args) => {
    const laps = args.laps
    const bestLap = laps.reduce((best, lap) => {
      if (!best) return lap
      return lap.lapTime < best.lapTime ? lap : best
    })
    return <LapHistory {...args} laps={laps} lastLap={laps[laps.length - 1]} bestLap={bestLap} />
  },
  play: async ({ canvas }) => {
    expect(canvas.queryByText('Last lap')).toBeInTheDocument()
    expect(canvas.queryByText('Best lap')).toBeInTheDocument()
  },
})
