import { PlayIcon } from 'lucide-react'

import { ButtonLegacy } from '@/components/ui'
import { Button } from '@/components/ui/button'

interface FormActionsProps {
  isPredefined: boolean
  onSaveAsPredefined?: ((config: any) => void) | undefined
  onSave?: ((config: any) => void) | undefined
  onHandleSave: () => void
}

export const FormActions = ({
  isPredefined,
  onSaveAsPredefined,
  onSave,
  onHandleSave,
}: FormActionsProps) => {
  return (
    <div className="flex gap-3 pt-4">
      <Button variant="default" type="submit" size="lg">
        <PlayIcon size={4} strokeWidth={0} className="fill-background" />
        Start Timer
      </Button>

      {!isPredefined && onSaveAsPredefined && (
        <Button type="button" variant="outline" onClick={onHandleSave} size="lg">
          Save as Predefined
        </Button>
      )}

      {onSave && (
        <Button type="button" variant="secondary" onClick={onHandleSave} size="lg">
          Save Changes
        </Button>
      )}
    </div>
  )
}
