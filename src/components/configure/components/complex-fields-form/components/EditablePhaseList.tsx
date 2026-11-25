import { ChevronDown, ChevronUp, CopyPlus, Edit, GripVertical, Repeat2, Trash2 } from 'lucide-react'

import type { ComplexPhase, PhaseRepeatGroup } from '@/types/configure'

import { TIMER_TYPE_LABELS } from '@/lib/enums'

import { Button } from '@/components/ui/button'
import { Card, CardAction, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface EditablePhaseListProps {
  phases: ComplexPhase[]
  groupByPhase: Map<string, PhaseRepeatGroup>
  onMove: (index: number, step: -1 | 1) => void
  onEdit: (id: string) => void
  onDuplicate: (phase: ComplexPhase) => void
  onRemove: (id: string) => void
  onEditGroup: (group: PhaseRepeatGroup) => void
  onUngroup: (group: PhaseRepeatGroup) => void
}

export function EditablePhaseList({
  phases,
  groupByPhase,
  onMove,
  onEdit,
  onDuplicate,
  onRemove,
  onEditGroup,
  onUngroup,
}: EditablePhaseListProps) {
  const phaseCard = (phase: ComplexPhase, index: number) => (
    <Card
      key={phase.id}
      className="relative max-sm:flex-row max-sm:flex-wrap max-sm:items-center max-sm:justify-between"
    >
      <CardHeader className="max-sm:contents">
        <div className="flex items-center gap-2 overflow-hidden max-sm:w-full max-sm:p-2">
          <GripVertical className="text-muted-foreground size-5 max-sm:hidden" />
          <CardTitle className="text-sm max-sm:leading-snug max-sm:wrap-anywhere sm:truncate">
            {phase.name}{' '}
            <span className="text-muted-foreground hidden text-xs sm:inline">
              ({TIMER_TYPE_LABELS[phase.type]})
            </span>
          </CardTitle>
        </div>
        <CardAction className="max-sm:flex max-sm:gap-1 max-sm:[&>button]:size-11">
          <Button
            onClick={() => onMove(index, -1)}
            size="sm"
            variant="ghost"
            disabled={index === 0}
            className="disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Move phase up"
          >
            <ChevronUp />
          </Button>
          <Button
            onClick={() => onMove(index, 1)}
            size="sm"
            variant="ghost"
            disabled={index === phases.length - 1}
            aria-label="Move phase down"
          >
            <ChevronDown />
          </Button>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex items-center justify-start gap-1 max-sm:px-0 max-sm:[&>button]:size-11">
        <Button onClick={() => onEdit(phase.id)} variant="ghost" aria-label="Edit phase">
          <Edit />
        </Button>
        <Button onClick={() => onDuplicate(phase)} variant="ghost" aria-label="Duplicate phase">
          <CopyPlus />
        </Button>
        <Button
          onClick={() => onRemove(phase.id)}
          variant="ghost"
          className="text-destructive hover:text-destructive"
          aria-label="Remove phase"
        >
          <Trash2 />
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <>
      {phases.map((phase, index) => {
        const group = groupByPhase.get(phase.id)
        if (!group) return phaseCard(phase, index)
        if (group.phaseIds[0] !== phase.id) return null
        return (
          <section
            key={group.id}
            className="border-primary/60 space-y-2 border-l-2 pl-2"
            aria-label={`Repeat ×${group.count}`}
          >
            <div className="flex flex-wrap items-center gap-1">
              <h4 className="mr-auto flex items-center gap-1 font-semibold">
                <Repeat2 className="size-4" />
                Repeat ×{group.count}
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-11"
                onClick={() => onEditGroup(group)}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-11"
                onClick={() => onUngroup(group)}
              >
                Ungroup
              </Button>
            </div>
            {phases
              .slice(index, index + group.phaseIds.length)
              .map((member, offset) => phaseCard(member, index + offset))}
          </section>
        )
      })}
    </>
  )
}
