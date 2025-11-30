import { ReactNode } from 'react'
import cx from 'clsx'

interface CardContainerProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function CardContainer({ children, className, onClick }: CardContainerProps) {
  return (
    <div
      className={cx(
        'border-accent bg-background rounded-lg border p-2 shadow-md md:p-6',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
