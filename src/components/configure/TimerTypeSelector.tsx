'use client'

import cx from 'clsx'

import type { TimerTypeSelectorProps } from '@/types/configure'

import { TIMER_TYPE_ICONS, TIMER_TYPE_LABELS, TimerType } from '@/lib/enums'

import { CardContainer } from '@/components/ui'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const TIMER_TYPES = [
  {
    type: TimerType.COUNTDOWN,
    name: TIMER_TYPE_LABELS[TimerType.COUNTDOWN],
    description: 'Simple countdown timer',
    icon: TIMER_TYPE_ICONS[TimerType.COUNTDOWN],
  },
  {
    type: TimerType.STOPWATCH,
    name: TIMER_TYPE_LABELS[TimerType.STOPWATCH],
    description: 'Count-up timer with optional limit',
    icon: TIMER_TYPE_ICONS[TimerType.STOPWATCH],
  },
  {
    type: TimerType.INTERVAL,
    name: TIMER_TYPE_LABELS[TimerType.INTERVAL],
    description: 'Work/rest cycles',
    icon: TIMER_TYPE_ICONS[TimerType.INTERVAL],
  },
  {
    type: TimerType.WORKREST,
    name: TIMER_TYPE_LABELS[TimerType.WORKREST],
    description: 'Ratio-based timer',
    icon: TIMER_TYPE_ICONS[TimerType.WORKREST],
  },
  {
    type: TimerType.COMPLEX,
    name: TIMER_TYPE_LABELS[TimerType.COMPLEX],
    description: 'Multi-sequence timer combining different types',
    icon: TIMER_TYPE_ICONS[TimerType.COMPLEX],
  },
] as const
export const TimerTypeSelector = ({ selectedTimer, onTimerSelect }: TimerTypeSelectorProps) => {
  return (
    <CardContainer>
      <h2 className="mb-6 text-xl font-semibold">Timer Type</h2>
      <div className="grid w-full grid-cols-3 gap-4">
        {TIMER_TYPES.map(({ type, name, description, icon: Icon }) => (
          <Card
            key={type}
            className={cx('cursor-pointer transition-colors', {
              'ring-accent-foreground ring': selectedTimer === type,
            })}
            onClick={() => onTimerSelect(type)}
            data-selected={selectedTimer === type}
          >
            <CardHeader>
              <div
                className="flex items-center justify-center gap-1 overflow-hidden md:justify-between"
                title={name}
              >
                <Icon className="size-6" />
                <h3 className="hidden truncate md:inline">{name}</h3>
              </div>
            </CardHeader>
            <CardContent className="max-w-20 overflow-hidden md:max-w-full">
              <p className="truncate text-sm">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </CardContainer>
  )
}
