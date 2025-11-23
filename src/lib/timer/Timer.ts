import type { TimerOptions } from './types'

import { TimerState } from '@/lib/enums'

import { cancelAnimationFrame, requestAnimationFrame } from './requestAnimationFramePolyfill'


export class Timer {
  private time: number
  private state: TimerState = TimerState.Idle
  private startTime: number | null = null
  private animationFrameId: number | NodeJS.Timeout | null = null
  private lastTickTime: number | null = null
  private lastUpdateTime: number = 0
  private totalElapsedTime: number = 0
  private options?: TimerOptions
  private readonly debug: boolean = false
  private readonly updateInterval: number = 100 // Update UI every 100ms

  constructor(
    private readonly initialTime: number,
    options?: TimerOptions
  ) {
    this.debug = options?.debug ?? false
    this.time = initialTime
    this.options = options
  }

  private log(message?: any) {
    if (!this.debug) return
    console.log('[Timer] ' + message)
  }

  private updateTime(timestamp: number) {
    this.log('updateTime() called, current state: ' + this.state)
    if (this.startTime === null) return

    if (this.lastTickTime === null) {
      this.lastTickTime = timestamp
      this.lastUpdateTime = timestamp
      this.log('First tick, lastTickTime set to: ' + timestamp)
    }

    const delta = timestamp - this.lastTickTime
    this.lastTickTime = timestamp

    this.log('updateTime - delta: ' + delta + 'ms, time before: ' + this.time)

    this.time = Math.max(0, this.time - delta)
    this.totalElapsedTime += delta

    this.log('updateTime - time after: ' + this.time + 'ms (' + Math.round(this.time / 1000) + 's)')

    if (this.time <= 0) {
      this.log('Timer completed!')
      this.state = TimerState.Completed
      this.cleanup()
      this.options?.onTick?.(0, this.totalElapsedTime)
      this.options?.onComplete?.(this.totalElapsedTime)
      this.options?.onStateChange?.(this.state, this.totalElapsedTime)
      return
    }

    // Only call onTick every updateInterval ms to reduce re-renders
    if (timestamp - this.lastUpdateTime >= this.updateInterval) {
      this.options?.onTick?.(this.time, this.totalElapsedTime)
      this.lastUpdateTime = timestamp
    }

    this.animationFrameId = requestAnimationFrame((ts) => this.updateTime(ts))
  }

  public start() {
    this.log('start() called, current state: ' + this.state)
    if (this.state === TimerState.Running) {
      this.log('Already running, returning')
      return
    }

    this.startTime = performance.now()
    this.lastTickTime = null
    this.state = TimerState.Running
    this.log('State changed to Running, time: ' + this.time + 'ms')
    this.options?.onStateChange?.(this.state, this.totalElapsedTime)

    this.animationFrameId = requestAnimationFrame((ts) => this.updateTime(ts))
  }

  public pause() {
    this.log('pause() called, current state: ' + this.state)
    if (this.state !== TimerState.Running) {
      this.log('Not running, returning')
      return
    }

    this.cleanup()
    this.state = TimerState.Paused
    this.log('State changed to Paused, time: ' + this.time + 'ms')
    this.options?.onStateChange?.(this.state, this.totalElapsedTime)
  }

  public reset() {
    this.cleanup()
    this.time = this.initialTime
    this.startTime = null
    this.lastTickTime = null
    this.totalElapsedTime = 0
    this.state = TimerState.Idle
    this.options?.onTick?.(this.time, this.totalElapsedTime)
    this.options?.onStateChange?.(this.state, this.totalElapsedTime)
  }

  public getState(): TimerState {
    return this.state
  }

  public getTime(): number {
    return this.time
  }

  public getTotalElapsedTime(): number {
    return this.totalElapsedTime
  }

  public getInitialTime(): number {
    return this.initialTime
  }

  public setTime(newTime: number) {
    this.time = newTime
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

  private cleanup() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId as number)
      this.animationFrameId = null
    }
    this.lastTickTime = null
  }
}
