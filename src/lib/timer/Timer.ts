import { cancelAnimationFrame, requestAnimationFrame } from "./requestAnimationFramePolyfill";
import { TimerOptions, TimerState } from "./types";

export class Timer {
  private time: number;
  private state: TimerState = "idle";
  private startTime: number | null = null;
  private remainingTime: number;
  private animationFrameId: number | NodeJS.Timeout | null = null;
  private lastTickTime: number | null = null;
  private options?: TimerOptions;

  constructor(initialTime: number, options?: TimerOptions) {
    this.time = initialTime;
    this.remainingTime = initialTime;
    this.options = options;
  }

  private updateTime(timestamp: number) {
    if (this.startTime === null) return;

    if (this.lastTickTime === null) {
      this.lastTickTime = timestamp;
    }

    const delta = timestamp - this.lastTickTime;
    this.lastTickTime = timestamp;

    this.remainingTime = Math.max(0, this.remainingTime - delta);
    this.time = this.remainingTime;

    this.options?.onTick?.(this.time);

    if (this.time <= 0) {
      this.state = "idle";
      this.cleanup();
      this.options?.onComplete?.();
      this.options?.onStateChange?.(this.state);
      return;
    }

    this.animationFrameId = requestAnimationFrame((ts) => this.updateTime(ts));
  }

  public start() {
    if (this.state === "running") return;

    this.startTime = performance.now();
    this.lastTickTime = null;
    this.state = "running";
    this.options?.onStateChange?.(this.state);

    this.animationFrameId = requestAnimationFrame((ts) => this.updateTime(ts));
  }

  public pause() {
    if (this.state !== "running") return;

    this.cleanup();
    this.state = "paused";
    this.options?.onStateChange?.(this.state);
  }

  public reset() {
    this.cleanup();
    this.time = this.remainingTime = this.initialTime;
    this.startTime = null;
    this.lastTickTime = null;
    this.state = "idle";
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
    this.remainingTime = newTime;
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

  private get initialTime() {
    return this.time;
  }
}
