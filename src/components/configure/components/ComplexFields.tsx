import type { AnyTimerConfig } from '@/types/configure'

import { FieldGroup } from '@/components/ui/field'

interface ComplexFieldsProps {
  config: Partial<AnyTimerConfig>
  onChange: (updates: Partial<AnyTimerConfig>) => void
}

export const ComplexFields = ({ config, onChange }: ComplexFieldsProps) => {
  return (
    <FieldGroup className="space-y-4">
      <div className="bg-accent rounded-md p-4">
        <p className="text-accent-foreground text-sm">
          Complex timers allow you to combine multiple timer types in sequence. This feature will be
          implemented in a future update.
        </p>
      </div>
    </FieldGroup>
  )
}
