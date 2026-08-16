import { useEffect, useState } from 'react'
import type { CSSProperties, ReactElement } from 'react'
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

export interface LabelSummary {
  name: string
  color: string
}

export interface PlanningItem {
  id: number
  number: number
  title: string
  url: string
  description: string
  labels: LabelSummary[]
  isPullRequest: boolean
  comments: number
  createdAt: string
  updatedAt: string
  priority: Priority
}

interface GitHubIssue {
  id: number
  number: number
  title: string
  html_url: string
  body?: string | null
  pull_request?: unknown
  labels?: Array<{ name?: string; color?: string }>
  comments?: number
  created_at?: string
  updated_at?: string
}

const DESCRIPTION_PREVIEW_MAX = 240

export function toDescriptionPreview(body: string | null | undefined): string {
  if (!body) return ''

  const text = body
    // Code fences and inline code.
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    // Images (markdown + HTML), then markdown links -> keep link text.
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Any remaining HTML tags.
    .replace(/<[^>]+>/g, ' ')
    // Heading, blockquote, and list markers at line starts.
    .replace(/^\s{0,3}(?:#{1,6}\s+|>\s?|[-*+]\s+|\d+[.)]\s+)/gm, '')
    // Emphasis markers.
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1')
    // Collapse all whitespace.
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= DESCRIPTION_PREVIEW_MAX) return text
  return `${text.slice(0, DESCRIPTION_PREVIEW_MAX).trimEnd()}…`
}

export function parsePlanningItems(payload: unknown): PlanningItem[] {
  if (!Array.isArray(payload)) return []

  return (payload as GitHubIssue[]).map((item) => {
    const labels: LabelSummary[] = (item.labels ?? [])
      .map((label) => ({ name: label.name ?? '', color: label.color ?? '' }))
      .filter((label) => label.name)
    const priority =
      labels
        .map((label) => PRIORITY_LABELS[label.name])
        .find(Boolean) ?? 'none'

    return {
      id: item.id,
      number: item.number,
      title: item.title,
      url: item.html_url,
      description: toDescriptionPreview(item.body),
      labels: labels.filter((label) => !(label.name in PRIORITY_LABELS)),
      isPullRequest: Boolean(item.pull_request),
      comments: item.comments ?? 0,
      createdAt: item.created_at ?? '',
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
  }))
}

const DAY_MS = 24 * 60 * 60 * 1000

export function formatRelativeDays(
  iso: string,
  now: number = Date.now()
): string {
  const timestamp = Date.parse(iso)
  if (Number.isNaN(timestamp)) return ''

  const days = Math.max(0, Math.floor((now - timestamp) / DAY_MS))
  return days === 0 ? 'today' : `${days}d ago`
}

export function pickLabelTextColor(hexColor: string): string {
  const match = /^[0-9a-f]{6}$/i.exec(hexColor)
  if (!match) return 'inherit'

  const red = parseInt(hexColor.slice(0, 2), 16)
  const green = parseInt(hexColor.slice(2, 4), 16)
  const blue = parseInt(hexColor.slice(4, 6), 16)
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255

  return luminance > 0.55 ? '#1c2733' : '#ffffff'
}

function labelPillStyle(color: string): CSSProperties | undefined {
  if (!/^[0-9a-f]{6}$/i.test(color)) return undefined
  return {
    backgroundColor: `#${color}`,
    color: pickLabelTextColor(color),
  }
}

function ItemTypeIcon({ isPullRequest }: { isPullRequest: boolean }): ReactElement {
  return isPullRequest ? (
    <svg
      className={styles.itemTypeIcon}
      viewBox="0 0 16 16"
      aria-label="Pull request"
      role="img"
    >
      <circle cx="4" cy="3" r="2" />
      <circle cx="4" cy="13" r="2" />
      <circle cx="12" cy="13" r="2" />
      <path d="M4 5v6M10 3h1a1 1 0 0 1 1 1v7M8 5l2-2-2-2" />
    </svg>
  ) : (
    <svg
      className={styles.itemTypeIcon}
      viewBox="0 0 16 16"
      aria-label="Issue"
      role="img"
    >
      <circle cx="8" cy="8" r="6" />
      <circle cx="8" cy="8" r="1" className={styles.itemTypeIconDot} />
    </svg>
  )
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
          {group.items.length === 0 ? (
            <p className={styles.priorityEmpty}>Nothing here yet.</p>
          ) : (
            <ul className={styles.issueList} aria-label={group.heading}>
              {group.items.map((item) => (
                <li key={item.id} className={styles.issueItem}>
                  <span className={styles.issueRow}>
                    <a href={item.url}>
                      <span className={styles.issueIdentity}>
                        <ItemTypeIcon isPullRequest={item.isPullRequest} />
                        <span className={styles.issueNumber}>#{item.number}</span>
                      </span>{' '}
                      <strong className={styles.issueTitle}>{item.title}</strong>
                    </a>
                    {item.labels.length > 0 && (
                      <span className={styles.issueLabels}>
                        {item.labels.map((label) => (
                          <span
                            key={label.name}
                            className={styles.issueLabel}
                            style={labelPillStyle(label.color)}
                          >
                            {label.name}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                  {item.description && (
                    <p className={styles.issueDescription}>{item.description}</p>
                  )}
                  <span className={styles.issueMeta}>
                    <span>
                      {item.comments === 1
                        ? '1 comment'
                        : `${item.comments} comments`}
                      {formatRelativeDays(item.createdAt) && (
                        <> · opened {formatRelativeDays(item.createdAt)}</>
                      )}
                    </span>
                    {formatRelativeDays(item.updatedAt) && (
                      <span className={styles.issueMetaRight}>
                        active {formatRelativeDays(item.updatedAt)}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}
