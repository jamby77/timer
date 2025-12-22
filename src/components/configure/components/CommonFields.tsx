import { useCallback } from 'react'

import type {
  AnyTimerConfig,
  CountdownConfig,
  IntervalConfig,
  StopwatchConfig,
  WorkRestConfig,
} from '@/types/configure'

import { TimerType } from '@/types/configure'
import { generateTimerName } from '@/lib/configure/utils'

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { CountdownFields } from './CountdownFields'
import { CountdownSelector } from './CountdownSelector'
import { IntervalFields } from './IntervalFields'
import { StopwatchFields } from './StopwatchFields'
import { WorkRestFields } from './WorkRestFields'

interface CommonFieldsProps {
  config: Partial<AnyTimerConfig>
  onChange: (updates: Partial<AnyTimerConfig>) => void
  type: TimerType
}

export const CommonFields = ({ config, onChange, type }: CommonFieldsProps) => {
  const handleConfigChange = useCallback(
    (updates: Partial<AnyTimerConfig>) => {
      const newConfig = { ...config, ...updates }
      // Auto-generate name if it's currently a generated name or empty
      const currentName = config.name || ''
      const generatedName = generateTimerName({ ...config, type } as AnyTimerConfig)
      const shouldUpdateName = !currentName || currentName === generatedName
      if (
        shouldUpdateName &&
        (updates.type || Object.keys(updates).some((key) => key !== 'name'))
      ) {
        const finalConfig = { ...newConfig, type: newConfig.type || type }
        newConfig.name = generateTimerName(finalConfig as AnyTimerConfig)
      }
      // Use any to bypass type checking issues with the onChange callback
      onChange(newConfig as any)
    },
    [onChange, config, type]
  )
  const renderFormFields = () => {
    switch (type) {
      case TimerType.COUNTDOWN:
        return <CountdownFields config={config as CountdownConfig} onChange={handleConfigChange} />
      case TimerType.STOPWATCH:
        return <StopwatchFields config={config as StopwatchConfig} onChange={handleConfigChange} />
      case TimerType.INTERVAL:
        return <IntervalFields config={config as IntervalConfig} onChange={handleConfigChange} />
      case TimerType.WORKREST:
        return <WorkRestFields config={config as WorkRestConfig} onChange={handleConfigChange} />
      default:
        return null
    }
  }

  return (
    <FieldGroup>
      {/* Timer Name */}
      <Field>
        <FieldLabel htmlFor="timerName">Timer Name*</FieldLabel>
        <Input
          id="timerName"
          name="timerName"
          type="text"
          value={config.name || ''}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Enter timer name"
          required
        />
      </Field>
      {/* Type-specific fields */}
      {renderFormFields()}
      <FieldGroup>
        <Field orientation="vertical">
          <FieldLabel htmlFor="countdownBeforeStart">Countdown</FieldLabel>
          <div className="max-w-48">
            <CountdownSelector
              countdown={config.countdownBeforeStart}
              onChange={(e) => {
                const next = parseInt(e.target.value, 10)
                onChange({ countdownBeforeStart: next > 0 ? next : undefined })
              }}
            />
          </div>
        </Field>

        <Field orientation="horizontal">
          <Switch
            id="sound-enabled"
            checked={config.sound?.enabled ?? false}
            onCheckedChange={(checked) =>
              onChange({
                sound: {
                  ...(config.sound ?? {
                    enabled: false,
                    volume: 0.7,
                  }),
                  enabled: Boolean(checked),
                  volume: config.sound?.volume ?? 0.7,
                },
              })
            }
          />
          <FieldContent>
            <FieldLabel htmlFor="sound-enabled">Sounds</FieldLabel>
            <FieldDescription>Enable audio cues for countdown and transitions</FieldDescription>
          </FieldContent>
        </Field>

        {/* Completion Message */}
        <Field>
          <FieldLabel htmlFor="completionMessage">Completion Message</FieldLabel>
          <Input
            id="completionMessage"
            name="completionMessage"
            type="text"
            value={config.completionMessage || 'Time is up!'}
            onChange={(e) => onChange({ completionMessage: e.target.value })}
            placeholder="Time is up!"
          />
        </Field>
      </FieldGroup>
    </FieldGroup>
  )
}
