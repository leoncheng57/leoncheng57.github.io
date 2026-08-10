import { useEffect, useRef, useState } from 'react'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'complete'

interface Countdown {
  remainingMs: number
  status: TimerStatus
  start: () => void
  pause: () => void
  reset: () => void
}

export default function useCountdown(
  seconds: number,
  onComplete: () => void
): Countdown {
  const durationMs = seconds * 1000
  const [remainingMs, setRemainingMs] = useState(durationMs)
  const [status, setStatus] = useState<TimerStatus>('idle')
  const endAtRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const clearTick = (): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const readClock = (): number => Math.max(0, endAtRef.current - Date.now())

  const finishIfNeeded = (nextRemaining: number): boolean => {
    if (nextRemaining > 0) return false
    clearTick()
    setRemainingMs(0)
    setStatus('complete')
    onCompleteRef.current()
    return true
  }

  const tick = (): void => {
    const nextRemaining = readClock()
    if (!finishIfNeeded(nextRemaining)) setRemainingMs(nextRemaining)
  }

  const start = (): void => {
    clearTick()
    const nextRemaining = remainingMs > 0 ? remainingMs : durationMs
    setRemainingMs(nextRemaining)
    endAtRef.current = Date.now() + nextRemaining
    setStatus('running')
    intervalRef.current = setInterval(tick, 200)
  }

  const pause = (): void => {
    const nextRemaining = readClock()
    clearTick()
    if (!finishIfNeeded(nextRemaining)) {
      setRemainingMs(nextRemaining)
      setStatus('paused')
    }
  }

  const reset = (): void => {
    clearTick()
    endAtRef.current = 0
    setRemainingMs(durationMs)
    setStatus('idle')
  }

  useEffect(() => {
    clearTick()
    endAtRef.current = 0
    setRemainingMs(durationMs)
    setStatus('idle')
    return clearTick
  }, [durationMs])

  return { remainingMs, status, start, pause, reset }
}
