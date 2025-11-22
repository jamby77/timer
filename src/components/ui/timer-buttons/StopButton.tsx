import StopIcon from "@/icons/StopIcon";
import { cn } from "@/lib/utils";

import { BaseButton } from "./BaseButton";

interface StopButtonProps {
  onClick: () => void;
  title?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const StopButton = ({
  onClick,
  title = "Stop",
  label = "Stop timer",
  disabled = false,
  className = "",
}: StopButtonProps) => {
  return (
    <BaseButton
      onClick={onClick}
      title={title}
      label={label}
      disabled={disabled}
      className={cn("bg-tm-stop hover:bg-tm-stop/80 focus:ring-tm-stop", className)}
    >
      <StopIcon className="h-6 w-6" />
    </BaseButton>
  );
};
