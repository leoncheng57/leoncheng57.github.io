import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useCountdown from './useCountdown'

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts, pauses, and resets from the wall clock', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useCountdown(10, onComplete))

    act(() => result.current.start())
    expect(result.current.status).toBe('running')

    act(() => {
      vi.advanceTimersByTime(2500)
      result.current.pause()
    })
    expect(result.current.status).toBe('paused')
    expect(result.current.remainingMs).toBe(7500)

    act(() => result.current.reset())
    expect(result.current.status).toBe('idle')
    expect(result.current.remainingMs).toBe(10000)
  })

  it('corrects for elapsed time when timer ticks were throttled', () => {
    const { result } = renderHook(() => useCountdown(10, vi.fn()))

    act(() => result.current.start())
    act(() => {
      vi.setSystemTime(new Date('2026-01-01T00:00:06Z'))
      result.current.pause()
    })

    expect(result.current.remainingMs).toBe(4000)
  })

  it('completes once when the end timestamp is reached', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useCountdown(1, onComplete))

    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(1200))

    expect(result.current.status).toBe('complete')
    expect(result.current.remainingMs).toBe(0)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
