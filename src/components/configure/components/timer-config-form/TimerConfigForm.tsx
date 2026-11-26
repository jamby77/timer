'use client'

import { useState } from 'react'
import { CircleX, PlayIcon, Save } from 'lucide-react'

import type { AnyTimerConfig, TimerConfigFormProps } from '@/types/configure'

import { createTimerDraft } from '@/lib/configure/new-timer'
import { validateTimerConfig } from '@/lib/configure/utils'
import { TIMER_TYPE_LABELS } from '@/lib/enums'
import { normalizeDraftRoundNames } from '@/lib/configure/round-names'
import { TimerConfigHash } from '@/lib/timer/TimerConfigHash'

import { Button } from '@/components/ui/button'
import { SetupBackButton } from '@/components/configure/components/shared/SetupBackButton'
import { FormErrors } from '@/components/configure/components'
import { CommonFields } from './CommonFields'

export const TimerConfigForm = ({
  type,
  initialConfig,
  isPredefined = false,
  onStartTimer,
  onSaveAsPredefined,
  onCancel,
}: TimerConfigFormProps) => {
  const [errors, setErrors] = useState<string[]>([])
  const [config, setConfig] = useState(() => initialConfig ?? createTimerDraft(type))

  const buildFullConfig = (config: Partial<AnyTimerConfig>): AnyTimerConfig => {
    const fullConfig = normalizeDraftRoundNames({
      ...config,
      type,
      createdAt: new Date(),
      lastUsed: new Date(),
    } as AnyTimerConfig)

    fullConfig.id = TimerConfigHash.generateTimerId(fullConfig)
    return fullConfig
  }

  const handleValidate = (config: Partial<AnyTimerConfig>) => {
    const fullConfig = buildFullConfig(config)
    const validationErrors = validateTimerConfig(fullConfig)
    return validationErrors.length > 0 ? validationErrors : undefined
  }

  const updateConfig = (updates: Partial<AnyTimerConfig>) => {
    setConfig((prev) => {
      const newConfig = { ...prev, ...updates } as AnyTimerConfig
      const errors = handleValidate(newConfig)
      setErrors(errors || [])

      return newConfig
    })
  }

  const handleSubmit = (config: Partial<AnyTimerConfig>) => {
    const fullConfig = buildFullConfig(config)
    const validationErrors = handleValidate(fullConfig)
    if (validationErrors) {
      setErrors(validationErrors)
      return
    }
    onStartTimer(fullConfig)
  }
  const handleSaveAsPreset = (config: Partial<AnyTimerConfig>) => {
    const fullConfig = buildFullConfig(config)
    const validationErrors = handleValidate(fullConfig)
    if (validationErrors) {
      setErrors(validationErrors)
      return
    }
    onSaveAsPredefined?.(fullConfig)
  }

  return (
    <div className="mx-auto h-full max-w-2xl overflow-hidden overflow-y-auto p-4">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <SetupBackButton onClick={onCancel} />
          <h2 className="text-foreground text-xl font-semibold">Configure {TIMER_TYPE_LABELS[type]} Timer</h2>
        </div>
        {isPredefined && (
          <p className="text-accent-foreground text-sm">
            Customizing a predefined style. Changes will not affect the original.
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(config)
        }}
        className="space-y-6"
      >
        <FormErrors errors={errors} />

        <CommonFields config={config} onChange={updateConfig} type={type} />

        <div className="flex flex-col justify-between gap-4 pt-4 md:flex-row max-sm:*:min-h-11">
          <Button disabled={errors.length > 0} variant="default" type="submit" size="lg">
            <PlayIcon />
            Start Timer
          </Button>
          {!!onSaveAsPredefined && (
            <Button
              disabled={errors.length > 0}
              type="button"
              variant="outline"
              onClick={() => handleSaveAsPreset(config)}
              size="lg"
            >
              <Save />
              Save as Preset
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={onCancel} size="lg">
            <CircleX />
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
