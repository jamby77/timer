"use client";

import React, { useEffect } from "react";

import { Timer } from "@/components/timer/Timer";

export default function Home() {
  const [state, setState] = React.useState(10);
  const [showGo, setShowGo] = React.useState(false);
  // using requestAnimationFrame instead of setTimeout increment state by 1 every second
  useEffect(() => {
    let lastTime = performance.now();
    let requestId: number;

    const loop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;

      if (deltaTime >= 1000) {
        // 1000 ms = 1 sec
        setState((state) => {
          if (state <= 0) {
            return 0;
          }
          return state - 1;
        });
        lastTime = currentTime;
      }
      if (state > 0) {
        requestId = requestAnimationFrame(loop);
      }
    };

    requestId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(requestId);
  }, [state]);

  // when state = 0, set a 1000 ms timer to set shoGo to true
  useEffect(() => {
    if (state === 0) {
      const timer = setTimeout(() => {
        setShowGo(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state]);

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
      <Timer />
    </main>
  );
}
