import preview from '#.storybook/preview'
import { fn } from 'storybook/test'

import { TimerState } from '@/lib/timer'

import TimerButton from '@/components/display/TimerButton'
import { TimerCard } from '@/components/display/TimerCard'

const meta = preview.meta({ component: TimerCard })
export const WithButtons = meta.story({
  args: {
    label: 'WORK/REST (r 1.00x)',
    state: TimerState.Paused,
    time: '01:23.45',
    subtitle: 'Round: 1',
    currentStep: { isWork: true } as any,
    children: (
      <TimerButton
        state={TimerState.Paused}
        onStart={fn()}
        onPause={fn()}
        onReset={fn()}
        onRestart={fn()}
      />
    ),
  },
})

export const WorkPhase = meta.story({
  args: {
    label: 'WORK/REST (r 1.00x)',
    state: TimerState.Running,
    time: '01:23.45',
    subtitle: 'Round: 1',
    currentStep: { isWork: true } as any,
    children: <div>Control buttons would go here</div>,
  },
})

export const RestPhase = meta.story({
  args: {
    label: 'WORK/REST (r 1.00x)',
    state: TimerState.Paused,
    time: '01:23.45',
    subtitle: 'Round: 1',
    currentStep: { isWork: false } as any,
    children: <div>Control buttons would go here</div>,
  },
})

export const Idle = meta.story({
  args: {
    label: 'WORK/REST (r 1.00x)',
    state: TimerState.Idle,
    time: '00:00.00',
    subtitle: 'Round: 0',
    currentStep: null,
    children: <div>Control buttons would go here</div>,
  },
})

export const WithoutSubtitle = meta.story({
  args: {
    label: 'WORK/REST (r 2.50x)',
    state: TimerState.Paused,
    time: '05:42.30',
    children: <div>Control buttons would go here</div>,
  },
})
