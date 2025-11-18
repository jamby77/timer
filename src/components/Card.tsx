import { ReactNode } from "react";
import { TimerStep } from "@/lib/timer/TimerManager";
import cx from "clsx";

interface CardProps {
  label: string;
  status: ReactNode;
  time: string;
  children: ReactNode;
  subtitle?: ReactNode;
  currentStep?: TimerStep | null;
}

export function Card({ label, status, time, children, subtitle, currentStep }: CardProps) {
  return (
    <div
      className={cx("w-fit max-w-5xl rounded-lg p-8 shadow-lg", {
        "bg-emerald-400": currentStep?.isWork,
        "bg-rose-300": currentStep && !currentStep?.isWork,
        "bg-transparent": !currentStep,
      })}
    >
      <h2 className="mb-2 text-center text-3xl font-bold text-gray-800">{label}</h2>
      <p
        className={cx(
          "mx-auto mb-2 max-w-32 rounded bg-white/80 text-center text-xs text-gray-700",
          { invisible: !subtitle },
        )}
      >
        {subtitle}
      </p>
      <p className={cx({ invisible: !status }, "mb-8 text-center text-base text-gray-600")}>
        {status}
      </p>
      <div className="mb-8 text-center">
        <div className="font-mono text-9xl text-gray-800 tabular-nums">{time}</div>
      </div>
      <div className="flex flex-col justify-center space-x-4">{children}</div>
    </div>
  );
}
