import { useState } from 'react'
import { CircleX, MoveLeft, Save } from 'lucide-react'

import type { ComplexPhase } from '@/types/configure'

import { TimerType } from '@/types/configure'
import { generateTimerName } from '@/lib/configure/utils'
import { TimerConfigHash } from '@/lib/timer/TimerConfigHash'

import { Button } from '@/components/ui/button'
import ComplexBody from '@/components/configure/components/complex-fields-form/components/ComplexBody'
import { createDefaultPhaseConfig, PhaseTimerConfig } from './complex-phase-utils'

type PhaseDraft = Omit<ComplexPhase, 'order'>

type ComplexPhaseEditProps = {
  phase: ComplexPhase
  onCancel: () => void
  onSave: (phaseId: string, draft: PhaseDraft) => void
}

export const ComplexPhaseEdit = (props: ComplexPhaseEditProps) => (
  <ComplexPhaseDraft key={props.phase.id} {...props} />
)

const ComplexPhaseDraft = ({ phase, onSave, onCancel }: ComplexPhaseEditProps) => {
  const phaseId = phase.id
  const [draftType, setDraftType] = useState<TimerType>(phase.type)
  const [draftConfig, setDraftConfig] = useState<PhaseTimerConfig>(
    () => phase.config as PhaseTimerConfig
  )
  const [draftName, setDraftName] = useState<string>(phase.name)

  const handleConfigChange = (updates: Partial<PhaseTimerConfig>) => {
    setDraftConfig((prev) => {
      const next = { ...prev, ...updates } as PhaseTimerConfig
      setDraftName(generateTimerName(next))
      return next
    })
  }
  const handleTypeChange = (type: TimerType) => {
    const nextConfig = createDefaultPhaseConfig(phaseId, type)

    setDraftType(type)
    setDraftConfig(nextConfig)
    setDraftName(generateTimerName(nextConfig))
  }

  const handleSave = () => {
    const savedConfig: PhaseTimerConfig = {
      ...draftConfig,
      name: draftName,
    } as PhaseTimerConfig
    savedConfig.id = TimerConfigHash.generateTimerId(savedConfig)
    const draft: PhaseDraft = {
      id: phaseId,
      name: draftName,
      type: draftType,
      config: savedConfig,
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
      <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-2">
        <ComplexBody
          type={draftType}
          config={draftConfig}
          name={draftName}
          onNameChange={setDraftName}
          onTypeChange={handleTypeChange}
          onConfigChange={handleConfigChange}
        />
        <div className="flex gap-2 max-sm:[&>button]:min-h-11">
          <Button type="button" onClick={handleSave} className="grow">
            <Save />
            Save
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} className="grow">
            <CircleX /> Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
