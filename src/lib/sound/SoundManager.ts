import { z } from 'zod'

import type { SoundConfig } from '@/types/configure'

import { TimerPhase, TimerState } from '@/lib/enums'

import {
  playCountdownBeep,
  playFinishBeep,
  playIntervalEndBeep,
  playIntervalStartBeep,
  playStartBeep,
} from './cues'
import { SoundEngine } from './SoundEngine'

const SoundManagerConfigSchema = z.object({
  enabled: z.boolean().catch(false),
  volume: z.number().min(0).max(1).catch(0.7),
  countdownBeeps: z.int().min(1).catch(3),
  startBeep: z.boolean().catch(true),
  finishBeep: z.boolean().catch(true),
  intervalStartBeep: z.boolean().catch(true),
  intervalEndBeep: z.boolean().catch(true),
})

type SoundManagerConfig = z.infer<typeof SoundManagerConfigSchema>

type PlayedCue = 'start' | 'finish' | 'intervalStart' | 'intervalEnd' | 'countdownBeep'

const resolveSoundConfig = (config?: SoundConfig): SoundManagerConfig => {
  return SoundManagerConfigSchema.parse(config ?? {})
}

export class SoundManager {
  private config: SoundManagerConfig

  private lastCountdownSecond: number | null = null

  private lastPlayedWallClockSecond: number | null = null
  private lastPlayedCue: PlayedCue | null = null

  private previousTimerState: TimerState | null = null
  private previousPhase: TimerPhase | null = null
  private previousIsWork: boolean | null = null

  private previousCountdownTimeLeftMs: number | null = null
  private previousStopwatchElapsedMs: number | null = null
  private previousIntervalStepIndex: number | null = null
  private previousWorkRestRounds: number | null = null

  constructor(config?: SoundConfig) {
    this.config = resolveSoundConfig(config)
    this.applyEngineSettings()
  }

  public syncPreStartCountdown(timeLeftMs: number): void {
    if (!this.config.enabled) {
      return
    }

    this.onCountdownTick(timeLeftMs)
  }

  public setConfig(config?: SoundConfig): void {
    this.config = resolveSoundConfig(config)
    this.applyEngineSettings()
    this.reset()
  }

  public reset(): void {
    this.resetTickState()
    this.resetPlaybackState()
    this.previousTimerState = null
    this.previousPhase = null
    this.previousIsWork = null

    this.previousCountdownTimeLeftMs = null
    this.previousStopwatchElapsedMs = null
    this.previousIntervalStepIndex = null
    this.previousWorkRestRounds = null
  }

  private resetTickState(): void {
    this.lastCountdownSecond = null
  }

  private resetPlaybackState(): void {
    this.lastPlayedWallClockSecond = null
    this.lastPlayedCue = null
  }

  private hasPlayedCueThisSecond(nowSecond: number = Math.floor(Date.now() / 1000)): boolean {
    return this.lastPlayedWallClockSecond === nowSecond && this.lastPlayedCue !== null
  }

  private tryPlayCue(cue: PlayedCue, play: () => void): boolean {
    const nowSecond = Math.floor(Date.now() / 1000)

    if (this.hasPlayedCueThisSecond(nowSecond)) {
      return false
    }

    play()
    this.lastPlayedWallClockSecond = nowSecond
    this.lastPlayedCue = cue
    return true
  }

  private handleTimerStateTransition(
    timerState: TimerState,
    prevState: TimerState | null,
    handlers?: {
      onIdle?: () => void
      shouldStart?: () => boolean
      onStart?: () => void
      shouldFinish?: () => boolean
      onFinish?: () => void
    }
  ): void {
    if (prevState === timerState) {
      return
    }

    if (timerState === TimerState.Idle && prevState !== null) {
      this.resetTickState()
      handlers?.onIdle?.()
    }

    if (
      timerState === TimerState.Running &&
      prevState !== TimerState.Running &&
      (prevState === null || prevState === TimerState.Idle || prevState === TimerState.Completed)
    ) {
      if (!handlers?.shouldStart || handlers.shouldStart()) {
        if (handlers?.onStart) {
          handlers.onStart()
        } else {
          this.onStart()
        }
      }
    }

    if (timerState === TimerState.Completed && prevState !== TimerState.Completed) {
      if (!handlers?.shouldFinish || handlers.shouldFinish()) {
        if (handlers?.onFinish) {
          handlers.onFinish()
        } else {
          this.onFinish()
        }
      }
    }
  }

  public syncCountdown(timerState: TimerState, timeLeftMs: number): void {
    const prevState = this.previousTimerState

    if (
      timerState === TimerState.Running &&
      this.previousCountdownTimeLeftMs !== null &&
      timeLeftMs > this.previousCountdownTimeLeftMs + 50
    ) {
      this.resetTickState()
    }

    this.handleTimerStateTransition(timerState, prevState)

    if (timerState === TimerState.Running) {
      this.onCountdownTick(timeLeftMs)
    }

    this.previousTimerState = timerState
    this.previousCountdownTimeLeftMs = timeLeftMs
  }

