import type { ReactElement } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import GuideNotFound from '../components/GuideNotFound'
import { getGuideBySlug, getGuideChapter } from '../content'

/**
 * The guide now renders as a single page, so legacy per-chapter URLs redirect
 * to the one-pager with the chapter slug as the anchor. Unknown guides and
 * chapters keep their not-found states so bad links stay visible.
 */
export default function GuideChapterRoute(): ReactElement {
  const { slug = '', chapterSlug = '' } = useParams()
  const guide = getGuideBySlug(slug)

  if (!guide) {
    return <GuideNotFound heading="Guide not found" message="The requested guide does not exist." />
  }

  const found = getGuideChapter(guide, chapterSlug)

  if (!found) {
    return (
      <GuideNotFound
        heading="Chapter not found"
        message={`"${guide.title}" does not have that chapter.`}
      />
    )
  }

  return <Navigate to={{ pathname: `/guides/${guide.slug}`, hash: `#${chapterSlug}` }} replace />
}
