import TimerControls from "@/components/timer/TimerControls";
import useTimer from "@/components/timer/useTimer";

export const TimerControlsController = () => {
  const [start, stop, pause] = useTimer((state) => [state.start, state.stop, state.pause]);
  const running = useTimer((state) => state.running);
  return <TimerControls running={running} onStart={start} onStop={stop} onPause={pause} />;
};

export default TimerControls;
