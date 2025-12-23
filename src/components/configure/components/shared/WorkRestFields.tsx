import type { WorkRestConfig } from '@/types/configure'

import { WorkRestMode } from '@/types/configure'

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { TimePicker } from '@/components/configure/components/shared/TimePicker'

interface WorkRestFieldsProps {
  config: Partial<WorkRestConfig>
  onChange: (updates: Partial<WorkRestConfig>) => void
}

export const WorkRestFields = ({
  config: { fixedRestDuration, maxRounds, maxWorkTime, ratio, restMode },
  onChange,
}: WorkRestFieldsProps) => {
  return (
    <FieldGroup className="px-1">
      <Field>
        <FieldLabel htmlFor="restMode">Rest Mode</FieldLabel>
        <RadioGroup
          defaultValue={restMode || WorkRestMode.RATIO}
          onValueChange={(value) => onChange({ restMode: value as WorkRestMode })}
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value={WorkRestMode.RATIO} id={WorkRestMode.RATIO} />
            <Label htmlFor={WorkRestMode.RATIO}>Ratio-based</Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value={WorkRestMode.FIXED} id={WorkRestMode.FIXED} />
            <Label htmlFor={WorkRestMode.FIXED}>Fixed duration</Label>
          </div>
        </RadioGroup>
      </Field>

      {(restMode === WorkRestMode.RATIO || restMode === undefined) && (
        <Field>
          <FieldLabel htmlFor="ratio">Work/Rest Ratio</FieldLabel>
          <Input
            id="ratio"
            name="ratio"
            type="number"
            min="0.1"
            max="10"
            step="0.1"
            value={ratio || ''}
            onChange={(e) => onChange({ ratio: parseFloat(e.target.value) || 0 })}
            placeholder="2.0"
            required
          />
        </Field>
      )}
      {restMode === WorkRestMode.FIXED && (
        <Field>
          <FieldLabel htmlFor="fixedRestDuration">Fixed Rest Duration (seconds)</FieldLabel>
          <TimePicker
            max={86400}
            min={1}
            initialSeconds={fixedRestDuration || 0}
            onTimeChange={(seconds) => onChange({ fixedRestDuration: seconds })}
          />
        </Field>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="maxWorkTime">Work Time Limit</FieldLabel>
          <TimePicker
            max={86400}
            min={1}
            initialSeconds={maxWorkTime || 0}
            onTimeChange={(seconds) => onChange({ maxWorkTime: seconds })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="maxRounds">Maximum Rounds</FieldLabel>
          <NativeSelect
            id="maxRounds"
            name="maxRounds"
            onChange={(e) => onChange({ maxRounds: parseInt(e.target.value) || 0 })}
          >
            <NativeSelectOption value={maxRounds || ''}>Select rounds</NativeSelectOption>
            {[...Array(100)].map((_, i) => (
              <NativeSelectOption key={i + 1} value={i + 1}>
                {i + 1}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
      </div>
    </FieldGroup>
  )
}
