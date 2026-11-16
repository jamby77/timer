import { useEffect, useRef, useState } from 'react'

export function useAutoStart(enabled: boolean, start: () => void | Promise<void>) {
  const requested = useRef(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!enabled || requested.current) return

    const timeout = setTimeout(async () => {
      requested.current = true
      try {
        await start()
      } catch (error) {
        console.error('Failed to start timer automatically:', error)
      } finally {
        setStarted(true)
      }
    }, 0)

    return () => clearTimeout(timeout)
  }, [enabled, start])

  return enabled && !started
}
