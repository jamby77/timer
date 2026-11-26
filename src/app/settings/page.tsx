'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

import type { SettingsSection } from './sections'

import { SectionEditor } from './SectionEditor'
import { sections } from './sections'

export default function SettingsPage() {
  const [section, setSection] = useState<SettingsSection>()
  const previousSection = useRef<string | null>(null)
  const rows = useRef(new Map<string, HTMLButtonElement>())

  useEffect(() => {
    if (section) {
      window.scrollTo(0, 0)
    } else if (previousSection.current) {
      rows.current.get(previousSection.current)?.focus()
    }
  }, [section])

  if (section) {
    return (
      <SectionEditor
        section={section}
        onClose={(saved) => {
          if (saved) toast.success(`${section.title} defaults saved`)
          setSection(undefined)
        }}
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-xl px-8 py-5">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="text-muted-foreground mt-1 mb-3 text-sm">
        Defaults for new timers on this device.
      </p>
      {sections.map((group) => (
        <section
          className="mb-4"
          key={group.entries[0].key}
          aria-label={group.title ?? 'General settings'}
        >
          {group.title && (
            <h2 className="text-muted-foreground mb-1.5 text-sm font-medium">{group.title}</h2>
          )}
          <div className="bg-background divide-y overflow-hidden rounded-lg border">
            {group.entries.map((entry) => (
              <button
                key={entry.key}
                type="button"
                ref={(node) => {
                  if (node) rows.current.set(entry.key, node)
                  else rows.current.delete(entry.key)
                }}
                className="hover:bg-muted focus-visible:ring-ring flex min-h-11 w-full items-center justify-between px-3 text-left text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
                onClick={() => {
                  previousSection.current = entry.key
                  setSection(entry)
                }}
              >
                {entry.title}
                <ChevronRight className="text-muted-foreground size-4" aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
