'use client'

import { useState } from 'react'
import { PlayIcon, X } from 'lucide-react'

import { RecentTimersProps } from '@/types/configure'
import { formatRelativeTime, getConfigSummary } from '@/lib/configure/utils'
import { cn } from '@/lib/utils'

import { ButtonLegacy, CardContainer } from '@/components/ui'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const RecentTimers = ({
  timers,
  onStartTimer,
  onRemoveTimer,
  onClearAll,
}: RecentTimersProps) => {
  const [visibleCount, setVisibleCount] = useState(10)

  const displayTimers = timers.slice(0, visibleCount)
  const hasMore = timers.length > visibleCount

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 10, timers.length))
  }

  if (timers.length === 0) {
    return (
      <CardContainer>
        <div className="py-8 text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">No Recent Timers</h2>
          <p className="text-gray-600">Start a timer to see it appear here for quick access.</p>
        </div>
      </CardContainer>
    )
  }

  return (
    <CardContainer>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Timers</h2>
        {timers.length > 0 && (
          <Button variant="destructive" size="sm" onClick={onClearAll}>
            Clear All
          </Button>
        )}
      </div>

      {/* Desktop: Grid layout */}
      <div className="mb-6 hidden gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-3">
        {displayTimers.map((timer) => (
          <TimerCard
            key={timer.id}
            timer={timer}
            onStartTimer={onStartTimer}
            onRemoveTimer={onRemoveTimer}
          />
        ))}
      </div>

      {/* Mobile: Horizontal scroll layout */}
      <div className="lg:hidden">
        <div
          className={cn(
            'flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4',
            'scrollbar-width-none [&::-webkit-scrollbar]:hidden'
          )}
        >
          {displayTimers.map((timer) => (
            <div key={timer.id} className="w-80 flex-none snap-start">
              <TimerCard timer={timer} onStartTimer={onStartTimer} onRemoveTimer={onRemoveTimer} />
            </div>
          ))}
        </div>

        {/* Scroll indicators for mobile */}
        <div className="mt-2 flex justify-center gap-1 lg:hidden">
          {timers.map((_, index) => (
            <div
              key={index}
              className={cn('h-1 w-8 rounded-full transition-colors', {
                'bg-blue-500': index < 3,
                'bg-gray-300': index >= 3,
              })}
            />
          ))}
        </div>
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="mt-6 text-center">
          <ButtonLegacy variant="outline" onClick={handleLoadMore} className="w-full sm:w-auto">
            Load More ({timers.length - visibleCount} remaining)
          </ButtonLegacy>
        </div>
      )}
    </CardContainer>
  )
}

interface TimerCardProps {
  timer: RecentTimersProps['timers'][0]
  onStartTimer: RecentTimersProps['onStartTimer']
  onRemoveTimer: RecentTimersProps['onRemoveTimer']
}

const TimerCard = ({ timer, onStartTimer, onRemoveTimer }: TimerCardProps) => {
  const handleStart = () => {
    onStartTimer(timer.config)
  }

  const handleRemove = () => {
    onRemoveTimer(timer.id)
  }

  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <CardTitle>
          <h3>{timer.config.name}</h3>
        </CardTitle>
        <CardAction>
          {/* Remove button */}
          <Button
            aria-label="Remove timer"
            aria-labelledby="remove-timer"
            size="icon"
            onClick={handleRemove}
            className="rounded-full"
            variant="destructive"
          >
            <X size={4} />
            <span className="sr-only" id="remove-timer">
              Remove timer
            </span>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="px-4">
        <CardDescription>
          <p>{getConfigSummary(timer.config)}</p>
        </CardDescription>
      </CardContent>
      <CardFooter className="justify-between gap-4 px-4">
        <span className="text-muted-foreground text-xs">{formatRelativeTime(timer.startedAt)}</span>
        <CardAction>
          <Button size="sm" onClick={handleStart}>
            <PlayIcon size={4} className="fill-tm-play stroke-card" />
            Start
          </Button>
        </CardAction>
      </CardFooter>
    </Card>
  )
}
