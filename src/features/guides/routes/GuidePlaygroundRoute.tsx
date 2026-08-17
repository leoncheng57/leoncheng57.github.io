import type { ReactElement } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import GuideNotFound from '../components/GuideNotFound'
import { SIMULATOR_GUIDE_SLUG } from '../components/ManagerWorkerSimulator'
import { getGuideBySlug } from '../content'

/**
 * The simulator now lives inline as a chapter of the guide one-pager, so the
 * legacy playground URL redirects to its section anchor. Other slugs keep the
 * not-found state.
 */
export default function GuidePlaygroundRoute(): ReactElement {
  const { slug = '' } = useParams()
  const guide = getGuideBySlug(slug)

  if (!guide || guide.slug !== SIMULATOR_GUIDE_SLUG) {
    return (
      <GuideNotFound
        heading="Playground not found"
        message="This guide does not have a playground."
      />
    )
  }

  return <Navigate to={{ pathname: `/guides/${guide.slug}`, hash: '#simulator' }} replace />
}
