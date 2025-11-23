import { ReactNode } from "react";
import { TimerStep } from "@/lib/timer/TimerManager";
import { cn } from "@/lib/utils";

import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Card as ShadcnCard,
} from "@/components/ui/card";

interface CardProps {
  label: string;
  status: ReactNode;
  time: string;
  children: ReactNode;
  subtitle?: ReactNode;
  currentStep?: TimerStep | null;
}

export const TimerCard = ({ label, status, time, children, subtitle, currentStep }: CardProps) => (
  <div
    className={cn("animate-border rounded-xl border-4 border-transparent", {
      "animated-border-card": currentStep?.isWork,
    })}
  >
    <ShadcnCard
      className={cn("px-2", {
        "bg-tm-work-bg": currentStep?.isWork,
        "bg-tm-rest-bg": currentStep && !currentStep?.isWork,
      })}
    >
      <CardHeader className="space-y-2">
        <CardTitle className="text-card-foreground text-center text-3xl font-bold">
          {label}
        </CardTitle>
        <CardDescription className="text-card-foreground">
          {subtitle && (
            <p
              className={cn("mx-auto max-w-32 text-center text-xs", {
                invisible: !subtitle,
              })}
            >
              {subtitle}
            </p>
          )}
          {status && <p className={cn("text-center text-sm", { invisible: !status })}>{status}</p>}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div
          className={cn("font-mono text-9xl font-bold tabular-nums", {
            "text-tm-work-fg": currentStep?.isWork,
            "text-tm-rest-fg": currentStep && !currentStep?.isWork,
            "text-foreground": !currentStep,
          })}
        >
          {time}
        </div>
      </CardContent>

      <CardFooter className="justify-center px-0 pt-0">
        <div className="flex flex-col space-x-4">{children}</div>
      </CardFooter>
    </ShadcnCard>
  </div>
);
