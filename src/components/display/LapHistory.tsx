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
  initialExpanded?: boolean
  onClearHistory?: () => void
}

const CollapsedHeader = ({
  id,
  lastLapTime,
  bestLapTime,
}: {
  id: string
  lastLapTime: string
  bestLapTime: string
}) => (
  <span id={id} className="flex flex-wrap items-center gap-2.5">
    <span className="text-accent-foreground font-medium">Last lap</span>
    <span className="text-card-foreground font-mono">{lastLapTime}</span>
    <span>/</span>
    <span className="text-accent-foreground font-medium">Best lap</span>
    <span className="text-card-foreground font-mono">{bestLapTime}</span>
  </span>
)

export function LapHistory({
  laps,
  lastLap,
  bestLap,
  onClearHistory,
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
              bestLapTime={formatTime(bestLap?.lapTime || 0)}
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
        {laps.length > 0 ? (
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
