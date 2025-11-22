"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";

export const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/configure", label: "Configure" },
    { href: "/timer/countdown", label: "Countdown" },
    { href: "/timer/stopwatch", label: "Stopwatch" },
    { href: "/timer/interval", label: "Interval" },
    { href: "/timer/workrest", label: "Work/Rest" },
  ];

  return (
    <nav className="border-border bg-background text-foreground border-b shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium",
                    {
                      "text-foreground border-blue-500": isActive,
                      "text-muted-foreground hover:border-muted hover:text-foreground h border-transparent":
                        pathname !== item.href,
                    },
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};
