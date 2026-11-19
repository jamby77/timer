'use client'

import { PlayIcon, X } from 'lucide-react'

import { RecentTimersProps } from '@/types/configure'
import { formatRelativeTime, getConfigSummary } from '@/lib/configure/utils'

import { CardContainer } from '@/components/ui'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

const visibleCount = 10
export const RecentTimers = ({ timers, onStartTimer, onRemoveTimer }: RecentTimersProps) => {
  const displayTimers = timers.slice(0, visibleCount)

  if (timers.length === 0) {
    return (
      <CardContainer>
        <div className="py-8 text-center">
          <h2 className="text-foreground mb-2 text-xl font-semibold">No Recent Timers</h2>
          <p className="text-muted-foreground">
            Start a timer to see it appear here for quick access.
          </p>
        </div>
      </CardContainer>
    )
  }

  return (
    <div className="flex w-full items-center justify-center">
      <Carousel
        className="relative min-w-0 w-full sm:max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-6xl"
        opts={{ align: 'start' }}
      >
        <CarouselContent>
          {displayTimers.map((timer) => (
            <CarouselItem key={timer.id} className="basis-full sm:min-w-52 sm:basis-62.5 md:basis-1/3 lg:basis-1/5">
              <TimerCard timer={timer} onStartTimer={onStartTimer} onRemoveTimer={onRemoveTimer} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {displayTimers.length > 1 && (
          <div className="mt-2 flex justify-center gap-3 sm:contents">
            <CarouselPrevious className="max-sm:static max-sm:size-11 max-sm:translate-y-0" />
            <CarouselNext className="max-sm:static max-sm:size-11 max-sm:translate-y-0" />
          </div>
        )}
      </Carousel>
    </div>
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
    <Card className="cursor-grab py-4 active:cursor-grabbing">
      <div className="flex items-center justify-between gap-2 px-1 md:px-4">
        <CardTitle className="max-w-32 text-left">
          <h3 className="truncate">{timer.config.name}</h3>
        </CardTitle>
        <div className="inline-flex items-center">
          {/* Remove button */}
          <Button
            aria-label="Remove timer"
            aria-labelledby={`remove-timer-${timer.id}`}
            size="icon"
            onClick={handleRemove}
            className="rounded-full max-sm:size-11"
            variant="destructive"
          >
            <X size={4} />
            <span className="sr-only" id={`remove-timer-${timer.id}`}>
              Remove timer
            </span>
          </Button>
        </div>
      </div>

      <CardContent className="px-1 md:px-4">
        <CardDescription>
          <p className="truncate">{getConfigSummary(timer.config)}</p>
        </CardDescription>
      </CardContent>
      <CardFooter className="justify-between gap-2 px-1 md:px-4">
        <span className="text-muted-foreground truncate text-xs">
          {formatRelativeTime(timer.startedAt)}
        </span>
        <CardAction>
          <Button size="sm" className="max-sm:min-h-11" onClick={handleStart}>
            <PlayIcon size={4} className="fill-tm-play stroke-card" />
            Start
          </Button>
        </CardAction>
      </CardFooter>
    </Card>
  )
}

TimerCard.displayName = 'RecentTimerCard'
