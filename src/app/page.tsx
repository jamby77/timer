import { Interval } from "@/components/display/Interval";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 p-4">
      {/*<Timer duration={10} label="Work" completionMessage="Time's up!" />*/}
      {/*<Stopwatch label="Stopwatch" timeLimit={5} completionMessage="Time limit reached" />*/}
      <Interval
        intervalConfig={{
          workDuration: 20,
          restDuration: 10,
          intervals: 8,
          workLabel: "Work",
          restLabel: "Rest",
          skipLastRest: true,
        }}
      />
    </div>
  );
}
