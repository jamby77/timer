import PauseIcon from "@/icons/PauseIcon";
import { cn } from "@/lib/utils";

import { BaseButton } from "./BaseButton";

interface PauseButtonProps {
  onClick: () => void;
  title?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const PauseButton = ({
  onClick,
  title = "Pause",
  label = "Pause timer",
  disabled = false,
  className = "",
}: PauseButtonProps) => {
  return (
    <BaseButton
      onClick={onClick}
      title={title}
      label={label}
      disabled={disabled}
      className={cn("bg-tm-pause hover:bg-tm-pause/80 focus:ring-tm-pause", className)}
    >
      <PauseIcon className="h-6 w-6" />
    </BaseButton>
  );
};
