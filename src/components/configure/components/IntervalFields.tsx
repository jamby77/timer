import type { IntervalConfig } from "@/types/configure";

interface IntervalFieldsProps {
  config: Partial<IntervalConfig>;
  onChange: (updates: Partial<IntervalConfig>) => void;
}

export const IntervalFields = ({ config, onChange }: IntervalFieldsProps) => {
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
