import type { AnyTimerConfig } from "@/types/configure";

interface ComplexFieldsProps {
  config: Partial<AnyTimerConfig>;
  onChange: (updates: Partial<AnyTimerConfig>) => void;
}

export const ComplexFields = ({ config, onChange }: ComplexFieldsProps) => {
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
