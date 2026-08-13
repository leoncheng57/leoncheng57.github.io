import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../../../components/top-nav/TopNav'
import styles from '../repo.module.css'

const PRODUCTION_FLOW = `push to main
    |
    v
lint + tests + build
    |
    v
gh-pages branch (root)
    |
    v
leoncheng.dev`

export default function ProductionRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.content}>
        <p className={styles.backLink}>
          <Link to="/">Back home</Link>
        </p>

        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>Repo / production</p>
          <h1>Production deploys</h1>
          <p>
            Merging to <code>main</code> is the release process. Nothing is
            deployed by hand.
          </p>
        </header>

        <section className={styles.section} aria-labelledby="production-heading">
          <h2 id="production-heading">Merge to main, land on the domain</h2>
          <p>
            A merge to <code>main</code> builds with the site rooted at{' '}
            <code>/</code>. The generated files are committed to the root of the{' '}
            <code>gh-pages</code> branch, which GitHub Pages serves through the
            custom domain.
          </p>
          <pre className={styles.pipeline} aria-label="Production deployment flow">
            <code>{PRODUCTION_FLOW}</code>
          </pre>
        </section>

        <section className={styles.section} aria-labelledby="shared-branch-heading">
          <h2 id="shared-branch-heading">One branch, serialized writes</h2>
          <p>
            Production and <Link to="/repo/previews">pull request previews</Link>{' '}
            share <code>gh-pages</code>. Their workflows use one concurrency
            queue and non-force pushes, while production cleanup explicitly
            preserves <code>previews/</code>. That keeps a release and several
            active previews from overwriting one another.
          </p>
          <p>
            The workflows live in{' '}
            <a href="https://github.com/leoncheng57/leoncheng57.github.io/tree/main/.github/workflows">
              this repository
            </a>
            .
          </p>
        </section>
      </main>
    </div>
  )
}
