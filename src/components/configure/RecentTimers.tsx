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
  CardHeader,
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
    <Carousel
      className="w-full max-w-[210px] sm:max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-6xl"
      opts={{ align: 'start' }}
    >
      <CarouselContent>
        {displayTimers.map((timer) => (
          <CarouselItem
            key={timer.id}
            className="min-w-52 basis-[max-content] md:basis-1/3 lg:basis-1/5"
          >
            <TimerCard timer={timer} onStartTimer={onStartTimer} onRemoveTimer={onRemoveTimer} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
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
          <p className="truncate">{getConfigSummary(timer.config)}</p>
        </CardDescription>
      </CardContent>
      <CardFooter className="justify-between gap-4 px-4">
        <span className="text-muted-foreground truncate text-xs">
          {formatRelativeTime(timer.startedAt)}
        </span>
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
