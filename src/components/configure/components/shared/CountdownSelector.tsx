import { ChangeEvent } from 'react'

import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from '@/components/ui/native-select'

type CountdownSelectorProps = {
  countdown: number | undefined
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void
}
const quickSeconds = [3, 5, 10]
const otherSeconds = Array.from({ length: 60 }, (_, i) => i + 1).filter(
  seconds => !quickSeconds.includes(seconds)
)

const secondsOption = (seconds: number) => (
  <NativeSelectOption key={seconds} value={String(seconds)}>
    {seconds}s
  </NativeSelectOption>
)

export const CountdownSelector = ({ countdown, onChange }: CountdownSelectorProps) => {
  return (
    <NativeSelect
      className="max-sm:min-h-11 max-sm:text-base"
      id="countdownBeforeStart"
      name="countdownBeforeStart"
      value={countdown ?? 0}
      onChange={onChange}
    >
      <NativeSelectOption value="0">None</NativeSelectOption>
      <NativeSelectOptGroup label="Quick options">
        {quickSeconds.map(secondsOption)}
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Other durations">{otherSeconds.map(secondsOption)}</NativeSelectOptGroup>
    </NativeSelect>
  )
}
