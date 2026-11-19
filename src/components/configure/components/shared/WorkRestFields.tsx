import { useId, useRef } from 'react'

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
  config: { fixedRestDuration, maxRounds, maxWorkTime, ratio = 1, restMode = WorkRestMode.RATIO },
  onChange,
}: WorkRestFieldsProps) => {
  const modeId = useId()
  const previousRatio = useRef(ratio)
  const previousFixedDuration = useRef(fixedRestDuration)

  const changeMode = (mode: string) => {
    if (mode === WorkRestMode.FIXED) {
      previousRatio.current = ratio
      onChange({ restMode: WorkRestMode.FIXED, ratio: undefined, fixedRestDuration: previousFixedDuration.current })
    } else {
      previousFixedDuration.current = fixedRestDuration
      onChange({ restMode: WorkRestMode.RATIO, ratio: previousRatio.current, fixedRestDuration: undefined })
    }
  }

  return (
    <FieldGroup className="px-1">
      <Field>
        <FieldLabel asChild>
          <span id={modeId}>Rest Mode</span>
        </FieldLabel>
        <RadioGroup
          aria-labelledby={modeId}
          className="max-sm:grid-cols-2 max-sm:gap-2"
          value={restMode}
          onValueChange={changeMode}
        >
          {([WorkRestMode.RATIO, WorkRestMode.FIXED] as const).map((mode) => (
            <Label
              key={mode}
              htmlFor={`${modeId}-${mode}`}
              className="cursor-pointer max-sm:min-h-11 max-sm:rounded-md max-sm:border max-sm:px-3 max-sm:has-[[aria-checked=true]]:border-primary max-sm:has-[[aria-checked=true]]:bg-accent"
            >
              <RadioGroupItem id={`${modeId}-${mode}`} value={mode} />
              {mode === WorkRestMode.RATIO ? 'Ratio-based' : 'Fixed rest'}
            </Label>
          ))}
        </RadioGroup>
      </Field>

      {restMode === WorkRestMode.RATIO && (
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
              value={[ratio]}
              onValueChange={(value) => onChange({ ratio: value[0] })}
            />
            <span className="text-lg font-bold">{ratio}</span>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="maxWorkTime">Time limit</FieldLabel>
          <TimePicker
            max={86400}
            min={0}
            value={maxWorkTime || 0}
            onTimeChange={(seconds) => onChange({ maxWorkTime: seconds > 0 ? seconds : undefined })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="maxRounds">Max rounds</FieldLabel>
          <NativeSelect
            id="maxRounds"
            name="maxRounds"
            value={maxRounds || ''}
            onChange={(e) => onChange({ maxRounds: parseInt(e.target.value) || 0 })}
          >
            <NativeSelectOption value="">Select rounds</NativeSelectOption>
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
