import { useEffect, useState } from 'react'
import { CircleX, MoveLeft, Save } from 'lucide-react'

import type { ComplexPhase } from '@/types/configure'

import { TimerType } from '@/types/configure'
import { generateTimerName } from '@/lib/configure/utils'

import { Button } from '@/components/ui/button'
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

  const { id, type, config, name } = phase
  useEffect(() => {
    setPhaseId(id)
    setDraftType(type)
    setDraftConfig(config as PhaseTimerConfig)
    setDraftName(name)
  }, [id, type, config, name])

  const handleConfigChange = (updates: Partial<PhaseTimerConfig>) => {
    setDraftConfig((prev) => {
      const next = { ...prev, ...updates } as PhaseTimerConfig
      setDraftName(generateTimerName(next as any))
      return next
    })
  }
  const handleTypeChange = (type: TimerType) => {
    const nextConfig = createDefaultPhaseConfig(phaseId, type)

    setDraftType(type)
    setDraftConfig(nextConfig)
    setDraftName(generateTimerName(nextConfig as any))
  }

  const handleSave = () => {
    const draft: PhaseDraft = {
      id: phaseId,
      name: draftName,
      type: draftType,
      config: {
        ...(draftConfig as any),
        name: draftName,
      },
    }
    onSave(phase.id, draft)
    onCancel()
  }

  const title = 'Edit phase'

  return (
    <div className="overflow-hidden">
      <div className="mb-6">
        <h2 className="text-foreground mb-2 text-xl font-semibold">
          <Button variant="ghost" size="sm" type="button" onClick={onCancel}>
            <MoveLeft size={4} />
          </Button>{' '}
          {title}
        </h2>
      </div>
      <form className="flex flex-col gap-2">
        <ComplexBody
          type={type}
          config={config}
          name={name}
          onNameChange={setDraftName}
          onTypeChange={handleTypeChange}
          onConfigChange={handleConfigChange}
        />
        <div className="flex gap-2">
          <Button onClick={handleSave} className="grow">
            <Save />
            Save
          </Button>
          <Button variant="secondary" onClick={onCancel} className="grow">
            <CircleX /> Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
