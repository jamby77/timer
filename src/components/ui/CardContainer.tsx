import { ReactNode } from "react";
import cx from "clsx";

interface CardContainerProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function CardContainer({ children, className, onClick }: CardContainerProps) {
  return (
    <div
      className={cx("rounded-lg border border-gray-200 bg-white p-6 shadow-md", className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
