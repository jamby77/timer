import { Timer } from "./Timer";
import { TimerState } from "./types";
import { formatTime } from "./utils";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds

export interface StopwatchOptions {
  /**
   * Callback that's called on each tick with the current elapsed time in milliseconds
   */
  onTick?: (elapsedTime: number) => void;

  /**
   * Callback that's called when the stopwatch is stopped
   */
  onStop?: (elapsedTime: number) => void;

  /**
   * Whether to start the stopwatch immediately on creation
   * @default false
   */
  autoStart?: boolean;

  /**
   * Maximum time in milliseconds the stopwatch will run
   * @default ONE_YEAR_MS (1 year)
   */
  timeLimitMs?: number;
}

export class Stopwatch {
  private timer: Timer;
  private readonly timeLimitMs: number;
  private readonly stopCallback?: (elapsedTime: number) => void;
  private readonly tickCallback?: (elapsedTime: number) => void;

  constructor(options: StopwatchOptions = {}) {
    this.timeLimitMs = options.timeLimitMs ?? ONE_YEAR_MS;
    this.stopCallback = options.onStop;
    this.tickCallback = options.onTick;

    this.timer = new Timer(this.timeLimitMs, {
      debug: true,
      onTick: (remaining) => {
        const elapsed = this.timeLimitMs - remaining;
        this.tickCallback?.(elapsed);
      },
      onComplete: () => {
        this.stop();
      },
      onStateChange: (_state) => {
        // State changes are handled by the Timer instance
      },
    });

    if (options.autoStart) {
      this.start();
    }
  }

  /**
   * Start or resume the stopwatch
   */
  public start(): void {
    if (this.isRunning) return;

    if (this.getElapsedTime() >= this.timeLimitMs) {
      this.reset();
    }

    this.timer.start();
  }

  /**
   * Pause the stopwatch
   */
  public pause(): void {
    this.timer.pause();
  }

  /**
   * Stop the stopwatch, reset the elapsed time, and notify listeners
   */
  public stop(): void {
    const wasRunning = this.isRunning;
    this.timer.pause();

    if (wasRunning && this.stopCallback) {
      this.stopCallback(this.getElapsedTime());
    }

    this.reset();
  }

  /**
   * Reset the stopwatch to zero
   */
  public reset(): void {
    this.timer.reset();
  }

  /**
   * Get the current elapsed time in milliseconds
   */
  public getElapsedTime(): number {
    return Math.min(this.timeLimitMs - this.timer.getTime(), this.timeLimitMs);
  }

  /**
   * Check if the stopwatch is currently running
   */
  public get isRunning(): boolean {
    return this.timer.getState() === "running";
  }

  /**
   * Get the current state of the stopwatch
   */
  public getState(): TimerState {
    return this.timer.getState();
  }

  /**
   * Format the elapsed time as a string (MM:SS.MS)
   */
  public formatTime(): string {
    return formatTime(this.getElapsedTime());
  }

  /**
   * Clean up resources when the stopwatch is no longer needed
   */
  public destroy(): void {
    this.timer.destroy();
  }
}
