import { useState, type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import FeedbackTrigger from '../../../components/feedback/FeedbackTrigger'
import HostingGate from '../components/HostingGate'
import styles from '../hosting.module.css'

const tenets = [
  {
    name: 'Build community',
    note: "Everyone values community A LOT, but folks often don't know how to find it. Let's help a tiny bit.",
  },
  { name: 'Keep it light', note: 'Friendly, casual, never too competitive.' },
  { name: 'Play board games', note: 'Keep games moving.' },
]

const duties = [
  {
    label: 'Before',
    items: ['Post in the chat weekly', 'Start roughly on time', 'Bring the games cart in'],
  },
  {
    label: 'During',
    items: [
      'Greet people as they arrive, especially new or shy folks',
      'Watch the table: nobody left out, every group enjoying the vibe',
      'Invite folks to the WhatsApp chat',
    ],
  },
  {
    label: 'Closing',
    items: ['Close whenever you choose, with about 30 minutes of warning', 'Bring the games cart back out'],
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
    <button className={styles.button} type="button" onClick={handleCopy}>
      {copied ? 'Copied' : 'Copy message'}
    </button>
  )
}

export default function HostingRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <Link to="/georgies-board-game-nights">← Georgie&apos;s Game Nights</Link>
        <nav className={styles.barNav} aria-label="Hosting navigation">
          <a href="#tenets">Tenets</a>
          <a href="#duties">Duties</a>
          <a href="#toolkit">Toolkit</a>
        </nav>
      </header>

      <main>
        <HostingGate>
          <article className={styles.sheet}>
            <header className={styles.sheetHeader}>
              <h1>Hosting Georgie&apos;s Board Games</h1>
              <span className={styles.stamp}>Hosts only</span>
            </header>

            <section className={`${styles.section} ${styles.sectionTenets}`} id="tenets" aria-labelledby="tenets-title">
              <h2 className={styles.sectionTitle} id="tenets-title">Our tenets (always remember)</h2>
              <ol className={styles.tenets}>
                {tenets.map((tenet) => (
                  <li key={tenet.name}>
                    <h3 className={styles.tenetName}>{tenet.name}</h3>
                    <p>{tenet.note}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className={styles.section} id="duties" aria-labelledby="duties-title">
              <h2 className={styles.sectionTitle} id="duties-title">Duties (required reading for training)</h2>
              <dl className={styles.duties}>
                {duties.map((group) => (
                  <div key={group.label} className={styles.dutyGroup}>
                    <dt>{group.label}</dt>
                    <dd>
                      <ul>
                        {group.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className={styles.section} id="toolkit" aria-labelledby="toolkit-title">
              <h2 className={styles.sectionTitle} id="toolkit-title">Toolkit</h2>
              <div className={styles.tools}>
                <div>
                  <h3>Add someone to WhatsApp</h3>
                  <ol>
                    <li>All hosts are group admins.</li>
                    <li>Ask for their number, in person only.</li>
                    <li>Group info → Add member.</li>
                  </ol>
                </div>
                <div>
                  <h3>30-minute warning</h3>
                  <p className={styles.message}>{closeOutMessage}</p>
                  <CopyButton text={closeOutMessage} />
                </div>
              </div>
            </section>
          </article>
        </HostingGate>
      </main>

      <footer className={styles.footer}>
        <p>Host briefing · Georgie&apos;s Game Nights</p>
        <p>
          <FeedbackTrigger />
        </p>
      </footer>
    </div>
  )
}
