import { describe, expect, it } from 'vitest'
import {
  buildEmbeddedFeedbackUrl,
  buildFeedbackUrl,
  FEEDBACK_FORM_URL,
  FEEDBACK_PAGE_URL_ENTRY_ID,
} from './feedbackConfig'

describe('buildFeedbackUrl', () => {
  it('returns null when the form URL is not configured', () => {
    expect(buildFeedbackUrl('/sub-wait/', '')).toBeNull()
  })

  it('uses the configured Sub-Wait form and entry ID by default', () => {
    const result = buildFeedbackUrl('/sub-wait/map')
    expect(result).not.toBeNull()
    expect(result).toContain(FEEDBACK_FORM_URL)

    const url = new URL(result ?? '')
    expect(url.searchParams.get(FEEDBACK_PAGE_URL_ENTRY_ID)).toBe(
      '/sub-wait/map'
    )
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

describe('buildEmbeddedFeedbackUrl', () => {
  it('returns null when the form URL is not configured', () => {
    expect(buildEmbeddedFeedbackUrl('/sub-wait/', '')).toBeNull()
  })

  it('adds embedded=true on top of the prefilled form URL', () => {
    const result = buildEmbeddedFeedbackUrl(
      '/sub-wait/map',
      'https://docs.google.com/forms/d/e/example/viewform',
      'entry.123456'
    )
    const url = new URL(result ?? '')

    expect(url.searchParams.get('embedded')).toBe('true')
    expect(url.searchParams.get('usp')).toBe('pp_url')
    expect(url.searchParams.get('entry.123456')).toBe('/sub-wait/map')
  })
})
