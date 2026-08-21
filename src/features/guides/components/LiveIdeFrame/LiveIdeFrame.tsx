import { useRef, useState } from 'react'
import type { ReactElement } from 'react'
import styles from './LiveIdeFrame.module.css'

export const LIVE_IDE_URL =
  'https://leoncheng.dev/Customizable-DCA-OpenHands/openhands/native/'
export const LIVE_IDE_TITLE = 'Customizable DCA — live interactive demo'

interface LiveIdeFrameProps {
  /** Accessible name supplied by the markdown embed's alt text. */
  label?: string
  /** Neutralises the guide-only full-width breakout for other hosts. */
  inline?: boolean
}

export default function LiveIdeFrame({
  label = 'Independently explorable live app UI with fake data',
  inline = false,
}: LiveIdeFrameProps): ReactElement {
  const [isLoaded, setIsLoaded] = useState(false)
  const regionRef = useRef<HTMLElement>(null)
  const posterUrl = `${import.meta.env.BASE_URL}guides/custom-coding-agent-ide-with-openhands/simulator-hub.png`

  const loadFrame = (): void => {
    const theme = regionRef.current?.closest<HTMLElement>('[data-theme]')?.dataset.theme
    if (theme === 'light' || theme === 'dark') {
      try {
        window.localStorage.setItem('theme', theme)
      } catch {
        // Storage may be unavailable; the simulator keeps its own default.
      }
    }
    setIsLoaded(true)
  }

  return (
    <section
      ref={regionRef}
      className={inline ? `${styles.frame} ${styles.inline}` : styles.frame}
      aria-label={label}
    >
      <header className={styles.header}>
        <span className={styles.badge}>Live app</span>
        <p>
          Explore the real app UI on a fake, in-browser backend. Nothing here connects to an
          agent, repository, or account.
        </p>
        <a className={styles.newTabLink} href={LIVE_IDE_URL} target="_blank" rel="noreferrer">
          Open in a new tab ↗
        </a>
      </header>

      {isLoaded ? (
        <iframe
          className={styles.iframe}
          src={LIVE_IDE_URL}
          title={LIVE_IDE_TITLE}
          loading="lazy"
        />
      ) : (
        <div className={styles.poster}>
          <img src={posterUrl} alt="" aria-hidden="true" />
          <div className={styles.posterShade} />
          <button className={styles.loadButton} type="button" onClick={loadFrame}>
            Load live simulator
          </button>
        </div>
      )}
    </section>
  )
}
