"use client";

import { WorkRestTimer } from "@/components/WorkRestTimer";

export default function WorkRestTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Work/Rest Timer Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Test Instructions:</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Click "Start work" to begin work phase</li>
              <li>Verify timer counts up (MM:SS.MS format)</li>
              <li>Click "Stop work" to record lap and start rest</li>
              <li>Verify rest timer counts down</li>
              <li>Verify lap appears in history</li>
              <li>Test ratio adjustments (only when idle)</li>
              <li>Test pause/resume functionality</li>
              <li>Test skip/stop rest functionality</li>
            </ul>
          </div>
          
          <WorkRestTimer />
        </div>
      </div>
    </div>
  );
}
