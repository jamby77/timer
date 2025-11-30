import { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export const PageContainer = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => {
  return <div className={cn('container min-h-screen py-8', className)}>{children}</div>
}
