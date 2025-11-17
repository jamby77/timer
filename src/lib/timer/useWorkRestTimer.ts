import { useCallback, useEffect, useRef, useState } from "react";
import { Timer } from "./Timer";
import { TimerState } from "./types";

export enum TimerPhase {
  Idle = "idle",
  Work = "work",
  Rest = "rest",
  Completed = "completed",
}

export interface WorkRestTimerState {
  phase: TimerPhase;
  ratio: number; // Work/rest multiplier (stored as integer * 100)
  rounds: number; // Count of completed work sessions
  state: TimerState; // Active timing state
  currentTime: number; // Current time in milliseconds (work elapsed or rest remaining)
}

export interface WorkRestTimerActions {
  // Work phase controls
  startWork: () => void;
  pauseWork: () => void;
  resumeWork: () => void;
  stopWork: () => void;

  // Rest phase controls
  skipRest: () => void;
  stopRest: () => void;

  // Configuration
  adjustRatio: (delta: number) => void; // delta = 1 for 0.01, -1 for -0.01
  setRatio: (ratio: number) => void;
  resetRatio: () => void;

  // System controls
  reset: () => void;
  getProgress: () => number; // Progress percentage (0-100)
}

export interface WorkRestTimerOptions {
  onLapRecorded?: (time: number) => void; // Callback for lap recording
}

const WORK_TIME_LIMIT_MS = 99 * 60 * 1000 + 99 * 1000; // 99:99 = 5,999,000ms
const DEFAULT_RATIO = 100; // 1.0 stored as integer
const MIN_RATIO = 1; // 0.01 stored as integer
const MAX_RATIO = 10000; // 100.0 stored as integer
const REST_DELAY_MS = 100; // 100ms delay before rest starts

