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
}

export const TimerCard = ({ label, state, time, children, subtitle, isWork }: CardProps) => (
  <div
    className={cn('sticky top-8 z-10 rounded-lg border border-transparent', {
      'animated-border-card': isWork,
      'animate-border': state === TimerState.Running,
    })}
  >
    <Card
      className={cn('rounded-lg border-none px-2', {
        'bg-tm-work-bg': isWork,
        'bg-tm-rest-bg': !isWork && isWork !== undefined && state !== TimerState.Idle,
      })}
    >
      <CardHeader className="space-y-2">
        <CardTitle className="text-card-foreground text-center text-3xl font-bold">
          {label}
        </CardTitle>
        <CardDescription className="text-card-foreground">
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

      <CardContent>
        <div
          className={cn(
            'font-mono text-[clamp(4rem,18vw,28vh)] leading-none font-bold tabular-nums md:text-[clamp(8rem,18vw,30vh)] lg:text-[clamp(10rem,18vw,50vh)]',
            {
              'text-tm-work-fg': isWork,
              'text-tm-rest-fg': !isWork && isWork !== undefined,
              'text-foreground': isWork === undefined,
            }
          )}
        >
          {time}
        </div>
      </CardContent>

      <CardFooter className="grow justify-center px-0 pt-0">
        <div className="flex max-w-8/10 grow flex-col space-x-4">{children}</div>
      </CardFooter>
    </Card>
  </div>
)
