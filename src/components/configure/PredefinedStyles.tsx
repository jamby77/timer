'use client'

import { MouseEvent } from 'react'

import { PredefinedStylesProps } from '@/types/configure'
import { getConfigSummary } from '@/lib/configure/utils'

import { CardContainer } from '@/components/ui'
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
    <CardContainer>
      <div>
        <h2 className="mb-2 text-xl font-semibold sm:m-6">Presets</h2>

        {/* Styles list */}
        <div className="grid grid-cols-1 gap-2 sm:gap-4">
          {styles.map((style) => (
            <StyleCard
              key={style.id}
              style={style}
              onSelect={() => onSelectStyle(style)}
              onStart={() => onStartTimer(style.config)}
            />
          ))}
        </div>
      </div>
    </CardContainer>
  )
}

interface StyleCardProps {
  style: PredefinedStylesProps['styles'][0]
  onSelect: () => void
  onStart: () => void
}

const StyleCard = ({ style, onSelect, onStart }: StyleCardProps) => {
  const handleCardClick = () => {
    onSelect()
  }

  const handleStartClick = (e: MouseEvent) => {
    e.stopPropagation()
    onStart()
  }

  return (
    <Card onClick={handleCardClick} className="cursor-pointer transition-colors hover:opacity-80">
      <CardHeader>
        <CardTitle>
          <h3 className="text-card-foreground font-semibold">{style.name}</h3>
          {style.isBuiltIn && (
            <span className="text-card-foreground rounded py-1 text-xs font-thin">(Built-in)</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>
          <p className="mb-2 text-sm">{style.description}</p>
          <p className="text-sm">{getConfigSummary(style.config)}</p>
        </CardDescription>

        <CardAction className="flex items-center justify-between">
          <Button size="sm" onClick={handleStartClick}>
            <PlayIcon className="h-4 w-4" />
            Start
          </Button>
        </CardAction>
      </CardContent>
    </Card>
  )
}
