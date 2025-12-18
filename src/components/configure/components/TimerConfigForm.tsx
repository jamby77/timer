'use client'

import { useCallback } from 'react'
import { useForm } from '@tanstack/react-form'

import type { SyntheticEvent } from 'react'
import type { AnyTimerConfig, TimerConfigFormProps } from '@/types/configure'

import { TimerType } from '@/types/configure'
import { validateTimerConfig } from '@/lib/configure/utils'
import { TIMER_TYPE_LABELS } from '@/lib/enums'
import { TimerConfigHash } from '@/lib/timer/TimerConfigHash'

import { CommonFields } from './CommonFields'
import { FormActions } from './FormActions'
import { FormErrors } from './FormErrors'

function getName(type: TimerType) {
  return type === TimerType.COUNTDOWN
    ? 'Countdown'
    : type === TimerType.STOPWATCH
      ? 'Stopwatch'
      : type === TimerType.INTERVAL
        ? 'Interval'
        : type === TimerType.WORKREST
          ? 'Work/Rest'
          : type === TimerType.COMPLEX
            ? 'Complex Timer (0 phases, 0s)'
            : 'Timer'
}

export const TimerConfigForm = ({
  type,
  initialConfig,
  isPredefined = false,
  onStartTimer,
  onSaveAsPredefined,
  onSave,
}: TimerConfigFormProps) => {
  const initialDraft: Partial<AnyTimerConfig> = initialConfig || {
    type,
    name: getName(type),
  }

  const buildFullConfig = useCallback(
    (draft: Partial<AnyTimerConfig>): AnyTimerConfig => {
      const fullConfig = {
        ...draft,
        type,
        createdAt: new Date(),
        lastUsed: new Date(),
      } as AnyTimerConfig

      fullConfig.id = TimerConfigHash.generateTimerId(fullConfig)
      return fullConfig
    },
    [type]
  )

  const form = useForm({
    defaultValues: {
      draft: initialDraft,
    },
    validators: {
      onSubmit: ({ value }) => {
        const fullConfig = buildFullConfig(value.draft)
        const validationErrors = validateTimerConfig(fullConfig)
        return validationErrors.length > 0 ? validationErrors : undefined
      },
    },
    onSubmit: ({ value }) => {
      const fullConfig = buildFullConfig(value.draft)
      onStartTimer(fullConfig)
    },
  })

  const handleSubmit = useCallback(
    (e?: SyntheticEvent) => {
      e?.preventDefault()
      void form.handleSubmit()
    },
    [form]
  )

  const updateConfig = useCallback(
    (updates: Partial<AnyTimerConfig>) => {
      form.setFieldValue('draft', (prev) => ({ ...prev, ...updates }) as Partial<AnyTimerConfig>)
      form.setErrorMap({ onSubmit: undefined } as any)
    },
    [form]
  )

  return (
    <div className="mx-auto h-full max-w-2xl overflow-hidden overflow-y-auto p-4">
      <div className="mb-6">
        <h2 className="text-foreground mb-2 text-xl font-semibold">
          Configure {TIMER_TYPE_LABELS[type]} Timer
        </h2>
        {isPredefined && (
          <p className="text-accent-foreground text-sm">
            Customizing a predefined style. Changes will not affect the original.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <form.Subscribe
          selector={(state) => state.errorMap.onSubmit}
          children={(onSubmitError) => {
            const errors = Array.isArray(onSubmitError)
              ? (onSubmitError as string[])
              : onSubmitError
                ? [String(onSubmitError)]
                : []

            return <FormErrors errors={errors} />
          }}
        />

        <form.Subscribe
          selector={(state) => state.values.draft}
          children={(config) => (
            <CommonFields config={config} onChange={updateConfig} type={type} />
          )}
        />

        <FormActions
          enableSaveAsPredefined={isPredefined && !!onSaveAsPredefined}
          enableSave={!!onSave}
          onHandleSave={handleSubmit}
        />
      </form>
    </div>
  )
}
