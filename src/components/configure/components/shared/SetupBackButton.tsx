import { MoveLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface SetupBackButtonProps {
  onClick?: () => void
  label?: string
}

export function SetupBackButton({ onClick, label = 'Go back' }: SetupBackButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={label}
      onClick={onClick}
      className="shrink-0 max-sm:size-11 max-sm:bg-muted max-sm:p-0"
    >
      <MoveLeft aria-hidden="true" />
    </Button>
  )
}
