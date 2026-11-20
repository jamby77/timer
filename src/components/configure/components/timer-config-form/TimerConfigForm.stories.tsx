import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { AnyTimerConfig, WorkRestMode } from '@/types/configure'
import { TimerType } from '@/lib/enums'

import { TimerConfigForm } from './TimerConfigForm'

const meta = preview.meta({
  component: TimerConfigForm,
  argTypes: {
    type: {
      control: 'select',
      options: [
        TimerType.COUNTDOWN,
        TimerType.STOPWATCH,
        TimerType.INTERVAL,
        TimerType.WORKREST,
        TimerType.COMPLEX,
      ],
    },
  },
  args: {
    onStartTimer: fn(),
    onSaveAsPredefined: fn(),
    isPredefined: false,
  },
})

export const Countdown = meta.story({
  args: {
    type: TimerType.COUNTDOWN,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain('Configure Countdown Timer')
    expect(canvasElement.textContent).toContain('Timer Name')
    expect(canvasElement.textContent).toContain('Duration')
    expect(canvasElement.textContent).toContain('Completion Message')
    expect(canvasElement.textContent).toContain('Start Timer')
    expect(canvasElement.textContent).toContain('Save as Preset')
  },
})

export const Interval = meta.story({
  args: {
    type: TimerType.INTERVAL,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain('Configure Interval Timer')
    expect(canvasElement.textContent).toContain('Work Duration')
    expect(canvasElement.textContent).toContain('Rest Duration')
    expect(canvasElement.textContent).toContain('Number of Intervals')
    expect(canvasElement.textContent).toContain('Work Label')
    expect(canvasElement.textContent).toContain('Rest Label')
    expect(canvasElement.textContent).toContain('Skip last rest period')
  },
})

export const Stopwatch = meta.story({
  args: {
    type: TimerType.STOPWATCH,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain('Configure Stopwatch Timer')
    expect(canvasElement.textContent).toContain('Time Limit (optional)')
    expect(canvasElement.textContent).toContain('Completion Message')
  },
})

export const WorkRestRatio = meta.story({
  args: {
    type: TimerType.WORKREST,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain('Configure Work/Rest Ratio Timer')
    expect(canvasElement.textContent).toContain('Rest Mode')
    expect(canvasElement.textContent).toContain('Work/Rest Ratio')
    expect(canvasElement.textContent).toContain('Time limit')
    expect(canvasElement.textContent).toContain('Max rounds')
  },
})

export const WorkRestFixed = meta.story({
  args: {
    type: TimerType.WORKREST,
    initialConfig: {
      id: 'fixed-rest-timer',
      name: 'Fixed Rest Timer',
      type: TimerType.WORKREST,
      restMode: WorkRestMode.FIXED,
      fixedRestDuration: 30,
      maxWorkTime: 300,
      maxRounds: 10,
      createdAt: new Date(),
      lastUsed: new Date(),
    },
  },
  play: async ({ canvas }) => {
    const title = canvas.getByRole('heading', { name: /configure work/i })
    const fixedRestLabel = canvas.getByText('Rest time')
    const ratioOption = canvas.queryByRole('option', { name: /work\/rest ratio/i })

    expect(title).toBeInTheDocument()
    expect(fixedRestLabel).toBeInTheDocument()
    expect(ratioOption).not.toBeInTheDocument()
  },
})

export const Complex = meta.story({
  args: {
    type: TimerType.COMPLEX,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain('Configure Complex Timer')
    expect(canvasElement.textContent).toContain('Timer Name')
    expect(canvasElement.textContent).toContain('Start Timer')
  },
})

export const PredefinedStyle = meta.story({
  args: {
    type: TimerType.INTERVAL,
    isPredefined: true,
    initialConfig: {
      id: 'tabata-config',
      name: 'Tabata',
      type: TimerType.INTERVAL,
      workDuration: 20,
      restDuration: 10,
      intervals: 8,
      workLabel: 'Work',
      restLabel: 'Rest',
      skipLastRest: true,
      createdAt: new Date(),
      lastUsed: new Date(),
    } as AnyTimerConfig,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain('Configure Interval Timer')
    expect(canvasElement.textContent).toContain('Customizing a predefined style')
  },
})

export const WithInitialData = meta.story({
  args: {
    type: TimerType.COUNTDOWN,
    initialConfig: {
      id: 'countdown-5min',
      name: '5 Minute Timer',
      type: TimerType.COUNTDOWN,
      duration: 300,
      completionMessage: 'Time is up!',
      createdAt: new Date(),
      lastUsed: new Date(),
    } as AnyTimerConfig,
  },
  play: async ({ canvas, canvasElement }) => {
    expect(canvas.getByLabelText(/Timer Name/)).toHaveValue('5 Minute Timer')
    expect(canvasElement.querySelector('input[name="minutes"]')).toHaveValue('05')
    expect(canvas.getByLabelText('Completion Message')).toHaveValue('Time is up!')
  },
})

