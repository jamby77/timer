import { cancelAnimationFrame, requestAnimationFrame } from "./requestAnimationFramePolyfill";
import { TimerOptions, TimerState } from "./types";

export class Timer {
  private time: number;
  private state: TimerState = TimerState.Idle;
  private startTime: number | null = null;
  private animationFrameId: number | NodeJS.Timeout | null = null;
  private lastTickTime: number | null = null;
  private options?: TimerOptions;

  constructor(
    private readonly initialTime: number,
    options?: TimerOptions,
    private readonly debug = false,
  ) {
    this.time = initialTime;
    this.options = options;
  }

  private log(message?: any) {
    if (!this.debug) return;
    console.log("[Timer] " + message);
  }

  private updateTime(timestamp: number) {
    this.log("updateTime() called, current state: " + this.state);
    if (this.startTime === null) return;

    if (this.lastTickTime === null) {
      this.lastTickTime = timestamp;
      this.log("First tick, lastTickTime set to: " + timestamp);
    }

    const delta = timestamp - this.lastTickTime;
    this.lastTickTime = timestamp;

    this.log("updateTime - delta: " + delta + "ms, time before: " + this.time);

    this.time = Math.max(0, this.time - delta);

    this.log("updateTime - time after: " + this.time + "ms (" + Math.round(this.time / 1000) + "s)");

    this.options?.onTick?.(this.time);

    if (this.time <= 0) {
      this.log("Timer completed!");
      this.state = TimerState.Completed;
      this.cleanup();
      this.options?.onComplete?.();
      this.options?.onStateChange?.(this.state);
      return;
    }

    this.animationFrameId = requestAnimationFrame((ts) => this.updateTime(ts));
  }

  public start() {
    this.log("start() called, current state: " + this.state);
    if (this.state === TimerState.Running) {
      this.log("Already running, returning");
      return;
    }

    this.startTime = performance.now();
    this.lastTickTime = null;
    this.state = TimerState.Running;
    this.log("State changed to Running, time: " + this.time + "ms");
    this.options?.onStateChange?.(this.state);

    this.animationFrameId = requestAnimationFrame((ts) => this.updateTime(ts));
  }

  public pause() {
    if (this.state !== TimerState.Running) return;

    this.cleanup();
    this.state = TimerState.Paused;
    this.options?.onStateChange?.(this.state);
  }

  public reset() {
    this.cleanup();
    this.time = this.initialTime;
    this.startTime = null;
    this.lastTickTime = null;
    this.state = TimerState.Idle;
    this.options?.onTick?.(this.time);
    this.options?.onStateChange?.(this.state);
  }

  public getState(): TimerState {
    return this.state;
  }

  public getTime(): number {
    return this.time;
  }

  public getInitialTime(): number {
    return this.initialTime;
  }

  public setTime(newTime: number) {
    this.time = newTime;
  }

  public updateOptions(newOptions: Partial<TimerOptions>) {
    this.options = {
      ...this.options,
      ...newOptions,
    };
  }

  public destroy() {
    this.cleanup();
  }

  private cleanup() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId as number);
      this.animationFrameId = null;
    }
    this.lastTickTime = null;
  }
}
