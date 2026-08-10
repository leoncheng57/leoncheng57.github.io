import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import useWakeLock from './useWakeLock'

describe('useWakeLock', () => {
  it('requests and releases a screen wake lock while active', async () => {
    const release = vi.fn().mockResolvedValue(undefined)
    const request = vi.fn().mockResolvedValue({ release })
    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: { request },
    })

    const { result, unmount } = renderHook(() => useWakeLock(true))
    await act(async () => Promise.resolve())

    expect(request).toHaveBeenCalledWith('screen')
    expect(result.current).toBe(true)

    unmount()
    expect(release).toHaveBeenCalledTimes(1)
  })
})
