import { Stopwatch } from "@/components/Stopwatch";
import { Timer } from "@/components/Timer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-gray-100 p-4">
      <Timer duration={120} label="Work" completionMessage="Time's up!" />
      <Stopwatch label="Stopwatch" timeLimit={5} completionMessage="Time limit reached" />
    </div>
  );
}
