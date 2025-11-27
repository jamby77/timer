'use client'

import cx from 'clsx'

import type { TimerTypeSelectorProps } from '@/types/configure'

import { TIMER_TYPE_LABELS, TimerType } from '@/lib/enums'

import { CardContainer } from '@/components/ui'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const TIMER_TYPES = [
  {
    type: TimerType.COUNTDOWN,
    name: TIMER_TYPE_LABELS[TimerType.COUNTDOWN],
    description: 'Simple countdown timer',
  },
  {
    type: TimerType.STOPWATCH,
    name: TIMER_TYPE_LABELS[TimerType.STOPWATCH],
    description: 'Count-up timer with optional limit',
  },
  {
    type: TimerType.INTERVAL,
    name: TIMER_TYPE_LABELS[TimerType.INTERVAL],
    description: 'Work/rest cycles',
  },
  {
    type: TimerType.WORKREST,
    name: TIMER_TYPE_LABELS[TimerType.WORKREST],
    description: 'Ratio-based timer',
  },
  {
    type: TimerType.COMPLEX,
    name: TIMER_TYPE_LABELS[TimerType.COMPLEX],
    description: 'Multi-sequence timer combining different types',
  },
] as const
export const TimerTypeSelector = ({ selectedType, onTypeSelect }: TimerTypeSelectorProps) => {
  return (
    <CardContainer>
      <h2 className="mb-6 text-xl font-semibold">Timer Type</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {TIMER_TYPES.map(({ type, name, description }) => (
          <Card
            key={type}
            className={cx('cursor-pointer transition-colors', {
              'ring-accent-foreground ring': selectedType === type,
            })}
            onClick={() => onTypeSelect(type)}
            data-selected={selectedType === type}
          >
            <CardHeader>
              <h3>{name}</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </CardContainer>
  )
}
