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
  onCancel,
}: TimerConfigFormProps) => {
  return (
    <PageContainer>
      <TimerConfigForm
        type={type}
        initialConfig={initialConfig}
        isPredefined={isPredefined}
        onStartTimer={onStartTimer}
        onSaveAsPredefined={onSaveAsPredefined}
        onCancel={onCancel}
      />
    </PageContainer>
  )
}
