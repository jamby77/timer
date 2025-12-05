import { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export const PageContainer = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => {
  return (
    <div className={cn('container mx-auto min-h-screen p-1 md:py-8', className)}>{children}</div>
  )
}
