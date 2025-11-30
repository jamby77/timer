'use client'

import { useState } from 'react'

import type { AnyTimerConfig, TimerConfigFormProps } from '@/types/configure'

import { validateTimerConfig } from '@/lib/configure/utils'
import { TIMER_TYPE_LABELS } from '@/lib/enums'

import { CardContainer } from '@/components/ui'
import { CommonFields } from './CommonFields'
import { FormActions } from './FormActions'
import { FormErrors } from './FormErrors'

export const TimerConfigForm = ({
  type,
  initialConfig,
  isPredefined = false,
  onStartTimer,
  onSaveAsPredefined,
  onSave,
}: TimerConfigFormProps) => {
  const [config, setConfig] = useState<Partial<AnyTimerConfig>>(
    initialConfig || {
      type,
      name: '',
    }
  )

  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const fullConfig = {
      ...config,
      type,
      createdAt: new Date(),
      lastUsed: new Date(),
    } as AnyTimerConfig

    const validationErrors = validateTimerConfig(fullConfig)

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors([])
    onStartTimer(fullConfig)
  }

  const handleSave = () => {
    if (!config.name) {
      setErrors(['Timer name is required for saving'])
      return
    }

    const fullConfig = {
      ...config,
      type,
      id: config.id || generateId(),
      createdAt: new Date(),
      lastUsed: new Date(),
    } as AnyTimerConfig

    const validationErrors = validateTimerConfig(fullConfig)

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors([])

    if (onSaveAsPredefined && !isPredefined) {
      onSaveAsPredefined(fullConfig)
    } else if (onSave) {
      onSave(fullConfig)
    }
  }

  const updateConfig = (updates: Partial<AnyTimerConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }) as AnyTimerConfig)
    setErrors([])
  }

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

      <FormErrors errors={errors} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <CommonFields config={config} onChange={updateConfig} type={type} />

        <FormActions
          isPredefined={isPredefined}
          onSaveAsPredefined={onSaveAsPredefined}
          onSave={onSave}
          onHandleSave={handleSave}
        />
      </form>
    </div>
  )
}

// Helper function to generate ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9)
}