  public syncStopwatch(timerState: TimerState, elapsedMs: number): void {
    const prevState = this.previousTimerState

    if (
      timerState === TimerState.Running &&
      this.previousStopwatchElapsedMs !== null &&
      elapsedMs < this.previousStopwatchElapsedMs - 50
    ) {
      this.resetTickState()
    }

    this.handleTimerStateTransition(timerState, prevState)

    this.previousTimerState = timerState
    this.previousStopwatchElapsedMs = elapsedMs
  }

  public syncInterval(
    timerState: TimerState,
    timeLeftMs: number,
    isWork: boolean | null,
    stepIndex: number
  ): void {
    const prevState = this.previousTimerState
    const prevIsWork = this.previousIsWork

    if (
      timerState === TimerState.Running &&
      this.previousIntervalStepIndex !== null &&
      stepIndex < this.previousIntervalStepIndex
    ) {
      this.resetTickState()
      this.previousIsWork = null
    }

    this.handleTimerStateTransition(timerState, prevState, {
      onIdle: () => {
        this.previousIsWork = null
      },
      onFinish: () => {
        if (prevIsWork === true) {
          this.onIntervalEnd()
        }
        this.onFinish()
        this.previousIsWork = null
      },
    })

    if (
      timerState === TimerState.Running &&
      prevIsWork !== null &&
      isWork !== null &&
      prevIsWork !== isWork
    ) {
      if (prevIsWork && !isWork) {
        this.onIntervalEnd()
      }

      if (!prevIsWork && isWork) {
        this.onIntervalStart()
      }
    }

    if (timerState === TimerState.Running) {
      this.onCountdownTick(timeLeftMs)
    }

    this.previousTimerState = timerState
    this.previousIsWork = isWork
    this.previousIntervalStepIndex = stepIndex
  }

  public syncWorkRest(
    timerState: TimerState,
    phase: TimerPhase,
    currentTimeMs: number,
    rounds: number
  ): void {
    const prevState = this.previousTimerState
    const prevPhase = this.previousPhase

    if (
      timerState === TimerState.Running &&
      this.previousWorkRestRounds !== null &&
      rounds < this.previousWorkRestRounds
    ) {
      this.resetTickState()
      this.previousPhase = null
    }

    this.handleTimerStateTransition(timerState, prevState, {
      shouldStart: () => phase === TimerPhase.Work && prevPhase !== TimerPhase.Rest,
    })

    if (prevPhase !== null && prevPhase !== phase) {
      if (prevPhase === TimerPhase.Work && phase === TimerPhase.Rest) {
        this.onIntervalEnd()
      }

      if (prevPhase === TimerPhase.Rest && phase === TimerPhase.Work) {
        this.onIntervalStart()
      }

      if (prevPhase === TimerPhase.Rest && phase === TimerPhase.Idle) {
        if (this.previousWorkRestRounds !== null && rounds > this.previousWorkRestRounds) {
          this.onFinish()
        }
      }
    }

    if (timerState === TimerState.Running) {
      if (phase === TimerPhase.Rest) {
        this.onCountdownTick(currentTimeMs)
      }
    }

    this.previousTimerState = timerState
    this.previousPhase = phase
    this.previousWorkRestRounds = rounds
  }

  public async init(): Promise<boolean> {
    if (!this.config.enabled) {
      return false
    }
    const engine = SoundEngine.getInstance()
    const ok = await engine.init()
    this.applyEngineSettings()
    return ok
  }

  public onStart(): void {
    if (!this.config.enabled || !this.config.startBeep) {
      return
    }

    this.tryPlayCue('start', () => {
      playStartBeep()
    })
  }

  public onFinish(): void {
    if (!this.config.enabled || !this.config.finishBeep) {
      return
    }

    this.tryPlayCue('finish', () => {
      playFinishBeep()
    })
  }

  public onIntervalStart(): void {
    if (!this.config.enabled || !this.config.intervalStartBeep) {
      return
    }

    this.tryPlayCue('intervalStart', () => {
      playIntervalStartBeep()
    })
  }

  public onIntervalEnd(): void {
    if (!this.config.enabled || !this.config.intervalEndBeep) {
      return
    }

    this.tryPlayCue('intervalEnd', () => {
      playIntervalEndBeep()
    })
  }

  public onCountdownTick(timeLeftMs: number): void {
    if (!this.config.enabled) {
      return
    }

    const secondsLeft = Math.ceil(timeLeftMs / 1000)

    const countdownThresholdSeconds = this.config.countdownBeeps
    if (
      countdownThresholdSeconds > 0 &&
      secondsLeft > 0 &&
      secondsLeft <= countdownThresholdSeconds
    ) {
      if (this.lastCountdownSecond !== secondsLeft) {
        const played = this.tryPlayCue('countdownBeep', () => {
          playCountdownBeep(secondsLeft)
        })

        if (played) {
          this.lastCountdownSecond = secondsLeft
        }
      }
    } else if (secondsLeft > countdownThresholdSeconds) {
      this.lastCountdownSecond = null
    }
  }

  private applyEngineSettings(): void {
    const engine = SoundEngine.getInstance()
    engine.setEnabled(this.config.enabled)
    engine.setVolume(this.config.volume)
  }
}
