// "SubWait Feedback form" (see #152). Fields: Category (dropdown,
// entry.1233029295), Current page (short answer, entry.201088765),
// "Describe your comment" (paragraph, entry.1675638029), and Rating
// (1-5 linear scale, entry.1796631476).
export const FEEDBACK_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSe3vmUWVzBh74mpxOz9TXMkqoyAiTeP2B7h9FIzYx19oAtTUA/viewform'

// Entry ID of the "Current page" question, prefilled with the visitor's path.
export const FEEDBACK_PAGE_URL_ENTRY_ID = 'entry.201088765'

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

export function buildEmbeddedFeedbackUrl(
  pagePath: string,
  formUrl = FEEDBACK_FORM_URL,
  pageUrlEntryId = FEEDBACK_PAGE_URL_ENTRY_ID
): string | null {
  const url = buildFeedbackUrl(pagePath, formUrl, pageUrlEntryId)
  if (!url) {
    return null
  }

  const embedded = new URL(url)
  embedded.searchParams.set('embedded', 'true')
  return embedded.toString()
}
