import { ReactNode } from 'react'

import { TimerState } from '@/lib/enums'
import { cn } from '@/lib/utils'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface CardProps {
  label: string
  state: TimerState
  time: string
  children: ReactNode
  subtitle?: ReactNode
  isWork?: boolean
  fullscreen?: boolean
}

export const TimerCard = ({
  label,
  state,
  time,
  children,
  subtitle,
  isWork,
  fullscreen = false,
}: CardProps) => {
  const lastDotIndex = time.lastIndexOf('.')
  const mainTime = lastDotIndex > -1 ? time.slice(0, lastDotIndex) : time
  const fractionalTime = lastDotIndex > -1 ? time.slice(lastDotIndex) : ''

  return (
    <div
      className={cn('rounded-lg border border-transparent', {
        'sticky top-8 z-10': !fullscreen,
        'inset-0 h-full w-full': fullscreen,
        'animated-border-card': isWork,
        'animate-border': state === TimerState.Running,
      })}
    >
      <Card
        className={cn('border-none', {
          'rounded-lg px-2': !fullscreen,
          'inset-0 h-full w-full gap-0 rounded-none! p-0': fullscreen,
          'bg-tm-work-bg': isWork,
          'bg-tm-rest-bg': !isWork && isWork !== undefined,
        })}
      >
        <CardHeader
          className={cn('space-y-2', {
            'text-tm-work-fg': isWork,
            'text-tm-rest-fg': !isWork && isWork !== undefined,
            'text-foreground': isWork === undefined,
          })}
        >
          <CardTitle
            className={cn('text-center font-bold', {
              'text-3xl': !fullscreen,
              'text-xl': fullscreen,
            })}
          >
            {label}
          </CardTitle>
          <CardDescription className="text-inherit">
            {subtitle && (
              <p
                className={cn('mx-auto max-w-32 text-center text-xs', {
                  invisible: !subtitle,
                })}
              >
                {subtitle}
              </p>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent
          className={cn({
            'flex grow items-center justify-center px-4 md:px-8': fullscreen,
          })}
        >
          <div
            className={cn(
              'w-full text-center font-mono leading-none font-bold tabular-nums',
              {
                'text-[clamp(4rem,18vw,28vh)] md:text-[clamp(8rem,18vw,30vh)] lg:text-[clamp(10rem,18vw,50vh)]':
                  !fullscreen,
              },
              {
                'text-tm-work-fg': isWork,
                'text-tm-rest-fg': !isWork && isWork !== undefined,
                'text-foreground': isWork === undefined,
              }
            )}
          >
            {!fullscreen && time}

            {fullscreen && (
              <div className="flex w-full items-end justify-center whitespace-nowrap">
                <span className="text-[clamp(4rem,26vw,68vh)]">{mainTime}</span>
                {fractionalTime && (
                  <span className="pb-[0.12em] text-[clamp(1.25rem,8vw,18vh)]">
                    {fractionalTime}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter
          className={cn('justify-center px-0 pt-0', {
            grow: !fullscreen,
            'mt-auto px-0 pb-8 md:px-0': fullscreen,
          })}
        >
          <div
            className={cn('flex max-w-8/10 grow flex-col space-x-4', {
              'mx-auto w-full px-4': fullscreen,
            })}
          >
            {children}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
