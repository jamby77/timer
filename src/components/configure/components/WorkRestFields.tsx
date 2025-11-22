import type { WorkRestConfig } from "@/types/configure";
import { WorkRestMode } from "@/types/configure";

interface WorkRestFieldsProps {
  config: Partial<WorkRestConfig>;
  onChange: (updates: Partial<WorkRestConfig>) => void;
}

export const WorkRestFields = ({ config, onChange }: WorkRestFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="restMode" className="mb-2 block text-sm font-medium text-gray-700">Rest Mode</label>
        <select
          id="restMode"
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
          <label htmlFor="ratio" className="mb-2 block text-sm font-medium text-gray-700">Work/Rest Ratio</label>
          <input
            id="ratio"
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
          <label htmlFor="fixedRestDuration" className="mb-2 block text-sm font-medium text-gray-700">
            Fixed Rest Duration (seconds)
          </label>
          <input
            id="fixedRestDuration"
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
          <label htmlFor="maxWorkTime" className="mb-2 block text-sm font-medium text-gray-700">
            Maximum Work Time (seconds)
          </label>
          <input
            id="maxWorkTime"
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
          <label htmlFor="maxRounds" className="mb-2 block text-sm font-medium text-gray-700">Maximum Rounds</label>
          <input
            id="maxRounds"
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
