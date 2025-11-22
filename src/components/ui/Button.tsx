import { ButtonHTMLAttributes, forwardRef } from "react";
import cx from "clsx";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";

    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-900",
      ghost: "hover:bg-gray-100 text-gray-900",
      destructive: "bg-red-600 text-white hover:bg-red-700",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-10 py-2 px-4",
      lg: "h-11 px-8",
    };

    return (
      <button
        className={cx(baseClasses, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
