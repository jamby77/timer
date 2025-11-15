import { ReactNode } from "react";

interface CardProps {
  label: string;
  status: ReactNode;
  time: string;
  children: ReactNode;
}

export function Card({ label, status, time, children }: CardProps) {
  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
      <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">{label}</h1>
      <p className="mb-8 text-center text-sm text-gray-500">{status}</p>
      <div className="mb-8 text-center">
        <div className="font-mono text-6xl text-gray-800">{time}</div>
      </div>
      <div className="flex justify-center space-x-4">{children}</div>
    </div>
  );
}
