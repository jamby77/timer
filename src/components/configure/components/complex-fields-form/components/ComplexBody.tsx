import { AnyTimerConfig } from '@/types/configure'
import { generateTimerName } from '@/lib/configure/utils'
import { TIMER_TYPE_LABELS, TimerType } from '@/lib/enums'

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhaseTimerConfig } from './complex-phase-utils'
import ComplexFields from './ComplexFields'

type ComplexBodyProps = {
  type: TimerType
  config: AnyTimerConfig
  name: string
  onNameChange: (name: string) => void
  onTypeChange: (type: TimerType) => void
  onConfigChange: (updates: Partial<PhaseTimerConfig>) => void
}

export const ComplexBody = ({
  type,
  config,
  name,
  onNameChange,
  onTypeChange,
  onConfigChange,
}: ComplexBodyProps) => {
  const generatedName = generateTimerName(config)
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="phase-name">Phase name</FieldLabel>
        <Input
          id="phase-name"
          className="max-sm:min-h-11"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={generatedName}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="phase-type">Phase type</FieldLabel>
        <Select value={type} onValueChange={(value) => onTypeChange(value as TimerType)}>
          <SelectTrigger id="phase-type" className="max-sm:min-h-11 max-sm:text-base">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TIMER_TYPE_LABELS)
              .filter(([type]) => type !== 'COMPLEX')
              .map(([type, label]) => (
                <SelectItem key={type} value={type} className="max-sm:min-h-11 max-sm:text-base">
                  {label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </Field>

      <ComplexFields
        type={type}
        config={config}
        onChange={(updates) => onConfigChange(updates as Partial<PhaseTimerConfig>)}
      />
    </FieldGroup>
  )
}

export default ComplexBody
