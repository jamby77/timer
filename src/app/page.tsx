'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTimer, formatTime } from '@/lib/timer';

export default function Home() {
  const [inputTime, setInputTime] = useState('01:00');
  const [initialTime, setInitialTime] = useState(60000); // 1 minute in ms

  const {
    time,
    state,
    start,
    pause,
    reset,
  } = useTimer(initialTime, {
    onComplete: () => {
      console.log('Timer completed!');
    },
    onStateChange: (state) => {
      console.log('Timer state changed to:', state);
    },
  });

  const handleStart = useCallback(() => {
    if (state === 'running') {
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
      if (value.includes(':') && value.length === 5) {
        const [minutes, seconds] = value.split(':').map(Number);
        setInitialTime((minutes * 60 + seconds) * 1000);
        reset();
      }
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Timer</h1>
        
        <div className="mb-8">
          <div className="text-8xl font-mono font-bold text-sky-600 mb-4">
            {formatTime(time)}
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleStart}
              className="px-6 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
            >
              {state === 'running' ? 'Pause' : 'Start'}
            </button>
            
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
        
        <div className="mt-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Set Timer (MM:SS)
          </label>
          <input
            type="text"
            value={inputTime}
            onChange={handleTimeChange}
            placeholder="01:00"
            className="px-4 py-2 border border-gray-300 rounded-md text-center font-mono"
            disabled={state === 'running'}
          />
        </div>
      </div>
    </main>
  );
}
