import { useEffect, type ReactElement } from 'react'
import styles from '../game-nights.module.css'

const sampleGames = [
  'Mahjong',
  'Unstable Unicorns',
  'The Mind',
  'Sushi Go',
  'Puzzles',
  'The Crew',
  'Slapjack',
  'Coup',
  'Fire Storm',
  'Sequence',
  'Monopoly Deal',
]

const photos = [
  {
    src: 'https://github.com/user-attachments/assets/a5aa3c28-88d7-47c6-8c6e-6537137d7c63',
    alt: 'A colorful puzzle spread across a game table',
  },
  {
    src: 'https://github.com/user-attachments/assets/cce09b80-4f9b-4fb7-9250-a395b4636ce8',
    alt: 'A card game in progress around a table',
  },
  {
    src: 'https://github.com/user-attachments/assets/d1f5b6ab-25a0-4c5b-9049-ac3422551ff4',
    alt: 'A stack of party and card games',
  },
]

export default function GameNightsRoute(): ReactElement {
  useEffect(() => {
    const previousTitle = document.title
    document.title = "Georgie's Game Nights"

    return () => {
      document.title = previousTitle
    }
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="Georgie's Game Nights home">
          <span className={styles.brandMark} aria-hidden="true">
            G
          </span>
          <span>Georgie&apos;s Game Nights</span>
        </a>
        <nav className={styles.nav} aria-label="Game night navigation">
          <a href="#details">Details</a>
          <a href="#games">Games</a>
          <a href="#join">Join</a>
        </nav>
      </header>

      <main id="top">
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Friday nights on the Lower East Side</p>
            <h1>
              Casual games.
              <br />
              Good company.
              <br />
              <span>No pressure.</span>
            </h1>
            <p className={styles.heroIntro}>
              A relaxed board game night for casual players. Come solo or bring a
              friend. Newcomers are always welcome, and we&apos;re happy to teach.
            </p>
            <a className={styles.primaryButton} href="#details">
              Plan your first visit <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.heroCard}>
              <span className={styles.cardCorner}>FRI</span>
              <span className={styles.cardPip}>8</span>
              <span className={styles.cardWord}>PLAY</span>
              <span className={`${styles.cardCorner} ${styles.cardCornerBottom}`}>11</span>
            </div>
            <div className={styles.heroToken}>G</div>
            <div className={styles.heroDie}>
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </section>

        <section className={styles.details} id="details" aria-labelledby="details-title">
          <div className={styles.sectionHeading}>
            <p className={styles.sectionNumber}>01</p>
            <h2 id="details-title">The essentials</h2>
          </div>
          <div className={styles.detailGrid}>
            <article className={styles.detailCard}>
              <p className={styles.detailLabel}>When</p>
              <h3>Almost every Friday</h3>
              <p className={styles.detailMain}>8:00-11:00 PM</p>
              <p>Some Fridays are skipped. Drop in anytime and leave whenever you like.</p>
            </article>
            <article className={styles.detailCard}>
              <p className={styles.detailLabel}>Where</p>
              <h3>VITAL Lower East Side</h3>
              <p className={styles.detailMain}>
                <a
                  className={styles.inlineLink}
                  href="https://www.georgies.cafe/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Georgie&apos;s Cafe
                </a>
              </p>
              <p>Take the stairs to the second floor. That&apos;s where you&apos;ll find us.</p>
              <a
                className={styles.textLink}
                href="https://maps.google.com/?q=VITAL+Lower+East+Side"
                target="_blank"
                rel="noreferrer"
              >
                Get directions <span aria-hidden="true">↗</span>
              </a>
            </article>
            <article className={`${styles.detailCard} ${styles.detailCardAccent}`}>
              <p className={styles.detailLabel}>Good to know</p>
              <ul className={styles.checkList}>
                <li>Free to attend</li>
                <li>No dress code</li>
                <li>No experience needed</li>
                <li>Bring your own food or snacks</li>
                <li>
                  <span>
                    Georgie&apos;s Cafe is open 9 AM-8 PM every day, so you can always come early to{' '}
                    <a
                      className={styles.inlineLink}
                      href="https://www.georgies.cafe/menu"
                      target="_blank"
                      rel="noreferrer"
                    >
                      grab a snack or drink
                    </a>{' '}
                    before we start
                  </span>
                </li>
              </ul>
            </article>
          </div>
        </section>

        <section className={styles.welcome} aria-labelledby="welcome-title">
          <div className={styles.welcomePhoto}>
            <img src={photos[1].src} alt={photos[1].alt} />
          </div>
          <div className={styles.welcomeCopy}>
            <p className={styles.sectionNumber}>02</p>
            <h2 id="welcome-title">Never played? Perfect.</h2>
            <p>
              This is a casual group, not a competitive club. We often teach newcomers
              how to play, whether that&apos;s a quick round of Exploding Kittens or your
              first game of Mahjong.
            </p>
            <p>
              There&apos;s no need to study rules beforehand. Pull up a chair and we&apos;ll
              find a game that fits.
            </p>
          </div>
        </section>

        <section className={styles.games} id="games" aria-labelledby="games-title">
          <div className={styles.gamesIntro}>
            <div className={styles.sectionHeading}>
              <p className={styles.sectionNumber}>03</p>
              <h2 id="games-title">What might hit the table</h2>
            </div>
            <p>
              These are examples of games we&apos;ve played or sometimes have
              around, not a guaranteed inventory.
            </p>
          </div>
          <ul className={styles.gameList} aria-label="Sample games">
            {sampleGames.map((game, index) => (
              <li key={game}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {game}
              </li>
            ))}
            <li className={styles.gameListMore}>
              <span>+</span>
              Whatever you bring
            </li>
          </ul>
        </section>

        <section className={styles.gallery} aria-label="Scenes from game nights">
          <figure className={styles.photoWide}>
            <img src={photos[0].src} alt={photos[0].alt} />
            <figcaption>One table, many tiny pieces</figcaption>
          </figure>
          <figure className={styles.photoStack}>
            <img src={photos[2].src} alt={photos[2].alt} />
            <figcaption>A few familiar favorites</figcaption>
          </figure>
        </section>

        <section className={styles.join} id="join" aria-labelledby="join-title">
          <div>
            <p className={styles.sectionNumber}>04</p>
            <h2 id="join-title">Show up, then join the chat.</h2>
          </div>
          <div className={styles.joinCopy}>
            <p>
              Our WhatsApp group is not publicly accessible, which helps us discourage
              bots. Come to a game night and ask a host to add you.
            </p>
            <p>
              Once you&apos;re in, you&apos;ll get schedule updates, including which Fridays
              we&apos;re meeting and any additional details.
            </p>
            <a
              className={styles.secondaryButton}
              href="https://maps.google.com/?q=VITAL+Lower+East+Side"
              target="_blank"
              rel="noreferrer"
            >
              Find VITAL LES / Georgie&apos;s Cafe <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          <a href="https://leoncheng.dev/">← LeonCheng.dev</a>
        </p>
        <p>Georgie&apos;s Game Nights</p>
        <p>
          <a href="https://www.georgies.cafe/events" target="_blank" rel="noreferrer">
            Book the space at Georgie&apos;s Cafe <span aria-hidden="true">↗</span>
          </a>
        </p>
        <p>Almost every Friday &middot; 8-11 PM &middot; Lower East Side</p>
      </footer>
    </div>
  )
}
