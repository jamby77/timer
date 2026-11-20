import { formatTime } from '@/lib/timer'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface WorkoutLimitDialogProps {
  open: boolean
  elapsedMs: number
  limitSeconds: number
  onContinue: () => void
  onEnd: () => void
}

export function WorkoutLimitDialog({
  open,
  elapsedMs,
  limitSeconds,
  onContinue,
  onEnd,
}: WorkoutLimitDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onContinue()
      }}
    >
      <DialogContent className="z-10001 max-sm:[&>[data-slot=dialog-close]]:top-1 max-sm:[&>[data-slot=dialog-close]]:right-1 max-sm:[&>[data-slot=dialog-close]]:grid max-sm:[&>[data-slot=dialog-close]]:size-11 max-sm:[&>[data-slot=dialog-close]]:place-items-center" overlayClassName="z-10000">
        <DialogHeader>
          <DialogTitle>Time Limit Reached</DialogTitle>
          <DialogDescription>
            Your workout has reached its overall time limit. This message does not pause your
            workout. Continue the workout or end it now.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm tabular-nums">
          Elapsed {formatTime(elapsedMs).split('.')[0]} / Limit{' '}
          {formatTime(limitSeconds * 1000).split('.')[0]}
        </p>
        <DialogFooter className="max-sm:flex-col">
          <Button className="max-sm:min-h-11" onClick={onContinue}>Continue Workout</Button>
          <Button className="max-sm:min-h-11" variant="destructive" onClick={onEnd}>
            End Workout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
