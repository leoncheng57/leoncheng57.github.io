import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import SiteFooter from '../../../components/site-footer/SiteFooter'
import TopNav from '../../../components/top-nav/TopNav'
import styles from '../apps.module.css'

const sourceUrl = 'https://github.com/leoncheng57/leoncheng57.github.io/tree/main/src/weather-extension'

export default function WeatherExtensionRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.index}>
        <p className={styles.backLink}><Link to="/apps">Back to apps</Link></p>
        <header className={styles.pageHeader}>
          <div className={styles.appCardHeader}>
            <img className={styles.appIcon} src={`${import.meta.env.BASE_URL}app-icons/weather.svg`} alt="" width={64} height={64} />
            <div>
              <h1>NYC Weather - Chromium Extension</h1>
              <p className={styles.subtitle}>A little New York weather, always within reach.</p>
            </div>
          </div>
        </header>
        <figure className={styles.extensionPreview}>
          <img src={`${import.meta.env.BASE_URL}app-previews/nyc-weather-browser.svg`} alt="Browser illustration showing the NYC temperature icon pinned in the toolbar and the hourly weather popup open over a new tab." width={1200} height={800} />
          <figcaption>Browser illustration with example readings.</figcaption>
        </figure>
        <div className={styles.extensionCopy}>
          <p>NYC temperature in your toolbar. Hourly forecasts and air quality in one click. Works in Chrome and Brave.</p>
          <p><strong>Chrome Web Store release coming soon.</strong></p>
          <p className={styles.links}>
            <Link to="/weather/">Try the web app</Link>{' · '}
            <a href={sourceUrl}>Install locally</a>{' · '}
            <a href="https://github.com/leoncheng57/leoncheng57.github.io/blob/main/src/weather-extension/PRIVACY.md">Privacy</a>{' · '}
            <a href="mailto:leonc@alum.mit.edu">Support</a>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
