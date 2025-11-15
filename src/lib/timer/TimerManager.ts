import { TimerState } from "@/lib/timer/types";

import { Timer } from "./Timer";

export interface TimerStep {
  duration: number; // in milliseconds
  label: string;
  id: string;
  isWork?: boolean;
  onStart?: () => void;
  onComplete?: () => void;
}

export interface TimerSequenceOptions {
  steps: TimerStep[];
  repeat?: number; // Number of times to repeat the sequence, 0 for infinite
  onStepChange?: (step: TimerStep, stepIndex: number) => void;
  onSequenceComplete?: () => void;
}

export class TimerManager {
  private readonly sequence: TimerStep[] = [];
  private currentStepIndex: number = 0;
  private currentRepeat: number = 0;
  private readonly totalRepeats: number = 0;
  private timer: Timer;
  private isSequenceRunning: boolean = false;
  private sequenceOptions: TimerSequenceOptions;

  constructor(options: TimerSequenceOptions) {
    this.sequenceOptions = {
      repeat: 0,
      ...options,
    };
    this.sequence = [...this.sequenceOptions.steps];
    this.totalRepeats = this.sequenceOptions.repeat ?? 0;

    this.timer = new Timer(0, {
      onComplete: this.handleTimerComplete.bind(this),
      onStateChange: this.handleTimerStateChange.bind(this),
    });
  }

  public start(): void {
    if (this.isSequenceRunning) return;

    this.isSequenceRunning = true;
    if (this.timer.getState() === TimerState.Idle) {
      this.startCurrentStep();
    } else {
      this.timer.start();
    }
  }

  public pause(): void {
    this.timer.pause();
  }

  public reset(): void {
    this.timer.reset();
    this.currentStepIndex = 0;
    this.currentRepeat = 0;
    this.isSequenceRunning = false;
  }

  public getCurrentStep(): TimerStep | null {
    return this.sequence[this.currentStepIndex] || null;
  }

  public getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  public getCurrentRepeat(): number {
    return this.currentRepeat;
  }

  public getTotalSteps(): number {
    return this.sequence.length;
  }

  public getTotalRepeats(): number {
    return this.totalRepeats;
  }

  public isRunning(): boolean {
    return this.isSequenceRunning;
  }

  private startCurrentStep(): void {
    const currentStep = this.getCurrentStep();
    if (!currentStep) {
      this.isSequenceRunning = false;
      return;
    }

    // Call the step's onStart callback if provided
    currentStep.onStart?.();

    // Notify about the step change
    this.sequenceOptions.onStepChange?.(currentStep, this.currentStepIndex);

    // Set up and start the timer for this step
    this.timer = new Timer(currentStep.duration, {
      onComplete: this.handleTimerComplete.bind(this),
      onStateChange: this.handleTimerStateChange.bind(this),
    });

    this.timer.start();
  }

  private handleTimerComplete(): void {
    const currentStep = this.getCurrentStep();
    currentStep?.onComplete?.();

    // Move to the next step
    this.currentStepIndex++;

    // Check if we've completed all steps
    if (this.currentStepIndex >= this.sequence.length) {
      this.currentStepIndex = 0;
      this.currentRepeat++;

      // Check if we've completed all repeats
      if (this.totalRepeats > 0 && this.currentRepeat >= this.totalRepeats) {
        this.sequenceOptions.onSequenceComplete?.();
        this.isSequenceRunning = false;
        return;
      }
    }

    // Start the next step if sequence is still running
    if (this.isSequenceRunning) {
      this.startCurrentStep();
    }
  }

  private handleTimerStateChange(state: TimerState): void {
    // Handle any state changes if needed
    if (state === TimerState.Idle && !this.isSequenceRunning) {
      // Timer was reset
      this.currentStepIndex = 0;
      this.currentRepeat = 0;
    }
  }

  // Utility method to create a simple interval timer
  public static createIntervalTimer(
    workDuration: number,
    restDuration: number,
    intervals: number,
    workLabel: string = "Work",
    restLabel: string = "Rest",
    skipLastRest: boolean = false,
  ): TimerManager {
    const steps: TimerStep[] = [];

    const restIntervals = skipLastRest ? intervals - 1 : intervals;
    for (let i = 0; i < intervals; i++) {
      // Work interval
      steps.push({
        id: `work-${i}`,
        duration: workDuration,
        label: workLabel,
        isWork: true,
      });

      // Rest interval (except after the last work interval)
      if (i < restIntervals) {
        steps.push({
          id: `rest-${i}`,
          duration: restDuration,
          label: restLabel,
          isWork: false,
        });
      }
    }

    return new TimerManager({
      steps,
      repeat: 1, // We're handling the intervals in the steps
    });
  }
}

export default TimerManager;
