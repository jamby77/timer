import { cn } from '@/lib/utils'

import RepeatIcon from '@/icons/Repeat'
import { BaseButton } from './BaseButton'

interface ResetButtonProps {
  onClick: () => void
  text?: string
  title?: string
  label?: string
  disabled?: boolean
  className?: string
}

export const ResetButton = ({
  onClick,
  title = 'Reset',
  text,
  label = 'Reset timer',
  disabled = false,
  className = '',
}: ResetButtonProps) => {
  return (
    <BaseButton
      onClick={onClick}
      title={title}
      label={label}
      disabled={disabled}
      className={cn(
        'bg-tm-reset hover:bg-tm-reset/80 focus:ring-tm-reset',
        text && 'w-auto px-4',
        className
      )}
    >
      <RepeatIcon className="h-6 w-6" />
      {text}
    </BaseButton>
  )
}
