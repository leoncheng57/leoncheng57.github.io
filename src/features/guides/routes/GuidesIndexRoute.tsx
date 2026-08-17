import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import SiteFooter from '../../../components/site-footer/SiteFooter'
import TopNav from '../../../components/top-nav/TopNav'
import GuideCard from '../components/GuideCard'
import { getAllGuides } from '../content'
import { getSetupGuides } from '../setupGuides'
import styles from '../guides-index.module.css'

export default function GuidesIndexRoute(): ReactElement {
  const guides = [...getAllGuides(), ...getSetupGuides()]

  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.index}>
        <p className={styles.backLink}>
          <Link to="/">Back home</Link>
        </p>
        <header className={styles.pageHeader}>
          <div className={styles.titleRow}>
            <h1>Guides</h1>
            <span className={styles.betaBadge}>BETA</span>
          </div>
          <p>
            Maintained, step-by-step references I keep up to date as the workflows change. Each guide
            opens as its own multi-chapter document. This section is still taking shape.
          </p>
        </header>
        <div className={styles.guideList}>
          {guides.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
          {/* Interactive page, not a markdown guide, so it is listed here
              explicitly instead of coming from getAllGuides(). */}
          <article className={styles.guideCard}>
            <div className={styles.cardChrome}>
              <span className={styles.dots} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <p className={styles.cardPath}>~/guides/opencode-remote-control</p>
            </div>
            <div className={styles.cardBody}>
              <h2 className={styles.cardTitle}>
                <span className={styles.prompt} aria-hidden="true">
                  $
                </span>
                <Link to="/guides/opencode-remote-control">
                  OpenCode Remote Control
                </Link>
              </h2>
              <p className={styles.description}>
                Control local OpenCode sessions from your phone over a private
                tailnet, with ntfy pushes that deep-link into the exact session.
                Interactive setup builder, daily commands, notification
                customization, and troubleshooting on one page.
              </p>
              <p className={styles.cardMeta}>
                <span>updated 2026-08-13</span>
                <span className={styles.separator} aria-hidden="true">
                  ·
                </span>
                <span>interactive guide</span>
                <span className={styles.separator} aria-hidden="true">
                  ·
                </span>
                <span>
                  <a href="https://github.com/leoncheng57/opencode-remote-control-and-notifications">
                    GitHub ↗
                  </a>
                </span>
              </p>
              <p className={styles.cardCta}>
                <Link to="/guides/opencode-remote-control">read guide &rarr;</Link>
              </p>
            </div>
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
