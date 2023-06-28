"use client";

import React, { useEffect } from "react";

import { Timer } from "@/components/timer/useTimer";
import { msToTime } from "@/components/timer/utilities";

export default function Home() {
  const [state, setState] = React.useState(10);
  const [showGo, setShowGo] = React.useState(false);
  // using requestAnimationFrame instead of setTimeout increment state by 1 every second
  useEffect(() => {
    const timer = new Timer(10000);
    timer.addUpdateListener((time) => {
      // time is in millisecond.microseconds format, convert it to seconds
      let timeStruct = msToTime(Math.floor(time));
      setState(10 - timeStruct.seconds);
    });
    timer.addStopListener(() => {
      console.log("timer stopped");
      setShowGo(true);
    });
    timer.run();
    return () => timer.stop();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div
        className={`text-9xl font-bold text-sky-500 ${
          state <= 3 && !showGo ? "animate-ping" : "animate-none"
        }`}
      >
        {!showGo && state}
        {showGo && "GO"}
      </div>
    </main>
  );
}
