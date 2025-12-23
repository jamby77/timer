import type { IntervalConfig } from '@/types/configure'

import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { TimePicker } from '@/components/configure/components/shared/TimePicker'

interface IntervalFieldsProps {
  config: Partial<IntervalConfig>
  onChange: (updates: Partial<IntervalConfig>) => void
}

export const IntervalFields = ({ config, onChange }: IntervalFieldsProps) => {
  const workPlaceholder = 'Work'
  const restPlaceholder = 'Rest'
  return (
    <FieldGroup>
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="workDuration">Work Duration</FieldLabel>
          <TimePicker
            min={1}
            value={config.workDuration || 0}
            onTimeChange={(seconds) => onChange({ workDuration: seconds })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="restDuration">Rest Duration</FieldLabel>
          <TimePicker
            min={0}
            value={config.restDuration || 0}
            onTimeChange={(seconds) => onChange({ restDuration: seconds })}
          />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="intervals">Number of Intervals</FieldLabel>
        <Input
          id="intervals"
          name="intervals"
          type="number"
          min="1"
          max="1000"
          value={config.intervals || ''}
          onChange={(e) => onChange({ intervals: parseInt(e.target.value) || 0 })}
          placeholder="8"
          required
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="workLabel">Work Label</FieldLabel>
          <Input
            id="workLabel"
            name="workLabel"
            type="text"
            value={config.workLabel || workPlaceholder}
            onChange={(e) => onChange({ workLabel: e.target.value })}
            placeholder={workPlaceholder}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="restLabel">Rest Label</FieldLabel>
          <Input
            id="restLabel"
            name="restLabel"
            type="text"
            value={config.restLabel || restPlaceholder}
            onChange={(e) => onChange({ restLabel: e.target.value })}
            placeholder={restPlaceholder}
          />
        </Field>
      </div>
      <FieldGroup>
        <Field orientation="horizontal">
          <Checkbox
            id="skipLastRest"
            name="skipLastRest"
            checked={config.skipLastRest || false}
            onCheckedChange={(state) => {
              // Treat indeterminate as false
              onChange({ skipLastRest: state === true })
            }}
          />
          <FieldLabel htmlFor="skipLastRest">Skip last rest period</FieldLabel>
        </Field>
      </FieldGroup>
    </FieldGroup>
  )
}
