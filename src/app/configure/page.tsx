"use client";

import { useEffect, useState } from "react";
import { getPredefinedStyles } from "@/lib/configure/presets";
import { storage } from "@/lib/configure/storage";
import { TimerConfigHash } from "@/lib/timer/TimerConfigHash";
import { AnyTimerConfig, PredefinedStyle, RecentTimer, TimerType } from "@/types/configure";
import { useRouter } from "next/navigation";

import { PredefinedStyles } from "@/components/configure/PredefinedStyles";
import { RecentTimers } from "@/components/configure/RecentTimers";
import { TimerConfigForm } from "@/components/configure/TimerConfigForm";
import { TimerTypeSelector } from "@/components/configure/TimerTypeSelector";

export default function ConfigurePage() {
  const [recentTimers, setRecentTimers] = useState<RecentTimer[]>([]);
  const [selectedType, setSelectedType] = useState<TimerType | null>(null);
  const [selectedPredefined, setSelectedPredefined] = useState<PredefinedStyle | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Load recent timers on mount
    const timers = storage.getRecentTimers();
    setRecentTimers(timers);
  }, []);

  const handleStartTimer = (config: AnyTimerConfig, isPredefined: boolean = false) => {
    let finalConfig: AnyTimerConfig;

    if (isPredefined) {
      // For predefined configs: copy and add runtime timestamps
      finalConfig = {
        ...config,
        id: TimerConfigHash.generateTimerId(config),
        createdAt: new Date(),
        lastUsed: new Date(),
      };
    } else {
      // For custom configs: ensure ID exists
      finalConfig = {
        ...config,
        id: config.id || TimerConfigHash.generateTimerId(config),
        createdAt: config.createdAt || new Date(),
        lastUsed: new Date(),
      };
    }

    // Add to recent timers
    storage.addRecentTimer(finalConfig);
    setRecentTimers(storage.getRecentTimers());

    // Navigate to appropriate timer page
    switch (finalConfig.type) {
      case TimerType.COUNTDOWN:
        router.push(`/timer/countdown?id=${finalConfig.id}`);
        break;
      case TimerType.STOPWATCH:
        router.push(`/timer/stopwatch?id=${finalConfig.id}`);
        break;
      case TimerType.INTERVAL:
        router.push(`/timer/interval?id=${finalConfig.id}`);
        break;
      case TimerType.WORKREST:
        router.push(`/timer/workrest?id=${finalConfig.id}`);
        break;
      case TimerType.COMPLEX:
        router.push(`/timer/complex?id=${finalConfig.id}`);
        break;
    }
  };

  const handleRemoveTimer = (timerId: string) => {
    storage.removeTimer(timerId);
    setRecentTimers(storage.getRecentTimers());
  };

  const handleClearAll = () => {
    storage.clearRecentTimers();
    setRecentTimers([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configure Timer</h1>
          <p className="mt-2 text-gray-600">
            Create custom timers or choose from predefined styles
          </p>
        </div>

        {/* Recent Timers Section */}
        <RecentTimers
          timers={recentTimers}
          onStartTimer={handleStartTimer}
          onRemoveTimer={handleRemoveTimer}
          onClearAll={handleClearAll}
        />

        {/* Timer Type Selection */}
        <div className="mt-8">
          <TimerTypeSelector selectedType={selectedType} onTypeSelect={setSelectedType} />
        </div>

        {/* Predefined Styles */}
        <div className="mt-8">
          <PredefinedStyles
            styles={getPredefinedStyles()}
            onSelectStyle={setSelectedPredefined}
            onStartTimer={(config) => handleStartTimer(config, true)}
          />
        </div>

        {/* Configuration Form */}
        {(selectedType || selectedPredefined) && (
          <div className="mt-8">
            <TimerConfigForm
              type={selectedType || selectedPredefined?.config.type || TimerType.COUNTDOWN}
              initialConfig={selectedPredefined?.config}
              isPredefined={!!selectedPredefined}
              onStartTimer={(config) => handleStartTimer(config, !!selectedPredefined)}
              onSaveAsPredefined={(config) => {
                // TODO: Implement save as predefined functionality
                console.log("Save as predefined:", config);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
