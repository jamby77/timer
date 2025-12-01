import type {
  AnyTimerConfig,
  CountdownConfig,
  IntervalConfig,
  StopwatchConfig,
  WorkRestConfig,
} from '@/types/configure'

import { TimerType } from '@/types/configure'
import { generateTimerName } from '@/lib/configure/utils'

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { CountdownFields } from './CountdownFields'
import { IntervalFields } from './IntervalFields'
import { StopwatchFields } from './StopwatchFields'
import { WorkRestFields } from './WorkRestFields'

interface CommonFieldsProps {
  config: Partial<AnyTimerConfig>
  onChange: (updates: Partial<AnyTimerConfig>) => void
  type: TimerType
}

export const CommonFields = ({ config, onChange, type }: CommonFieldsProps) => {
  const handleConfigChange = (updates: Partial<AnyTimerConfig>) => {
    const newConfig = { ...config, ...updates }
    // Auto-generate name if it's currently a generated name or empty
    const currentName = config.name || ''
    const generatedName = generateTimerName({ ...config, type } as AnyTimerConfig)
    const shouldUpdateName = !currentName || currentName === generatedName
    if (shouldUpdateName && (updates.type || Object.keys(updates).some((key) => key !== 'name'))) {
      const finalConfig = { ...newConfig, type: newConfig.type || type }
      newConfig.name = generateTimerName(finalConfig as AnyTimerConfig)
    }
    // Use any to bypass type checking issues with the onChange callback
    onChange(newConfig as any)
  }

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
      {/* Type-specific fields */}
      {renderFormFields()}
      <FieldGroup>
        {/* Completion Message */}
        <Field>
          <FieldLabel htmlFor="completionMessage">Completion Message (optional)</FieldLabel>
          <Input
            id="completionMessage"
            name="completionMessage"
            type="text"
            value={config.completionMessage || 'Time is up!'}
            onChange={(e) => onChange({ completionMessage: e.target.value })}
            placeholder="Time is up!"
          />
        </Field>

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
      </FieldGroup>
    </FieldGroup>
  )
}
