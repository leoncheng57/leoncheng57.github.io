import { useState } from 'react'
import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import PlaceholderBanner from '../../../components/placeholder-banner/PlaceholderBanner'
import SiteFooter from '../../../components/site-footer/SiteFooter'
import TopNav from '../../../components/top-nav/TopNav'
import ChaptersNav from '../../guides/components/ChaptersNav'
import GuideCard from '../../guides/components/GuideCard'
import GuideVideo from '../../guides/components/GuideVideo'
import OpenHandsIdeWalkthrough from '../../guides/components/OpenHandsIdeWalkthrough'
import ToolGrid from '../../guides/components/ToolGrid'
import { getAllGuides } from '../../guides/content'
import guidesStyles from '../../guides/guides.module.css'
import RemoteControlStoryboard from '../../opencode-remote-control/components/RemoteControlStoryboard'
import styles from '../design-components.module.css'
import repoStyles from '../repo.module.css'

export default function DesignComponentsRoute(): ReactElement {
  // Live specimens: rendered from real guide data so the reference never
  // drifts from the shipped components.
  const [featuredGuide] = getAllGuides()
  const specimenChapters = featuredGuide?.chapters ?? []
  const [specimenActiveSlug, setSpecimenActiveSlug] = useState<string | null>(
    specimenChapters[1]?.slug ?? specimenChapters[0]?.slug ?? null
  )

  return (
    <div className={repoStyles.page}>
      <TopNav />
      <main className={repoStyles.content}>
        <p className={repoStyles.backLink}>
          <Link to="/">Back home</Link>
        </p>
        <header className={repoStyles.pageHeader}>
          <p className={repoStyles.eyebrow}>Repo / visual system</p>
          <h1>Design Components</h1>
          <p>
            A working reference for the colors, type, controls, cards, surfaces,
            and motion used across leoncheng.dev.
          </p>
        </header>

        <section className={styles.showcase} aria-labelledby="colors-heading">
          <h2 id="colors-heading">Color palette</h2>
          <div className={styles.swatchGrid}>
            <div className={`${styles.swatch} ${styles.ink}`}>Ink</div>
            <div className={`${styles.swatch} ${styles.link}`}>Link</div>
            <div className={`${styles.swatch} ${styles.sky}`}>Sky</div>
            <div className={`${styles.swatch} ${styles.softSky}`}>Soft sky</div>
            <div className={`${styles.swatch} ${styles.paper}`}>Paper</div>
            <div className={`${styles.swatch} ${styles.surface}`}>Surface</div>
          </div>
        </section>

        <section className={styles.showcase} aria-labelledby="type-heading">
          <h2 id="type-heading">Typography</h2>
          <div className={styles.typeSpecimen}>
            <p className={styles.displayType}>Display heading</p>
            <p className={styles.serifType}>Editorial emphasis with character.</p>
            <p className={styles.monoType}>MONO LABEL / SYSTEM STATUS / 2026</p>
            <p>
              Body copy stays direct and readable, with enough line height for
              documentation and longer explanations.
            </p>
          </div>
        </section>

        <section className={styles.showcase} aria-labelledby="controls-heading">
          <h2 id="controls-heading">Controls &amp; status</h2>
          <div className={styles.controlRow}>
            <button type="button" className={styles.primaryButton}>Primary button</button>
            <button type="button" className={styles.secondaryButton}>Secondary</button>
            <a href="#cards-heading" className={styles.textLink}>Text link</a>
          </div>
          <div className={styles.badgeRow} aria-label="Status badge examples">
            <span className={styles.alphaBadge}>Alpha</span>
            <span className={styles.betaBadge}>Beta</span>
            <span className={styles.soonBadge}>Coming soon</span>
          </div>
        </section>

        <section className={styles.showcase} aria-labelledby="cards-heading">
          <h2 id="cards-heading">Cards</h2>
          <div className={styles.cardGrid}>
            <article className={styles.catalogCard}>
              <span className={styles.cardKicker}>Catalog card</span>
              <h3>Useful and descriptive</h3>
              <p>Raised surfaces organize content without losing the heavy outline.</p>
              <a href="#loading-heading">Explore component</a>
            </article>
            <article className={styles.posterCard}>
              <span className={styles.posterNumber}>02</span>
              <span className={styles.cardKicker}>Poster card</span>
              <div className={styles.posterShapes} aria-hidden="true"><span /><span /></div>
              <h3>Graphic and compact</h3>
              <p>Best for recent work and high-signal destinations.</p>
            </article>
          </div>
        </section>

        {featuredGuide && specimenChapters.length > 0 ? (
          <section className={styles.showcase} aria-labelledby="chapters-nav-heading">
            <h2 id="chapters-nav-heading">Chapters bar &amp; scrollspy</h2>
            <p>
              The guide one-pager&rsquo;s chapter TOC: a sticky bar that collapses to a
              single row on narrow viewports and expands to the grouped chapter
              list. On the guide page an IntersectionObserver scrollspy
              (<code>useScrollSpy</code>) tracks which chapter section crosses the
              middle of the viewport; the collapsed bar shows it and the list
              highlights it. This is the live component with real guide data —
              use the buttons to simulate the scrolled-to chapter.
            </p>
            <div
              className={styles.simulateRow}
              role="group"
              aria-label="Simulate the scrolled-to chapter"
            >
              {specimenChapters.map((chapter, index) => (
                <button
                  key={chapter.slug}
                  type="button"
                  className={
                    chapter.slug === specimenActiveSlug
                      ? styles.simulateButtonActive
                      : styles.simulateButton
                  }
                  aria-pressed={chapter.slug === specimenActiveSlug}
                  onClick={() => setSpecimenActiveSlug(chapter.slug)}
                >
                  {String(index + 1).padStart(2, '0')}
                </button>
              ))}
            </div>
            <div
              className={`${guidesStyles.theme} ${styles.chaptersNavSpecimen}`}
              data-theme="dark"
            >
              <ChaptersNav
                chapters={specimenChapters}
                activeSlug={specimenActiveSlug}
                listId="specimen-chapter-list"
              />
            </div>
          </section>
        ) : null}

        {featuredGuide ? (
          <section className={styles.showcase} aria-labelledby="terminal-card-heading">
            <h2 id="terminal-card-heading">Terminal card</h2>
            <p>
              The guides index renders each guide as a terminal window: chrome dots, a
              path header, a <code>$</code> prompt, tag chips, and a chapter preview.
              This is the live component with real guide data.
            </p>
            <GuideCard guide={featuredGuide} />
          </section>
        ) : null}

        <section className={styles.showcase} aria-labelledby="placeholder-heading">
          <h2 id="placeholder-heading">Placeholder banner</h2>
          <PlaceholderBanner
            headingId="placeholder-example-heading"
            headingLevel={3}
            description="Use this status card when a section has a clear purpose but its maintained content is not ready to publish yet."
            buildLabel="Building the next thing"
          />
        </section>

        <section className={styles.showcase} aria-labelledby="surfaces-heading">
          <h2 id="surfaces-heading">Borders, shadows &amp; backgrounds</h2>
          <div className={styles.surfaceGrid}>
            <div className={styles.gridSurface}>Grid surface</div>
            <div className={styles.dotSurface}>Dot surface</div>
            <div className={styles.shadowSurface}>Offset shadow</div>
          </div>
        </section>

        <section className={styles.showcase} aria-labelledby="loading-heading">
          <h2 id="loading-heading">Loading bars</h2>
          <div className={styles.loadingList}>
            <div>
              <p>Static progress</p>
              <div className={styles.loadingBar} role="progressbar" aria-label="Static progress" aria-valuenow={64} aria-valuemin={0} aria-valuemax={100}>
                <span className={styles.staticFill} />
              </div>
            </div>
            <div>
              <p>Animated stripe</p>
              <div className={styles.loadingBar} role="progressbar" aria-label="Animated progress">
                <span className={styles.animatedFill} />
              </div>
            </div>
            <div>
              <p>Indeterminate</p>
              <div className={styles.loadingBar} role="progressbar" aria-label="Indeterminate progress">
                <span className={styles.indeterminateFill} />
              </div>
            </div>
            <div>
              <p>Segmented build</p>
              <div className={`${styles.loadingBar} ${styles.segmentedBar}`} role="progressbar" aria-label="Segmented progress" />
            </div>
          </div>
        </section>

        <section className={styles.showcase} aria-labelledby="simulation-heading">
          <h2 id="simulation-heading">Simulation frame</h2>
          <p>
            When an article needs to show an application it cannot embed, it
            uses a scripted mock instead of a screenshot: a dark fake window
            inside a dashed accent frame, announced by a{' '}
            <strong>SIMULATION</strong> pill so it is never mistaken for a
            recording. The window is deliberately dark in both guide themes,
            because it stands in for an app screenshot rather than page
            furniture; only the outer shell follows <code>--gd-*</code>.
            Frames advance on Back/Next or the arrow keys, scoped to the
            section so they never hijack page scrolling, and the caption
            doubles as an <code>aria-live</code> region. Nothing autoplays.
          </p>
          <p>
            In a guide the frame breaks out to the full page width; hosts
            outside a guide pass <code>inline</code> to keep it in the flow,
            as here:
          </p>
          <div className={guidesStyles.theme} data-theme="dark">
            <OpenHandsIdeWalkthrough
              ariaLabel="Live specimen of the simulated application walkthrough"
              inline
            />
          </div>
        </section>

        <section className={styles.showcase} aria-labelledby="tool-grid-heading">
          <h2 id="tool-grid-heading">Catalogue cards</h2>
          <p>
            A grid of short capability cards, two up on desktop and one on
            narrow viewports. Each card is a heading, a sentence, and a small
            monospace sketch pinned to the bottom so sketches line up across a
            row regardless of how long the copy runs. Markdown cannot express
            a grid, so chapters embed this through the same{' '}
            <code>component:</code> marker used for figures.
          </p>
          <div className={guidesStyles.theme} data-theme="dark">
            <ToolGrid label="Live specimen of the catalogue card grid" />
          </div>
        </section>

        <section className={styles.showcase} aria-labelledby="guide-video-heading">
          <h2 id="guide-video-heading">Screen recording figure</h2>
          <p>
            Silent screen recordings ship as a webm/mp4 pair behind a poster
            frame, click-to-play with <code>preload=&quot;metadata&quot;</code>{' '}
            so nothing downloads until a reader asks. Landscape captures fill
            the column; portrait phone captures are height-capped and centred
            so a tall frame does not run off the screen.
          </p>
          <div className={guidesStyles.theme} data-theme="dark">
            <GuideVideo
              recording="mobile-tour"
              label="Live specimen of the screen recording figure"
              caption="Portrait variant: height-capped and centred."
            />
          </div>
        </section>

        <section className={styles.showcase} aria-labelledby="storyboard-heading">
          <h2 id="storyboard-heading">Storyboard animations</h2>
          <p>
            Long-form pages open with an animated SVG storyboard: node cards
            connected by dashed paths, with dots riding the paths to act the
            story out. The pattern combines a framer-motion entrance stagger
            (cards fade up once when scrolled into view), marching dashes on
            the main route, SMIL <code>animateMotion</code> with{' '}
            <code>calcMode=&quot;paced&quot;</code> for deterministic
            path-following dots, ping ripples where events land, and a
            figure-eight &quot;working&quot; indicator inside the hub card.
            Every loop is disabled under{' '}
            <code>prefers-reduced-motion</code>; the entrance still settles
            into the full static composition.
          </p>
          <p>
            Two shipped storyboards use it: the OpenHands article opener
            (SessionStoryboard) and the OpenCode Remote Control guide
            (RemoteControlStoryboard). This is the live guide component:
          </p>
          <RemoteControlStoryboard ariaLabel="Live specimen of the remote-control storyboard animation" />
        </section>

        <section className={styles.showcase} aria-labelledby="footer-heading">
          <h2 id="footer-heading">Site footer</h2>
          <p>
            Every page ends with the shared footer (#198): a link back home,
            the Google feedback form trigger, and a copyright line. Pages can
            pass an optional extra row for app-specific credits, and themed
            pages restyle it through the <code>--sf-*</code> custom
            properties.
          </p>
          <div className={styles.footerSpecimen}>
            <SiteFooter />
          </div>
          <div className={styles.footerSpecimen}>
            <SiteFooter>
              <span>Example extra row · app-specific credits go here</span>
            </SiteFooter>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
