import type { TimerOptions } from './types'

import { TimerState } from '@/lib/enums'

import { cancelAnimationFrame, requestAnimationFrame } from './requestAnimationFramePolyfill'

export class Timer {
  private time: number
  private state: TimerState = TimerState.Idle
  private animationFrameId: number | null = null
  private endsAt = 0
  private lastUpdateTime: number = 0
  private totalElapsedTime: number = 0
  private options?: TimerOptions
  private readonly debug: boolean = false
  private readonly updateInterval: number = 100 // Update UI every 100ms

  // Enhanced pause tracking
  private pauseDurations: number[] = []
  private pauseStartTime: number | null = null

  constructor(
    private readonly initialTime: number,
    options?: TimerOptions
  ) {
    this.debug = options?.debug ?? false
    this.time = initialTime
    this.options = options
  }

  private log(message?: string) {
    if (!this.debug) return
    console.log('[Timer] ' + message)
  }

  private syncTime() {
    const remaining = this.getTime()
    this.totalElapsedTime += this.time - remaining
    this.time = remaining

    this.log('updateTime - time after: ' + this.time + 'ms (' + Math.round(this.time / 1000) + 's)')

    if (this.time <= 0) {
      this.log('Timer completed!')
      this.state = TimerState.Completed
      this.cleanup()
      this.options?.onTick?.(0, this.totalElapsedTime)
      this.options?.onComplete?.(this.totalElapsedTime)
      this.options?.onStateChange?.(this.state, this.totalElapsedTime)
      return false
    }
    return true
  }

  private updateTime(timestamp: number) {
    if (this.state !== TimerState.Running || !this.syncTime()) return

    // Only call onTick every updateInterval ms to reduce re-renders
    if (timestamp - this.lastUpdateTime >= this.updateInterval) {
      this.options?.onTick?.(this.time, this.totalElapsedTime)
      this.lastUpdateTime = timestamp
    }

    this.animationFrameId = requestAnimationFrame((ts) => this.updateTime(ts))
  }

  public getEndTime() {
    return this.endsAt
  }

  public start(startsAt?: number) {
    this.log('start() called, current state: ' + this.state)
    if (this.state === TimerState.Running) {
      this.log('Already running, returning')
      return
    }

    // If resuming from pause, record the pause duration
    if (this.state === TimerState.Paused && this.pauseStartTime !== null) {
      const pauseDuration = performance.now() - this.pauseStartTime
      this.pauseDurations.push(pauseDuration)
      this.pauseStartTime = null
      this.options?.onPauseCountChange?.(this.getPauseCount(), this.getTotalPausedTime())
    }

    const now = Date.now()
    this.endsAt = (startsAt ?? now) + this.time
    this.lastUpdateTime = performance.now() - Math.max(0, now - (startsAt ?? now))
    this.state = TimerState.Running
    this.log('State changed to Running, time: ' + this.time + 'ms')
    if (startsAt === undefined) this.options?.onStateChange?.(this.state, this.totalElapsedTime)
    else this.options?.onStateChange?.(this.state, this.totalElapsedTime, startsAt)

    this.animationFrameId = requestAnimationFrame((ts) => this.updateTime(ts))
  }

  public pause() {
    this.log('pause() called, current state: ' + this.state)
    if (this.state !== TimerState.Running) {
      this.log('Not running, returning')
      return
    }

    if (!this.syncTime()) return

    // Start tracking pause time
    this.pauseStartTime = performance.now()

    this.cleanup()
    this.state = TimerState.Paused
    this.options?.onTick?.(this.time, this.totalElapsedTime)
    this.log('State changed to Paused, time: ' + this.time + 'ms')
    this.options?.onStateChange?.(this.state, this.totalElapsedTime)
    this.options?.onPauseCountChange?.(this.getPauseCount(), this.getTotalPausedTime())
  }

  public reset() {
    this.cleanup()
    this.time = this.initialTime
    this.totalElapsedTime = 0
    this.pauseDurations = []
    this.pauseStartTime = null
    this.state = TimerState.Idle
    this.options?.onTick?.(this.time, this.totalElapsedTime)
    this.options?.onStateChange?.(this.state, this.totalElapsedTime)
    this.options?.onPauseCountChange?.(this.getPauseCount(), this.getTotalPausedTime())
  }

  public resumeFrom(remaining: number) {
    this.time = Math.max(0, Math.min(remaining, this.initialTime))
    this.totalElapsedTime = this.initialTime - this.time
    this.options?.onTick?.(this.time, this.totalElapsedTime)
    this.start()
  }

  public getState(): TimerState {
    return this.state
  }

  public getTime(): number {
    if (this.state === TimerState.Running && this.animationFrameId !== null) {
      return Math.max(0, Math.min(this.time, this.endsAt - Date.now()))
    }
    return this.time
  }

  public getTotalElapsedTime(): number {
    return this.totalElapsedTime
  }

  public getInitialTime(): number {
    return this.initialTime
  }

  public setTime(newTime: number) {
    if (this.state === TimerState.Running) this.endsAt = Date.now() + newTime
    this.time = newTime
  }

  // Enhanced pause tracking methods
  public getPauseCount(): number {
    return this.pauseDurations.length
  }

  public getTotalPausedTime(): number {
    // Calculate total from completed pauses
    const totalFromCompleted = this.pauseDurations.reduce((sum, duration) => sum + duration, 0)

    // If currently paused, include current pause duration
    if (this.state === TimerState.Paused && this.pauseStartTime !== null) {
      const currentPauseDuration = performance.now() - this.pauseStartTime
      return totalFromCompleted + currentPauseDuration
    }

    return totalFromCompleted
  }

  public getPauseDurations(): number[] {
    return [...this.pauseDurations] // Return copy to prevent external modification
  }

  public getAveragePauseTime(): number {
    if (this.getPauseCount() === 0) return 0
    return this.getTotalPausedTime() / this.getPauseCount()
  }

  public updateOptions(newOptions: Partial<TimerOptions>) {
    this.options = {
      ...this.options,
      ...newOptions,
    }
  }

  public destroy() {
    this.cleanup()
  }

  // Serialization methods
  public serialize(): string {
    return JSON.stringify({
      time: this.time,
      state: this.state,
      totalElapsedTime: this.totalElapsedTime,
      initialTime: this.initialTime,
      pauseDurations: this.pauseDurations,
    })
  }

  public static deserialize(data: string, options?: TimerOptions): Timer {
    const parsed = JSON.parse(data)
    const timer = new Timer(parsed.initialTime, options)

    // Restore timer state
    timer.time = parsed.time
    timer.state = parsed.state
    timer.totalElapsedTime = parsed.totalElapsedTime
    timer.pauseDurations = parsed.pauseDurations || []

    if (timer.state === TimerState.Running) {
      timer.state = TimerState.Paused
    }

    if (timer.state === TimerState.Paused) {
      timer.pauseStartTime = performance.now()
    } else {
      timer.pauseStartTime = null
    }

    return timer
  }

  private cleanup() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }
}
