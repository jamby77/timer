import type { StopwatchConfig } from "@/types/configure";

interface StopwatchFieldsProps {
  config: Partial<StopwatchConfig>;
  onChange: (updates: Partial<StopwatchConfig>) => void;
}

export const StopwatchFields = ({ config, onChange }: StopwatchFieldsProps) => {
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
