import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TuziPwa from './TuziPwa'

describe('TuziPwa', () => {
  it('adds install metadata and restores the document on unmount', () => {
    const originalTitle = document.title
    const { unmount } = render(<TuziPwa />)

    expect(document.title).toBe('Tuzi · Rank your favorite books')
    expect(document.head.querySelector('link[data-tuzi="manifest"]')).toHaveAttribute(
      'href',
      '/tuzi/manifest.webmanifest',
    )
    expect(document.head.querySelector('meta[data-tuzi="theme-color"]')).toHaveAttribute(
      'content',
      '#1b3328',
    )
    expect(document.head.querySelector('link[data-tuzi="apple-icon"]')).toHaveAttribute(
      'href',
      '/tuzi/icon-192.png',
    )

    unmount()
    expect(document.title).toBe(originalTitle)
    expect(document.head.querySelector('link[data-tuzi="manifest"]')).toBeNull()
  })
})
