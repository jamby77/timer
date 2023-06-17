import { TimerStateEnum } from "@/components/timer/utilities";

interface TimerState {
  startTime: number;
  running: TimerStateEnum;
  currentTime: number;
  time: number;
  timerId?: number | null;
  currentRound?: number;
  totalRounds?: number;
  phase?: IntervalPhase;
  intervals?: IntervalsInterface;
  endTime?: number;
  start: () => void;
  stop: () => void;
  pause: () => void;
}

type IntervalPhase = "work" | "rest";
type Interval = {
  work: number;
  rest: number;
  name?: string;
  rounds: number;
};
interface IntervalsInterface {
  intervals: Interval[];
}
type TimeStruct = {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
};
