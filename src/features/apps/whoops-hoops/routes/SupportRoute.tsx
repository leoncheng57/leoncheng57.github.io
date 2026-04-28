import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import styles from '../whoops-hoops.module.css'

const LAST_UPDATED = 'April 27, 2026'
const SUPPORT_EMAIL = 'leon.cheng.work@gmail.com'

export default function SupportRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <main className={styles.content}>
        <header className={styles.pageHeader}>
          <h1>Whoops Hoops &mdash; Support</h1>
          <p className={styles.lastUpdated}>Last updated: {LAST_UPDATED}</p>
        </header>
        <section className={styles.body}>
          <p>
            Whoops Hoops is a daily NBA player guessing game for iOS. This page is the support
            home for the App. If you&rsquo;re running into a bug, have a feature request, or just
            want to say hi, please email us.
          </p>

          <h2>Contact</h2>
          <div className={styles.contactCard}>
            <p>
              Email: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </p>
          </div>

          <h2>How to play</h2>
          <ol>
            <li>Open the App. A new puzzle is available each day.</li>
            <li>Type a player name to make a guess.</li>
            <li>
              Each guess returns hints (e.g. team, position, age, height) so you can narrow down
              the target player.
            </li>
            <li>Solve the puzzle in as few guesses as possible to keep your streak alive.</li>
          </ol>

          <h2>Frequently asked questions</h2>

          <h3>Do I need an account?</h3>
          <p>
            No. Whoops Hoops works without sign-in. Your streak and history are stored locally on
            your device.
          </p>

          <h3>Why didn&rsquo;t I get my daily reminder?</h3>
          <p>
            Reminders rely on iOS notification permissions. Open{' '}
            <em>Settings &rsaquo; Notifications &rsaquo; Whoops Hoops</em> and confirm that
            notifications are enabled. If they were just enabled, the next reminder will fire on
            its normal schedule.
          </p>

          <h3>I lost my streak after reinstalling the App.</h3>
          <p>
            Game state is stored locally on the device, so uninstalling clears it. We don&rsquo;t
            currently support cloud sync. If you&rsquo;d like to see this, please reach out &mdash;
            it helps us prioritize.
          </p>

          <h3>How do I report a bug or wrong player data?</h3>
          <p>
            Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with the App version
            (Settings screen), iOS version, and a short description of what went wrong. Screenshots
            help a lot.
          </p>

          <h3>How do I request a feature?</h3>
          <p>
            Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with your idea. We
            read everything.
          </p>

          <h2>Privacy</h2>
          <p>
            For details on what data the App collects, see the{' '}
            <Link to="/apps/whoops-hoops/privacy">Whoops Hoops Privacy Policy</Link>.
          </p>
        </section>
      </main>
    </div>
  )
}
