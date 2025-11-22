"use client";

import { WorkRestTimer } from "@/components/display/WorkRestTimer";

export default function WorkRestTestPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-center text-3xl font-bold">Work/Rest Timer Test</h1>

        <div className="shadow-card rounded-lg p-6 shadow-lg">
          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold">Test Instructions:</h2>
            <ul className="text-foreground list-inside list-disc space-y-1">
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
