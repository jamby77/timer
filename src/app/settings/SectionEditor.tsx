import { useEffect, useRef, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { ZodError } from 'zod'

import type { FormEvent } from 'react'
import type { DefaultsFields } from '@/lib/configure/defaults'
import type { WorkRestConfig } from '@/types/configure'
import type { SettingsSection } from './sections'

import { TimerType } from '@/types/configure'
import { readDefaults, saveDefaults } from '@/lib/configure/defaults'
import { normalizeRoundNames } from '@/lib/configure/round-names'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import {
  CountdownFields,
  CountdownSelector,
  IntervalFields,
  StopwatchFields,
  WorkRestFields,
} from '@/components/configure/components'
import { SwitchField } from '@/components/configure/components/shared/SwitchField'
import { TimePicker } from '@/components/configure/components/shared/TimePicker'
import { phaseTypes, typeLabel } from './sections'
import { SoundDefaults } from './SoundDefaults'

export function SectionEditor({
  section,
  onClose,
}: {
  section: SettingsSection
  onClose: (saved: boolean) => void
}) {
  const [values, setValues] = useState(() => readDefaults(section.key))
  const [error, setError] = useState('')
  const titleRef = useRef<HTMLHeadingElement>(null)
  const isPreset = section.key.startsWith('preset:')
  const isPhase = section.key.startsWith('phase:')
  const isTimer = section.key.startsWith('timer:')

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  function change(updates: DefaultsFields) {
    setError('')
    setValues((current) => ({ ...current, ...updates }))
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const draft = { ...values }
    if (section.type) draft.name = draft.name?.trim() || ''
    if (section.type === TimerType.INTERVAL) {
      draft.roundNames = normalizeRoundNames(draft.roundNames, draft.intervals ?? 0) ?? []
    }
    try {
      saveDefaults(section.key, draft)
    } catch (cause) {
      setError(
        cause instanceof ZodError
          ? cause.issues.map((issue) => issue.message).join('. ')
          : 'Could not save these defaults on this device. Your edits are still here.'
      )
      return
    }
    onClose(true)
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 pt-4 pb-8">
      <button
        type="button"
        aria-label="Back to Settings"
        onClick={() => onClose(false)}
        className="text-muted-foreground hover:text-foreground mb-1 inline-flex min-h-11 items-center gap-1 text-sm"
      >
        <ChevronLeft aria-hidden="true" className="size-4" /> Settings
      </button>
      <h1
        ref={titleRef}
        tabIndex={-1}
        className="mb-4 text-2xl font-bold tracking-tight outline-none"
      >
        {section.title}
      </h1>
      <form onSubmit={save} className="grid gap-4">
        {section.key === 'sound' && values.sound && (
          <SoundDefaults sound={values.sound} onChange={(sound) => change({ sound })} />
        )}
        {section.key === 'new-phase' && (
          <Field>
            <FieldLabel htmlFor="phase-type">Phase type</FieldLabel>
            <NativeSelect
              id="phase-type"
              className="min-h-11"
              value={values.phaseType}
              onChange={(event) =>
                change({ phaseType: phaseTypes.find((type) => type === event.target.value) })
              }
            >
              {phaseTypes.map((type) => (
                <option key={type} value={type}>
                  {typeLabel(type)}
                </option>
              ))}
            </NativeSelect>
          </Field>
        )}
        {section.type && (
          <Field>
            <FieldLabel htmlFor="default-name">{isPhase ? 'Phase name' : 'Timer name'}</FieldLabel>
            <Input
              id="default-name"
              className="min-h-11"
              value={values.name ?? ''}
              placeholder="Automatic"
              onChange={(event) => change({ name: event.target.value })}
            />
          </Field>
        )}
        {section.type === TimerType.COUNTDOWN && (
          <CountdownFields config={values} onChange={change} allowUnset={isTimer} />
        )}
        {section.type === TimerType.STOPWATCH && (
          <StopwatchFields config={values} onChange={change} />
        )}
        {section.type === TimerType.INTERVAL && (
          <IntervalFields config={values} onChange={change} allowUnset={isTimer} />
        )}
        {section.type === TimerType.WORKREST && (
          <WorkRestFields
            config={values as Partial<WorkRestConfig>}
            allowUnset={isTimer}
            onChange={change}
          />
        )}
        {section.type === TimerType.COMPLEX && (
          <>
            <SwitchField
              title="Auto-advance phases"
              description="Start the next phase when the current phase finishes."
              checked={values.autoAdvance ?? true}
              onCheckedChange={(autoAdvance) => change({ autoAdvance })}
            />
            <Field>
              <FieldLabel htmlFor="overall-limit">Overall time limit</FieldLabel>
              <TimePicker
                secondsInputId="overall-limit"
                min={0}
                clearLabel="Clear overall time limit"
                value={values.overallTimeLimit}
                onTimeChange={(seconds) => change({ overallTimeLimit: seconds || undefined })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="repeat-count">New repeat group repetitions</FieldLabel>
              <Input
                id="repeat-count"
                className="min-h-11"
                type="number"
                min={2}
                max={100}
                step={1}
                required
                value={values.repeatCount ?? ''}
                onChange={(event) =>
                  change({
                    repeatCount: event.target.value ? Number(event.target.value) : undefined,
                  })
                }
              />
            </Field>
          </>
        )}
        {(section.key === 'general' || isPreset) && (
          <Field>
            <FieldLabel htmlFor="countdownBeforeStart">Pre-start countdown</FieldLabel>
            <CountdownSelector
              countdown={values.countdownBeforeStart}
              onChange={(event) => change({ countdownBeforeStart: Number(event.target.value) })}
            />
          </Field>
        )}
        {section.key === 'general' && (
          <Field>
            <FieldLabel htmlFor="completion-message">Completion message</FieldLabel>
            <Input
              id="completion-message"
              className="min-h-11"
              value={values.completionMessage ?? ''}
              onChange={(event) => change({ completionMessage: event.target.value })}
            />
          </Field>
        )}
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
        <Button type="submit" className="min-h-11">
          Save
        </Button>
      </form>
    </div>
  )
}
