import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import PlaceholderBanner from '../../../components/placeholder-banner/PlaceholderBanner'
import SiteFooter from '../../../components/site-footer/SiteFooter'
import TopNav from '../../../components/top-nav/TopNav'
import styles from '../cook-today.module.css'

export default function CookTodayRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.main}>
        <p className={styles.backLink}>
          <Link to="/apps">Back to apps</Link>
        </p>
        <header className={styles.pageHeader}>
          <h1>Cook Today</h1>
        </header>
        <p className={styles.tagline}>
          Tick a few boxes, get tonight&apos;s recipe ideas with short cooking
          videos.
        </p>

        <PlaceholderBanner
          headingId="cook-today-placeholder"
          description="Cook Today is still an idea on the drawing board. This page reserves its home while the quick checkbox form and recipe suggestions are being designed."
          buildLabel="Sketching the form"
        />

        <section className={styles.section} aria-labelledby="cook-today-plan">
          <h2 id="cook-today-plan">The plan</h2>
          <ol className={styles.flowList}>
            <li>
              Fill out a very quick checkbox form: ingredients on hand, cuisine
              mood, time available, and dietary needs.
            </li>
            <li>
              Get a handful of matching recipe suggestions for what to cook
              today.
            </li>
            <li>
              Each suggestion links to a short cooking video so you can see the
              dish being made before committing.
            </li>
          </ol>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
