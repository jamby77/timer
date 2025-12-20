'use client'

import { TimerConfigFormProps } from '@/types/configure'

import { TimerConfigForm } from '@/components/configure/components'
import { PageContainer } from '@/components/PageContainer'

export const TimerConfig = ({
  type,
  initialConfig,
  isPredefined = false,
  onStartTimer,
  onSaveAsPredefined,
  onSave,
  onCancel,
}: TimerConfigFormProps) => {
  return (
    <PageContainer className="bg-background absolute inset-0">
      <h5 className="text-muted-foreground text-center text-base">Configure</h5>
      <TimerConfigForm
        type={type}
        initialConfig={initialConfig}
        isPredefined={isPredefined}
        onStartTimer={onStartTimer}
        onSaveAsPredefined={onSaveAsPredefined}
        onSave={onSave}
        onCancel={onCancel}
      />
    </PageContainer>
  )
}
