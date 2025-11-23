import { useState } from 'react'
import cx from 'clsx'
import { ChevronDown } from 'lucide-react'

import { formatTime } from '@/lib/timer'
import { LapEntry } from '@/lib/timer/useLapHistory'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

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
      className="text-card-foreground bg-transparent p-0 px-1 shadow-none transition-colors hover:bg-transparent"
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
  <div className="flex items-center gap-2">
    <span className="text-accent-foreground font-medium">Last lap</span>
    <span className="text-card-foreground font-mono">{lastLapTime}</span>
    <span>/</span>
    <span className="text-accent-foreground font-medium">Best lap</span>
    <span className="text-card-foreground font-mono">{bestLapTime}</span>
  </div>
)

const ExpandedHeader = () => (
  <div className="flex w-full items-center justify-start">
    <h3 className="text-foreground text-lg font-semibold">Lap History</h3>
  </div>
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
    // setIsExpanded(false);
  }
  if (laps.length === 0) {
    return null
  }
  return (
    <Collapsible
      defaultOpen={initialExpanded}
      onOpenChange={setIsExpanded}
      className={cx(
        'border-accent divide-accent mt-6 w-full divide-y rounded-md border-2 transition-all duration-300 ease-in-out',
        {
          invisible: laps.length === 0,
        }
      )}
    >
      {/*// Compact view - show only last lap*/}
      <div
        className={cn(
          'flex items-center justify-between gap-4 px-4 py-2 text-sm transition-all duration-300 ease-in-out',
          {
            'bg-background text-foreground rounded-t-lg': isExpanded,
            'rounded-lg bg-gray-50/50': !isExpanded,
          }
        )}
      >
        <CollapsibleTrigger role="button" className="cursor-pointer">
          {!isExpanded && (
            <CollapsedHeader
              lastLapTime={formatTime(lastLap?.lapTime || 0)}
              bestLapTime={formatTime(bestLap?.lapTime || 0)}
            />
          )}
          {isExpanded && <ExpandedHeader />}
        </CollapsibleTrigger>
        <div className="space-x-2">
          {isExpanded && !!onClearHistory && (
            <Button variant="destructive" onClick={onClearHistory} className="uppercase" size="sm">
              Clear
            </Button>
          )}
          <CollapsibleTrigger asChild>
            <ExpandButton label="Expand lap history" opened={isExpanded} />
          </CollapsibleTrigger>
        </div>
      </div>
      <CollapsibleContent asChild>
        {laps.length > 0 ? (
          // Expanded view - show full list (only when laps exist)
          <div className="w-full max-w-5xl p-6 transition-all duration-300 ease-in-out">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4 bg-blue-50 px-4 text-lg hover:bg-blue-100">
                {lastLap && (
                  <div className="flex items-center justify-between gap-2 text-blue-700">
                    <span className="font-medium">Last lap: </span>
                    <span className="font-mono font-bold text-blue-800">
                      {formatTime(lastLap?.lapTime || 0)}
                    </span>
                  </div>
                )}
                {bestLap && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-gray-700">Best lap: </span>
                    <span className="font-mono font-bold text-gray-800">
                      {formatTime(bestLap?.lapTime || 0)}
                    </span>
                  </div>
                )}
              </div>
              {[...laps].reverse().map((lap, index) => {
                if (index === 0) {
                  return null
                }
                const lapNumber = laps.length - index
                return (
                  <div
                    key={lap.id}
                    className={cx(
                      'flex items-center justify-between rounded bg-white px-4 py-2 text-sm text-gray-500 transition-all duration-300 ease-in-out hover:bg-gray-100'
                    )}
                  >
                    <span className="font-medium">{`Lap ${lapNumber}`}</span>
                    <span className="font-mono">{formatTime(lap.lapTime)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  )
}
