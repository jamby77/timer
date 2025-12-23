import type { WorkRestConfig } from '@/types/configure'

import { WorkRestMode } from '@/types/configure'

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
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
          <div className="flex items-center gap-2">
            <RadioGroupItem value={WorkRestMode.RATIO} id={WorkRestMode.RATIO} />
            <Label htmlFor={WorkRestMode.RATIO}>Ratio-based</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value={WorkRestMode.FIXED} id={WorkRestMode.FIXED} />
            <Label htmlFor={WorkRestMode.FIXED}>Fixed duration</Label>
          </div>
        </RadioGroup>
      </Field>

      {restMode !== WorkRestMode.FIXED && (
        <Field>
          <FieldLabel htmlFor="ratio">Work/Rest Ratio</FieldLabel>
          <div className="flex items-center justify-between gap-2">
            <Slider
              className="max-w-[90%]"
              id="ratio"
              name="ratio"
              min={0.1}
              max={10}
              step={0.1}
              defaultValue={[ratio || 0]}
              onValueChange={(value) => onChange({ ratio: value[0] })}
            />
            <span className="text-lg font-bold">{ratio || 0.0}</span>
          </div>
        </Field>
      )}
      {restMode === WorkRestMode.FIXED && (
        <Field>
          <FieldLabel htmlFor="fixedRestDuration">Rest time</FieldLabel>
          <TimePicker
            max={86400}
            min={1}
            value={fixedRestDuration || 0}
            onTimeChange={(seconds) => onChange({ fixedRestDuration: seconds })}
          />
        </Field>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="maxWorkTime">Time limit</FieldLabel>
          <TimePicker
            max={86400}
            min={1}
            value={maxWorkTime || 0}
            onTimeChange={(seconds) => onChange({ maxWorkTime: seconds })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="maxRounds">Max rounds</FieldLabel>
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
