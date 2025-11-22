import PlayIcon from "@/icons/PlayIcon";

import { ButtonLegacy } from "@/components/ui";

interface FormActionsProps {
  isPredefined: boolean;
  onSaveAsPredefined?: ((config: any) => void) | undefined;
  onSave?: ((config: any) => void) | undefined;
  onHandleSave: () => void;
}

export const FormActions = ({
  isPredefined,
  onSaveAsPredefined,
  onSave,
  onHandleSave,
}: FormActionsProps) => {
  return (
    <div className="flex gap-3 pt-4">
      <ButtonLegacy type="submit" className="flex items-center gap-2">
        <PlayIcon className="h-4 w-4" />
        Start Timer
      </ButtonLegacy>

      {!isPredefined && onSaveAsPredefined && (
        <ButtonLegacy type="button" variant="outline" onClick={onHandleSave}>
          Save as Predefined
        </ButtonLegacy>
      )}

      {onSave && (
        <ButtonLegacy type="button" variant="outline" onClick={onHandleSave}>
          Save Changes
        </ButtonLegacy>
      )}
    </div>
  );
};
