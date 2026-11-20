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

const timerStatusLabels = {
  [TimerState.Idle]: '',
  [TimerState.Running]: '',
  [TimerState.Paused]: 'Paused',
  [TimerState.Completed]: 'Complete',
}

interface TimerCardProps {
  header?: ReactNode
  headerControls?: ReactNode
  hideLabel?: boolean
  label: string
  state: TimerState
  time: string
  children: ReactNode
  subtitle?: ReactNode
  idleStatus?: string
  isPreStarting?: boolean
  isWork?: boolean
  fullscreen?: boolean
}

export const TimerCard = ({
  label,
  header,
  headerControls,
  hideLabel = false,
  state,
  time,
  children,
  subtitle,
  idleStatus,
  isPreStarting = false,
  isWork,
  fullscreen = false,
}: TimerCardProps) => {
  let status = timerStatusLabels[state]
  if (state === TimerState.Idle && idleStatus) status = idleStatus
  if (state === TimerState.Running && isPreStarting) status = 'Get ready'
  const lastDotIndex = time.lastIndexOf('.')
  const mainTime = lastDotIndex > -1 ? time.slice(0, lastDotIndex) : time
  const fractionalTime = lastDotIndex > -1 ? time.slice(lastDotIndex) : ''
  const characterWidth = mainTime.length * 0.62 + fractionalTime.length * 0.18

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col" data-timer-state={state}>
      <Card
        className={cn('flex h-full min-h-0 flex-col gap-0! overflow-hidden border-0 p-0!', {
          'rounded-none!': fullscreen,
          'bg-tm-work-bg text-tm-work-fg': isWork,
          'bg-tm-rest-bg text-tm-rest-fg': isWork === false,
        })}
      >
        {(header || !hideLabel || subtitle || status) && (
          <CardHeader
            className={cn('shrink-0 gap-1 px-4 text-center md:px-6', header ? 'py-1' : 'py-2')}
          >
            {header}
            {!hideLabel && (
              <CardTitle
                className={cn(
                  'truncate max-sm:portrait:line-clamp-2 max-sm:portrait:wrap-anywhere max-sm:portrait:whitespace-normal max-sm:portrait:leading-tight',
                  subtitle
                    ? 'text-xs leading-4 font-normal opacity-80'
                    : 'text-base font-semibold sm:text-lg'
                )}
                title={label}
              >
                {label}
              </CardTitle>
            )}
            {subtitle && (
              <CardDescription className="text-base leading-none font-semibold text-inherit sm:text-lg">
                {subtitle}
              </CardDescription>
            )}
            {status && (
              <div role="status" className="text-sm leading-5 font-semibold">
                {status}
              </div>
            )}
            {headerControls}
          </CardHeader>
        )}
        <CardContent className="min-h-0 flex-1 px-3 md:px-6">
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ containerType: 'size' }}
          >
            <div
              className="flex items-baseline justify-center font-mono leading-none font-bold whitespace-nowrap tabular-nums"
              style={{ fontSize: `min(${90 / characterWidth}cqw, 76cqh)` }}
            >
              <span>{mainTime}</span>
              {fractionalTime && <span className="text-[0.28em] opacity-70">{fractionalTime}</span>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="shrink-0 justify-center px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6">
          <div className="flex w-full flex-col gap-2">{children}</div>
        </CardFooter>
      </Card>
    </div>
  )
}
