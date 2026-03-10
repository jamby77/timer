'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { Theme, THEME_LABELS } from '@/lib/enums'

import { Button } from '@/components/ui/button'

const themes = [Theme.LIGHT, Theme.DARK, Theme.SYSTEM]

export const ThemeToggle = () => {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const rotateTheme = () => {
    const currentIndex = themes.indexOf(theme as Theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getThemeIcon = (currentTheme: Theme) => {
    switch (currentTheme) {
      case Theme.LIGHT:
        return <Sun />
      case Theme.DARK:
        return <Moon />
      case Theme.SYSTEM:
        return <Monitor />
      default:
        return null
    }
  }

  const currentTheme = mounted ? (theme as Theme) : Theme.SYSTEM

  return (
    <Button variant="outline" size="icon" onClick={rotateTheme}>
      {mounted ? getThemeIcon(currentTheme) : null}
      <span className="sr-only">
        Toggle theme (current: {THEME_LABELS[currentTheme]})
      </span>
    </Button>
  )
}
