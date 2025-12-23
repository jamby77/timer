'use client'

import { useEffect, useState } from 'react'

import type { ComplexPhase } from '@/types/configure'

import { TimerType } from '@/types/configure'
import { generateTimerName } from '@/lib/configure/utils'

import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import ComplexBody from '@/components/configure/components/complex-fields-form/components/ComplexBody'
import { createDefaultPhaseConfig, PhaseTimerConfig } from './complex-phase-utils'

type PhaseDraft = Omit<ComplexPhase, 'order'>

type ComplexPhaseEditProps = {
  phase: ComplexPhase
  onCancel: () => void
  onSave: (phaseId: string, draft: PhaseDraft) => void
}

export const ComplexPhaseEdit = ({ phase, onSave, onCancel }: ComplexPhaseEditProps) => {
  const [phaseId, setPhaseId] = useState<string>('')
  const [draftType, setDraftType] = useState<TimerType>(TimerType.COUNTDOWN)
  const [draftConfig, setDraftConfig] = useState<PhaseTimerConfig>(() =>
    createDefaultPhaseConfig(phaseId, TimerType.COUNTDOWN)
  )
  const [draftName, setDraftName] = useState<string>(() => generateTimerName(draftConfig as any))

  useEffect(() => {
    setPhaseId(phase.id)
    setDraftType(phase.type)
    setDraftConfig(phase.config as PhaseTimerConfig)
    setDraftName(phase.name)
  }, [phase])

  const handleConfigChange = (updates: Partial<PhaseTimerConfig>) => {
    setDraftConfig((prev) => {
      const next = { ...prev, ...updates } as PhaseTimerConfig
      const prevGenerated = generateTimerName(prev as any)
      const shouldUpdateName = !draftName || draftName === prevGenerated
      if (shouldUpdateName) {
        setDraftName(generateTimerName(next as any))
      }
      return next
    })
  }
  const handleTypeChange = (type: TimerType) => {
    const nextConfig = createDefaultPhaseConfig(phaseId, type)
    const prevGenerated = generateTimerName(draftConfig as any)
    const shouldUpdateName = !draftName || draftName === prevGenerated

    setDraftType(type)
    setDraftConfig(nextConfig)
    if (shouldUpdateName) {
      setDraftName(generateTimerName(nextConfig as any))
    }
  }

  const draft: PhaseDraft = {
    id: phaseId,
    name: draftName,
    type: draftType,
    config: {
      ...(draftConfig as any),
      name: draftName,
    },
  }

  const handleSave = () => {
    onSave(phase.id, draft)
    onCancel()
  }

  const title = 'Edit phase'

  return (
    <Drawer>
      <DrawerContent className="overflow-hidden">
        <DrawerHeader className="text-left sm:text-center">
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="h-full overflow-hidden overflow-y-auto p-4">
          <div className="space-y-6">
            <ComplexBody
              type={draftType}
              config={draftConfig}
              name={draftName}
              onNameChange={setDraftName}
              onTypeChange={handleTypeChange}
              onConfigChange={handleConfigChange}
            />
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-2 p-4">
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
