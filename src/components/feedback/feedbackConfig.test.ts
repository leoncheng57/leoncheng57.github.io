import { describe, expect, it } from 'vitest'
import { buildFeedbackUrl } from './feedbackConfig'

describe('buildFeedbackUrl', () => {
  it('returns null when the form URL is not configured', () => {
    expect(buildFeedbackUrl('/blog')).toBeNull()
  })

  it('prefills the page path in a configured Google Form URL', () => {
    const result = buildFeedbackUrl(
      '/sub-wait/map',
      'https://docs.google.com/forms/d/e/example/viewform',
      'entry.123456'
    )
    const url = new URL(result ?? '')

    expect(url.searchParams.get('usp')).toBe('pp_url')
    expect(url.searchParams.get('entry.123456')).toBe('/sub-wait/map')
  })
})
