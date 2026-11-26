import { useMemo, useState } from 'react'
import { MoveLeft } from 'lucide-react'

import type { AnyTimerConfig, ComplexPhase, PhaseConfig } from '@/types/configure'

import { TimerType } from '@/types/configure'
import { generateTimerName } from '@/lib/configure/utils'
import { normalizeDraftRoundNames } from '@/lib/configure/round-names'
import { TimerConfigHash } from '@/lib/timer/TimerConfigHash'

import { Button } from '@/components/ui/button'
import { SetupBackButton } from '@/components/configure/components/shared/SetupBackButton'
import ComplexBody from '@/components/configure/components/complex-fields-form/components/ComplexBody'
import { readDefaults } from '@/lib/configure/defaults'
import { createPhaseDraft } from '@/lib/configure/new-timer'

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
  const [draftType, setDraftType] = useState<TimerType>(() => readDefaults('new-phase').phaseType ?? TimerType.COUNTDOWN)
  const [draftConfig, setDraftConfig] = useState<PhaseConfig>(() =>
    createPhaseDraft('', draftType)
  )
  const [customName, setCustomName] = useState<string>()
  const draftName = customName ?? (draftConfig.name || generateTimerName(draftConfig))

  const handleConfigChange = (updates: Partial<PhaseConfig>) => {
    setDraftConfig((prev) => ({ ...prev, ...updates }) as PhaseConfig)
  }

  const handleTypeChange = (type: TimerType) => {
    const nextConfig = createPhaseDraft('', type)
    setDraftConfig(nextConfig)
    setDraftType(type)
  }

  const draft: PhaseDraft = useMemo(() => {
    const phaseConfig: PhaseConfig = normalizeDraftRoundNames({
      ...draftConfig,
      name: draftName || generateTimerName(draftConfig),
    } as PhaseConfig)
    const id = createPhaseId(phaseConfig)
    phaseConfig.id = TimerConfigHash.generateTimerId(phaseConfig)

    return {
      id,
      name: phaseConfig.name,
      type: draftType,
      config: phaseConfig,
    }
  }, [draftConfig, draftName, draftType])

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
        <div className="flex items-center gap-2">
          <SetupBackButton onClick={onCancel} label="Back to phases" />
          <h2 className="text-foreground text-xl font-semibold">{title}</h2>
        </div>
      </div>

      <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-2 md:gap-4">
        <ComplexBody
          type={draftType}
          config={draftConfig}
          name={draftName}
          onNameChange={setCustomName}
          onTypeChange={handleTypeChange}
          onConfigChange={handleConfigChange}
        />
        <div className="flex flex-col gap-2 md:flex-row md:justify-end max-sm:[&>button]:min-h-11">
          {phasesCount === 0 && (
            <Button type="button" onClick={handleAddAtStart}>
              Add
            </Button>
          )}
          {phasesCount > 0 && (
            <>
              <Button type="button" onClick={handleAddAtEnd}>
                Add at the end
              </Button>
              <Button type="button" variant="outline" onClick={handleAddAtStart}>
                Add at the start
              </Button>
            </>
          )}
          <Button type="button" variant="destructive" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
