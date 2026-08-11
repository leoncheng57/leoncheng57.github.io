// TODO(#152): Swap in the rebuilt Google Form URL once its fields (category,
// message, current page, optional contact email) are published.
export const FEEDBACK_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSdximC28ET_wPA3gpIyu6iYeS2NDPftJj8RuW_jfw2pUVOy4Q/viewform'

// TODO(#152): Replace with the entry ID of the "Current page" question from
// the rebuilt form. Google Forms ignores unknown entry params, so the prefill
// is a harmless no-op until then.
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
