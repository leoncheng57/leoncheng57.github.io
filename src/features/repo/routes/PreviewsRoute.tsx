import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../../../components/top-nav/TopNav'
import styles from '../repo.module.css'

const DEPLOY_FLOW = `PR #N: opened / updated
    |
    v
lint + tests
    |
    v
vite build --base=/previews/pr-N/
    |
    v
gh-pages:/previews/pr-N/
    |
    v
sticky comment on the PR:
leoncheng.dev/previews/pr-N/`

const TEARDOWN_FLOW = `PR #N: closed or merged
    |
    v
deploy an empty folder
to previews/pr-N/
    |
    v
directory removed,
preview URL stops resolving`

const BRANCH_LAYOUT = `gh-pages/
|-- index.html      <- production, base "/"
|-- 404.html  CNAME  .nojekyll
|-- assets/
+-- previews/       <- preserved by
    |                  production deploys
    |-- pr-86/
    |   |-- index.html
    |   |     base "/previews/pr-86/"
    |   +-- assets/
    +-- pr-87/
        +-- ...`

const WRITE_QUEUE = `main deploy    --+
PR #86 deploy  --+--> one queue:
PR #87 deploy  --+    gh-pages-deploy
                       |
                       v
              push -> rebase -> push
    every deployment lands, none clobbered`

export default function PreviewsRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.content}>
        <p className={styles.backLink}>
          <Link to="/repo">Back to Repo</Link>
        </p>

        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>Repo / previews</p>
          <h1>Pull request previews</h1>
          <p>
            Every pull request gets a disposable copy of the site on the
            production domain, so changes can be reviewed exactly as they will
            ship — no external hosting service involved.
          </p>
        </header>

        <section className={styles.section} aria-labelledby="lifecycle-heading">
          <h2 id="lifecycle-heading">Lifecycle</h2>
          <p>
            Opening or updating a pull request builds the site and publishes it
            under <code>/previews/pr-&lt;number&gt;/</code> on the{' '}
            <code>gh-pages</code> branch. A bot comments the URL on the pull
            request and keeps that comment updated for every commit.
          </p>
          <pre className={styles.pipeline} aria-label="Pull request preview flow">
            <code>{DEPLOY_FLOW}</code>
          </pre>
          <p>
            Closing the pull request tears the environment down again. The
            cleanup job deploys an empty folder over the preview directory,
            which deletes its contents from the branch.
          </p>
          <pre className={styles.pipeline} aria-label="Preview teardown flow">
            <code>{TEARDOWN_FLOW}</code>
          </pre>
        </section>

        <section className={styles.section} aria-labelledby="base-path-heading">
          <h2 id="base-path-heading">One build, different root</h2>
          <p>
            A preview is a normal production build with one difference: Vite is
            given the preview directory as its base path, so every generated
            script, stylesheet, and favicon URL is prefixed with{' '}
            <code>/previews/pr-&lt;number&gt;/</code>. The router picks the same
            value up at runtime through <code>import.meta.env.BASE_URL</code>,
            which keeps in-app navigation inside the preview.
          </p>
          <div className={styles.command} aria-label="Preview build command">
            <span>$ npx vite build --base=/previews/pr-N/</span>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="layout-heading">
          <h2 id="layout-heading">Where previews live</h2>
          <p>
            Production and every active preview are directories on one deploy
            branch. Production deploys clean the root but explicitly preserve{' '}
            <code>previews/</code>, so merging to <code>main</code> never wipes
            an open pull request&apos;s environment.
          </p>
          <pre className={styles.pipeline} aria-label="Deploy branch layout">
            <code>{BRANCH_LAYOUT}</code>
          </pre>
        </section>

        <section className={styles.section} aria-labelledby="queue-heading">
          <h2 id="queue-heading">Avoiding write races</h2>
          <p>
            Several workflows can target <code>gh-pages</code> at the same
            time. They share a single concurrency queue and push without force,
            rebasing onto whatever landed first — so a release and multiple
            preview deploys can interleave safely.
          </p>
          <pre className={styles.pipeline} aria-label="Serialized write queue">
            <code>{WRITE_QUEUE}</code>
          </pre>
        </section>

        <section className={styles.section} aria-labelledby="tradeoffs-heading">
          <h2 id="tradeoffs-heading">Deliberate trade-offs</h2>
          <p>
            Absolute asset paths inside a preview, like blog images, resolve to
            the production copies — only pull requests that add or change
            static assets notice. Previews for forked repositories are skipped
            because they run without write access. And previews are public:
            anything pushed to a pull request is visible on the preview URL.
          </p>
        </section>
      </main>
    </div>
  )
}
