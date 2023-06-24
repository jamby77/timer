import TimerDisplay from "@/components/timer/TimerDisplay";
import useTimer from "@/components/timer/useTimer";
import { msToTime } from "@/components/timer/utilities";

function TimerDisplayController({}) {
  const time = useTimer((state) => state.time);
  const phase = useTimer((state) => state.phase);
  const running = useTimer((state) => state.running);
  const parsedTime = msToTime(time);
  return <TimerDisplay {...parsedTime} phase={phase} running={running} />;
}

export default TimerDisplayController;
