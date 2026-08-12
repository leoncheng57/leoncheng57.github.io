import { useEffect, type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { assetUrl } from '../utils/assetUrl'
import styles from '../sub-wait.module.css'

type InstallStep = {
  image: string
  alt: string
  title: string
  body: string
}

const IPHONE_STEPS: InstallStep[] = [
  {
    image: 'iphone-1-share.png',
    alt: 'Illustrated iPhone Safari screen with the Share button highlighted',
    title: 'Tap Share in Safari',
    body: 'Open Sub-Wait in Safari, then tap the Share button in the bottom toolbar.',
  },
  {
    image: 'iphone-2-add.png',
    alt: 'Illustrated iPhone share sheet with Add to Home Screen highlighted',
    title: 'Choose Add to Home Screen',
    body: 'Scroll the share sheet if needed, then tap Add to Home Screen.',
  },
  {
    image: 'iphone-3-confirm.png',
    alt: 'Illustrated iPhone Add to Home Screen confirmation with Add highlighted',
    title: 'Confirm with Add',
    body: 'Keep the Sub-Wait name, tap Add, and the S/W icon appears on your home screen.',
  },
]

const ANDROID_STEPS: InstallStep[] = [
  {
    image: 'android-1-menu.png',
    alt: 'Illustrated Android Chrome screen with the three-dot menu highlighted',
    title: 'Open the Chrome menu',
    body: 'Open Sub-Wait in Chrome, then tap the three-dot menu beside the address bar.',
  },
  {
    image: 'android-2-install.png',
    alt: 'Illustrated Android Chrome menu with Install app highlighted',
    title: 'Choose Install app',
    body: 'Tap Install app. Some Android versions call this Add to Home screen.',
  },
  {
    image: 'android-3-confirm.png',
    alt: 'Illustrated Android installation confirmation with Install highlighted',
    title: 'Confirm installation',
    body: 'Tap Install. Sub-Wait opens like a standalone app from your home screen.',
  },
]

function PlatformSteps({
  title,
  note,
  steps,
}: {
  title: string
  note: string
  steps: InstallStep[]
}): ReactElement {
  return (
    <section className={styles.installPlatform} aria-labelledby={`${title}-steps`}>
      <h2 id={`${title}-steps`}>{title}</h2>
      <p>{note}</p>
      <ol className={styles.installSteps}>
        {steps.map((step, index) => (
          <li key={step.image} className={styles.installStep}>
            <img
              src={assetUrl(`sub-wait/install/${step.image}`)}
              alt={step.alt}
              width={390}
              height={720}
              loading="lazy"
            />
            <h3>
              <span aria-hidden="true">{index + 1}.</span> {step.title}
            </h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default function InstallRoute(): ReactElement {
  useEffect(() => {
    const previousTitle = document.title
    document.title = "Install Sub-Wait | Leon's Website"

    return () => {
      document.title = previousTitle
    }
  }, [])

  return (
    <main className={styles.main}>
      <p className={styles.backLink}>
        <Link to="/sub-wait/">Home</Link>
      </p>
      <header className={styles.installHeader}>
        <img
          src={assetUrl('sub-wait/icon-v2.svg')}
          alt=""
          width={72}
          height={72}
        />
        <div>
          <h1 className={styles.pageTitle}>Install Sub-Wait</h1>
          <p className={styles.pageLede}>
            Put live train times on your home screen. No app store or account
            required.
          </p>
        </div>
      </header>

      <PlatformSteps
        title="iPhone"
        note="Use Safari. The exact toolbar position can vary slightly by iOS version."
        steps={IPHONE_STEPS}
      />
      <PlatformSteps
        title="Android"
        note="Use Chrome. Depending on your device, the menu may say Install app or Add to Home screen."
        steps={ANDROID_STEPS}
      />

      <section className={styles.installUpdateNote}>
        <h2>Still seeing an old icon?</h2>
        <p>
          Phones can hold onto home-screen artwork longer than the website.
          Remove the existing Sub-Wait icon, revisit this page in Safari or
          Chrome, and install it again to fetch the current purple-and-gold S/W
          icon.
        </p>
      </section>
      <p className={styles.installIllustrationNote}>
        These are original illustrations. Labels and menu placement can vary
        slightly by phone and operating-system version.
      </p>
    </main>
  )
}