export const useWorkRestTimer = (options: WorkRestTimerOptions = {}): [WorkRestTimerState, WorkRestTimerActions] => {
  const [state, setState] = useState<WorkRestTimerState>({
    phase: TimerPhase.Idle,
    ratio: DEFAULT_RATIO,
    rounds: 0,
    state: TimerState.Idle,
    currentTime: 0,
  });

  const timerRef = useRef<Timer | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onLapRecordedRef = useRef(options.onLapRecorded);

  // Update callback ref when options change
  useEffect(() => {
    onLapRecordedRef.current = options.onLapRecorded;
  }, [options.onLapRecorded]);

  // Clean up current timer and timeout
  const cleanupTimer = useCallback(() => {
    if (timerRef.current) {
      timerRef.current.destroy();
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Create work timer
  const createWorkTimer = useCallback(() => {
    cleanupTimer();
    
    const workTimer = new Timer(WORK_TIME_LIMIT_MS, {
      onTick: (timeLeft, totalElapsedTime) => {
        // Update currentTime to trigger re-renders
        setState(prev => ({ ...prev, currentTime: totalElapsedTime }));
      },
      onComplete: (totalElapsedTime) => {
        // Work timer completed (hit 99:99 limit)
        onLapRecordedRef.current?.(totalElapsedTime);
        // Pass current ratio to avoid stale closure
        startRestPhase(totalElapsedTime, state.ratio);
      },
      onStateChange: (newState) => {
        setState(prev => ({ ...prev, state: newState }));
      },
    });

    timerRef.current = workTimer;
    return workTimer;
  }, [cleanupTimer, state.ratio]);

  // Create rest timer
  const createRestTimer = useCallback((duration: number) => {
    cleanupTimer();
    
    const restTimer = new Timer(duration, {
      onTick: (timeLeft, totalElapsedTime) => {
        // Update currentTime to trigger re-renders (show remaining time)
        setState(prev => ({ ...prev, currentTime: timeLeft }));
      },
      onComplete: () => {
        // Rest completed, return to idle state
        setState(prev => ({
          ...prev,
          phase: TimerPhase.Idle, // Stay in idle, not work
          rounds: prev.rounds + 1,
          state: TimerState.Idle,
          currentTime: 0,
        }));
        // User must manually start next work phase
      },
      onStateChange: (newState) => {
        setState(prev => ({ ...prev, state: newState }));
      },
    });

    timerRef.current = restTimer;
    return restTimer;
  }, [cleanupTimer]);

  // Start rest phase
  const startRestPhase = useCallback((workDuration: number, ratio: number) => {
    const restDuration = Math.round(workDuration * (ratio / 100));
    
    // Cap rest duration to 99:99 if needed
    const cappedRestDuration = Math.min(restDuration, WORK_TIME_LIMIT_MS);

    timeoutRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        phase: TimerPhase.Rest,
        state: TimerState.Idle,
      }));
      
      const restTimer = createRestTimer(cappedRestDuration);
      restTimer.start();
      setState(prev => ({ ...prev, state: TimerState.Running }));
    }, REST_DELAY_MS);
  }, [createRestTimer]);

  // Start work
  const startWork = useCallback(() => {
    if (state.phase !== TimerPhase.Idle) return;

    setState(prev => ({
      ...prev,
      phase: TimerPhase.Work,
      state: TimerState.Idle,
    }));

    const workTimer = createWorkTimer();
    workTimer.start();
    setState(prev => ({ ...prev, state: TimerState.Running }));
  }, [state.phase, createWorkTimer]);

  // Pause work
  const pauseWork = useCallback(() => {
    if (state.phase !== TimerPhase.Work || state.state !== TimerState.Running) return;
    
    timerRef.current?.pause();
    setState(prev => ({ ...prev, state: TimerState.Paused }));
  }, [state.phase, state.state]);

  // Resume work
  const resumeWork = useCallback(() => {
    if (state.phase !== TimerPhase.Work || state.state !== TimerState.Paused) return;
    
    timerRef.current?.start();
    setState(prev => ({ ...prev, state: TimerState.Running }));
  }, [state.phase, state.state]);

  // Stop work
  const stopWork = useCallback(() => {
    if (state.phase !== TimerPhase.Work) return;

    const workDuration = timerRef.current?.getTotalElapsedTime() || 0;
    onLapRecordedRef.current?.(workDuration);
    cleanupTimer();
    
    // Handle zero work duration edge case
    if (workDuration === 0) {
      setState(prev => ({
        ...prev,
        phase: TimerPhase.Idle,
        state: TimerState.Idle,
        currentTime: 0,
      }));
      return;
    }
    
    startRestPhase(workDuration, state.ratio);
  }, [state.phase, state.ratio, cleanupTimer, startRestPhase]);

  // Skip rest
  const skipRest = useCallback(() => {
    if (state.phase !== TimerPhase.Rest) return;

    cleanupTimer();
    setState(prev => ({
      ...prev,
      phase: TimerPhase.Idle, // Go to idle, not work
      rounds: prev.rounds + 1,
      state: TimerState.Idle,
      currentTime: 0,
    }));
  }, [state.phase, cleanupTimer]);

  // Stop rest (reset completely)
  const stopRest = useCallback(() => {
    if (state.phase !== TimerPhase.Rest) return;

    cleanupTimer();
    setState({
      phase: TimerPhase.Idle,
      ratio: state.ratio,
      rounds: state.rounds,
      state: TimerState.Idle,
      currentTime: 0,
    });
  }, [state.phase, state.ratio, state.rounds, cleanupTimer]);

  // Adjust ratio
  const adjustRatio = useCallback((delta: number) => {
    if (state.phase !== TimerPhase.Idle) return; // Only allow when idle

    setState(prev => {
      const newRatio = Math.max(MIN_RATIO, Math.min(MAX_RATIO, prev.ratio + delta));
      return { ...prev, ratio: newRatio };
    });
  }, [state.phase]);

  // Set ratio directly
  const setRatio = useCallback((ratio: number) => {
    if (state.phase !== TimerPhase.Idle) return; // Only allow when idle

    setState(prev => {
      const internalRatio = Math.max(MIN_RATIO, Math.min(MAX_RATIO, Math.round(ratio * 100)));
      return { ...prev, ratio: internalRatio };
    });
  }, [state.phase]);

  // Reset ratio
  const resetRatio = useCallback(() => {
    if (state.phase !== TimerPhase.Idle) return;
    
    setState(prev => ({ ...prev, ratio: DEFAULT_RATIO }));
  }, [state.phase]);

  // Reset everything
  const reset = useCallback(() => {
    cleanupTimer();
    setState({
      phase: TimerPhase.Idle,
      ratio: DEFAULT_RATIO,
      rounds: 0,
      state: TimerState.Idle,
      currentTime: 0,
    });
  }, [cleanupTimer]);

  // Get progress
  const getProgress = useCallback(() => {
    if (!timerRef.current) return 0;

    if (state.phase === TimerPhase.Work) {
      const elapsed = state.currentTime;
      return (elapsed / WORK_TIME_LIMIT_MS) * 100;
    } else if (state.phase === TimerPhase.Rest) {
      const duration = timerRef.current.getInitialTime();
      const timeLeft = state.currentTime;
      return ((duration - timeLeft) / duration) * 100;
    }
    return 0;
  }, [state.phase, state.currentTime]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanupTimer;
  }, [cleanupTimer]);

  const actions: WorkRestTimerActions = {
    startWork,
    pauseWork,
    resumeWork,
    stopWork,
    skipRest,
    stopRest,
    adjustRatio,
    setRatio,
    resetRatio,
    reset,
    getProgress,
  };

  return [state, actions];
};
