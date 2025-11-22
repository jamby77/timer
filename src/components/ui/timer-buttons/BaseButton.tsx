import { ButtonHTMLAttributes } from "react";

import { Button } from "@/components/ui/button";

type BaseButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
};

export const BaseButton = ({
  onClick,
  children,
  label,
  title,
  className,
  disabled,
  ...rest
}: BaseButtonProps) => {
  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      className={className}
      size="timer"
      variant="timer"
      aria-label={label}
      title={title}
      {...rest}
    >
      {children}
    </Button>
  );
};
