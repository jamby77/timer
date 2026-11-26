import { useId, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'

import { normalizeRoundNames } from '@/lib/configure/round-names'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface RoundNamesFieldProps {
  count: number
  names?: string[]
  workLabel: string
  onChange: (names: string[] | undefined) => void
}

function fitVisualViewport(sheet: HTMLDivElement | null) {
  const viewport = window.visualViewport
  if (!sheet || !viewport) return

  function fit() {
    if (!sheet || !viewport) return
    sheet.style.setProperty('--sheet-height', `${viewport.height}px`)
    const bottom = Math.max(0, window.innerHeight - viewport.offsetTop - viewport.height)
    sheet.style.setProperty('--sheet-bottom', `${bottom}px`)
    const input = document.activeElement
    if (input instanceof HTMLInputElement && sheet.contains(input)) {
      input.scrollIntoView({ block: 'nearest' })
    }
  }

  fit()
  viewport.addEventListener('resize', fit)
  viewport.addEventListener('scroll', fit)
  return () => {
    viewport.removeEventListener('resize', fit)
    viewport.removeEventListener('scroll', fit)
  }
}

export function RoundNamesField({ count, names, workLabel, onChange }: RoundNamesFieldProps) {
  const [open, setOpen] = useState(false)
  const title = useRef<HTMLHeadingElement>(null)
  const summaryId = useId()
  const namedCount = names?.slice(0, count).filter((name) => name.trim()).length ?? 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="bg-card min-h-11 w-full justify-between gap-2 px-3"
          aria-label="Round names"
          aria-describedby={summaryId}
          disabled={!count}
        >
          <span>Round names</span>
          <span
            className="text-muted-foreground flex items-center gap-1 font-normal"
            id={summaryId}
          >
            {namedCount} of {count} named <ChevronRight className="size-4" />
          </span>
        </Button>
      </DialogTrigger>
      {open && (
        <DialogContent
          ref={fitVisualViewport}
          className="bg-card top-auto bottom-[var(--sheet-bottom,0px)] flex max-h-[min(max(58dvh,18rem),var(--sheet-height,100dvh))] w-full max-w-full translate-y-0 flex-col gap-0 overflow-hidden rounded-t-2xl rounded-b-none p-0 transition-none sm:max-w-lg"
          showCloseButton={false}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            title.current?.focus()
          }}
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3">
            <DialogTitle ref={title} tabIndex={-1} className="text-base outline-none">
              Round names
            </DialogTitle>
            <DialogDescription>
              {count} {count === 1 ? 'round' : 'rounds'}
            </DialogDescription>
          </div>
          <form
            className="flex min-h-0 flex-col"
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              const values = new FormData(event.currentTarget).getAll('roundName').map(String)
              onChange(normalizeRoundNames(values, count))
              setOpen(false)
            }}
          >
            <div className="min-h-0 space-y-2 overflow-y-auto overscroll-contain px-4 py-3">
              {Array.from({ length: count }, (_, index) => (
                <label
                  key={index}
                  className="grid grid-cols-[max(4.5rem,25%)_1fr] items-center gap-2 text-sm"
                >
                  Round {index + 1}
                  <Input
                    className="bg-background min-h-11 min-w-0 text-base"
                    name="roundName"
                    defaultValue={names?.[index] ?? ''}
                    placeholder={workLabel}
                  />
                </label>
              ))}
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-2 border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="min-h-11">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="min-h-11">
                Done
              </Button>
            </div>
          </form>
        </DialogContent>
      )}
    </Dialog>
  )
}
