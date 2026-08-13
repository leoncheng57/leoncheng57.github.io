import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../../../components/top-nav/TopNav'
import styles from '../repo.module.css'

const SUBPAGES = [
  {
    to: '/repo/ci',
    title: 'CI checks',
    description: 'Lint, tests, and a production build for every change.',
  },
  {
    to: '/repo/production',
    title: 'Production deploys',
    description: 'How merges to main reach leoncheng.dev.',
  },
  {
    to: '/repo/previews',
    title: 'Pull request previews',
    description: 'A disposable environment for every pull request, with diagrams.',
  },
  {
    to: '/repo/planning',
    title: 'Project planning',
    description: 'The open GitHub issues currently on the backlog.',
  },
  {
    to: '/repo/google-analytics',
    title: 'Google Analytics',
    description: 'The site-wide GA4 setup and how to verify page views.',
  },
  {
    to: '/repo/alpha-projs',
    title: 'Alpha Projs',
    description: 'Early projects and experiments still taking shape.',
  },
]

export default function RepoRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.content}>
        <p className={styles.backLink}>
          <Link to="/">Back home</Link>
        </p>

        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>How this site ships</p>
          <h1>Repo</h1>
          <p>
            A small Vite and React site with repository-owned validation,
            production releases, and a disposable environment for every pull
            request. Each part of the pipeline has its own page.
          </p>
        </header>

        <nav aria-label="Repo pages" className={styles.cardList}>
          {SUBPAGES.map((subpage) => (
            <Link key={subpage.to} to={subpage.to} className={styles.card}>
              <h2>{subpage.title}</h2>
              <p>{subpage.description}</p>
            </Link>
          ))}
        </nav>

        <p className={styles.footnote}>
          The source and workflows live in{' '}
          <a href="https://github.com/leoncheng57/leoncheng57.github.io">
            leoncheng57/leoncheng57.github.io
          </a>
          .
        </p>
      </main>
    </div>
  )
}
