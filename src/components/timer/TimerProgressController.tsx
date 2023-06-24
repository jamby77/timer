import TimerProgress from "@/components/timer/TimerProgress";
import useTimer from "@/components/timer/useTimer";

export default function TimerProgressController() {
  const phase = useTimer((state) => state.phase);
  const currentRound = useTimer((state) => state.currentRound);
  const totalRounds = useTimer((state) => state.totalRounds);

  return <TimerProgress currentRound={currentRound} phase={phase} totalRounds={totalRounds} />;
}
