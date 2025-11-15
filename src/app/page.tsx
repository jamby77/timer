import { Timer } from "@/components/Timer";

export default function Home() {
  return (
    <Timer
      duration={30}
      label="Work Timer"
      completionMessage="Time's up!"
    />
  );
}
