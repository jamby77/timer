import { useEffect } from 'react'

export const useWakeLock = (isActive: boolean) => {
  useEffect(() => {
    if (!isActive) return

    let disposed = false
    let pending = false
    let lock: WakeLockSentinel | undefined
    let video: HTMLVideoElement | undefined
    const visible = () => !disposed && document.visibilityState === 'visible'

    function stopVideo() {
      if (!video) return
      video.pause()
      video.removeAttribute('src')
      video.load()
      video.remove()
      video = undefined
    }

    function playFallback() {
      if (!visible()) return
      if (!video) {
        video = document.createElement('video')
        video.playsInline = true
        video.muted = true
        video.loop = true
        video.setAttribute('aria-hidden', 'true')
        video.style.cssText =
          'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0.01;pointer-events:none'
        video.src = '/keep-awake.mp4'
        document.body.appendChild(video)
      }
      const player = video
      void player.play().catch((error) => {
        if (player === video && visible())
          console.error('Wake lock fallback playback failed:', error)
      })
    }

    async function acquire() {
      if (!visible() || pending || (lock && !lock.released)) return
      if (!navigator.wakeLock) {
        playFallback()
        return
      }
      pending = true
      try {
        const next = await navigator.wakeLock.request('screen')
        if (!visible()) {
          await next.release()
          return
        }
        lock = next
        stopVideo()
        next.addEventListener(
          'release',
          () => {
            if (lock === next) {
              lock = undefined
              playFallback()
            }
          },
          { once: true }
        )
      } catch (error) {
        if (visible()) {
          if (!(error instanceof DOMException && error.name === 'NotAllowedError')) {
            console.error('Wake lock failed, using video fallback:', error)
          }
          playFallback()
        }
      } finally {
        pending = false
      }
    }

    function visibilityChanged() {
      if (visible()) void acquire()
      else stopVideo()
    }

    void acquire()
    document.addEventListener('visibilitychange', visibilityChanged)
    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', visibilityChanged)
      if (lock && !lock.released) void lock.release()
      stopVideo()
    }
  }, [isActive])
}
