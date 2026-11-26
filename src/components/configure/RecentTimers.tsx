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
        className="relative min-w-0 w-full max-sm:px-2 sm:max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-6xl"
        opts={{ align: 'start' }}
      >
        <CarouselContent className="max-sm:-ml-2">
          {displayTimers.map((timer) => (
            <CarouselItem key={timer.id} className="max-sm:basis-1/2 max-sm:pl-2 max-sm:only:basis-full sm:min-w-52 sm:basis-62.5 md:basis-1/3 lg:basis-1/5">
              <TimerCard timer={timer} onStartTimer={onStartTimer} onRemoveTimer={onRemoveTimer} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {displayTimers.length > 1 && (
          <div className="mt-2 flex justify-center gap-3 max-sm:has-[[data-slot=carousel-next]:disabled]:has-[[data-slot=carousel-previous]:disabled]:hidden sm:contents">
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
    <Card className="cursor-grab py-4 active:cursor-grabbing max-sm:h-full max-sm:rounded-[10px] max-sm:p-2.5">
      <div className="flex items-center justify-between gap-2 px-1 max-sm:-mt-1.5 max-sm:-mr-1.5 max-sm:items-start max-sm:px-0 md:px-4">
        <CardTitle className="min-w-0 text-left max-sm:flex-1 max-sm:self-center max-sm:leading-snug sm:max-w-32">
          <h3 className="wrap-anywhere sm:truncate">{timer.config.name}</h3>
        </CardTitle>
        <Button
          aria-label="Remove timer"
          size="icon"
          variant="ghost"
          onClick={handleRemove}
          className="shrink-0 text-red-600 hover:bg-transparent hover:text-red-700 max-sm:size-11 dark:text-red-400 dark:hover:text-red-300 [&_svg]:size-4"
        >
          <X aria-hidden="true" />
        </Button>
      </div>

      <CardContent className="px-1 max-sm:px-0 md:px-4">
        <CardDescription>
          <p className="max-sm:wrap-anywhere max-sm:leading-snug sm:truncate">{getConfigSummary(timer.config)}</p>
        </CardDescription>
      </CardContent>
      <CardFooter className="justify-between gap-2 px-1 max-sm:grow max-sm:flex-col max-sm:items-stretch max-sm:px-0 md:px-4">
        <span className="text-muted-foreground truncate text-xs">
          {formatRelativeTime(timer.startedAt)}
        </span>
        <CardAction className="max-sm:mt-auto max-sm:self-stretch">
          <Button aria-label={`Start ${timer.config.name}`} size="sm" className="max-sm:min-h-11 max-sm:w-full" onClick={handleStart}>
            <PlayIcon size={4} className="fill-tm-play stroke-card" />
            <span className="max-sm:hidden">Start</span>
          </Button>
        </CardAction>
      </CardFooter>
    </Card>
  )
}

TimerCard.displayName = 'RecentTimerCard'
