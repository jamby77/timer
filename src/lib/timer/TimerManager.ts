import { StepState } from '@/lib/enums'

import { cancelAnimationFrame, requestAnimationFrame } from './requestAnimationFramePolyfill'

// Re-export StepState for backward compatibility
export { StepState }

export interface StepStateData {
  step: TimerStep
  index: number
  elapsed: number // 0 when not applicable (start, resume, complete)
}

export type StepStateChangeCallback = (state: StepState, data: StepStateData) => void

export interface TimerStep {
  duration: number // in milliseconds
  label: string
  id: string
  isWork?: boolean
  onStart?: () => void
  onComplete?: () => void
  onStepStateChange?: StepStateChangeCallback
}

export interface TimerSequenceOptions {
  steps: TimerStep[]
  repeat?: number // Number of times to repeat the sequence, 0 for infinite
  onStepChange?: (step: TimerStep, stepIndex: number) => void
  onSequenceComplete?: (endedAt: number) => void
  onTick?: (time: number, totalElapsedTime: number, step: TimerStep | null) => void // Add this
}

export class TimerManager {
  private readonly sequence: TimerStep[] = []
  private currentStepIndex: number = 0
  private currentRepeat: number = 0
  private readonly totalRepeats: number = 0
  private frame: number | null = null
  private stepEndsAt = 0
  private pausedRemaining: number | null = null
  private lastTickAt = 0
  private isSequenceRunning: boolean = false
  private readonly onStepChange?: (step: TimerStep, stepIndex: number) => void
  private readonly onSequenceComplete?: (endedAt: number) => void
  private readonly onStepTick?: (
    time: number,
    totalElapsedTime: number,
    step: TimerStep | null
  ) => void

  constructor(options: TimerSequenceOptions) {
    this.sequence = [...options.steps]
    this.totalRepeats = options.repeat ?? 0
    this.onStepChange = options.onStepChange
    this.onSequenceComplete = options.onSequenceComplete
    this.onStepTick = options.onTick
  }

  public start(now = Date.now()): void {
    const step = this.getCurrentStep()
    if (!step || this.isSequenceRunning) return

    this.isSequenceRunning = true
    if (this.pausedRemaining === null) {
      this.startStep(step, now)
    } else {
      this.stepEndsAt = now + this.pausedRemaining
      this.pausedRemaining = null
      step.onStepStateChange?.(StepState.Resume, { step, index: this.currentStepIndex, elapsed: 0 })
    }
    this.lastTickAt = now
    this.frame = requestAnimationFrame(this.tick)
  }

  public resumeFrom(index: number, remaining: number): void {
    const step = this.sequence[index]
    if (!step) return
    this.currentStepIndex = index
    this.pausedRemaining = Math.min(remaining, step.duration)
    this.onStepChange?.(step, index)
    this.onStepTick?.(this.pausedRemaining, step.duration - this.pausedRemaining, step)
    this.start()
  }

  public pause(): boolean {
    if (!this.isSequenceRunning) return false
    const now = Date.now()
    this.update(now)
    const step = this.getCurrentStep()
    if (!this.isSequenceRunning || !step) return false

    this.pausedRemaining = this.stepEndsAt - now
    const elapsed = step.duration - this.pausedRemaining
    this.stopFrames()
    this.onStepTick?.(this.pausedRemaining, elapsed, step)
    step.onStepStateChange?.(StepState.Pause, { step, index: this.currentStepIndex, elapsed })
    return true
  }

  public skipCurrentStep(): void {
    if (!this.isSequenceRunning) return
    const now = Date.now()
    this.update(now)
    const step = this.getCurrentStep()
    if (!this.isSequenceRunning || !step) return
    const elapsed = step.duration - (this.stepEndsAt - now)
    step.onStepStateChange?.(StepState.Skip, { step, index: this.currentStepIndex, elapsed })
    this.advanceToNextStep(now)
  }

  public stop(): void {
    const now = Date.now()
    if (this.isSequenceRunning) this.update(now, false)
    const step = this.getCurrentStep()
    if (step && (this.isSequenceRunning || this.pausedRemaining !== null)) {
      const remaining = this.pausedRemaining ?? (this.stepEndsAt - now)
      const elapsed = Math.max(0, Math.min(step.duration, step.duration - remaining))
      if (elapsed > 0) {
        step.onStepStateChange?.(StepState.Stop, { step, index: this.currentStepIndex, elapsed })
      }
    }
    this.reset()
  }

  public reset(): void {
    this.stopFrames()
    this.pausedRemaining = null
    this.currentStepIndex = 0
    this.currentRepeat = 0
  }

  public getCurrentStep(): TimerStep | null {
    return this.sequence[this.currentStepIndex] || null
  }

  public getCurrentStepIndex(): number {
    return this.currentStepIndex
  }

  public getCurrentRepeat(): number {
    return this.currentRepeat
  }

  public getTotalSteps(): number {
    return this.sequence.length
  }

  public getTotalRepeats(): number {
    return this.totalRepeats
  }

  public isRunning(): boolean {
    return this.isSequenceRunning
  }

  public getSteps(): TimerStep[] {
    return [...this.sequence]
  }

  private startStep(step: TimerStep, startsAt: number): void {
    this.stepEndsAt = startsAt + Math.max(1, step.duration)
    step.onStart?.()
    step.onStepStateChange?.(StepState.Start, { step, index: this.currentStepIndex, elapsed: 0 })
    this.onStepChange?.(step, this.currentStepIndex)
  }

  private tick = (): void => {
    this.frame = null
    this.update(Date.now())
    if (this.isSequenceRunning) this.frame = requestAnimationFrame(this.tick)
  }

  private update(now: number, notifyCompletion = true): void {
    let step = this.getCurrentStep()
    let advanced = false
    while (this.isSequenceRunning && step && now >= this.stepEndsAt) {
      this.onStepTick?.(0, step.duration, step)
      step.onStepStateChange?.(StepState.Complete, {
        step,
        index: this.currentStepIndex,
        elapsed: 0,
      })
      step.onComplete?.()
      this.advanceToNextStep(this.stepEndsAt, notifyCompletion)
      advanced = true
      step = this.getCurrentStep()
    }
    if (this.isSequenceRunning && step && (advanced || now - this.lastTickAt >= 100)) {
      const remaining = this.stepEndsAt - now
      this.onStepTick?.(remaining, step.duration - remaining, step)
      this.lastTickAt = now
    }
  }

  private advanceToNextStep(startsAt: number, notifyCompletion = true): void {
    this.currentStepIndex++
    if (this.currentStepIndex >= this.sequence.length) {
      this.currentStepIndex = 0
      this.currentRepeat++
      if (this.totalRepeats > 0 && this.currentRepeat >= this.totalRepeats) {
        this.stopFrames()
        if (notifyCompletion) this.onSequenceComplete?.(startsAt)
        return
      }
    }
    this.startStep(this.sequence[this.currentStepIndex], startsAt)
    this.lastTickAt = startsAt
  }

  private stopFrames(): void {
    this.isSequenceRunning = false
    if (this.frame !== null) cancelAnimationFrame(this.frame)
    this.frame = null
  }
}

export default TimerManager
