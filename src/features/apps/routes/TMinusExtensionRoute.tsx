import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import SiteFooter from '../../../components/site-footer/SiteFooter'
import TopNav from '../../../components/top-nav/TopNav'
import styles from '../apps.module.css'

const sourceUrl = 'https://github.com/leoncheng57/leoncheng57.github.io/tree/main/src/chromium-extensions/t-minus-extension'

export default function TMinusExtensionRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.index}>
        <p className={styles.backLink}><Link to="/apps">Back to apps</Link></p>
        <header className={styles.pageHeader}>
          <div className={styles.appCardHeader}>
            <img className={styles.appIcon} src={`${import.meta.env.BASE_URL}app-icons/t-minus.svg`} alt="" width={64} height={64} />
            <div>
              <h1>T-minus - Chromium Extension</h1>
              <p className={styles.subtitle}>Your next meeting, counting down in the toolbar.</p>
            </div>
          </div>
        </header>
        <div className={styles.extensionCopy}>
          <p>
            T-minus reads your Google Calendar and counts the next joinable
            meeting down on the toolbar badge: quiet when the meeting is over an
            hour out, grey minutes inside that hour, amber once you are inside
            your chosen lead time, and <code>now</code> once it has started.
          </p>
          <p>
            The popup names the meeting and the signed-in account and gives you
            a Join button, a lead time of one to fifteen minutes, a per-meeting
            dismiss with undo, and an optional five-meeting agenda. Declined,
            all-day, and link-less events are filtered out.
          </p>
          <p>
            There is no backend and no analytics. Calendar access is read-only,
            and the access token stays in <code>chrome.storage.local</code> on
            your device. Works in Chrome and Brave.
          </p>
          <p><strong>Not on the Chrome Web Store — load it unpacked for now.</strong></p>
          <p className={styles.links}>
            <a href={sourceUrl}>Install the extension locally</a>{' · '}
            <a href="mailto:leonc@alum.mit.edu">Support</a>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
