'use client'

import { useMemo, useState } from 'react'
import { MoveLeft } from 'lucide-react'

import type { AnyTimerConfig, ComplexPhase } from '@/types/configure'

import { TimerType } from '@/types/configure'
import { generateTimerName } from '@/lib/configure/utils'
import { TimerConfigHash } from '@/lib/timer/TimerConfigHash'

import { Button } from '@/components/ui/button'
import ComplexBody from '@/components/configure/components/complex-fields-form/components/ComplexBody'
import { createDefaultPhaseConfig, PhaseTimerConfig } from './complex-phase-utils'

type PhaseDraft = Omit<ComplexPhase, 'order'>

type ComplexPhaseAddProps = {
  onAddAtStart: (draft: PhaseDraft) => void
  onAddAtEnd: (draft: PhaseDraft) => void
  onCancel: () => void
  phasesCount: number
}

const createPhaseId = (config: AnyTimerConfig) => `phase-${TimerConfigHash.generateTimerId(config)}`

export const ComplexPhaseAdd = ({
  onAddAtEnd,
  onAddAtStart,
  onCancel,
  phasesCount,
}: ComplexPhaseAddProps) => {
  const [draftType, setDraftType] = useState<TimerType>(TimerType.COUNTDOWN)
  const [draftConfig, setDraftConfig] = useState<PhaseTimerConfig>(() =>
    createDefaultPhaseConfig('', TimerType.COUNTDOWN)
  )
  const [draftName, setDraftName] = useState<string>(() => generateTimerName(draftConfig))

  const handleConfigChange = (updates: Partial<PhaseTimerConfig>) => {
    setDraftConfig((prev) => {
      const next = { ...prev, ...updates } as PhaseTimerConfig
      setDraftName(generateTimerName(next))
      return next
    })
  }

  const handleTypeChange = (type: TimerType) => {
    const nextConfig = createDefaultPhaseConfig('', type)
    setDraftConfig(nextConfig)
    setDraftType(type)
    setDraftName(generateTimerName(nextConfig as any))
  }

  const draft: PhaseDraft = useMemo(() => {
    const config = {
      ...(draftConfig as any),
      name: draftName,
    }
    const id = createPhaseId(config)
    return {
      id,
      name: draftName,
      type: draftType,
      config,
    }
  }, [draftConfig, draftName])

  const handleAddAtStart = () => {
    onAddAtStart(draft)
    onCancel()
  }

  const handleAddAtEnd = () => {
    onAddAtEnd(draft)
    onCancel()
  }

  const title = 'Add phase'

  return (
    <div className="h-full w-full overflow-hidden overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-foreground mb-2 text-xl font-semibold">
          <Button variant="ghost" size="sm" type="button" onClick={onCancel}>
            <MoveLeft size={4} />
          </Button>{' '}
          {title}
        </h2>
      </div>

      <form className="flex flex-col gap-2">
        <div className="h-full">
          <div className="flex flex-col gap-2">
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
        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {phasesCount === 0 && <Button onClick={handleAddAtStart}>Add</Button>}
          {phasesCount > 0 && (
            <>
              <Button onClick={handleAddAtEnd}>Add at the end</Button>
              <Button variant="outline" onClick={handleAddAtStart}>
                Add at the start
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}
