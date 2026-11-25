import type { ComplexConfig, ComplexPhase, PhaseRepeatGroup } from '@/types/configure'

type PhasePosition = Pick<ComplexPhase, 'id' | 'order'>
export type PhaseOccurrence = ComplexPhase & { group?: PhaseRepeatGroup; pass?: number }

export function repeatGroupError(phases: PhasePosition[], groups: PhaseRepeatGroup[]) {
  if (!groups.length) return
  const ordered = [...phases].sort((a, b) => a.order - b.order)
  const indices = new Map(ordered.map((phase, index) => [phase.id, index]))
  if (indices.size !== phases.length) return 'Repeated phases need unique IDs.'
  const groupIds = new Set<string>()
  const members = new Set<string>()
  let executions = phases.length
  for (const group of groups) {
    if (!group.id || groupIds.has(group.id)) return 'Repeat groups need unique IDs.'
    groupIds.add(group.id)
    if (!Number.isInteger(group.count) || group.count < 2 || group.count > 100)
      return 'Choose 2–100 passes.'
    const first = indices.get(group.phaseIds[0])
    if (first === undefined || !group.phaseIds.length) return 'Select a phase to repeat.'
    for (const [offset, id] of group.phaseIds.entries()) {
      if (indices.get(id) !== first + offset) return 'Select consecutive phases.'
      if (members.has(id)) return 'Repeat groups cannot overlap.'
      members.add(id)
    }
    executions += (group.count - 1) * group.phaseIds.length
    if (executions > 1000) return 'Choose fewer passes or phases (1,000 total maximum).'
  }
}

export function phaseSequence(config: Partial<ComplexConfig>): PhaseOccurrence[] {
  const phases = [...(config.phases ?? [])].sort((a, b) => a.order - b.order)
  const groups = config.repeatGroups ?? []
  if (!groups.length || repeatGroupError(phases, groups)) return phases
  const starts = new Map(groups.map((group) => [group.phaseIds[0], group]))
  const result: PhaseOccurrence[] = []
  for (let i = 0; i < phases.length; ) {
    const group = starts.get(phases[i].id)
    if (!group) {
      result.push(phases[i++])
      continue
    }
    const members = phases.slice(i, i + group.phaseIds.length)
    for (let pass = 1; pass <= group.count; pass++) {
      for (const phase of members) result.push({ ...phase, group, pass })
    }
    i += members.length
  }
  return result
}
