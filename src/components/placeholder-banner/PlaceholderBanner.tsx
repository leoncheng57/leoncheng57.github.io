import type { ReactElement } from 'react'
import styles from './placeholder-banner.module.css'

type PlaceholderBannerProps = {
  headingId: string
  description: string
  buildLabel: string
  headingLevel?: 2 | 3
}

export default function PlaceholderBanner({
  headingId,
  description,
  buildLabel,
  headingLevel = 2,
}: PlaceholderBannerProps): ReactElement {
  const Heading = headingLevel === 3 ? 'h3' : 'h2'

  return (
    <section className={styles.banner} aria-labelledby={headingId}>
      <div className={styles.status}>
        <span className={styles.statusDot} aria-hidden="true" />
        In progress
      </div>
      <Heading id={headingId} className={styles.heading}>
        Still taking shape
      </Heading>
      <p>{description}</p>
      <div className={styles.footer}>
        <span className={styles.comingSoon}>Coming soon</span>
        <div className={styles.buildTrack} aria-hidden="true">
          <span />
          <strong>{buildLabel}</strong>
        </div>
      </div>
    </section>
  )
}
