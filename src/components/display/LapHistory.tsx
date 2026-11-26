import { useId, useState } from 'react'
import cx from 'clsx'
import { ChevronDown } from 'lucide-react'

import { LapEntry } from '@/types'
import { formatTime } from '@/lib/timer'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'

interface LapHistoryProps {
  laps: LapEntry[]
  lastLap?: LapEntry | null
  bestLap?: LapEntry | null
  showSplits?: boolean
  initialExpanded?: boolean
  onClearHistory?: () => void
}

const CollapsedHeader = ({
  id,
  lastLapTime,
  bestLabel,
  bestLapValue,
}: {
  id: string
  lastLapTime: string
  bestLabel: string
  bestLapValue?: string
}) => (
  <span id={id} className="flex flex-wrap items-center gap-2.5">
    <span className="text-accent-foreground font-medium">Last lap</span>
    <span className="text-card-foreground font-mono">{lastLapTime}</span>
    {bestLapValue && (
      <>
        <span>/</span>
        <span className="text-accent-foreground font-medium">{bestLabel}</span>
        <span className="text-card-foreground font-mono">{bestLapValue}</span>
      </>
    )}
  </span>
)

function SplitHistory({ laps, bestLapValue }: { laps: LapEntry[]; bestLapValue?: string }) {
  const runs: LapEntry[][] = []
  for (const lap of laps) {
    if (!runs.length || (lap.split?.number ?? 1) === 1) runs.push([])
    runs[runs.length - 1].push(lap)
  }
  return (
    <div className="space-y-3 px-3 py-2">
      {bestLapValue && (
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium">Best</span>
          <span className="text-lap-best-fg font-mono font-bold">{bestLapValue}</span>
        </div>
      )}
      {runs.reverse().map((run, i) => (
        <table key={run[0].id} aria-label={`Run ${runs.length - i}`} className="w-full text-right text-sm">
          {runs.length > 1 && <caption className="text-left font-medium">Run {runs.length - i}</caption>}
          <thead className="text-muted-foreground text-xs"><tr>
            <th scope="col" className="py-2 text-left">Lap</th>
            <th scope="col">Split</th><th scope="col">Total</th>
          </tr></thead>
          <tbody className="font-mono tabular-nums">
            {run.reverse().map(lap => (
              <tr className="border-t" key={lap.id}>
                <th scope="row" className="py-2 text-left font-normal">{lap.split?.number ?? 1}</th>
                <td>{formatTime(lap.lapTime)}</td>
                <td>{formatTime(lap.split?.total ?? lap.lapTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  )
}

export function LapHistory({
  laps,
  lastLap,
  bestLap,
  onClearHistory,
  showSplits = false,
  initialExpanded = false,
}: LapHistoryProps) {
  const summaryId = useId()
  const [isExpanded, setIsExpanded] = useState(initialExpanded)

  const handleClearHistory = () => {
    onClearHistory?.()
    setIsExpanded(false)
  }
  if (laps.length === 0) {
    return null
  }
  let bestLapValue: string | undefined
  if (bestLap && (!showSplits || laps.length > 1)) {
    const time = formatTime(bestLap.lapTime)
    bestLapValue = showSplits
      ? `Lap ${bestLap.split?.number ?? 1} - ${time.replace('.', ':')}`
      : time
  }
  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className={cx('mt-6 w-full max-w-lg divide-y rounded-md border-2', {
        invisible: laps.length === 0,
        'bg-background border-accent divide-accent': isExpanded,
      })}
    >
      {/*// Compact view - show only last lap*/}
      <div
        className={cn('flex items-center justify-between gap-2 rounded-md text-sm', {
          'bg-background/50': !isExpanded,
        })}
      >
        <CollapsibleTrigger
          aria-describedby={isExpanded ? undefined : summaryId}
          aria-label={isExpanded ? 'Collapse lap history' : 'Expand lap history'}
          className="flex min-h-11 flex-1 cursor-pointer items-center justify-between gap-2 px-4 py-3 text-left"
        >
          {isExpanded ? (
            <span className="text-lg font-semibold">Lap History</span>
          ) : (
            <CollapsedHeader
              id={summaryId}
              lastLapTime={formatTime(lastLap?.lapTime || 0)}
              bestLabel={showSplits ? 'Best' : 'Best lap'}
              bestLapValue={bestLapValue}
            />
          )}
          <ChevronDown aria-hidden="true" className={cn('size-4 shrink-0', isExpanded && 'rotate-180')} />
        </CollapsibleTrigger>
        {isExpanded && onClearHistory && (
          <Button variant="destructive" className="mr-2 min-h-11 min-w-11 uppercase" size="sm" onClick={handleClearHistory}>
            Clear
          </Button>
        )}
      </div>
      <CollapsibleContent
        asChild
        className={cn('overflow-hidden', {
          'animate-expand': isExpanded,
          'animate-collapse': !isExpanded,
        })}
      >
        {showSplits ? (
          <div><SplitHistory laps={laps} bestLapValue={bestLapValue} /></div>
        ) : laps.length > 0 ? (
          // Expanded view - show a full list (only when laps exist)
          <div className="w-full max-w-5xl space-y-2 p-6 px-4">
            <Item className="justify-between px-4 text-lg" variant="outline">
              {lastLap && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Last lap: </span>
                  <span className="text-lap-last-fg font-mono font-bold">
                    {formatTime(lastLap?.lapTime || 0)}
                  </span>
                </div>
              )}
              {bestLap && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Best lap: </span>
                  <span className="text-lap-best-fg font-mono font-bold">
                    {formatTime(bestLap?.lapTime || 0)}
                  </span>
                </div>
              )}
            </Item>
            {[...laps].reverse().map((lap, index) => {
              if (index === 0) {
                return null
              }
              const lapNumber = laps.length - index
              return (
                <Item size="sm" variant="outline" key={lap.id} className={cx('text-sm')}>
                  <ItemContent className="flex-row items-center justify-between">
                    <ItemTitle className="font-medium">{`Lap ${lapNumber}`}</ItemTitle>
                    <ItemDescription className="font-mono">
                      {formatTime(lap.lapTime)}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              )
            })}
          </div>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  )
}
