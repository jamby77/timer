import type { WorkRestTimerConfig } from '@/lib/timer/types'

import { WorkRestMode } from '@/lib/enums'

import { Interval } from '@/components/display/Interval'
import { Timer } from '@/components/display/Timer'
import { WorkRestTimer } from '@/components/display/WorkRestTimer'

export default function Home() {
  // Example configuration using WorkRestTimerConfig
  const workRestConfig: WorkRestTimerConfig = {
    ratio: 1.5, // 1.5x rest duration (work 10s = rest 15s)
    maxRounds: 5, // Maximum 5 rounds
    maxWorkTime: 300, // 5 minutes max work time
    restMode: WorkRestMode.RATIO, // Use ratio-based rest calculation
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 p-4">
      {/*<Timer duration={3} completionMessage="Time's up!" />*/}

      {/* WorkRestTimer with full WorkRestConfig */}
      <WorkRestTimer config={workRestConfig} />

      {/*<Stopwatch label="Stopwatch" timeLimit={5} completionMessage="Time limit reached" />*/}
      {/*<Interval*/}
      {/*  intervalConfig={{*/}
      {/*    workDuration: 20,*/}
      {/*    restDuration: 10,*/}
      {/*    intervals: 8,*/}
      {/*    workLabel: "Work",*/}
      {/*    restLabel: "Rest",*/}
      {/*    skipLastRest: true,*/}
      {/*  }}*/}
      {/*/>*/}
    </div>
  )
}
