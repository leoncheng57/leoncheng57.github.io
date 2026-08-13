import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../../../components/top-nav/TopNav'
import styles from '../design-components.module.css'
import repoStyles from '../repo.module.css'

export default function DesignComponentsRoute(): ReactElement {
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
      </main>
    </div>
  )
}
