import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import styles from '../repo.module.css'

const ISSUES_API_URL =
  'https://api.github.com/repos/leoncheng57/leoncheng57.github.io/issues?state=open&per_page=30'
const ISSUES_PAGE_URL =
  'https://github.com/leoncheng57/leoncheng57.github.io/issues'

interface IssueSummary {
  id: number
  number: number
  title: string
  url: string
  labels: string[]
}

interface GitHubIssue {
  id: number
  number: number
  title: string
  html_url: string
  pull_request?: unknown
  labels?: Array<{ name?: string }>
}

export function parseOpenIssues(payload: unknown): IssueSummary[] {
  if (!Array.isArray(payload)) return []

  return (payload as GitHubIssue[])
    .filter((item) => !item.pull_request)
    .map((item) => ({
      id: item.id,
      number: item.number,
      title: item.title,
      url: item.html_url,
      labels: (item.labels ?? [])
        .map((label) => label.name ?? '')
        .filter(Boolean),
    }))
}

type LoadState = 'loading' | 'error' | 'ready'

export default function OpenIssues(): ReactElement {
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [issues, setIssues] = useState<IssueSummary[]>([])

  useEffect(() => {
    const controller = new AbortController()

    async function loadIssues(): Promise<void> {
      try {
        const response = await fetch(ISSUES_API_URL, {
          signal: controller.signal,
          headers: { Accept: 'application/vnd.github+json' },
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const payload: unknown = await response.json()
        setIssues(parseOpenIssues(payload))
        setLoadState('ready')
      } catch {
        if (!controller.signal.aborted) setLoadState('error')
      }
    }

    void loadIssues()
    return () => controller.abort()
  }, [])

  if (loadState === 'loading') {
    return <p className={styles.issuesStatus}>Loading open issues…</p>
  }

  if (loadState === 'error') {
    return (
      <p className={styles.issuesStatus}>
        Could not load issues right now. See the{' '}
        <a href={ISSUES_PAGE_URL}>issue tracker on GitHub</a>.
      </p>
    )
  }

  if (issues.length === 0) {
    return <p className={styles.issuesStatus}>No open issues — the backlog is clear.</p>
  }

  return (
    <ul className={styles.issueList} aria-label="Open GitHub issues">
      {issues.map((issue) => (
        <li key={issue.id} className={styles.issueItem}>
          <a href={issue.url}>
            <span className={styles.issueNumber}>#{issue.number}</span>{' '}
            {issue.title}
          </a>
          {issue.labels.length > 0 && (
            <span className={styles.issueLabels}>
              {issue.labels.map((label) => (
                <span key={label} className={styles.issueLabel}>
                  {label}
                </span>
              ))}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
