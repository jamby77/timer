import PlayIcon from "@/icons/PlayIcon";
import { cn } from "@/lib/utils";

import { BaseButton } from "./BaseButton";

interface PlayButtonProps {
  onClick: () => void;
  title?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const StartButton = ({
  onClick,
  title = "Start",
  label = "Start timer",
  disabled = false,
  className = "",
}: PlayButtonProps) => {
  return (
    <BaseButton
      onClick={onClick}
      title={title}
      label={label}
      disabled={disabled}
      className={cn("bg-tm-play hover:bg-tm-play/80 focus:ring-tm-play", className)}
    >
      <PlayIcon className="h-6 w-6" />
    </BaseButton>
  );
};
