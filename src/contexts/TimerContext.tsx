'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

interface TimerContextType {
  isAnyTimerActive: boolean
  setTimerActive: (active: boolean) => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export const useTimerContext = () => {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error('useTimerContext must be used within a TimerProvider')
  }
  return context
}

interface TimerProviderProps {
  children: ReactNode
}

export const TimerProvider = ({ children }: TimerProviderProps) => {
  const [isAnyTimerActive, setIsAnyTimerActive] = useState(false)

  const setTimerActive = (active: boolean) => {
    setIsAnyTimerActive(active)
  }

  return (
    <TimerContext.Provider value={{ isAnyTimerActive, setTimerActive }}>
      {children}
    </TimerContext.Provider>
  )
}
