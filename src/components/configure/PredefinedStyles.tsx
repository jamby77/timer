'use client'

import { PredefinedStylesProps } from '@/types/configure'
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
  const summary = getConfigSummary(style.config)
  const description = style.description?.trim()

  return (
    <Card role="group" aria-label={style.name} className="relative transition-colors hover:opacity-80">
      <CardHeader>
        <CardTitle>
          <h3 aria-label={style.name} className="text-card-foreground wrap-anywhere font-semibold">
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

        <CardAction className="flex items-center justify-between max-sm:mt-2 max-sm:w-full">
          <Button type="button" size="sm" className="relative max-sm:min-h-11 max-sm:w-full" onClick={onStart}>
            <PlayIcon className="h-4 w-4" />
            Start
          </Button>
        </CardAction>
      </CardContent>
    </Card>
  )
}
