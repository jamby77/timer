"use client";

import { useState } from "react";
import PlayIcon from "@/icons/PlayIcon";
import { validateTimerConfig } from "@/lib/configure/utils";
import {
  AnyTimerConfig,
  CountdownConfig,
  IntervalConfig,
  StopwatchConfig,
  TimerConfigFormProps,
  TimerType,
  WorkRestConfig,
  WorkRestMode,
} from "@/types/configure";

import { Button } from "@/components/Button";
import { Card } from "@/components/UI/Card";

export const TimerConfigForm = ({
  type,
  initialConfig,
  isPredefined = false,
  onStartTimer,
  onSaveAsPredefined,
  onSave,
}: TimerConfigFormProps) => {
  const [config, setConfig] = useState<Partial<AnyTimerConfig>>(
    initialConfig || {
      type,
      name: "",
    },
  );

  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fullConfig = {
      ...config,
      type,
      createdAt: new Date(),
      lastUsed: new Date(),
    } as AnyTimerConfig;

    const validationErrors = validateTimerConfig(fullConfig);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    onStartTimer(fullConfig);
  };

  const handleSave = () => {
    if (!config.name) {
      setErrors(["Timer name is required for saving"]);
      return;
    }

    const fullConfig = {
      ...config,
      type,
      id: config.id || generateId(),
      createdAt: new Date(),
      lastUsed: new Date(),
    } as AnyTimerConfig;

    const validationErrors = validateTimerConfig(fullConfig);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);

    if (onSaveAsPredefined && !isPredefined) {
      onSaveAsPredefined(fullConfig);
    } else if (onSave) {
      onSave(fullConfig);
    }
  };

  const updateConfig = (updates: Partial<AnyTimerConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    setErrors([]);
  };

  const renderFormFields = () => {
    switch (type) {
      case TimerType.COUNTDOWN:
        return <CountdownFields config={config as CountdownConfig} onChange={updateConfig} />;
      case TimerType.STOPWATCH:
        return <StopwatchFields config={config as StopwatchConfig} onChange={updateConfig} />;
      case TimerType.INTERVAL:
        return <IntervalFields config={config as IntervalConfig} onChange={updateConfig} />;
      case TimerType.WORKREST:
        return <WorkRestFields config={config as WorkRestConfig} onChange={updateConfig} />;
      case TimerType.COMPLEX:
        return <ComplexFields config={config} onChange={updateConfig} />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Configure {type.charAt(0) + type.slice(1).toLowerCase()} Timer
        </h2>
        {isPredefined && (
          <p className="text-sm text-gray-600">
            Customizing a predefined style. Changes will not affect the original.
          </p>
        )}
      </div>

      {errors.length > 0 && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3">
          <h4 className="mb-1 text-sm font-medium text-red-800">
            Please fix the following errors:
          </h4>
          <ul className="list-inside list-disc text-sm text-red-700">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Common fields */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Timer Name</label>
          <input
            type="text"
            value={config.name || ""}
            onChange={(e) => updateConfig({ name: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter timer name"
            required
          />
        </div>

        {/* Type-specific fields */}
        {renderFormFields()}

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex items-center gap-2">
            <PlayIcon className="h-4 w-4" />
            Start Timer
          </Button>

          {!isPredefined && onSaveAsPredefined && (
            <Button type="button" variant="outline" onClick={handleSave}>
              Save as Predefined
            </Button>
          )}

          {onSave && (
            <Button type="button" variant="outline" onClick={handleSave}>
              Save Changes
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

// Helper function to generate ID
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Type-specific field components
interface CountdownFieldsProps {
  config: Partial<CountdownConfig>;
  onChange: (updates: Partial<CountdownConfig>) => void;
}

const CountdownFields = ({ config, onChange }: CountdownFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Duration (seconds)</label>
        <input
          type="number"
          min="1"
          max="86400"
          value={config.duration || ""}
          onChange={(e) => onChange({ duration: parseInt(e.target.value) || 0 })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="300"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Completion Message (optional)
        </label>
        <input
          type="text"
          value={config.completionMessage || ""}
          onChange={(e) => onChange({ completionMessage: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Time is up!"
        />
      </div>
    </div>
  );
};

interface StopwatchFieldsProps {
  config: Partial<StopwatchConfig>;
  onChange: (updates: Partial<StopwatchConfig>) => void;
}

const StopwatchFields = ({ config, onChange }: StopwatchFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Time Limit (seconds, optional)
        </label>
        <input
          type="number"
          min="1"
          max="86400"
          value={config.timeLimit || ""}
          onChange={(e) => onChange({ timeLimit: parseInt(e.target.value) || undefined })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Leave empty for no limit"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Completion Message (optional)
        </label>
        <input
          type="text"
          value={config.completionMessage || ""}
          onChange={(e) => onChange({ completionMessage: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Time limit reached"
        />
      </div>
    </div>
  );
};

interface IntervalFieldsProps {
  config: Partial<IntervalConfig>;
  onChange: (updates: Partial<IntervalConfig>) => void;
}

const IntervalFields = ({ config, onChange }: IntervalFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Work Duration (seconds)
          </label>
          <input
            type="number"
            min="1"
            value={config.workDuration || ""}
            onChange={(e) => onChange({ workDuration: parseInt(e.target.value) || 0 })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="20"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Rest Duration (seconds)
          </label>
          <input
            type="number"
            min="0"
            value={config.restDuration || ""}
            onChange={(e) => onChange({ restDuration: parseInt(e.target.value) || 0 })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="10"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Number of Intervals</label>
        <input
          type="number"
          min="1"
          max="1000"
          value={config.intervals || ""}
          onChange={(e) => onChange({ intervals: parseInt(e.target.value) || 0 })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="8"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Work Label (optional)
          </label>
          <input
            type="text"
            value={config.workLabel || ""}
            onChange={(e) => onChange({ workLabel: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Work"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Rest Label (optional)
          </label>
          <input
            type="text"
            value={config.restLabel || ""}
            onChange={(e) => onChange({ restLabel: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Rest"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={config.skipLastRest || false}
            onChange={(e) => onChange({ skipLastRest: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Skip last rest period</span>
        </label>
      </div>
    </div>
  );
};

interface WorkRestFieldsProps {
  config: Partial<WorkRestConfig>;
  onChange: (updates: Partial<WorkRestConfig>) => void;
}

const WorkRestFields = ({ config, onChange }: WorkRestFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Rest Mode</label>
        <select
          value={config.restMode || "RATIO"}
          onChange={(e) => onChange({ restMode: e.target.value as WorkRestMode })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="RATIO">Ratio-based</option>
          <option value="FIXED">Fixed duration</option>
        </select>
      </div>

      {config.restMode === WorkRestMode.RATIO ? (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Work/Rest Ratio</label>
          <input
            type="number"
            min="0.1"
            max="10"
            step="0.1"
            value={config.ratio || ""}
            onChange={(e) => onChange({ ratio: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="2.0"
            required
          />
        </div>
      ) : (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Fixed Rest Duration (seconds)
          </label>
          <input
            type="number"
            min="1"
            value={config.fixedRestDuration || ""}
            onChange={(e) => onChange({ fixedRestDuration: parseInt(e.target.value) || 0 })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="30"
            required
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Maximum Work Time (seconds)
          </label>
          <input
            type="number"
            min="1"
            value={config.maxWorkTime || ""}
            onChange={(e) => onChange({ maxWorkTime: parseInt(e.target.value) || 0 })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="300"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Maximum Rounds</label>
          <input
            type="number"
            min="1"
            value={config.maxRounds || ""}
            onChange={(e) => onChange({ maxRounds: parseInt(e.target.value) || 0 })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="10"
            required
          />
        </div>
      </div>
    </div>
  );
};

interface ComplexFieldsProps {
  config: Partial<AnyTimerConfig>;
  onChange: (updates: Partial<AnyTimerConfig>) => void;
}

const ComplexFields = ({ config, onChange }: ComplexFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="rounded-md bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          Complex timers allow you to combine multiple timer types in sequence. This feature will be
          implemented in a future update.
        </p>
      </div>
    </div>
  );
};
