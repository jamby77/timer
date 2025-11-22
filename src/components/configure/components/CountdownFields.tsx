import type { CountdownConfig } from "@/types/configure";

interface CountdownFieldsProps {
  config: Partial<CountdownConfig>;
  onChange: (updates: Partial<CountdownConfig>) => void;
}

export const CountdownFields = ({ config, onChange }: CountdownFieldsProps) => {
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
