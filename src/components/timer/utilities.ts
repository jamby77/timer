import {
  CountdownTimerInterface,
  IntervalInterface,
  IntervalPhase,
  StopwatchTimerInterface,
  TimerInterface,
  TimeStruct,
} from "@/components/timer/index";

export enum TimerStateEnum {
  initial,
  running,
  stopped,
  paused,
  complete,
}
export enum TimerTypeEnum {
  stopwatch,
  countdown,
  interval,
}
//
export function timeToString(time: TimeStruct): string {
  let res: string[] = [];
  if (time.hours > 0) {
    res.push(`${time.hours} hr`);
  }
  if (time.minutes) {
    res.push(`${time.minutes} min`);
  }
  if (time.seconds) {
    res.push(`${time.seconds} sec`);
  }
  if (time.milliseconds) {
    res.push(`${time.milliseconds} ms`);
  }
  return res.join(", ");
}

export function msToTime(time?: number): TimeStruct {
  if (!time || isNaN(time) || time < 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    };
  }
  let ms: number, seconds: number, minutes: number, hrs: number;
  // time in seconds, format as HH:mm:ss.mmm
  ms = time % 1000;
  seconds = Math.floor(time / 1000);
  minutes = Math.floor(seconds / 60);
  hrs = Math.floor(minutes / 60);

  return {
    hours: hrs,
    minutes: minutes % 60,
    seconds: seconds % 60,
    milliseconds: ms,
  };
}

export const toFixedDigits = (num: number, pad = 2) => {
  return num.toString(10).padStart(pad, "0");
};

export const getIntervalDuration = (intervalsConfig?: IntervalInterface) => {
  if (!intervalsConfig) {
    return 0;
  }
  const { intervals } = intervalsConfig;
  return intervals.reduce((acc: number, int) => {
    return acc + (int.rest + int.work) * int.rounds;
  }, 0);
};

/**
 * Given elapsed time and intervals configuration, determine in
 * which interval round and phase are we in
 *
 * @param time {number} elapsed time in milliseconds
 * @param intervalsConfig {IntervalInterface}
 * @returns
 */
export const getCurrentIntervalAndPhase = (time: number, intervalsConfig: IntervalInterface) => {
  const { intervals } = intervalsConfig;
  const result: {
    currentRound: number;
    totalRounds: number;
    phase: IntervalPhase;
  } = {
    currentRound: 0,
    totalRounds: 0,
    phase: "work",
  };
  let intervalTime = 0;

  intsLoop: for (let int of intervals) {
    const { work, rest, rounds } = int;
    for (let i = 1; i <= rounds; i++) {
      // loop over rounds and add time until work + rest
      intervalTime += work;
      if (time < intervalTime) {
        result.currentRound = i;
        result.phase = "work";
        result.totalRounds = rounds;
        break intsLoop;
      }

      intervalTime += rest;
      if (time < intervalTime) {
        result.currentRound = i;
        result.phase = "rest";
        result.totalRounds = rounds;
        break intsLoop;
      }
    }
  }

  return result;
};

export function isIntervalTimer(timer?: TimerInterface): timer is IntervalInterface {
  if (!timer) {
    return false;
  }
  return (
    timer.type === TimerTypeEnum.interval &&
    timer.intervals !== undefined &&
    timer.intervals?.length > 0
  );
}

export function isNotIntervalTimer(
  timer?: TimerInterface,
): timer is StopwatchTimerInterface | CountdownTimerInterface {
  if (!timer) {
    return false;
  }
  return typeof timer.duration === "number" && typeof timer.intervals === "undefined";
}
