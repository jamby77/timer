import { ReactNode } from "react";

interface CardProps {
  label: string;
  status: ReactNode;
  time: string;
  children: ReactNode;
  subtitle?: ReactNode;
}

export function Card({ label, status, time, children, subtitle }: CardProps) {
  return (
    <div className="w-fit max-w-5xl rounded-lg bg-white p-8 shadow-lg">
      <h2 className="mb-2 text-center text-3xl font-bold text-gray-800">{label}</h2>
      {subtitle && <p className="mb-2 text-center text-xs text-gray-400">{subtitle}</p>}
      <p className="mb-8 text-center text-base text-gray-500">{status}</p>
      <div className="mb-8 text-center">
        <div className="font-mono text-9xl text-gray-800 tabular-nums">{time}</div>
      </div>
      <div className="flex justify-center space-x-4">{children}</div>
    </div>
  );
}