export const Interactive = meta.story({
  args: { type: TimerType.INTERVAL },
  play: async ({ canvas, canvasElement, args }) => {
    await userEvent.clear(canvas.getByLabelText(/Timer Name/))
    await userEvent.type(canvas.getByLabelText(/Timer Name/), 'Custom Interval')
    await userEvent.type(canvasElement.querySelectorAll('input[name="seconds"]')[0], '45')
    await userEvent.type(canvasElement.querySelectorAll('input[name="seconds"]')[1], '10')
    await userEvent.type(canvas.getByLabelText('Number of Intervals'), '8')
    await userEvent.click(canvas.getByRole('button', { name: 'Start Timer' }))
    expect(args.onStartTimer).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Custom Interval',
        type: TimerType.INTERVAL,
        workDuration: 45,
        intervals: 8,
      })
    )
  },
})

export const FormValidation = meta.story({
  args: { type: TimerType.COUNTDOWN },
  play: async ({ canvas, args }) => {
    await userEvent.clear(canvas.getByLabelText(/Timer Name/))
    expect(canvas.getByText(/Timer name is required/)).toBeInTheDocument()
    expect(canvas.getByRole('button', { name: 'Start Timer' })).toBeDisabled()
    expect(args.onStartTimer).not.toHaveBeenCalled()
  },
})

export const ValidFormSubmission = meta.story({
  args: { type: TimerType.COUNTDOWN },
  play: async ({ canvas, canvasElement, args }) => {
    await userEvent.clear(canvas.getByLabelText(/Timer Name/))
    await userEvent.type(canvas.getByLabelText(/Timer Name/), 'Test Timer')
    await userEvent.type(canvasElement.querySelector('input[name="minutes"]')!, '5')
    await userEvent.click(canvas.getByRole('button', { name: 'Start Timer' }))
    expect(args.onStartTimer).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Timer',
        type: TimerType.COUNTDOWN,
        duration: 300,
        createdAt: expect.anything(),
        lastUsed: expect.anything(),
      })
    )
  },
})

export const SaveAsPredefined = meta.story({
  args: { type: TimerType.COUNTDOWN },
  play: async ({ canvas, canvasElement, args }) => {
    await userEvent.clear(canvas.getByLabelText(/Timer Name/))
    await userEvent.type(canvas.getByLabelText(/Timer Name/), 'Custom Timer')
    await userEvent.type(canvasElement.querySelector('input[name="minutes"]')!, '5')
    await userEvent.click(canvas.getByRole('button', { name: 'Save as Preset' }))
    expect(args.onSaveAsPredefined).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Custom Timer',
        type: TimerType.COUNTDOWN,
        duration: 300,
      })
    )
    expect(args.onStartTimer).not.toHaveBeenCalled()
  },
})

export const WorkRestModeToggle = meta.story({
  args: { type: TimerType.WORKREST },
  play: async ({ canvas }) => {
    expect(canvas.getByRole('radio', { name: 'Ratio-based' })).toBeChecked()
    await userEvent.click(canvas.getByRole('radio', { name: 'Fixed rest' }))
    expect(canvas.getByRole('radio', { name: 'Fixed rest' })).toBeChecked()
    expect(canvas.getByText('Rest time')).toBeInTheDocument()
    expect(canvas.queryByText('Work/Rest Ratio', { exact: true })).not.toBeInTheDocument()
    await userEvent.click(canvas.getByRole('radio', { name: 'Ratio-based' }))
    expect(canvas.getByText('Work/Rest Ratio', { exact: true })).toBeInTheDocument()
    expect(canvas.queryByText('Rest time')).not.toBeInTheDocument()
  },
})

export const IntervalFieldValidation = meta.story({
  args: {
    type: TimerType.INTERVAL,
    initialConfig: {
      id: 'invalid-interval',
      name: 'Interval validation',
      type: TimerType.INTERVAL,
      workDuration: 0,
      restDuration: 0,
      intervals: 8,
    },
  },
  play: async ({ canvas, canvasElement, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Start Timer' }))
    expect(canvas.getByText(/Work duration must be greater than 0/)).toBeInTheDocument()
    expect(canvas.getByRole('button', { name: 'Start Timer' })).toBeDisabled()
    expect(args.onStartTimer).not.toHaveBeenCalled()
    const seconds = canvasElement.querySelector('input[name="seconds"]')!
    await userEvent.type(seconds, '0')
    expect(seconds).toHaveValue('01')
    expect(canvas.queryByText(/Work duration must be greater than 0/)).not.toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: 'Start Timer' }))
    expect(args.onStartTimer).toHaveBeenCalledWith(expect.objectContaining({ workDuration: 1 }))
  },
})
