import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import styles from '../repo.module.css'

const ISSUES_API_URL =
  'https://api.github.com/repos/leoncheng57/leoncheng57.github.io/issues?state=open&per_page=30'
const ISSUES_PAGE_URL =
  'https://github.com/leoncheng57/leoncheng57.github.io/issues'

export type Priority = 'high' | 'medium' | 'low' | 'none'

const PRIORITY_LABELS: Record<string, Priority> = {
  'prio:high': 'high',
  'prio:medium': 'medium',
  'prio:low': 'low',
}

export interface PlanningItem {
  id: number
  number: number
  title: string
  url: string
  labels: string[]
  isPullRequest: boolean
  comments: number
  updatedAt: string
  priority: Priority
}

interface GitHubIssue {
  id: number
  number: number
  title: string
  html_url: string
  pull_request?: unknown
  labels?: Array<{ name?: string }>
  comments?: number
  updated_at?: string
}

export function parsePlanningItems(payload: unknown): PlanningItem[] {
  if (!Array.isArray(payload)) return []

  return (payload as GitHubIssue[]).map((item) => {
    const labels = (item.labels ?? [])
      .map((label) => label.name ?? '')
      .filter(Boolean)
    const priority =
      labels.map((label) => PRIORITY_LABELS[label]).find(Boolean) ?? 'none'

    return {
      id: item.id,
      number: item.number,
      title: item.title,
      url: item.html_url,
      labels: labels.filter((label) => !(label in PRIORITY_LABELS)),
      isPullRequest: Boolean(item.pull_request),
      comments: item.comments ?? 0,
      updatedAt: item.updated_at ?? '',
      priority,
    }
  })
}

interface PriorityGroup {
  priority: Priority
  heading: string
  items: PlanningItem[]
}

const PRIORITY_ORDER: Array<Pick<PriorityGroup, 'priority' | 'heading'>> = [
  { priority: 'high', heading: 'High priority' },
  { priority: 'medium', heading: 'Medium priority' },
  { priority: 'low', heading: 'Low priority' },
  { priority: 'none', heading: 'Unprioritized' },
]

export function groupByPriority(items: PlanningItem[]): PriorityGroup[] {
  return PRIORITY_ORDER.map(({ priority, heading }) => ({
    priority,
    heading,
    items: items.filter((item) => item.priority === priority),
  })).filter((group) => group.items.length > 0)
}

export function formatLastActivity(updatedAt: string): string {
  const timestamp = Date.parse(updatedAt)
  if (Number.isNaN(timestamp)) return ''

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

type LoadState = 'loading' | 'error' | 'ready'

const PRIORITY_BADGE_CLASS: Record<Priority, string> = {
  high: 'priorityHigh',
  medium: 'priorityMedium',
  low: 'priorityLow',
  none: 'priorityNone',
}

export default function OpenIssues(): ReactElement {
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [items, setItems] = useState<PlanningItem[]>([])

  useEffect(() => {
    const controller = new AbortController()

    async function loadItems(): Promise<void> {
      try {
        const response = await fetch(ISSUES_API_URL, {
          signal: controller.signal,
          headers: { Accept: 'application/vnd.github+json' },
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const payload: unknown = await response.json()
        setItems(parsePlanningItems(payload))
        setLoadState('ready')
      } catch {
        if (!controller.signal.aborted) setLoadState('error')
      }
    }

    void loadItems()
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

  if (items.length === 0) {
    return (
      <p className={styles.issuesStatus}>No open issues — the backlog is clear.</p>
    )
  }

  const groups = groupByPriority(items)

  return (
    <div className={styles.priorityGroups} aria-label="Open GitHub issues">
      {groups.map((group) => (
        <section key={group.priority} className={styles.priorityGroup}>
          <h3 className={styles.priorityHeading}>
            <span
              className={`${styles.priorityBadge} ${styles[PRIORITY_BADGE_CLASS[group.priority]]}`}
            >
              {group.heading}
            </span>
            <span className={styles.priorityCount}>{group.items.length}</span>
          </h3>
          <ul className={styles.issueList} aria-label={group.heading}>
            {group.items.map((item) => (
              <li key={item.id} className={styles.issueItem}>
                <span className={styles.issueRow}>
                  <a href={item.url}>
                    <span className={styles.issueNumber}>#{item.number}</span>{' '}
                    {item.title}
                  </a>
                  {item.isPullRequest && (
                    <span className={styles.prBadge}>PR</span>
                  )}
                  {item.labels.length > 0 && (
                    <span className={styles.issueLabels}>
                      {item.labels.map((label) => (
                        <span key={label} className={styles.issueLabel}>
                          {label}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
                <span className={styles.issueMeta}>
                  {item.comments === 1
                    ? '1 comment'
                    : `${item.comments} comments`}
                  {formatLastActivity(item.updatedAt) && (
                    <> · last activity {formatLastActivity(item.updatedAt)}</>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
