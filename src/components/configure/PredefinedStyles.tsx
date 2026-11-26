'use client'

import { useEffect, useState } from 'react'
import { Share } from 'lucide-react'
import { toast } from 'sonner'

import { PredefinedStylesProps } from '@/types/configure'
import { createShareUrl } from '@/lib/configure/share-link'
import { getConfigSummary } from '@/lib/configure/utils'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import PlayIcon from '@/icons/PlayIcon'

export const PredefinedStyles = ({
  styles,
  onSelectStyle,
  onStartTimer,
}: PredefinedStylesProps) => {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {styles.map((style) => (
        <StyleCard
          key={style.id}
          style={style}
          onSelect={() => onSelectStyle(style)}
          onStart={() => onStartTimer(style.config)}
        />
      ))}
    </div>
  )
}

interface StyleCardProps {
  style: PredefinedStylesProps['styles'][0]
  onSelect: () => void
  onStart: () => void
}

const StyleCard = ({ style, onSelect, onStart }: StyleCardProps) => {
  const config = style.config
  const [link, setLink] = useState<{ config: typeof config; url?: string; error?: string }>()
  const [manualUrl, setManualUrl] = useState('')
  useEffect(() => {
    let active = true
    createShareUrl(config, window.location.origin).then(
      (url) => {
        if (active) setLink({ config, url })
      },
      (error) => {
        if (active)
          setLink({
            config,
            error:
              error instanceof Error && error.message === 'Timer too large to share by link'
                ? error.message
                : 'Could not share this timer.',
          })
      }
    )
    return () => {
      active = false
    }
  }, [config])

  async function share() {
    if (!link || link.config !== config) return
    if (!link.url) {
      toast.error(link.error)
      return
    }
    try {
      if (navigator.share) {
        await navigator.share({ url: link.url })
      } else {
        await navigator.clipboard.writeText(link.url)
        toast.success('Link copied')
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      setManualUrl(link.url)
    }
  }

  const summary = getConfigSummary(style.config)
  const description = style.description?.trim()

  return (
    <Card
      role="group"
      aria-label={style.name}
      className="relative transition-colors hover:opacity-80"
    >
      <CardHeader>
        <CardTitle>
          <h3 aria-label={style.name} className="text-card-foreground font-semibold wrap-anywhere">
            <button
              type="button"
              aria-label={`Configure ${style.name}`}
              className="cursor-pointer text-left after:absolute after:inset-0 after:rounded-md"
              onClick={onSelect}
            >
              {style.name}
            </button>
          </h3>
          {style.isBuiltIn && (
            <span className="text-card-foreground rounded py-1 text-xs font-thin">(Built-in)</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>
          {description && description !== summary && <p className="mb-2 text-sm">{description}</p>}
          <p className="text-sm">{summary}</p>
        </CardDescription>

        <CardAction className="flex items-center gap-2 max-sm:mt-2 max-sm:w-full">
          <Button
            type="button"
            size="sm"
            className="relative max-sm:min-h-11 max-sm:flex-1"
            onClick={onStart}
          >
            <PlayIcon className="h-4 w-4" />
            Start
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="relative max-sm:min-h-11"
            onClick={share}
            disabled={link?.config !== config}
          >
            <Share aria-hidden="true" />
            Share
          </Button>
        </CardAction>
        {manualUrl && manualUrl === link?.url && (
          <label className="relative mt-2 block text-sm">
            Copy link
            <input
              className="block h-11 w-full rounded-md border px-2"
              readOnly
              value={manualUrl}
              onFocus={(event) => event.target.select()}
            />
          </label>
        )}
      </CardContent>
    </Card>
  )
}
