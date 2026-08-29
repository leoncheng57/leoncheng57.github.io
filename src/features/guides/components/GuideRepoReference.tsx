import type { ReactElement } from 'react'
import styles from '../guides-index.module.css'
import type { Guide } from '../types'

interface GuideRepoReferenceProps {
  repoUrl?: Guide['repoUrl']
  repoAccess?: Guide['repoAccess']
  repoScope?: Guide['repoScope']
}

export interface GitHubRepoReference {
  name: string
  selfOwned: boolean
}

const RESERVED_OWNERS = new Set([
  'about',
  'apps',
  'collections',
  'customer-stories',
  'enterprise',
  'events',
  'explore',
  'features',
  'issues',
  'marketplace',
  'new',
  'notifications',
  'orgs',
  'pricing',
  'pulls',
  'search',
  'security',
  'settings',
  'sponsors',
  'topics',
  'trending',
  'user-attachments',
])

export function parseGitHubRepoUrl(repoUrl?: string): GitHubRepoReference | null {
  if (!repoUrl) {
    return null
  }

  try {
    const url = new URL(repoUrl)
    const segments = url.pathname.split('/').filter(Boolean)
    const [owner, repo, suffix] = segments

    if (
      url.protocol !== 'https:' ||
      url.hostname.toLowerCase() !== 'github.com' ||
      !owner ||
      !repo ||
      RESERVED_OWNERS.has(owner.toLowerCase()) ||
      (segments.length > 2 && suffix !== 'tree')
    ) {
      return null
    }

    return {
      name: `${owner}/${repo}`,
      selfOwned: owner.toLowerCase() === 'leoncheng57',
    }
  } catch {
    return null
  }
}

export default function GuideRepoReference({
  repoUrl,
  repoAccess,
  repoScope,
}: GuideRepoReferenceProps): ReactElement | null {
  const repo = parseGitHubRepoUrl(repoUrl)
  if (!repo) {
    return null
  }

  return (
    <div className={styles.repoRow} aria-label="Guide repository">
      <span className={styles.repoKind}>
        {repoScope === 'this-site' ? 'SOURCE IN THIS REPO' : 'PROJECT REPO'}
      </span>
      <a
        className={styles.repoLink}
        href={repoUrl}
        aria-label={`GitHub repository ${repo.name}`}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M8 .2a8 8 0 0 0-2.5 15.6c.4.1.5-.2.5-.4v-1.5c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.1-.9-1.1-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4A3.1 3.1 0 0 1 3.7 6c-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8a7.7 7.7 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.5 1.1.2 1.9.1 2.1a3.1 3.1 0 0 1 .8 2.2c0 3.1-1.9 3.8-3.6 4 .3.2.5.7.5 1.4v1.8c0 .2.1.5.5.4A8 8 0 0 0 8 .2Z"
          />
        </svg>
        <span>{repo.name}</span>
        <span aria-hidden="true">↗</span>
      </a>
      {repo.selfOwned ? <span className={styles.repoOwner}>AUTHOR-OWNED</span> : null}
      {repoAccess === 'private' ? (
        <span className={styles.repoPrivate}>PRIVATE ACCESS</span>
      ) : null}
    </div>
  )
}
