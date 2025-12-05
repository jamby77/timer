'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Theme, THEME_LABELS } from '@/lib/enums'

import { Button } from '@/components/ui/button'

const themes = [Theme.LIGHT, Theme.DARK, Theme.SYSTEM]

export const ThemeToggle = () => {
  const { setTheme, theme } = useTheme()

  const rotateTheme = () => {
    const currentIndex = themes.indexOf(theme as Theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getThemeIcon = () => {
    switch (theme) {
      case Theme.LIGHT:
        return <Sun className="h-[1.2rem] w-[1.2rem]" />
      case Theme.DARK:
        return <Moon className="h-[1.2rem] w-[1.2rem]" />
      case Theme.SYSTEM:
        return <Monitor className="h-[1.2rem] w-[1.2rem]" />
      default:
        return null
    }
  }

  return (
    <Button variant="outline" size="icon" onClick={rotateTheme}>
      {getThemeIcon()}
      <span className="sr-only">
        Toggle theme (current: {theme ? THEME_LABELS[theme as Theme] : 'System'})
      </span>
    </Button>
  )
}
