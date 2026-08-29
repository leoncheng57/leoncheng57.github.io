import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import {
  createInstallPlatformGuides,
  type InstallPlatform,
} from '../../../components/pwa-install/installPlatforms'
import { assetUrl } from '../utils/assetUrl'
import styles from '../weather.module.css'

const guides = createInstallPlatformGuides('NYC Weather')

const STEP_IMAGES: Record<InstallPlatform, { src: string; alt: string }[]> = {
  iphone: [
    {
      src: 'iphone-share.svg',
      alt: 'NYC Weather open in iPhone Safari with the Share button highlighted',
    },
    {
      src: 'iphone-add-home.svg',
      alt: 'iPhone Safari share sheet with Add to Home Screen highlighted for NYC Weather',
    },
    {
      src: 'iphone-confirm.svg',
      alt: 'iPhone Add to Home Screen confirmation showing the NYC Weather icon and Add button',
    },
  ],
  android: [
    {
      src: 'android-menu.svg',
      alt: 'NYC Weather open in Android Chrome with the three-dot browser menu highlighted',
    },
    {
      src: 'android-install.svg',
      alt: 'Android Chrome menu with Install app highlighted for NYC Weather',
    },
    {
      src: 'android-confirm.svg',
      alt: 'Android installation confirmation showing NYC Weather and the Install button',
    },
  ],
}

function PlatformGuide({ platform }: { platform: InstallPlatform }): ReactElement {
  const guide = guides[platform]
  const images = STEP_IMAGES[platform]
  const headingId = `weather-install-${platform}`

  return (
    <section className={styles.installPlatform} aria-labelledby={headingId}>
      <h2 id={headingId}>{guide.title}</h2>
      <p className={styles.installPlatformNote}>{guide.note}</p>
      <ol className={styles.installSteps}>
        {guide.steps.map((step, index) => (
          <li key={step.title} className={styles.installStep}>
            <img
              src={assetUrl(`weather/install/${images[index].src}`)}
              alt={images[index].alt}
              width={320}
              height={520}
              loading="lazy"
            />
            <div>
              <h3>
                <span aria-hidden="true">{index + 1}.</span> {step.title}
              </h3>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default function InstallRoute(): ReactElement {
  return (
    <main className={styles.main}>
      <p className={styles.backLink}>
        <Link to="/weather/">Back to forecast</Link>
      </p>
      <header className={styles.installGuideHeader}>
        <img src={assetUrl('weather/icon.svg')} alt="" width={72} height={72} />
        <div>
          <h1>Install NYC Weather</h1>
          <p>
            Put the NYC forecast on your home screen for a full-screen,
            app-like view. No app store or account is required.
          </p>
        </div>
      </header>

      <PlatformGuide platform="iphone" />
      <PlatformGuide platform="android" />

      <section className={styles.installCompatibility}>
        <h2>Compatibility and troubleshooting</h2>
        <ul>
          <li>On iPhone and iPad, open this page in Safari.</li>
          <li>
            On Android, use a recent version of Chrome or another Chromium
            browser that offers Install app or Add to Home screen.
          </li>
          <li>
            If an old icon remains, remove it, revisit NYC Weather, and install
            again.
          </li>
          <li>
            Menu labels and positions can vary slightly by device and operating
            system version.
          </li>
        </ul>
      </section>
      <p className={styles.installIllustrationNote}>
        The walkthroughs are original NYC Weather illustrations. If an image
        does not load, the complete numbered instructions beside it contain
        every step needed to install the app.
      </p>
    </main>
  )
}
