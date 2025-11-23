import { useState } from 'react'
import cx from 'clsx'
import { ChevronDown } from 'lucide-react'

import { formatTime } from '@/lib/timer'
import { LapEntry } from '@/lib/timer/useLapHistory'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'

interface LapHistoryProps {
  laps: LapEntry[]
  lastLap?: LapEntry | null
  bestLap?: LapEntry | null
  initialExpanded?: boolean
  onClearHistory?: () => void
}

const ExpandButton = ({
  label,
  opened = false,
  onClick,
}: {
  label?: string
  opened?: boolean
  onClick?: () => void
}) => {
  return (
    <Button
      size="sm"
      className="text-card-foreground mx-2 bg-transparent p-0 px-1 shadow-none transition-colors hover:bg-transparent"
      aria-label={label}
      onClick={onClick}
    >
      <ChevronDown
        className={cn('size-4 transition-transform duration-300 ease-in-out', {
          'rotate-270': opened,
        })}
      />
    </Button>
  )
}

const CollapsedHeader = ({
  lastLapTime,
  bestLapTime,
}: {
  lastLapTime: string
  bestLapTime: string
}) => (
  <Item className="w-full" size="sm">
    <span className="text-accent-foreground font-medium">Last lap</span>
    <span className="text-card-foreground font-mono">{lastLapTime}</span>
    <span>/</span>
    <span className="text-accent-foreground font-medium">Best lap</span>
    <span className="text-card-foreground font-mono">{bestLapTime}</span>
  </Item>
)

const ExpandedHeader = ({ onClearHistory }: { onClearHistory?: () => void }) => (
  <Item className="w-full pr-0" size="sm">
    <ItemContent>
      <ItemTitle className="text-foreground text-lg font-semibold">Lap History</ItemTitle>
    </ItemContent>
    <ItemActions>
      <Button variant="destructive" className="uppercase" size="sm" onClick={onClearHistory}>
        Clear
      </Button>
    </ItemActions>
  </Item>
)

export function LapHistory({
  laps,
  lastLap,
  bestLap,
  onClearHistory,
  initialExpanded = false,
}: LapHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded)

  // const toggleExpand = () => setIsExpanded(!isExpanded);

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
        className={cn('flex items-center justify-between gap-1 rounded-md text-sm', {
          'bg-background/50': !isExpanded,
        })}
      >
        <CollapsibleTrigger role="button" className="w-full cursor-pointer">
          {!isExpanded && (
            <CollapsedHeader
              lastLapTime={formatTime(lastLap?.lapTime || 0)}
              bestLapTime={formatTime(bestLap?.lapTime || 0)}
            />
          )}
          {isExpanded && <ExpandedHeader onClearHistory={handleClearHistory} />}
        </CollapsibleTrigger>
        <CollapsibleTrigger asChild>
          <ExpandButton label="Expand lap history" opened={isExpanded} />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent
        asChild
        className={cn('overflow-hidden', {
          'animate-expand': isExpanded,
          'animate-collapse': !isExpanded,
        })}
      >
        {laps.length > 0 ? (
          // Expanded view - show full list (only when laps exist)
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
