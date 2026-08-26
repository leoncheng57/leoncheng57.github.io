import { describe, expect, it } from 'vitest'
import { publicAssetUrl } from './publicAssetUrl'

describe('publicAssetUrl', () => {
  it('rebases root-relative public URLs under the Vite base', () => {
    expect(publicAssetUrl('/images/example.png', '/previews/pr-42/')).toBe(
      '/previews/pr-42/images/example.png'
    )
    expect(publicAssetUrl('/images/example.png', '/')).toBe('/images/example.png')
  })

  it('does not rebase a URL already under the base', () => {
    const url = '/previews/pr-42/images/example.png'
    expect(publicAssetUrl(url, '/previews/pr-42/')).toBe(url)
    expect(publicAssetUrl('/previews/pr-42', '/previews/pr-42/')).toBe('/previews/pr-42')
  })

  it.each([
    'images/example.png',
    './images/example.png',
    '../images/example.png',
    'https://example.com/image.png',
    'http://example.com/image.png',
    '//example.com/image.png',
    '#section',
    '?size=large',
    'data:image/svg+xml;base64,PHN2Zz4=',
    'blob:https://example.com/id',
    'mailto:hello@example.com',
    'component:diagram',
  ])('leaves %s unchanged', (url) => {
    expect(publicAssetUrl(url, '/previews/pr-42/')).toBe(url)
  })
})
