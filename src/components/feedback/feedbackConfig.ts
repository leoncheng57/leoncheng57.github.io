// TODO(#152): Replace with the published Google Form URL.
export const FEEDBACK_FORM_URL = ''

// TODO(#152): Replace with the Google Form entry ID for the page URL question.
export const FEEDBACK_PAGE_URL_ENTRY_ID = 'entry.0000000'

export function buildFeedbackUrl(
  pagePath: string,
  formUrl = FEEDBACK_FORM_URL,
  pageUrlEntryId = FEEDBACK_PAGE_URL_ENTRY_ID
): string | null {
  if (!formUrl) {
    return null
  }

  const url = new URL(formUrl)
  url.searchParams.set('usp', 'pp_url')
  url.searchParams.set(pageUrlEntryId, pagePath)
  return url.toString()
}
