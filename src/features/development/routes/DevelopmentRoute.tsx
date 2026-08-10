import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../../../components/top-nav/TopNav'
import styles from '../development.module.css'

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

const PREVIEW_FLOW = `open or update PR #N
    |
    v
lint + tests + preview build
    |
    v
gh-pages/previews/pr-N/
    |
    v
leoncheng.dev/previews/pr-N/
    |
    v
close PR -> remove preview`

export default function DevelopmentRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.content}>
        <p className={styles.backLink}>
          <Link to="/">Back home</Link>
        </p>

        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>How this site ships</p>
          <h1>Development</h1>
          <p>
            A small Vite and React site with repository-owned validation,
            production releases, and a disposable environment for every pull
            request.
          </p>
        </header>

        <section className={styles.section} aria-labelledby="validation-heading">
          <h2 id="validation-heading">Every change is checked</h2>
          <p>
            GitHub Actions installs the locked dependencies, runs ESLint and
            Vitest, and creates a production build. The same checks run for pull
            requests and after changes reach <code>main</code>.
          </p>
          <div className={styles.command} aria-label="Continuous integration commands">
            <span>$ npm ci</span>
            <span>$ npm run lint</span>
            <span>$ npm run test:run</span>
            <span>$ npm run build</span>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="production-heading">
          <h2 id="production-heading">Production</h2>
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

        <section className={styles.section} aria-labelledby="preview-heading">
          <h2 id="preview-heading">Pull request previews</h2>
          <p>
            Each pull request is built with its own base path and published
            under <code>/previews/pr-&lt;number&gt;/</code>. A bot comments the URL
            on the pull request and removes the preview when the pull request
            closes.
          </p>
          <pre className={styles.pipeline} aria-label="Pull request preview flow">
            <code>{PREVIEW_FLOW}</code>
          </pre>
        </section>

        <section className={styles.section} aria-labelledby="shared-branch-heading">
          <h2 id="shared-branch-heading">One branch, serialized writes</h2>
          <p>
            Production and previews share <code>gh-pages</code>. Their workflows
            use one concurrency queue and non-force pushes, while production
            cleanup explicitly preserves <code>previews/</code>. That keeps a
            release and several active previews from overwriting one another.
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
