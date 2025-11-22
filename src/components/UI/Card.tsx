import { ReactNode } from "react";
import cx from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cx("rounded-lg border border-gray-200 bg-white p-6 shadow-md", className)}>
      {children}
    </div>
  );
}
