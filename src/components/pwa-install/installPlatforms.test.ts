import { describe, expect, it } from 'vitest'
import {
  detectInstallPlatforms,
  isInstallPlatformDevice,
} from './installPlatforms'

describe('install platform detection', () => {
  it.each([
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', '', 0],
    ['Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)', '', 0],
    ['Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X)', '', 0],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X)', 'MacIntel', 5],
  ])('detects Apple mobile devices including iPad desktop mode', (ua, platform, touch) => {
    expect(detectInstallPlatforms(ua, platform, touch)).toEqual(['iphone'])
    expect(isInstallPlatformDevice(ua, platform, touch)).toBe(true)
  })

  it('detects Android and falls back to both guides on desktop', () => {
    expect(detectInstallPlatforms('Mozilla/5.0 (Linux; Android 14)')).toEqual([
      'android',
    ])
    expect(detectInstallPlatforms('Mozilla/5.0 (X11; Linux x86_64)')).toEqual([
      'iphone',
      'android',
    ])
    expect(isInstallPlatformDevice('Mozilla/5.0 (X11; Linux x86_64)')).toBe(
      false,
    )
  })
})
