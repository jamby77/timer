import type { AnyTimerConfig, ComplexConfig } from '@/types/configure'

import { exactPhaseDuration, formatDuration } from '@/lib/configure/utils'
import { TIMER_TYPE_LABELS, TimerType, WorkRestMode } from '@/lib/enums'
import { clampCountdownSeconds } from '@/lib/timer/utils'
import { workTimeLimitMs } from '@/hooks/useWorkRestTimer'

function duration(seconds: number) {
  return formatDuration(seconds, { exact: true })
}

function heading(config: AnyTimerConfig) {
  if (config.type === TimerType.INTERVAL) {
    return `Interval · ${config.intervals} ${config.intervals === 1 ? 'round' : 'rounds'} · ${duration(exactPhaseDuration(config)!)}`
  }
  return config.type === TimerType.WORKREST ? 'Work/Rest' : TIMER_TYPE_LABELS[config.type]
}

function settings(config: AnyTimerConfig) {
  const rows: [string, string][] = []
  switch (config.type) {
    case TimerType.COUNTDOWN:
      rows.push(['Duration', duration(config.duration)])
      break
    case TimerType.STOPWATCH:
      rows.push(['Time limit', config.timeLimit ? duration(config.timeLimit) : 'None'])
      break
    case TimerType.INTERVAL:
      rows.push(
        [config.workLabel || 'Work', duration(config.workDuration)],
        [config.restLabel || 'Rest', duration(config.restDuration)],
        ['Final rest', config.skipLastRest === false ? 'Included' : 'Skipped']
      )
      if (config.workDirection) rows.push(['Work clock', `Counts ${config.workDirection}`])
      if (config.restDirection) rows.push(['Rest clock', `Counts ${config.restDirection}`])
      config.roundNames?.slice(0, config.intervals).forEach((name, index) => {
        if (name.trim()) rows.push([`Round ${index + 1}`, name])
      })
      break
    case TimerType.WORKREST:
      rows.push(
        ['Max rounds', String(config.maxRounds)],
        ['Max work time', duration(workTimeLimitMs(config.maxWorkTime) / 1000)],
        config.restMode === WorkRestMode.FIXED
          ? ['Fixed rest', duration(config.fixedRestDuration)]
          : ['Rest duration', `${config.ratio} × work time`],
        ['Auto-continue', config.autoContinue ? 'On' : 'Off']
      )
      break
    case TimerType.COMPLEX:
      rows.push(
        [
          'Overall time limit',
          config.overallTimeLimit ? duration(config.overallTimeLimit) : 'None',
        ],
        ['Auto-advance', config.autoAdvance === false ? 'Off' : 'On']
      )
      break
  }
  rows.push(
    [
      'Pre-start',
      config.type === TimerType.COMPLEX && config.countdownBeforeStart === undefined
        ? 'First phase setting'
        : duration(clampCountdownSeconds(config.countdownBeforeStart)),
    ],
    [
      'Sounds',
      config.type === TimerType.COMPLEX && !config.sound
        ? 'Phase settings'
        : config.sound?.enabled
          ? 'On'
          : 'Off',
    ]
  )
  if (config.completionMessage) rows.push(['Finish message', config.completionMessage])
  return rows
}

function SettingsList({ config }: { config: AnyTimerConfig }) {
  return (
    <dl className="text-sm">
      {settings(config).map(([label, value], index) => (
        <div key={index} className="border-border flex justify-between gap-3 border-t py-2">
          <dt className="text-muted-foreground min-w-0 wrap-anywhere">{label}</dt>
          <dd className="min-w-0 text-right font-semibold wrap-anywhere">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Phases({ config }: { config: ComplexConfig }) {
  const phases = [...config.phases].sort((a, b) => a.order - b.order)
  const repeats = new Map(config.repeatGroups?.map((group) => [group.phaseIds[0], group]))
  return (
    <section className="mt-4">
      <h3 className="font-semibold">Phases</h3>
      <ol className="mt-2 space-y-2">
        {phases.map((phase, index) => {
          const repeat = repeats.get(phase.id)
          return (
            <li key={phase.id}>
              {repeat && (
                <p className="text-muted-foreground mb-1 text-sm font-semibold">
                  Repeat {repeat.phaseIds.length === 1 ? 'phase' : 'phases'} {index + 1}
                  {repeat.phaseIds.length > 1 && `–${index + repeat.phaseIds.length}`} ×{' '}
                  {repeat.count}
                </p>
              )}
              <details className="border-border rounded-md border px-3">
                <summary className="cursor-pointer py-2 text-sm wrap-anywhere">
                  <span className="font-semibold">
                    {index + 1}. {phase.name || phase.config.name}
                  </span>
                  <span className="text-muted-foreground block">{heading(phase.config)}</span>
                </summary>
                <SettingsList
                  config={{ ...phase.config, sound: config.sound ?? phase.config.sound }}
                />
              </details>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export function TimerSummary({ config }: { config: AnyTimerConfig }) {
  return (
    <article className="bg-card text-card-foreground border-border rounded-xl border p-4">
      <h2 className="text-xl font-bold wrap-anywhere">{config.name}</h2>
      <p className="text-muted-foreground mt-1 mb-2 text-sm">{heading(config)}</p>
      <SettingsList config={config} />
      {config.type === TimerType.COMPLEX && <Phases config={config} />}
    </article>
  )
}
