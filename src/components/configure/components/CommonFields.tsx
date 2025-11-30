import type {
  AnyTimerConfig,
  CountdownConfig,
  IntervalConfig,
  StopwatchConfig,
  WorkRestConfig,
} from '@/types/configure'

import { TimerType } from '@/types/configure'

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ComplexFields } from './ComplexFields'
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
  const renderFormFields = () => {
    switch (type) {
      case TimerType.COUNTDOWN:
        return <CountdownFields config={config as CountdownConfig} onChange={onChange} />
      case TimerType.STOPWATCH:
        return <StopwatchFields config={config as StopwatchConfig} onChange={onChange} />
      case TimerType.INTERVAL:
        return <IntervalFields config={config as IntervalConfig} onChange={onChange} />
      case TimerType.WORKREST:
        return <WorkRestFields config={config as WorkRestConfig} onChange={onChange} />
      case TimerType.COMPLEX:
        return <ComplexFields config={config} onChange={onChange} />
      default:
        return null
    }
  }

  return (
    <FieldGroup>
      {/* Timer Name */}
      <Field>
        <FieldLabel htmlFor="duration">Timer Name</FieldLabel>
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
    </FieldGroup>
  )
}
