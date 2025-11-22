import type {
  AnyTimerConfig,
  CountdownConfig,
  IntervalConfig,
  StopwatchConfig,
  WorkRestConfig,
} from "@/types/configure";
import { TimerType } from "@/types/configure";

import { ComplexFields } from "./ComplexFields";
import { CountdownFields } from "./CountdownFields";
import { IntervalFields } from "./IntervalFields";
import { StopwatchFields } from "./StopwatchFields";
import { WorkRestFields } from "./WorkRestFields";

interface CommonFieldsProps {
  config: Partial<AnyTimerConfig>;
  onChange: (updates: Partial<AnyTimerConfig>) => void;
  type: TimerType;
}

export const CommonFields = ({ config, onChange, type }: CommonFieldsProps) => {
  const renderFormFields = () => {
    switch (type) {
      case TimerType.COUNTDOWN:
        return <CountdownFields config={config as CountdownConfig} onChange={onChange} />;
      case TimerType.STOPWATCH:
        return <StopwatchFields config={config as StopwatchConfig} onChange={onChange} />;
      case TimerType.INTERVAL:
        return <IntervalFields config={config as IntervalConfig} onChange={onChange} />;
      case TimerType.WORKREST:
        return <WorkRestFields config={config as WorkRestConfig} onChange={onChange} />;
      case TimerType.COMPLEX:
        return <ComplexFields config={config} onChange={onChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Timer Name */}
      <div>
        <label htmlFor="timerName" className="mb-2 block text-sm font-medium text-gray-700">
          Timer Name
        </label>
        <input
          id="timerName"
          type="text"
          value={config.name || ""}
          onChange={(e) => onChange({ name: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Enter timer name"
          required
        />
      </div>

      {/* Type-specific fields */}
      {renderFormFields()}
    </div>
  );
};
