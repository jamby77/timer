'use client'

import { useTimerContext } from '@/contexts/TimerContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

import { ThemeToggle } from '@/components/theme-toggle'

export const Navigation = () => {
  const pathname = usePathname()
  const { isAnyTimerActive } = useTimerContext()

  // Hide navigation when any timer is active (running or paused)
  if (isAnyTimerActive) {
    return null
  }

  const navItems = [
    { href: '/', label: 'Run' },
    { href: '/configure', label: 'New' },
    { href: '/settings', label: 'Settings' },
  ]

  return (
    <nav className="border-border bg-background text-foreground border-b shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex gap-2 sm:gap-8">
            {navItems.map((item) => {
              const isCurrentPage = pathname === item.href
              const isActive = isCurrentPage || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isCurrentPage ? 'page' : isActive ? 'location' : undefined}
                  className={cn(
                    'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium max-sm:min-h-11 max-sm:min-w-14 max-sm:justify-center',
                    {
                      'text-foreground border-blue-500': isActive,
                      'text-muted-foreground hover:border-muted hover:text-foreground border-transparent':
                        !isActive,
                    }
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
