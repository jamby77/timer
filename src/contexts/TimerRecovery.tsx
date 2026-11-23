'use client'

import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react'
import { z } from 'zod'

import type { ReactNode } from 'react'
import type { AnyTimerConfig, IntervalConfig } from '@/types/configure'

import { TimerPhase, TimerState } from '@/lib/enums'
import { SoundEngine } from '@/lib/sound/SoundEngine'
import { formatTime } from '@/lib/timer/utils'

import { Button } from '@/components/ui/button'

const ms = z.number().finite().nonnegative()
const index = z.number().int().nonnegative()
const progress = z.object({
  countdown: ms.optional(),
  stopwatch: ms.optional(),
  prestart: ms.optional(),
  interval: z.object({ index, remaining: ms, overdueMs: ms.optional() }).optional(),
  workrest: z
    .object({
      phase: z.enum([TimerPhase.Work, TimerPhase.Rest, TimerPhase.Idle]),
      rounds: index,
      time: ms,
      restDuration: ms,
      overdueMs: ms.optional(),
      preview: z.object({ round: index, time: ms }).optional(),
    })
    .optional(),
  phaseIndex: index.optional(),
  clock: z.object({ elapsed: ms, acknowledged: z.boolean() }).optional(),
  laps: z.array(z.object({ id: z.string(), timestamp: ms, lapTime: ms })).optional(),
})
type Progress = z.infer<typeof progress>
function intervalPreview(saved: NonNullable<Progress['interval']>, config: IntervalConfig) {
  let { index, remaining } = saved
  let overdue = saved.overdueMs ?? 0
  const lastIndex = config.intervals * 2 - (config.skipLastRest === false ? 1 : 2)
  while (remaining === 0 && index < lastIndex) {
    index++
    const seconds = index % 2 === 0 ? config.workDuration : config.restDuration
    const duration = Math.max(1, seconds * 1000)
    remaining = Math.max(0, duration - overdue)
    overdue = Math.max(0, overdue - duration)
  }
  return { index, remaining }
}

class Session {
  private readers = new Set<(snapshot: Progress) => void>()
  constructor(public initial: Progress = {}) {}
  clearInitial() {
    this.initial = {}
  }
  register(reader: (snapshot: Progress) => void) {
    this.readers.add(reader)
    return () => {
      this.readers.delete(reader)
    }
  }
  snapshot() {
    const snapshot: Progress = {}
    this.readers.forEach((read) => read(snapshot))
    return snapshot
  }
}
const RecoveryContext = createContext<Session | null>(null)

export function useInitialProgress<K extends keyof Progress>(key: K) {
  const session = useContext(RecoveryContext)
  const [value] = useState(() => session?.initial[key])
  return value
}

export function useSaveProgress<K extends keyof Progress>(
  key: K,
  value: Progress[K] | (() => Progress[K])
) {
  const session = useContext(RecoveryContext)
  useLayoutEffect(() => {
    if (!session) return
    return session.register((snapshot) => {
      snapshot[key] = typeof value === 'function' ? value() : value
    })
  }, [session, key, value])
}

export const isRecoverable = (state: TimerState) =>
  state === TimerState.Running || state === TimerState.Paused

function hasRun(value: Progress) {
  return (
    value.prestart !== undefined ||
    value.countdown !== undefined ||
    value.stopwatch !== undefined ||
    value.interval !== undefined ||
    value.workrest !== undefined
  )
}

function read(key: string, config: AnyTimerConfig, signature: string) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return
    const record = JSON.parse(raw)
    if (record?.signature !== signature) return
    const value = progress.parse(record.progress)
    if (
      hasRun(value) &&
      (config.type !== 'COMPLEX' || (value.phaseIndex ?? 0) < config.phases.length)
    )
      return value
  } catch {
    return
  }
}

export function TimerRecovery({
  config,
  children,
}: {
  config: AnyTimerConfig
  children: ReactNode
}) {
  const key = 'timer-recovery-v1:' + config.id
  const [signature] = useState(() => JSON.stringify(config))
  const [saved] = useState(() => read(key, config, signature))
  const [session, setSession] = useState<Session | null>(() => (saved ? null : new Session()))

  useEffect(() => {
    if (!session) return
    session.clearInitial()
    let lastWrite: string | null | undefined
    const save = () => {
      try {
        const current = session.snapshot()
        const snapshot =
          current.prestart === undefined
            ? current
            : {
                prestart: current.prestart,
                phaseIndex: current.phaseIndex,
                clock: current.clock,
                laps: current.laps,
              }
        const content = hasRun(snapshot) ? JSON.stringify({ signature, progress: snapshot }) : null
        if (content === lastWrite) return
        if (content) sessionStorage.setItem(key, content)
        else sessionStorage.removeItem(key)
        lastWrite = content
      } catch {
        return
      }
    }
    const interval = window.setInterval(save, 1000)
    window.addEventListener('pagehide', save)
    document.addEventListener('visibilitychange', save)
    return () => {
      clearInterval(interval)
      window.removeEventListener('pagehide', save)
      document.removeEventListener('visibilitychange', save)
      save()
    }
  }, [session, key, signature])

  if (!session && saved) {
    const phase =
      config.type === 'COMPLEX'
        ? [...config.phases].sort((a, b) => a.order - b.order)[saved.phaseIndex ?? 0]
        : undefined
    const activeConfig = phase?.config ?? config
    const interval = saved.interval && activeConfig.type === 'INTERVAL'
      ? intervalPreview(saved.interval, activeConfig)
      : saved.interval
    const time =
      saved.prestart ??
      interval?.remaining ??
      saved.workrest?.preview?.time ??
      saved.workrest?.time ??
      saved.countdown ??
      saved.stopwatch ??
      0
    const round = interval
      ? Math.floor(interval.index / 2) + 1
      : saved.workrest
        ? saved.workrest.preview?.round ?? saved.workrest.rounds + 1
        : undefined
    const detail = [phase?.name, round && `Round ${round}`, formatTime(time).split('.')[0]]
      .filter(Boolean)
      .join(' · ')
    const discard = () => {
      setSession(new Session())
      try {
        sessionStorage.removeItem(key)
      } catch {
        return
      }
    }
    const resume = () => {
      if ((config.sound ?? phase?.config.sound)?.enabled) void SoundEngine.getInstance().init()
      setSession(new Session(saved))
    }

    return (
      <section
        aria-labelledby="recovery-title"
        className="bg-card text-card-foreground mx-auto flex w-full max-w-sm flex-col gap-4 rounded-xl border p-5 shadow-sm"
      >
        <div>
          <h1 id="recovery-title" className="text-xl font-semibold">
            Resume timer?
          </h1>
          <p className="text-muted-foreground mt-1 wrap-anywhere">{config.name}</p>
        </div>
        <p className="text-sm wrap-anywhere tabular-nums">{detail}</p>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="min-h-11"
            onClick={discard}
          >
            Discard
          </Button>
          <Button className="min-h-11" onClick={resume}>
            Resume
          </Button>
        </div>
      </section>
    )
  }
  return <RecoveryContext.Provider value={session}>{children}</RecoveryContext.Provider>
}
