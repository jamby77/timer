// Polyfill for requestAnimationFrame and cancelAnimationFrame
const root = typeof window !== 'undefined' ? window : (globalThis as any)

if (typeof root.requestAnimationFrame === 'undefined') {
  let lastTime = 0

  root.requestAnimationFrame = function (callback: FrameRequestCallback): number {
    const currTime = Date.now()
    const timeToCall = Math.max(0, 16 - (currTime - lastTime))
    const id = setTimeout(() => {
      callback(currTime + timeToCall)
    }, timeToCall)

    lastTime = currTime + timeToCall
    return id as unknown as number
  }

  root.cancelAnimationFrame = function (id: number): void {
    clearTimeout(id)
  }
}

export const requestAnimationFrame = root.requestAnimationFrame.bind(
  root
) as typeof window.requestAnimationFrame
export const cancelAnimationFrame = root.cancelAnimationFrame.bind(
  root
) as typeof window.cancelAnimationFrame
