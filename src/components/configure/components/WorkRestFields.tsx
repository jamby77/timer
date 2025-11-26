import type { WorkRestConfig } from '@/types/configure'

import { WorkRestMode } from '@/types/configure'

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface WorkRestFieldsProps {
  config: Partial<WorkRestConfig>
  onChange: (updates: Partial<WorkRestConfig>) => void
}

export const WorkRestFields = ({
  config: { fixedRestDuration, maxRounds, maxWorkTime, ratio, restMode },
  onChange,
}: WorkRestFieldsProps) => {
  return (
    <FieldGroup>
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
          <Input
            id="fixedRestDuration"
            name="fixedRestDuration"
            type="number"
            min="1"
            value={fixedRestDuration || ''}
            onChange={(e) => onChange({ fixedRestDuration: parseInt(e.target.value) || 0 })}
            placeholder="30"
            required
          />
        </Field>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="maxWorkTime">Maximum Work Time (seconds)</FieldLabel>
          <Input
            id="maxWorkTime"
            name="maxWorkTime"
            type="number"
            min="1"
            value={maxWorkTime || ''}
            onChange={(e) => onChange({ maxWorkTime: parseInt(e.target.value) || 0 })}
            placeholder="300"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="maxRounds">Maximum Rounds</FieldLabel>
          <Input
            id="maxRounds"
            name="maxRounds"
            type="number"
            min="1"
            value={maxRounds || ''}
            onChange={(e) => onChange({ maxRounds: parseInt(e.target.value) || 0 })}
            placeholder="10"
            required
          />
        </Field>
      </div>
    </FieldGroup>
  )
}
