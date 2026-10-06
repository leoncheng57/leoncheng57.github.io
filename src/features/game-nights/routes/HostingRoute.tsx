import { useState, type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import FeedbackTrigger from '../../../components/feedback/FeedbackTrigger'
import HostingGate from '../components/HostingGate'
import styles from '../game-nights.module.css'

const tenets = [
  {
    title: 'Build community',
    body: 'Help strangers become regulars and regulars become friends.',
  },
  {
    title: 'Fun and friendly',
    body: 'Everyone should feel welcome at the table, whatever their experience.',
  },
  {
    title: 'Play board games',
    body: 'Keep games moving and get people playing together.',
  },
]

const checklist = [
  {
    label: 'Before',
    items: [
      'Post in the chat weekly',
      'Be relatively on time to start',
      'Bring the games cart in',
    ],
  },
  {
    label: 'During',
    items: [
      'Say hi to folks who come in, especially if they are new and shy',
      'Watch the table so nobody is left out and game groups have an enjoyable vibe',
      'Invite folks to the WhatsApp chat',
    ],
  },
  {
    label: 'Closing',
    items: [
      'Close out when you choose, with about 30 minutes of warning',
      'Bring the games cart back out',
    ],
  },
]

const closeOutMessage =
  "Heads up: we're wrapping up in about 30 minutes, so finish your current game and help pack up the cart!"

function CopyButton({ text }: { text: string }): ReactElement {
  const [copied, setCopied] = useState(false)

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      // Clipboard can be unavailable; the message stays visible to copy by hand.
    }
  }

  return (
    <button className={styles.secondaryButton} type="button" onClick={handleCopy}>
      {copied ? 'Copied' : 'Copy message'}
    </button>
  )
}

export default function HostingRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link
          className={styles.brand}
          to="/georgies-board-game-nights"
          aria-label="Georgie's Game Nights home"
        >
          <span className={styles.brandMark} aria-hidden="true">
            G
          </span>
          <span>Georgie&apos;s Game Nights</span>
        </Link>
        <nav className={styles.nav} aria-label="Hosting navigation">
          <a href="#tenets">Tenets</a>
          <a href="#checklist">Checklist</a>
          <a href="#toolkit">Toolkit</a>
        </nav>
      </header>

      <main id="top">
        <HostingGate>
          <section className={styles.hostingHero}>
            <p className={styles.eyebrow}>For Georgie&apos;s hosts</p>
            <h1>
              Hosting Georgie&apos;s <span>Board Games</span>
            </h1>
          </section>

          <section className={styles.details} id="tenets" aria-labelledby="tenets-title">
            <div className={styles.sectionHeading}>
              <p className={styles.sectionNumber}>01</p>
              <h2 id="tenets-title">Our tenets</h2>
            </div>
            <div className={styles.detailGrid}>
              {tenets.map((tenet, index) => (
                <article
                  key={tenet.title}
                  className={`${styles.detailCard} ${index === 0 ? styles.detailCardAccent : ''}`}
                >
                  <p className={styles.detailLabel}>{String(index + 1).padStart(2, '0')}</p>
                  <h3 className={styles.tenetTitle}>{tenet.title}</h3>
                  <p>{tenet.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section
            className={styles.hostingChecklist}
            id="checklist"
            aria-labelledby="checklist-title"
          >
            <div className={styles.sectionHeading}>
              <p className={styles.sectionNumber}>02</p>
              <h2 id="checklist-title">Host checklist</h2>
            </div>
            <p className={styles.hostingIntro}>How we live the tenets on a game night.</p>
            <div className={styles.checklistGrid}>
              {checklist.map((group) => (
                <article key={group.label} className={styles.checklistCard}>
                  <h3>{group.label}</h3>
                  <ul className={styles.checkList}>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.join} id="toolkit" aria-labelledby="toolkit-title">
            <div>
              <p className={styles.sectionNumber}>03</p>
              <h2 id="toolkit-title">Host toolkit</h2>
            </div>
            <div className={styles.joinCopy}>
              <h3 className={styles.toolkitHeading}>Adding someone to WhatsApp</h3>
              <p>
                Every host is a group admin. Ask for their number, then open the group
                and use Group info → Add member. Only add people you&apos;ve met in
                person. Keeping the group private is how we keep the bots out.
              </p>
              <h3 className={styles.toolkitHeading}>30-minute close-out message</h3>
              <blockquote className={styles.closeOutMessage}>{closeOutMessage}</blockquote>
              <CopyButton text={closeOutMessage} />
            </div>
          </section>
        </HostingGate>
      </main>

      <footer className={styles.footer}>
        <p>
          <Link to="/georgies-board-game-nights">← Georgie&apos;s Game Nights</Link>
        </p>
        <p>Hosting guide</p>
        <p>
          <FeedbackTrigger />
        </p>
      </footer>
    </div>
  )
}
