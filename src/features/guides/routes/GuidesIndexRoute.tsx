import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import SiteFooter from '../../../components/site-footer/SiteFooter'
import TopNav from '../../../components/top-nav/TopNav'
import GuideCard from '../components/GuideCard'
import GuideRepoReference from '../components/GuideRepoReference'
import { getAllGuides } from '../content'
import { getSetupGuides } from '../setupGuides'
import { REPOSITORY_URL as REMOTE_CONTROL_REPOSITORY_URL } from '../../opencode-remote-control/constants'
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
          {/* Deliberately rendered FIRST, above the date-sorted markdown guides
              from getAllGuides() — this is not a sorting bug, so please do not
              "fix" it by moving the card back down. The catalogue is the newest
              work and gets the most prominent slot on the page (issue #255,
              overriding the bottom placement chosen in #241).

              Hosted in its own repository and published to
              leoncheng.dev/agent-skills, so this card links out of the SPA with
              a plain anchor rather than a router Link. */}
          <article className={styles.guideCard}>
            <div className={styles.cardChrome}>
              <span className={styles.dots} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <p className={styles.cardPath}>~/guides/agent-skills</p>
            </div>
            <div className={styles.cardBody}>
              <h2 className={styles.cardTitle}>
                <span className={styles.prompt} aria-hidden="true">
                  $
                </span>
                <a href="https://leoncheng.dev/agent-skills/">Agent Skills</a>
              </h2>
              <p className={styles.description}>
                A catalogue of portable agent skills: reusable, on-demand
                workflow instructions a coding agent loads only when a task
                calls for them. Written for OpenCode and compatible with any
                agent that reads a SKILL.md file, so the same skill works in
                Claude Code or Cursor. Every skill page carries copy-paste
                install commands.
              </p>
              <GuideRepoReference
                repoUrl="https://github.com/leoncheng57/agent-skills"
                repoAccess="public"
                repoScope="standalone"
              />
              <p className={styles.cardMeta}>
                <span>external site</span>
              </p>
              <ul className={styles.tagRow} aria-label="Guide tags">
                <li className={styles.tag}>#agents</li>
                <li className={styles.tag}>#opencode</li>
                <li className={styles.tag}>#workflow</li>
              </ul>
              <p className={styles.cardCta}>
                <a href="https://leoncheng.dev/agent-skills/">browse skills ↗</a>
              </p>
            </div>
          </article>
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
                <span className={styles.betaBadge}>BETA</span>
              </h2>
              <p className={styles.description}>
                Control local OpenCode sessions from your phone over a private
                tailnet, with ntfy pushes that deep-link into the exact session.
                Interactive setup builder, daily commands, notification
                customization, and troubleshooting on one page.
              </p>
              <GuideRepoReference
                repoUrl={REMOTE_CONTROL_REPOSITORY_URL}
                repoAccess="public"
                repoScope="standalone"
              />
              <p className={styles.cardMeta}>
                <span>updated 2026-08-13</span>
                <span className={styles.separator} aria-hidden="true">
                  ·
                </span>
                <span>interactive guide</span>
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
