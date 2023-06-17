import { IntervalPhase, IntervalsInterface, TimeStruct } from "@/components/timer/index";

export enum TimerStateEnum {
  initial,
  running,
  stopped,
  paused,
}

export function timeToString(time: TimeStruct): string {
  let res = "";
  if (time.hours > 0) {
    res += `${time.hours} hr,`;
  }
  if (time.minutes) {
    res += `${time.minutes} min,`;
  }
  if (time.seconds) {
    res += `${time.seconds} sec,`;
  }
  if (time.milliseconds) {
    res += `${time.milliseconds} ms`;
  }
  res = res.replace(/,$/, "");
  return res;
}

export function msToTime(time?: number): TimeStruct {
  if (!time || isNaN(time)) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    };
  }
  let ms = 0,
    seconds = 0,
    minutes = 0,
    hrs = 0;
  // time in seconds, format as HH:mm:ss.mmm
  ms = time % 1000;
  seconds = Math.floor(time / 1000);
  minutes = Math.floor(seconds / 60);
  hrs = Math.floor(minutes / 60);
  console.log({ hrs, minutes, seconds, ms });

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

export const getIntervalDuration = (intervalsConfig?: IntervalsInterface) => {
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
 * @param intervalsConfig {IntervalsInterface}
 * @returns
 */
export const getCurrentIntervalAndPhase = (time: number, intervalsConfig: IntervalsInterface) => {
  const { intervals } = intervalsConfig;
  const result: {
    currentInterval: number;
    phase: IntervalPhase;
  } = {
    currentInterval: 0,
    phase: "work",
  };
  let intervalTime = 0;

  intsLoop: for (let int of intervals) {
    const { work, rest, rounds } = int;
    // if (time < intervalTime) {
    //   result.currentInterval = 1;
    //   result.phase = time <= work ? "work" : "rest";
    //   break;
    // }
    // we're beyond 1st round
    for (let i = 1; i <= rounds; i++) {
      // loop over rounds and add time until work + rest
      intervalTime += work;
      if (time < intervalTime) {
        result.currentInterval = i;
        result.phase = "work";
        break intsLoop;
      }

      intervalTime += rest;
      if (time < intervalTime) {
        result.currentInterval = i;
        result.phase = "rest";
        break intsLoop;
      }
    }
  }

  return result;
};
