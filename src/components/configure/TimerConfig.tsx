'use client'

import { TimerConfigFormProps } from '@/types/configure'
import { useMediaQuery } from '@/hooks/use-media-query'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { TimerConfigForm } from '@/components/configure/components'

export const TimerConfig = ({
  type,
  initialConfig,
  isPredefined = false,
  onStartTimer,
  onSaveAsPredefined,
  onSave,
  open,
  onOpenChange,
}: TimerConfigFormProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const isLaptop = useMediaQuery('(min-width: 1024px)')

  if (isLaptop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange} modal>
        <DialogContent className="overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure</DialogTitle>
          </DialogHeader>
          <TimerConfigForm
            type={type}
            initialConfig={initialConfig}
            isPredefined={isPredefined}
            onStartTimer={onStartTimer}
            onSaveAsPredefined={onSaveAsPredefined}
            onSave={onSave}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="overflow-hidden">
        <DrawerHeader className="text-left sm:text-center">
          <DrawerTitle>Edit timer</DrawerTitle>
        </DrawerHeader>
        <TimerConfigForm
          type={type}
          initialConfig={initialConfig}
          isPredefined={isPredefined}
          onStartTimer={onStartTimer}
          onSaveAsPredefined={onSaveAsPredefined}
          onSave={onSave}
        />
      </DrawerContent>
    </Drawer>
  )
}
