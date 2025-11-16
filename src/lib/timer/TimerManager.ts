import { TimerState } from "@/lib/timer/types";

import { Timer } from "./Timer";

export enum StepState {
  Start = "start",
  Pause = "pause",
  Resume = "resume",
  Complete = "complete",
  Skip = "skip",
}

export interface StepStateData {
  step: TimerStep;
  index: number;
  elapsed: number; // 0 when not applicable (start, resume, complete)
}

export type StepStateChangeCallback = (state: StepState, data: StepStateData) => void;

export interface TimerStep {
  duration: number; // in milliseconds
  label: string;
  id: string;
  isWork?: boolean;
  onStart?: () => void;
  onComplete?: () => void;
  onStepStateChange?: StepStateChangeCallback;
}

export interface TimerSequenceOptions {
  steps: TimerStep[];
  repeat?: number; // Number of times to repeat the sequence, 0 for infinite
  onStepChange?: (step: TimerStep, stepIndex: number) => void;
  onSequenceComplete?: () => void;
  onTick?: (time: number, totalElapsedTime: number, step: TimerStep | null) => void; // Add this
}

export class TimerManager {
  private readonly sequence: TimerStep[] = [];
  private currentStepIndex: number = 0;
  private currentRepeat: number = 0;
  private readonly totalRepeats: number = 0;
  private timer?: Timer;
  private isSequenceRunning: boolean = false;
  private readonly onStepChange?: (step: TimerStep, stepIndex: number) => void;
  private readonly onSequenceComplete?: () => void;
  private readonly onStepTick?: (
    time: number,
    totalElapsedTime: number,
    step: TimerStep | null,
  ) => void;

  constructor(options: TimerSequenceOptions) {
    this.sequence = [...options.steps];
    this.totalRepeats = options.repeat ?? 0;
    this.onStepChange = options.onStepChange;
    this.onSequenceComplete = options.onSequenceComplete;
    this.onStepTick = options.onTick;
  }

  public start(): void {
    if (this.isSequenceRunning) return;

    this.isSequenceRunning = true;
    if (!this.timer || this.timer.getState() === TimerState.Idle) {
      this.startCurrentStep();
    } else {
      // Timer was paused, notify about resume
      const currentStep = this.getCurrentStep();
      if (currentStep) {
        currentStep.onStepStateChange?.(StepState.Resume, {
          step: currentStep,
          index: this.getCurrentStepIndex(),
          elapsed: 0,
        });
      }
      this.timer.start();
    }
  }

  public pause(): void {
    const currentStep = this.getCurrentStep();

    // Notify step about pause with elapsed time
    if (currentStep && this.isSequenceRunning && this.timer) {
      const elapsed = currentStep.duration - this.timer.getTime();
      currentStep.onStepStateChange?.(StepState.Pause, {
        step: currentStep,
        index: this.getCurrentStepIndex(),
        elapsed,
      });
    }

    this.timer?.pause();
    this.isSequenceRunning = false;
  }

  public skipCurrentStep(): void {
    const currentStep = this.getCurrentStep();
    if (!currentStep || !this.isSequenceRunning || !this.timer) return;

    // Get the elapsed time for the current step
    const elapsed = currentStep.duration - this.timer.getTime();

    // Notify step about skip with elapsed time
    currentStep.onStepStateChange?.(StepState.Skip, {
      step: currentStep,
      index: this.getCurrentStepIndex(),
      elapsed,
    });

    // Stop the current timer before moving to next step
    this.timer?.pause();
    
    // Complete the current step to move to the next one
    this.handleTimerComplete();
  }

  public reset(): void {
    this.timer?.reset();
    this.timer = undefined; // Clear timer completely
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

  public getSteps(): TimerStep[] {
    return [...this.sequence];
  }

  private startCurrentStep(): void {
    const currentStep = this.getCurrentStep();
    if (!currentStep) {
      this.isSequenceRunning = false;
      return;
    }

    // Call the step's onStart callback if provided
    currentStep.onStart?.();

    // Notify step about starting
    const currentStepIndex = this.getCurrentStepIndex();
    currentStep.onStepStateChange?.(StepState.Start, {
      step: currentStep,
      index: currentStepIndex,
      elapsed: 0,
    });

    // Notify about the step change
    this.onStepChange?.(currentStep, currentStepIndex);

    // Set up and start the timer for this step
    this.timer = new Timer(currentStep.duration, {
      onComplete: this.handleTimerComplete.bind(this),
      onStateChange: this.handleTimerStateChange.bind(this),
      onTick: this.handleTimerTick.bind(this),
    });

    this.timer.start();
  }

  private handleTimerTick(time: number, totalElapsedTime: number): void {
    this.onStepTick?.(time, totalElapsedTime, this.getCurrentStep());
  }

  private handleTimerComplete(): void {
    const currentStep = this.getCurrentStep();

    // Notify step about completion
    currentStep?.onStepStateChange?.(StepState.Complete, {
      step: currentStep,
      index: this.getCurrentStepIndex(),
      elapsed: 0,
    });

    currentStep?.onComplete?.();

    // Clear the completed timer
    this.timer = undefined;

    // Move to the next step
    this.currentStepIndex++;

    // Check if we've completed all steps
    if (this.currentStepIndex >= this.sequence.length) {
      this.currentStepIndex = 0;
      this.currentRepeat++;

      // Check if we've completed all repeats
      if (this.totalRepeats > 0 && this.currentRepeat >= this.totalRepeats) {
        this.onSequenceComplete?.();
        this.isSequenceRunning = false;
        this.timer = undefined; // Clear timer when sequence completes
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
}

export default TimerManager;
