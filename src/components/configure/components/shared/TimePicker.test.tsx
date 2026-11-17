import { useState } from 'react'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
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

it.each([
  { picker: 'seconds', expected: 5 },
  { picker: 'minutes', expected: 300 },
  { picker: 'hours', expected: 18000 },
])(
  'keeps leading-zero $picker input intact when the first digit is clamped',
  ({ picker, expected }) => {
    const onTimeChange = vi.fn()
    const { container } = render(<TimePicker value={0} min={1} onTimeChange={onTimeChange} />)
    const input = container.querySelector<HTMLInputElement>(`input[name=${picker}]`)!
    fireEvent.keyDown(input, { key: '0' })
    fireEvent.keyDown(input, { key: '5' })
    expect(input.value).toBe('05')
    expect(onTimeChange).toHaveBeenLastCalledWith(expected)
  }
)

it('still bounds the completed entry and allows the next two-digit entry', () => {
  const onTimeChange = vi.fn()
  const { container } = render(
    <TimePicker value={0} min={1} max={10} onTimeChange={onTimeChange} />
  )
  const input = container.querySelector<HTMLInputElement>('input[name=seconds]')!
  for (const key of ['9', '9']) fireEvent.keyDown(input, { key })
  expect(input.value).toBe('10')
  expect(onTimeChange).toHaveBeenLastCalledWith(10)
  for (const key of ['0', '5']) fireEvent.keyDown(input, { key })
  expect(input.value).toBe('05')
  expect(onTimeChange).toHaveBeenLastCalledWith(5)
})

it.each(['timeout', 'blur', 'arrow'])('starts a fresh numeric entry after %s', (boundary) => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  try {
    const onTimeChange = vi.fn()
    const { container } = render(<TimePicker value={0} min={1} onTimeChange={onTimeChange} />)
    const input = container.querySelector<HTMLInputElement>('input[name=seconds]')!
    fireEvent.keyDown(input, { key: '4' })
    if (boundary === 'timeout') act(() => vi.advanceTimersByTime(2001))
    if (boundary === 'blur') fireEvent.blur(input)
    if (boundary === 'arrow') fireEvent.keyDown(input, { key: 'ArrowUp' })
    fireEvent.keyDown(input, { key: '3' })
    expect(input.value).toBe('03')
    expect(onTimeChange).toHaveBeenLastCalledWith(3)
  } finally {
    cleanup()
    vi.useRealTimers()
  }
})
