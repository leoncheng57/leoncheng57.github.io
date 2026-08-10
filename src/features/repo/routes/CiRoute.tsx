import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../../../components/top-nav/TopNav'
import styles from '../repo.module.css'

export default function CiRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.content}>
        <p className={styles.backLink}>
          <Link to="/repo">Back to Repo</Link>
        </p>

        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>Repo / CI</p>
          <h1>CI checks</h1>
          <p>
            Every change is checked before it ships — the same way, every
            time, owned by the repository itself.
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

        <section className={styles.section} aria-labelledby="local-heading">
          <h2 id="local-heading">Identical locally</h2>
          <p>
            The workflow runs the package scripts directly, so the exact CI
            gate can be reproduced on any machine before pushing — no
            CI-specific configuration to drift out of sync.
          </p>
        </section>
      </main>
    </div>
  )
}
