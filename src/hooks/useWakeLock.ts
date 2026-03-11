import { useCallback, useEffect, useRef } from 'react'

// Smallest valid MP4 with a silent 1-second video track.
// Browsers treat a playing <video> as active media and keep the screen on.
const SILENT_MP4 =
  'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAA' +
  'OhtZGF0AAACrwYF//+r3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2NCByMzA5' +
  'NSBiYWVlNDAwIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDM' +
  'tMjAyNCAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbn' +
  'M6IGNhYmFjPTEgcmVmPTEgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MToweDEgbWU9Z' +
  'GlhIHN1Ym1lPTEgcHN5PTEgcHN5X3JkPTEuMDA6MC4wMCBtaXhlZF9yZWY9MCBtZV9y' +
  'YW5nZT0xNiBjaHJvbWFfbWU9MSB0cmVsbGlzPTAgOHg4ZGN0PTAgY3FtPTAgZGVhZHp' +
  'vbmU9MjEsMTEgZmFzdF9wc2tpcD0xIGNocm9tYV9xcF9vZmZzZXQ9MCB0aHJlYWRzPT' +
  'EgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hd' +
  'GU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJh' +
  'PTAgYmZyYW1lcz0wIHdlaWdodHA9MCBrZXlpbnQ9MjUwIGtleWludF9taW49MjUgc2N' +
  'lbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjPWNyZiBtYnRyZWU9MCBjcmY9MjMuMC' +
  'BxY29tcD0wLjYwIHFwbWluPTAgcXBtYXg9NjkgcXBzdGVwPTQgaXBfcmF0aW89MS40M' +
  'CBhcT0xOjEuMDAAgAAAAA9liIQAF//+9uy8yegfOhAQAAAABkGaIkAn/wAAAAMBAAMAAA' +
  'MAGhAAAAMAAAAAAzqAAAADAAADAAADAAADABhMYy0AAAJ2bW9vdgAAAGxtdmhkAAAAAAAA' +
  'AAAAAAAAAAAPoAAAAKcAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAA' +
  'AAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAd10cmFrAAAAXHRr' +
  'aGQAAAADAAAAAAAAAAAAAAABAAAAAAAAACcAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAA' +
  'AAAAAAQAAAAAABABAAAAA0AAAAAAHAG1kaWEAAAAgbWRoZAAAAAAAAAAAAAAAAAAAgAAAAK' +
  'cAVcQAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAA' +
  'AXhtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAA' +
  'AMdXJsIAAAAAEAAAE4c3RibAAAALRzdHNkAAAAAAAAAAEAAACkYXZjMQAAAAAAAAABAAAA' +
  'AAAAAAAAAAAAAAABABAAAAH0FWQ0MBZAAf/+EAGGdkAB+s2UCQM7gQAAA+kAAOvKA8UK' +
  'ZYAAABCGFzcGVjdFJhdGlvSWR4AQAAAAQAAAAAEHBhc3AAAAABAAAAAQAAABhzdHRzAAAA' +
  'AAAAAAEAAAABAAAPoAAAABRzdHNzAAAAAAAAAAEAAAABAAAAHHN0c2MAAAAAAAAAAQAAAA' +
  'EAAAABAAAAAQAAABR0c3R6AAAAAAAAAdUAAAABAAAAFHN0Y28AAAAAAAAAAQAAA' +
  'O0AAAA='

const supportsWakeLock = () => typeof navigator !== 'undefined' && 'wakeLock' in navigator

/**
 * Hook to manage screen wake lock to prevent the screen from turning off.
 * Uses the Wake Lock API when available, falls back to a looping silent
 * video element that tricks the browser into keeping the screen on.
 */
export const useWakeLock = (isActive: boolean) => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const usingFallbackRef = useRef(false)

  const startVideoFallback = useCallback(() => {
    if (videoRef.current) {
      return
    }
    const video = document.createElement('video')
    video.setAttribute('playsinline', '')
    video.setAttribute('muted', '')
    video.muted = true
    video.setAttribute('loop', '')
    video.style.position = 'fixed'
    video.style.top = '-1px'
    video.style.left = '-1px'
    video.style.width = '1px'
    video.style.height = '1px'
    video.style.opacity = '0.01'
    video.src = SILENT_MP4
    document.body.appendChild(video)
    video.play().catch(() => {})
    videoRef.current = video
    usingFallbackRef.current = true
  }, [])

  const stopVideoFallback = useCallback(() => {
    if (!videoRef.current) {
      return
    }
    videoRef.current.pause()
    videoRef.current.removeAttribute('src')
    videoRef.current.load()
    videoRef.current.remove()
    videoRef.current = null
    usingFallbackRef.current = false
  }, [])

  const requestWakeLock = useCallback(async () => {
    if (!supportsWakeLock()) {
      startVideoFallback()
      return
    }
    try {
      if (!wakeLockRef.current) {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      }
    } catch (err) {
      console.error('Wake lock failed, using video fallback:', err)
      startVideoFallback()
    }
  }, [startVideoFallback])

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current && !wakeLockRef.current.released) {
      await wakeLockRef.current.release()
      wakeLockRef.current = null
    }
    stopVideoFallback()
  }, [stopVideoFallback])

  useEffect(() => {
    if (isActive) {
      void requestWakeLock()
    } else {
      void releaseWakeLock()
    }

    return () => {
      void releaseWakeLock()
    }
  }, [isActive, requestWakeLock, releaseWakeLock])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        void requestWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isActive, requestWakeLock])
}
