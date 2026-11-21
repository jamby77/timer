import { cn } from '@/lib/utils'

import SkipIcon from '@/icons/SkipIcon'
import { BaseButton } from './BaseButton'

interface SkipButtonProps {
  onClick: () => void
  title?: string
  text?: string
  label?: string
  disabled?: boolean
  className?: string
}

export const SkipButton = ({
  onClick,
  title = 'Skip',
  label = 'Skip to next',
  text,
  disabled = false,
  className = '',
}: SkipButtonProps) => {
  return (
    <BaseButton
      onClick={onClick}
      title={title}
      label={label}
      disabled={disabled}
      className={cn(
        'bg-tm-skip hover:bg-tm-skip/80 focus:ring-tm-skip',
        text && 'w-auto px-4',
        className
      )}
    >
      <SkipIcon className="h-6 w-6" />
      {text}
    </BaseButton>
  )
}
