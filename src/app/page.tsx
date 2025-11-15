"use client";

import { useCallback, useState } from "react";
import { formatTime, useTimer } from "@/lib/timer";

export default function Home() {
  const [inputTime, setInputTime] = useState("01:00");
  const [initialTime, setInitialTime] = useState(60000); // 1 minute in ms

  const { time, state, start, pause, reset } = useTimer(initialTime, {
    onComplete: () => {
      console.log("Timer completed!");
    },
    onStateChange: (state) => {
      console.log("Timer state changed to:", state);
    },
  });

  const handleStart = useCallback(() => {
    if (state === "running") {
      pause();
    } else {
      start();
    }
  }, [state, start, pause]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Simple validation for MM:SS format
    if (/^\d{0,2}:?\d{0,2}$/.test(value)) {
      setInputTime(value);

      // Update initial time when input is complete
      if (value.includes(":") && value.length === 5) {
        const [minutes, seconds] = value.split(":").map(Number);
        setInitialTime((minutes * 60 + seconds) * 1000);
        reset();
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="mb-8 text-4xl font-bold">Timer</h1>

        <div className="mb-8">
          <div className="mb-4 font-mono text-8xl font-bold text-sky-600">{formatTime(time)}</div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleStart}
              className="rounded-md bg-sky-500 px-6 py-2 text-white transition-colors hover:bg-sky-600"
            >
              {state === "running" ? "Pause" : "Start"}
            </button>

            <button
              onClick={handleReset}
              className="rounded-md bg-gray-200 px-6 py-2 text-gray-800 transition-colors hover:bg-gray-300"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-8">
          <label className="mb-2 block text-sm font-medium text-gray-700">Set Timer (MM:SS)</label>
          <input
            type="text"
            value={inputTime}
            onChange={handleTimeChange}
            placeholder="01:00"
            className="rounded-md border border-gray-300 px-4 py-2 text-center font-mono"
            disabled={state === "running"}
          />
        </div>
      </div>
    </main>
  );
}
