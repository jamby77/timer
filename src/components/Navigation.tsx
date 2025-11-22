"use client";

import cx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cx("inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium", {
                  "border-blue-500 text-gray-900": pathname === item.href,
                  "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700":
                    pathname !== item.href,
                })}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
