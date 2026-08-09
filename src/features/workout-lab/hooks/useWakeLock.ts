import { useEffect, useState } from 'react'

interface WakeLockSentinelLike {
  release: () => Promise<void>
}

interface WakeLockNavigator extends Navigator {
  wakeLock?: {
    request: (_type: 'screen') => Promise<WakeLockSentinelLike>
  }
}

export default function useWakeLock(active: boolean): boolean {
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    if (!active) {
      setIsLocked(false)
      return undefined
    }

    const wakeLock = (navigator as WakeLockNavigator).wakeLock
    if (!wakeLock) return undefined

    let sentinel: WakeLockSentinelLike | null = null
    let cancelled = false

    const acquire = async (): Promise<void> => {
      if (document.visibilityState !== 'visible' || sentinel) return
      try {
        const nextSentinel = await wakeLock.request('screen')
        if (cancelled) {
          await nextSentinel.release()
          return
        }
        sentinel = nextSentinel
        setIsLocked(true)
      } catch {
        setIsLocked(false)
      }
    }

    const handleVisibility = (): void => {
      if (document.visibilityState === 'visible') void acquire()
    }

    void acquire()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleVisibility)
      if (sentinel) void sentinel.release()
      setIsLocked(false)
    }
  }, [active])

  return isLocked
}
