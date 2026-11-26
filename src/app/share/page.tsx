'use client'

import { useEffect, useState } from 'react'
import { Play } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import type { AnyTimerConfig } from '@/types/configure'

import { saveTimerPreset } from '@/lib/configure/save-preset'
import { readShareHash } from '@/lib/configure/share-link'
import { startSharedTimer } from '@/lib/configure/start-shared-timer'

import { Button } from '@/components/ui/button'
import { TimerSummary } from './TimerSummary'

function SharedTimer({ config }: { config: AnyTimerConfig }) {
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function save() {
    try {
      saveTimerPreset(config)
      setSaved(true)
      setError('')
    } catch {
      setError('Could not save this preset on this device. Try again.')
    }
  }

  function start() {
    try {
      router.push(startSharedTimer(config))
    } catch {
      setError('Could not start this timer on this device. Try again.')
    }
  }

  return (
    <>
      <TimerSummary config={config} />
      <div className="mt-3.5 grid grid-cols-2 gap-2">
        <Button className="h-11" onClick={start}>
          <Play aria-hidden="true" />
          Start
        </Button>
        <Button className="h-11 px-2" variant="outline" onClick={save} disabled={saved}>
          {saved ? 'Saved to presets' : 'Save to presets'}
        </Button>
      </div>
      {saved && (
        <p className="mt-3 text-sm" role="status">
          Saved to your presets.
        </p>
      )}
      {error && (
        <p className="mt-3 text-sm" role="alert">
          {error}
        </p>
      )}
    </>
  )
}

export default function SharePage() {
  const [config, setConfig] = useState<AnyTimerConfig | null | undefined>(undefined)

  useEffect(() => {
    let revision = 0
    const load = () => {
      const current = ++revision
      setConfig(undefined)
      readShareHash(window.location.hash).then(
        (value) => {
          if (current === revision) setConfig(value)
        },
        () => {
          if (current === revision) setConfig(null)
        }
      )
    }
    load()
    window.addEventListener('hashchange', load)
    return () => {
      revision++
      window.removeEventListener('hashchange', load)
    }
  }, [])

  return (
    <section className="mx-auto w-full max-w-[30rem] px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Shared timer</h1>
      {config === undefined ? (
        <p className="text-muted-foreground" role="status">
          Opening timer…
        </p>
      ) : config === null ? (
        <>
          <p role="alert">This timer link is invalid or unsupported.</p>
          <Button asChild className="mt-4 h-11">
            <Link href="/configure">Back to New</Link>
          </Button>
        </>
      ) : (
        <SharedTimer config={config} />
      )}
    </section>
  )
}
