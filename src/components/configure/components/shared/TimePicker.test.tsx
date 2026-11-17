import { useState } from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import type { ComplexConfig } from '@/types/configure'

import { validateTimerConfig } from '@/lib/configure/utils'
import { TimerType } from '@/lib/enums'

import { ComplexFieldsForm } from '../complex-fields-form/ComplexFieldsForm'
import { StopwatchFields } from './StopwatchFields'
import { TimePicker } from './TimePicker'
import { WorkRestFields } from './WorkRestFields'

afterEach(cleanup)

it.each([
  {
    value: 1,
    min: 1,
    max: undefined,
    picker: 'seconds',
    key: 'ArrowDown',
    expected: 1,
    display: '01',
  },
  {
    value: 60,
    min: undefined,
    max: 60,
    picker: 'minutes',
    key: 'ArrowUp',
    expected: 60,
    display: '01',
  },
  { value: 20, min: 1, max: 60, picker: 'seconds', key: 'ArrowUp', expected: 21, display: '21' },
])(
  'reports the same bounded value it displays: $expected seconds',
  ({ value, min, max, picker, key, expected, display }) => {
    const onTimeChange = vi.fn()
    const { container } = render(
      <TimePicker value={value} min={min} max={max} onTimeChange={onTimeChange} />
    )
    const input = container.querySelector<HTMLInputElement>(`input[name=${picker}]`)!
    fireEvent.keyDown(input, { key })
    expect(input.value).toBe(display)
    expect(onTimeChange).toHaveBeenLastCalledWith(expected)
  }
)

it('removes a cleared optional overall limit and accepts a new positive limit', () => {
  const initial: ComplexConfig = {
    id: 'workout',
    name: 'Workout',
    type: TimerType.COMPLEX,
    overallTimeLimit: 1,
    phases: [
      {
        id: 'phase',
        name: 'Work',
        order: 0,
        type: TimerType.COUNTDOWN,
        config: { id: 'phase', name: 'Work', type: TimerType.COUNTDOWN, duration: 60 },
      },
    ],
  }
  const onChange = vi.fn()
  function Harness() {
    const [config, setConfig] = useState(initial)
    return (
      <ComplexFieldsForm
        config={config}
        onChange={(updates) => {
          const next = { ...config, ...updates }
          onChange(next)
          setConfig(next)
        }}
      />
    )
  }
  const { container } = render(<Harness />)
  const seconds = container.querySelector<HTMLInputElement>('input[name=seconds]')!
  fireEvent.keyDown(seconds, { key: 'ArrowDown' })
  expect(seconds.value).toBe('00')
  expect(onChange.mock.lastCall![0].overallTimeLimit).toBeUndefined()
  expect(validateTimerConfig(onChange.mock.lastCall![0])).toEqual([])
  fireEvent.keyDown(seconds, { key: 'ArrowUp' })
  expect(seconds.value).toBe('01')
  expect(onChange.mock.lastCall![0].overallTimeLimit).toBe(1)
  expect(validateTimerConfig(onChange.mock.lastCall![0])).toEqual([])
})

it('clears the optional Stopwatch time limit', () => {
  const onChange = vi.fn()
  const { container } = render(<StopwatchFields config={{ timeLimit: 1 }} onChange={onChange} />)
  fireEvent.keyDown(container.querySelector('input[name=seconds]')!, { key: 'ArrowDown' })
  expect(onChange).toHaveBeenLastCalledWith({ timeLimit: undefined })
})

it('clears the optional Work/Rest work time limit', () => {
  const onChange = vi.fn()
  const { container } = render(<WorkRestFields config={{ maxWorkTime: 1 }} onChange={onChange} />)
  fireEvent.keyDown(container.querySelector('input[name=seconds]')!, { key: 'ArrowDown' })
  expect(onChange).toHaveBeenLastCalledWith({ maxWorkTime: undefined })
})
