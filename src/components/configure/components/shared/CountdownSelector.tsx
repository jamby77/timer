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
const secondsOptions = Array.from({ length: 60 }, (_, i) => i + 1).map((i) => (
  <NativeSelectOption key={i} value={String(i)}>
    {i}s
  </NativeSelectOption>
))

export const CountdownSelector = ({ countdown, onChange }: CountdownSelectorProps) => {
  return (
    <NativeSelect
      id="countdownBeforeStart"
      name="countdownBeforeStart"
      value={countdown ?? 0}
      onChange={onChange}
    >
      <NativeSelectOption value="0">None</NativeSelectOption>
      <NativeSelectOptGroup label="Quick options">
        <NativeSelectOption value="3">3s</NativeSelectOption>
        <NativeSelectOption value="5">5s</NativeSelectOption>
        <NativeSelectOption value="10">10s</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="1 - 60 sec">{secondsOptions}</NativeSelectOptGroup>
    </NativeSelect>
  )
}
