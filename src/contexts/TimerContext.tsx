'use client'

import { createContext, ReactNode, useCallback, useContext, useId, useRef, useState } from 'react'

interface TimerContextType {
  isAnyTimerActive: boolean
  /** Register a timer as active/inactive by unique ID to support multiple concurrent timers */
  registerTimer: (id: string, active: boolean) => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

/**
 * Returns a stable `setTimerActive` function scoped to a unique timer ID.
 * Multiple timers can be active simultaneously without interfering with each other.
 */
export const useTimerContext = () => {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error('useTimerContext must be used within a TimerProvider')
  }
  const timerId = useId()

  const setTimerActive = useCallback(
    (active: boolean) => {
      context.registerTimer(timerId, active)
    },
    [context, timerId]
  )

  return {
    isAnyTimerActive: context.isAnyTimerActive,
    setTimerActive,
  }
}

interface TimerProviderProps {
  children: ReactNode
}

export const TimerProvider = ({ children }: TimerProviderProps) => {
  const [isAnyTimerActive, setIsAnyTimerActive] = useState(false)
  const activeTimersRef = useRef(new Set<string>())

  const registerTimer = useCallback((id: string, active: boolean) => {
    const activeTimers = activeTimersRef.current
    if (active) {
      activeTimers.add(id)
    } else {
      activeTimers.delete(id)
    }
    setIsAnyTimerActive(activeTimers.size > 0)
  }, [])

  return (
    <TimerContext.Provider value={{ isAnyTimerActive, registerTimer }}>
      {children}
    </TimerContext.Provider>
  )
}
