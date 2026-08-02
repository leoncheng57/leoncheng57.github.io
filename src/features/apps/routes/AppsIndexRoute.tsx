import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../../../components/top-nav/TopNav'
import styles from '../apps.module.css'

export default function AppsIndexRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.index}>
        <p className={styles.backLink}>
          <Link to="/">Back home</Link>
        </p>
        <header className={styles.pageHeader}>
          <h1>Apps</h1>
        </header>
        <div className={styles.appList}>
          <article className={styles.appCard}>
            <h2>
              <a href="https://leoncheng.dev/vibe-photo-voting-house-game/">
                House Party Photo Hunt
              </a>
            </h2>
            <p className={styles.subtitle}>A photo game built for house parties</p>
            <p className={styles.description}>
              Guests play on their phones while the host runs the game from a
              laptop and shares voting and results on a TV. The hosted game
              requires a password; clone the repository and connect your own
              Supabase database to run it yourself. Built with care and smarts.
            </p>
            <p className={styles.links}>
              <a href="https://leoncheng.dev/vibe-photo-voting-house-game/">
                Password-protected game
              </a>
              {' · '}
              <a href="https://github.com/leoncheng57/vibe-photo-voting-house-game">
                GitHub
              </a>
            </p>
          </article>
          <article className={styles.appCard}>
            <h2>
              <a href="https://apps.apple.com/us/app/whoops-hoops/id6763969713">
                Whoops Hoops
              </a>
            </h2>
            <p className={styles.subtitle}>A daily NBA player guess game</p>
            <p className={styles.description}>
              Guess a mystery NBA player each day using color-coded clues across
              six attributes: team, conference, division, position, height, and
              age. 304 current NBA players bundled offline — no internet
              required.
            </p>
            <p className={styles.links}>
              <a href="https://apps.apple.com/us/app/whoops-hoops/id6763969713">
                iOS
              </a>
              {' · '}
              <Link to="/apps/whoops-hoops/privacy">Privacy</Link>
              {' · '}
              <Link to="/apps/whoops-hoops/support">Support</Link>
            </p>
          </article>
        </div>
      </main>
    </div>
  )
}
