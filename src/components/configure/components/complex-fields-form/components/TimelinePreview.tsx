import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import type { ReactNode } from 'react'
import type { ComplexConfig, IntervalConfig, PhaseRepeatGroup } from '@/types/configure'

import { isIntervalConfig, isStopwatchConfig, isWorkRestConfig } from '@/types/configure'
import { buildTimeline } from '@/lib/configure/timeline'
import { formatDuration } from '@/lib/configure/utils'
import { intervalRestCount } from '@/lib/timer/utils'

import { Button } from '@/components/ui/button'

const row =
  'grid min-h-11 grid-cols-[max-content_minmax(0,1fr)_auto] items-baseline gap-x-2 border-t py-2.5'
const durationText = (seconds: number) => formatDuration(seconds, { exact: true })

function Timestamp({ seconds }: { seconds?: number }) {
  const value = seconds ?? 0
  const hours = Math.floor(value / 3600)
  const minutes = Math.floor(value / 60) % 60
  const remainder = String(value % 60).padStart(2, '0')
  return (
    <span className="text-muted-foreground min-w-[5ch] text-sm tabular-nums">
      {seconds === undefined
        ? '—'
        : hours
          ? `${hours}:${String(minutes).padStart(2, '0')}:${remainder}`
          : `${minutes}:${remainder}`}
    </span>
  )
}

function IntervalRounds({ config, start }: { config: IntervalConfig; start?: number }) {
  const [count, setCount] = useState(10)
  const restCount = intervalRestCount(config.intervals, config.skipLastRest)
  return (
    <div className="mb-3 ml-1 space-y-2 border-l-2 pl-3 text-sm">
      {Array.from({ length: Math.min(count, config.intervals) }, (_, i) => {
        const workAt =
          start === undefined ? undefined : start + i * (config.workDuration + config.restDuration)
        const step = 'grid grid-cols-[max-content_minmax(0,1fr)_auto] gap-2 wrap-anywhere'
        return (
          <div key={i}>
            <p className="mb-1 font-semibold">Round {i + 1}</p>
            <div className={step}>
              <Timestamp seconds={workAt} />
              <span>{config.workLabel || 'Work'}</span>
              <span>{durationText(config.workDuration)}</span>
            </div>
            {config.restDuration > 0 && i < restCount && (
              <div className={step}>
                <Timestamp
                  seconds={workAt === undefined ? undefined : workAt + config.workDuration}
                />
                <span>{config.restLabel || 'Rest'}</span>
                <span>{durationText(config.restDuration)}</span>
              </div>
            )}
          </div>
        )
      })}
      {count < config.intervals && (
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => setCount(count + 10)}
        >
          More rounds
        </Button>
      )}
    </div>
  )
}

type TimelineEntry = ReturnType<typeof buildTimeline>['entries'][number]

function PhaseEntry({ phase, ready, readyAt, start, duration, manual }: TimelineEntry) {
  const child = phase.config
  const [open, setOpen] = useState(false)
  let detail = duration === undefined ? 'Self-paced' : durationText(duration)
  if (isStopwatchConfig(child))
    detail = child.timeLimit ? `${durationText(child.timeLimit)} limit` : 'No time limit'
  if (isWorkRestConfig(child) && child.maxWorkTime)
    detail = `Self-paced · ${durationText(child.maxWorkTime)} work limit`
  return (
    <>
      {ready > 0 && (
        <div className={row}>
          <Timestamp seconds={readyAt} />
          <span>Get ready</span>
          <small>{durationText(ready)}</small>
        </div>
      )}
      {isIntervalConfig(child) ? (
        <>
          <button
            type="button"
            className={row + ' w-full text-left'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <Timestamp seconds={start} />
            <strong className="wrap-anywhere">{phase.name}</strong>
            <ChevronDown aria-hidden className={open ? 'size-4 rotate-180' : 'size-4'} />
            <span className="text-muted-foreground col-span-2 col-start-2 text-sm">
              {child.intervals} {child.intervals === 1 ? 'round' : 'rounds'} · {detail}
            </span>
          </button>
          {open && <IntervalRounds config={child} start={start} />}
        </>
      ) : (
        <div className={row}>
          <Timestamp seconds={start} />
          <strong className="wrap-anywhere">{phase.name}</strong>
          <span
            className={
              duration === undefined
                ? 'text-muted-foreground col-span-2 col-start-2 text-sm'
                : 'text-muted-foreground text-sm'
            }
          >
            {detail}
          </span>
        </div>
      )}
      {manual && <p className="text-muted-foreground pb-2 text-sm">Tap Next to continue</p>}
    </>
  )
}

function Disclosure({
  title,
  seconds,
  children,
}: {
  title: string
  seconds?: number
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        className={row + ' w-full text-left'}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Timestamp seconds={seconds} />
        <strong>{title}</strong>
        <ChevronDown aria-hidden className={open ? 'size-4 rotate-180' : 'size-4'} />
      </button>
      {open && <div className="border-l-2 pl-2 sm:pl-4">{children}</div>}
    </div>
  )
}

function timelineSections(entries: TimelineEntry[]) {
  type RepeatSection = { group: PhaseRepeatGroup; passes: TimelineEntry[][] }
  const sections: (TimelineEntry | RepeatSection)[] = []
  let current: RepeatSection | undefined
  for (const entry of entries) {
    const { group, pass } = entry.phase
    if (!group || !pass) {
      current = undefined
      sections.push(entry)
      continue
    }
    if (current?.group.id !== group.id) {
      current = { group, passes: [] }
      sections.push(current)
    }
    if (pass > current.passes.length) current.passes.push([])
    current.passes[pass - 1].push(entry)
  }
  return sections
}

export function TimelinePreview({ config }: { config: Partial<ComplexConfig> }) {
  const { entries, finish } = buildTimeline(config)
  return (
    <div>
      {timelineSections(entries).map((section) =>
        'phase' in section ? (
          <PhaseEntry key={'phase-' + section.phase.id} {...section} />
        ) : (
          <Disclosure
            key={'group-' + section.group.id}
            title={`Repeat ×${section.group.count}`}
            seconds={section.passes[0][0].readyAt}
          >
            {section.passes.map((pass) => (
              <Disclosure
                key={pass[0].phase.pass}
                title={`Pass ${pass[0].phase.pass} of ${section.group.count}`}
                seconds={pass[0].readyAt}
              >
                {pass.map((entry) => (
                  <PhaseEntry key={entry.phase.id} {...entry} />
                ))}
              </Disclosure>
            ))}
          </Disclosure>
        )
      )}
      <div className={row}>
        <Timestamp seconds={finish} />
        <strong>Finish</strong>
      </div>
    </div>
  )
}
