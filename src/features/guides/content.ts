import {
  assertRequiredFields,
  getSlugFromPath,
  parseFrontmatter,
  stripLeadingHeading,
} from '../../utils/frontmatter'
import { calculateReadingTime } from '../../utils/readingTime'
import type { Guide, GuideFrontmatter } from './types'

const guideModules = import.meta.glob('../../content/guides/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const REQUIRED_FIELDS: Array<keyof GuideFrontmatter> = [
  'title',
  'description',
  'updatedAt',
]

function parseGuide(path: string, rawContent: string): Guide {
  const { data: frontmatter, content } = parseFrontmatter<GuideFrontmatter>(rawContent)

  assertRequiredFields(frontmatter, REQUIRED_FIELDS, path)

  const normalizedContent = stripLeadingHeading(content)

  return {
    slug: getSlugFromPath(path),
    title: frontmatter.title!,
    description: frontmatter.description!,
    updatedAt: frontmatter.updatedAt!,
    publishedAt: frontmatter.publishedAt,
    audience: frontmatter.audience,
    estimateTimeToRead: frontmatter.estimateTimeToRead,
    readingTimeMinutes: frontmatter.estimateTimeToRead ?? calculateReadingTime(normalizedContent),
    tags: frontmatter.tags ?? [],
    draft: frontmatter.draft,
    content: normalizedContent,
  }
}

export function loadGuidesFromFiles(files: Record<string, string>): Guide[] {
  return Object.entries(files)
    .map(([path, rawContent]) => parseGuide(path, rawContent))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

function isPublished(guide: Guide): boolean {
  return !guide.draft
}

export function getAllGuides(): Guide[] {
  return loadGuidesFromFiles(guideModules).filter(isPublished)
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return loadGuidesFromFiles(guideModules).find((guide) => guide.slug === slug)
}
