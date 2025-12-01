import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full',
          'file:text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'border-input placeholder:text-muted-foreground border',
          'rounded-md bg-transparent px-3 py-1 text-base shadow-sm transition-colors',
          'focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
