import { useId } from 'react'

import { FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'

interface SwitchFieldProps {
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function SwitchField({ title, description, checked, onCheckedChange }: SwitchFieldProps) {
  const id = useId()

  return (
    <FieldLabel
      htmlFor={id}
      className="min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border px-3 py-2"
    >
      <span className="flex flex-1 flex-col gap-1">
        <span id={`${id}-title`}>{title}</span>
        <span id={`${id}-description`} className="text-muted-foreground text-sm font-normal">
          {description}
        </span>
      </span>
      <Switch
        id={id}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </FieldLabel>
  )
}
