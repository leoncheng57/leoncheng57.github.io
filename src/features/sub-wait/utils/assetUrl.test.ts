import { describe, expect, it } from 'vitest'
import { assetUrl } from './assetUrl'

describe('assetUrl', () => {
  it('builds production-root asset URLs', () => {
    expect(assetUrl('sub-wait/icon-v2.svg', '/')).toBe('/sub-wait/icon-v2.svg')
  })

  it('keeps assets inside a PR preview base path', () => {
    expect(
      assetUrl('/sub-wait/architecture-diagram-v2.svg', '/previews/pr-140/'),
    ).toBe('/previews/pr-140/sub-wait/architecture-diagram-v2.svg')
  })
})
