import { useDeferredValue, useEffect, useState } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import styles from '../repo.module.css'

const REPO_URL = 'https://github.com/leoncheng57/leoncheng57.github.io'
const ISSUES_API_URL = `${REPO_URL}/issues?state=open&per_page=30`.replace(
  'github.com',
  'api.github.com/repos'
)
const ISSUES_PAGE_URL = `${REPO_URL}/issues`

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

export interface LinkedItem {
  number: number
  type: 'issue' | 'pull request'
  url: string
}

export interface PlanningItem {
  id: number
  number: number
  title: string
  url: string
  description: string
  descriptionPreview: string
  linkedItems: LinkedItem[]
  labels: LabelSummary[]
  filterLabels: string[]
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

export function toPlainDescription(body: string | null | undefined): string {
  if (!body) return ''

  return body
    .replace(/```(?:\w+)?/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}(?:#{1,6}\s+|>\s?|[-*+]\s+|\d+[.)]\s+)/gm, '')
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

export function toDescriptionPreview(body: string | null | undefined): string {
  const text = toPlainDescription(body)
  if (text.length <= DESCRIPTION_PREVIEW_MAX) return text
  return `${text.slice(0, DESCRIPTION_PREVIEW_MAX).trimEnd()}…`
}

const REPO_ITEM_URL_RE =
  /https:\/\/github\.com\/leoncheng57\/leoncheng57\.github\.io\/(issues|pull)\/(\d+)/g
const LOCAL_REFERENCE_RE = /(?:^|[\s(])#(\d+)\b/g

export function extractLinkedItems(
  body: string | null | undefined,
  ownNumber: number
): LinkedItem[] {
  if (!body) return []

  const linked = new Map<number, LinkedItem>()
  for (const match of body.matchAll(REPO_ITEM_URL_RE)) {
    const number = Number(match[2])
    if (number === ownNumber) continue
    const type = match[1] === 'pull' ? 'pull request' : 'issue'
    linked.set(number, {
      number,
      type,
      url: `${REPO_URL}/${match[1]}/${number}`,
    })
  }
  for (const match of body.matchAll(LOCAL_REFERENCE_RE)) {
    const number = Number(match[1])
    if (number === ownNumber || linked.has(number)) continue
    linked.set(number, {
      number,
      type: 'issue',
      url: `${REPO_URL}/issues/${number}`,
    })
  }
  return [...linked.values()]
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
      description: toPlainDescription(item.body),
      descriptionPreview: toDescriptionPreview(item.body),
      linkedItems: extractLinkedItems(item.body, item.number),
      labels: labels.filter((label) => !(label.name in PRIORITY_LABELS)),
      filterLabels: labels.map((label) => label.name),
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

function daysSince(iso: string, now: number): number | null {
  const timestamp = Date.parse(iso)
  if (Number.isNaN(timestamp)) return null
  return Math.max(0, Math.floor((now - timestamp) / DAY_MS))
}

export function formatRelativeDays(
  iso: string,
  now: number = Date.now()
): string {
  const days = daysSince(iso, now)
  if (days === null) return ''
  return days === 0 ? 'today' : `${days}d ago`
}

export function formatActiveDays(
  iso: string,
  now: number = Date.now()
): string {
  const days = daysSince(iso, now)
  if (days === null) return ''
  return `${days} ${days === 1 ? 'day' : 'days'} ago`
}

export function pickLabelTextColor(hexColor: string): string {
  if (!/^[0-9a-f]{6}$/i.test(hexColor)) return 'inherit'
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
      className={`${styles.itemTypeIcon} ${styles.pullRequestIcon}`}
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
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [expandedItems, setExpandedItems] = useState<number[]>([])

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

  const availableLabels = [
    ...new Set(items.flatMap((item) => item.filterLabels)),
  ].sort()
  const normalizedQuery = deferredQuery.trim().toLowerCase()
  const filteredItems = items.filter((item) => {
    const matchesText =
      !normalizedQuery ||
      `${item.number} ${item.title} ${item.description}`
        .toLowerCase()
        .includes(normalizedQuery)
    const itemLabels = new Set(item.filterLabels)
    return (
      matchesText && selectedLabels.every((label) => itemLabels.has(label))
    )
  })

  function toggleLabel(label: string): void {
    setSelectedLabels((current) =>
      current.includes(label)
        ? current.filter((value) => value !== label)
        : [...current, label]
    )
  }

  function toggleExpanded(id: number): void {
    setExpandedItems((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    )
  }

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

  const groups = groupByPriority(filteredItems)

  return (
    <div className={styles.priorityGroups} aria-label="Open GitHub issues">
      <section className={styles.issueFilters} aria-labelledby="issue-filters-heading">
        <h3 id="issue-filters-heading">Filters and searches</h3>
        <label className={styles.issueSearchLabel}>
          Search title, number, or description
          <input
            className={styles.issueSearchInput}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search issues and pull requests…"
          />
        </label>
        <fieldset className={styles.issueLabelFilters}>
          <legend>Filter by labels (select multiple)</legend>
          <span className={styles.issueLabelFilterOptions}>
            {availableLabels.map((label) => (
              <label key={label} className={styles.issueLabelFilter}>
                <input
                  type="checkbox"
                  checked={selectedLabels.includes(label)}
                  onChange={() => toggleLabel(label)}
                />
                {label}
              </label>
            ))}
          </span>
        </fieldset>
        {(query || selectedLabels.length > 0) && (
          <button
            type="button"
            className={styles.clearIssueFilters}
            onClick={() => {
              setQuery('')
              setSelectedLabels([])
            }}
          >
            Clear filters
          </button>
        )}
        <p className={styles.issueFilterCount} aria-live="polite">
          Showing {filteredItems.length} of {items.length} open items
        </p>
      </section>

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
              {group.items.map((item) => {
                const expanded = expandedItems.includes(item.id)
                return (
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
                      <>
                        <p
                          className={`${styles.issueDescription} ${
                            expanded ? styles.issueDescriptionExpanded : ''
                          }`}
                        >
                          {expanded
                            ? item.description
                            : item.descriptionPreview}
                        </p>
                        <button
                          type="button"
                          className={styles.issueDescriptionToggle}
                          aria-expanded={expanded}
                          onClick={() => toggleExpanded(item.id)}
                        >
                          {expanded ? 'Show less' : 'See more...'}
                        </button>
                      </>
                    )}

                    {item.linkedItems.length > 0 && (
                      <span className={styles.linkedItems}>
                        <strong>Related:</strong>{' '}
                        {item.linkedItems.map((linked, index) => (
                          <span key={`${linked.type}-${linked.number}`}>
                            {index > 0 && ', '}
                            <a href={linked.url}>
                              {linked.type === 'pull request' ? 'PR' : 'issue'} #{linked.number}
                            </a>
                          </span>
                        ))}
                      </span>
                    )}

                    <span className={styles.issueMeta}>
                      <span>
                        {item.comments === 1
                          ? '1 comment'
                          : `${item.comments} comments`}
                      </span>
                      <span className={styles.issueMetaRight}>
                        {formatRelativeDays(item.createdAt) && (
                          <span>opened {formatRelativeDays(item.createdAt)}</span>
                        )}
                        {formatActiveDays(item.updatedAt) && (
                          <span>active {formatActiveDays(item.updatedAt)}</span>
                        )}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}
