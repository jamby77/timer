import { TimerStateEnum, TimerTypeEnum } from "@/components/timer/utilities";

interface TimerState {
  startTime: number;
  running: TimerStateEnum;
  currentTime: number;
  time: number;
  countdown?: number;
  timerId?: number | null;
  currentRound?: number;
  totalRounds?: number;
  phase?: IntervalPhase;
  timer?: IntervalInterface | StopwatchTimerInterface | CountdownTimerInterface;
  endTime?: number;
  init: (config: BaseTimerState) => void;
  start: () => void;
  stop: (complete?: boolean) => void;
  pause: () => void;
}

type BaseTimerState = Omit<TimerState, "stop" | "start" | "pause" | "init">;

type IntervalPhase = "work" | "rest" | "countdown";

interface Interval {
  /**
   * Work time in milliseconds
   */
  work: number;
  /**
   * rest time in milliseconds
   */
  rest: number;
  /**
   * interval name - "Tabata"
   */
  name?: string;
  /**
   * how many rounds of this interval
   */
  rounds: number;
  /**
   * Is work time fixed or variable, if variable, user can stop it before it is up
   */
  work_type?: "fixed" | "variable";
  /**
   * Is rest time fixed or variable, if variable, user can stop it before it is up
   */
  rest_type?: "fixed" | "variable";
}
interface TimerInterface {
  /**
   * Type of timer supported - stopwatch, countdown, intervals
   */
  type: TimerTypeEnum;
  /**
   * timer duration, except when intervals are used
   */
  duration?: number;
  intervals?: Interval[];
}

interface IntervalInterface extends TimerInterface {
  type: TimerTypeEnum.interval;
  intervals: Interval[];
  duration?: undefined;
}

interface StopwatchTimerInterface extends TimerInterface {
  type: TimerTypeEnum.stopwatch;
  duration: number;
  intervals?: undefined;
}

interface CountdownTimerInterface extends TimerInterface {
  type: TimerTypeEnum.countdown;
  duration: number;
  intervals?: undefined;
}

type TimeStruct = {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
};
