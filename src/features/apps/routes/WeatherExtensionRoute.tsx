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
          <figcaption>Pin the temperature to your toolbar. Click to open the hourly forecast. Browser illustration with example readings.</figcaption>
        </figure>
        <div className={styles.extensionLayout}>
          <div className={styles.extensionCopy}>
            <section aria-labelledby="extension-overview">
              <h2 id="extension-overview">Look up. Know the temperature.</h2>
              <p>The toolbar icon shows NYC’s current temperature. Open it for the same hourly charts as the NYC Weather web app, in a compact browser popup.</p>
              <ul>
                <li>Current conditions and US Air Quality Index.</li>
                <li>Temperature and precipitation charts for the past 12 hours and next 24 hours.</li>
                <li>Drag through the charts to inspect each hour.</li>
                <li>Fahrenheit or Celsius, with light and dark themes.</li>
              </ul>
              <p>Built for New York City. No account, city search, or location permission needed.</p>
            </section>
            <section className={styles.appCard} aria-labelledby="extension-get">
              <h2 id="extension-get">Get the extension</h2>
              <p><strong>Chrome Web Store release coming soon.</strong></p>
              <p>For now, try the web app or load the extension locally using the instructions on GitHub. It works in Chrome and Brave.</p>
              <p className={styles.links}><Link to="/weather/">Open NYC Weather</Link>{' · '}<a href={sourceUrl}>Source and local installation</a></p>
            </section>
            <section aria-labelledby="extension-updates">
              <h2 id="extension-updates">Fresh weather, even with the popup closed</h2>
              <p>The toolbar temperature refreshes about every 15 minutes while your browser runs. Opening the popup fetches fresh weather. Browser sleep and network availability can delay updates.</p>
            </section>
            <section aria-labelledby="extension-privacy">
              <h2 id="extension-privacy">Privacy and support</h2>
              <p>Your settings stay in your browser. Weather requests use fixed NYC coordinates, never your device’s location. Forecasts and air quality come from Open-Meteo.</p>
              <p className={styles.links}>
                <a href="https://github.com/leoncheng57/leoncheng57.github.io/blob/main/src/weather-extension/PRIVACY.md">Privacy policy</a>{' · '}
                <a href="mailto:leonc@alum.mit.edu">Email support</a>{' · '}
                <a href="https://github.com/leoncheng57/leoncheng57.github.io/issues">Report an issue</a>
              </p>
            </section>
          </div>

        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
