import type { ReactElement } from 'react'
import styles from './GuideVideo.module.css'

/** Recordings committed under public/guides/<guide-slug>/. */
export type GuideRecording = 'desktop-tour' | 'mobile-tour'

const ASSET_BASE = '/guides/custom-coding-agent-ide-with-openhands'

/**
 * Portrait recordings are phone captures and must not stretch to the article
 * width; landscape ones should fill it.
 */
const ORIENTATION: Record<GuideRecording, 'portrait' | 'landscape'> = {
  'desktop-tour': 'landscape',
  'mobile-tour': 'portrait',
}

interface GuideVideoProps {
  recording: GuideRecording
  /** Accessible name; supplied by the markdown embed's alt text. */
  label: string
  /** Visible caption under the frame. */
  caption?: string
}

/**
 * A silent screen recording of the real application, click-to-play with a
 * poster frame so nothing downloads until a reader asks for it.
 *
 * Both recordings are redacted at encode time — see
 * scripts/optimize-guide-recording.mjs. Do not replace these assets with raw
 * captures: the sources show internal repository names and the tailnet
 * hostname the phone connects through.
 */
export default function GuideVideo({
  recording,
  label,
  caption,
}: GuideVideoProps): ReactElement {
  const prefix = `${ASSET_BASE}/${recording}`
  const orientationClass =
    ORIENTATION[recording] === 'portrait' ? styles.portrait : styles.landscape

  return (
    <figure className={`${styles.figure} ${orientationClass}`}>
      <video
        className={styles.video}
        aria-label={label}
        controls
        playsInline
        muted
        preload="metadata"
        poster={`${prefix}-poster.png`}
      >
        <source src={`${prefix}.webm`} type="video/webm" />
        <source src={`${prefix}.mp4`} type="video/mp4" />
        Your browser does not support embedded videos.
      </video>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  )
}
