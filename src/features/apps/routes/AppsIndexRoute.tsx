import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../../../components/top-nav/TopNav'
import styles from '../apps.module.css'

export default function AppsIndexRoute(): ReactElement {
  const subWaitIconUrl = `${import.meta.env.BASE_URL}app-icons/sub-wait-v2.svg`
  const openCodeRemoteIconUrl = `${import.meta.env.BASE_URL}app-icons/opencode-remote-control.svg`

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
            <div className={styles.appCardHeader}>
              <img
                className={styles.appIcon}
                src={openCodeRemoteIconUrl}
                alt=""
                width={64}
                height={64}
                decoding="async"
              />
              <div className={styles.appCardHeading}>
                <h2>
                  <Link to="/opencode-remote-control">
                    OpenCode Remote Control
                  </Link>
                  <span className={styles.betaBadge}>BETA</span>
                </h2>
                <p className={styles.subtitle}>
                  Build a private phone-control setup for local agents
                </p>
              </div>
            </div>
            <p className={styles.description}>
              Configure a Tailscale-only OpenCode Web server, generate setup
              commands, and add ntfy push notifications that deep-link to the
              exact session needing attention.
            </p>
            <p className={styles.links}>
              <Link to="/opencode-remote-control">Build your setup</Link>
              {' · '}
              <a href="https://github.com/leoncheng57/opencode-remote-control-and-notifications">
                GitHub
              </a>
            </p>
          </article>
          <article className={styles.appCard}>
            <div className={styles.appCardHeader}>
              <img
                className={styles.appIcon}
                src="/app-icons/house-party-photo-hunt.svg"
                alt=""
                width={64}
                height={64}
                decoding="async"
              />
              <div className={styles.appCardHeading}>
                <h2>
                  <a href="https://leoncheng.dev/vibe-photo-voting-house-game/">
                    House Party Photo Hunt
                  </a>
                </h2>
                <p className={styles.subtitle}>
                  A photo game built for house parties
                </p>
              </div>
            </div>
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
            <div className={styles.appCardHeader}>
              <img
                className={styles.appIcon}
                src="/app-icons/whoops-hoops.png"
                alt=""
                width={64}
                height={64}
                decoding="async"
              />
              <div className={styles.appCardHeading}>
                <h2>
                  <a href="https://apps.apple.com/us/app/whoops-hoops/id6763969713">
                    Whoops Hoops
                  </a>
                </h2>
                <p className={styles.subtitle}>A daily NBA player guess game</p>
              </div>
            </div>
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
          <article className={styles.appCard}>
            <div className={styles.appCardHeader}>
              <img
                className={styles.appIcon}
                src={subWaitIconUrl}
                alt=""
                width={64}
                height={64}
                decoding="async"
              />
              <div className={styles.appCardHeading}>
                <h2>
                  <Link to="/sub-wait">Sub-Wait</Link>
                  <span className={styles.betaBadge}>BETA</span>
                </h2>
                <p className={styles.subtitle}>
                  How long until your subway train?
                </p>
              </div>
            </div>
            <p className={styles.description}>
              Live NYC subway arrival times straight from the MTA real-time
              feeds. Every station and direction gets its own page you can
              bookmark, in light or dark mode.
            </p>
            <p className={styles.links}>
              <Link to="/sub-wait">Check train times</Link>
            </p>
          </article>
          <article className={styles.appCard}>
            <div className={styles.appCardHeader}>
              <img
                className={styles.appIcon}
                src="/app-icons/game-nights.svg"
                alt=""
                width={64}
                height={64}
                decoding="async"
              />
              <div className={styles.appCardHeading}>
                <h2>
                  <Link to="/georgies-board-game-nights">
                    Georgie&apos;s Game Nights
                  </Link>
                </h2>
                <p className={styles.subtitle}>
                  Casual Friday board game nights on the Lower East Side
                </p>
              </div>
            </div>
            <p className={styles.description}>
              A welcome page for a casual weekly board game night. Covers when
              and where to show up, what newcomers can expect, sample games,
              and how to join the group chat.
            </p>
            <p className={styles.links}>
              <Link to="/georgies-board-game-nights">Visit the page</Link>
            </p>
          </article>
          <article className={styles.appCard}>
            <div className={styles.appCardHeader}>
              <img
                className={styles.appIcon}
                src="/app-icons/workout-lab.svg"
                alt=""
                width={64}
                height={64}
                decoding="async"
              />
              <div className={styles.appCardHeading}>
                <h2>
                  <Link to="/workout-lab">Workout Lab</Link>
                  <span className={styles.betaBadge}>BETA</span>
                </h2>
                <p className={styles.subtitle}>
                  A workout generator built around you
                </p>
              </div>
            </div>
            <p className={styles.description}>
              Customize your goal, experience, time, equipment, and focus to
              generate a complete workout. The deterministic generator makes
              every set of choices repeatable.
            </p>
            <p className={styles.links}>
              <Link to="/workout-lab">Build a workout</Link>
            </p>
          </article>
        </div>
      </main>
    </div>
  )
}
