import { getAllBlogPosts } from './content'
import { getAllGuides } from '../guides/content'
import { getSetupGuides } from '../guides/setupGuides'
import type { Guide } from '../guides/types'

export interface FeedEntry {
  href: string
  title: string
  description: string
  date: string
  kind: 'Post' | 'Guide'
  tags: string[]
  readingTimeMinutes?: number
  guide?: Pick<Guide, 'repoUrl' | 'repoAccess' | 'repoScope'>
}

export function getBlogFeed(): FeedEntry[] {
  const entries: FeedEntry[] = [
    ...getAllBlogPosts().map((post): FeedEntry => ({
      href: `/blog/${post.slug}`,
      title: post.title,
      description: post.description,
      date: post.publishedAt,
      kind: 'Post',
      tags: post.tags,
      readingTimeMinutes: post.readingTimeMinutes,
    })),
    ...[...getAllGuides(), ...getSetupGuides()].map((guide): FeedEntry => ({
      href: `/guides/${guide.slug}`,
      title: guide.title,
      description: guide.description,
      date: guide.updatedAt,
      kind: 'Guide',
      tags: guide.tags,
      readingTimeMinutes: guide.readingTimeMinutes,
      guide,
    })),
    {
      href: '/guides/opencode-remote-control',
      title: 'OpenCode Remote Control',
      description: 'Control local OpenCode sessions from your phone over a private tailnet. Interactive setup, daily commands, notifications, and troubleshooting.',
      date: '2026-08-13',
      kind: 'Guide',
      tags: ['opencode', 'setup'],
      guide: { repoUrl: 'https://github.com/leoncheng57/opencode-remote-control-and-notifications', repoAccess: 'public', repoScope: 'standalone' },
    },
  ]
  return entries.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))
}
