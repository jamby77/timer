import React, { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import type { ComplexConfig } from '@/types/configure'

import { TimerType } from '@/types/configure'

import { ComplexFieldsForm } from './ComplexFieldsForm'

const ComplexFieldsHarness = () => {
  const [config, setConfig] = useState<Partial<ComplexConfig>>({
    type: TimerType.COMPLEX,
    name: 'Complex Timer',
    phases: [],
    autoAdvance: true,
  })

  return (
    <div className="w-180 max-w-full">
      <ComplexFieldsForm
        config={config}
        onChange={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
      />
    </div>
  )
}

const meta = preview.meta({ component: ComplexFieldsForm })

export const AddAndEditPhase = meta.story({
  render: () => <ComplexFieldsHarness />,
  play: async ({ canvas, step }) => {
    const portal = within(document.body)

    const waitForEditButtonsCount = async (count: number) => {
      const timeoutMs = 2000
      const start = Date.now()
      while (Date.now() - start < timeoutMs) {
        const buttons = canvas.queryAllByLabelText(/edit phase/i)
        if (buttons.length === count) return buttons
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
      throw new Error(`Timed out waiting for ${count} edit buttons`)
    }

    await step('open add phase dialog (0 phases)', async () => {
      const addPhaseButton = canvas.getByRole('button', { name: /add phase/i })
      await userEvent.click(addPhaseButton)

      expect(await portal.findByRole('heading', { name: /add phase/i })).toBeInTheDocument()
      expect(portal.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      expect(portal.getByRole('button', { name: /^add$/i })).toBeInTheDocument()
      expect(portal.queryByRole('button', { name: /add at the start/i })).not.toBeInTheDocument()
      expect(portal.queryByRole('button', { name: /add at the end/i })).not.toBeInTheDocument()
    })

    await step('add first phase', async () => {
      await userEvent.click(portal.getByRole('button', { name: /^add$/i }))

      await waitForEditButtonsCount(1)
      expect(canvas.queryByText(/no phases added yet/i)).not.toBeInTheDocument()
    })

    await step('edit phase name and save', async () => {
      await userEvent.click(canvas.getByLabelText(/edit phase/i))

      expect(await portal.findByRole('heading', { name: /edit phase/i })).toBeInTheDocument()
      const nameInput = portal.getByLabelText(/phase name/i) as HTMLInputElement
      await userEvent.clear(nameInput)
      await userEvent.type(nameInput, 'Warm Up')
      expect(nameInput).toHaveValue('Warm Up')
      await userEvent.type(nameInput, '{enter}')
      expect(portal.getByRole('heading', { name: /edit phase/i })).toBeInTheDocument()

      await userEvent.click(portal.getByRole('button', { name: /^save$/i }))

      expect(await canvas.findByText('Warm Up')).toBeInTheDocument()
    })

    await step('edit phase type and duration, then reopen saved values', async () => {
      await userEvent.click(canvas.getByLabelText(/edit phase/i))
      await userEvent.click(portal.getByRole('combobox', { name: 'Phase type' }))
      await userEvent.click(portal.getByRole('option', { name: 'Interval' }))
      await waitFor(() => expect(document.body).not.toHaveStyle({ pointerEvents: 'none' }))
      expect(portal.getByText('Number of Intervals')).toBeInTheDocument()
      const rounds = portal.getByLabelText('Number of Intervals')
      await userEvent.clear(rounds)
      await userEvent.type(rounds, '6')
      expect(rounds).toHaveValue(6)
      await userEvent.click(portal.getByRole('button', { name: /^save$/i }))
      await userEvent.click(canvas.getByLabelText(/edit phase/i))
      expect(await portal.findByLabelText('Number of Intervals')).toHaveValue(6)
      await userEvent.clear(portal.getByLabelText(/phase name/i))
      await userEvent.type(portal.getByLabelText(/phase name/i), 'Discard this edit')
      await userEvent.click(portal.getByRole('button', { name: /cancel/i }))
      expect(canvas.queryByText('Discard this edit')).not.toBeInTheDocument()
      await userEvent.click(canvas.getByLabelText(/edit phase/i))
      expect(portal.getByLabelText(/phase name/i)).not.toHaveValue('Discard this edit')
      await userEvent.click(portal.getByRole('button', { name: /cancel/i }))
    })

    await step('open add phase dialog (>0 phases)', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /add phase/i }))

      expect(await portal.findByRole('heading', { name: /add phase/i })).toBeInTheDocument()
      expect(portal.getByRole('button', { name: /add at the start/i })).toBeInTheDocument()
      expect(portal.getByRole('button', { name: /add at the end/i })).toBeInTheDocument()
    })

    await step('add second phase at end', async () => {
      await userEvent.click(portal.getByRole('button', { name: /add at the end/i }))
      await waitForEditButtonsCount(2)
    })
  },
})
