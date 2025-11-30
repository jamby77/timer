import { SyntheticEvent } from 'react'
import { PlayIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface FormActionsProps {
  enableSaveAsPredefined: boolean
  enableSave: boolean
  onHandleSave: (e: SyntheticEvent) => void
}

export const FormActions = ({
  enableSaveAsPredefined,
  enableSave,
  onHandleSave,
}: FormActionsProps) => {
  return (
    <div className="flex gap-3 pt-4">
      <Button variant="default" type="submit" size="lg">
        <PlayIcon size={4} strokeWidth={0} className="fill-background" />
        Start Timer
      </Button>

      {!enableSaveAsPredefined && (
        <Button type="button" variant="outline" onClick={onHandleSave} size="lg">
          Save as Predefined
        </Button>
      )}

      {enableSave && (
        <Button type="button" variant="secondary" onClick={onHandleSave} size="lg">
          Save Changes
        </Button>
      )}
    </div>
  )
}
