import { useEffect, useState } from 'react'

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    const handler = () => setMatches(mediaQueryList.matches)

    mediaQueryList.addEventListener('change', handler)

    return () => {
      mediaQueryList.removeEventListener('change', handler)
    }
  }, [query])

  return matches
}
