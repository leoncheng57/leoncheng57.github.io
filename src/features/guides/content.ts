import {
  assertRequiredFields,
  parseFrontmatter,
  stripLeadingHeading,
} from '../../utils/frontmatter'
import { calculateReadingTime } from '../../utils/readingTime'
import type {
  Guide,
  GuideChapter,
  GuideChapterFrontmatter,
  GuideFrontmatter,
} from './types'

/**
 * Each guide is a directory that behaves like a small standalone site:
 *
 *   src/content/guides/<guide-slug>/guide.md          landing page + metadata
 *   src/content/guides/<guide-slug>/01-<chapter>.md   ordered chapter pages
 *
 * The numeric filename prefix only controls ordering; the chapter URL slug is
 * the remainder of the filename.
 */
const guideModules = import.meta.glob('../../content/guides/*/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const GUIDE_FILE = 'guide.md'

const REQUIRED_FIELDS: Array<keyof GuideFrontmatter> = [
  'title',
  'description',
  'updatedAt',
]

interface ParsedPath {
  guideSlug: string
  fileName: string
}

function parsePath(path: string): ParsedPath | null {
  const segments = path.split('/')
  const fileName = segments.pop()
  const guideSlug = segments.pop()

  if (!fileName || !guideSlug) {
    return null
  }

  return { guideSlug, fileName }
}

function parseChapter(fileName: string, rawContent: string, path: string): GuideChapter {
  const { data: frontmatter, content } = parseFrontmatter<GuideChapterFrontmatter>(rawContent)

  assertRequiredFields(frontmatter, ['title'], path)

  const baseName = fileName.replace(/\.md$/, '')
  const orderMatch = baseName.match(/^(\d+)-(.+)$/)
  const normalizedContent = stripLeadingHeading(content)

  return {
    slug: orderMatch ? orderMatch[2] : baseName,
    title: frontmatter.title!,
    description: frontmatter.description,
    order: orderMatch ? Number(orderMatch[1]) : Number.MAX_SAFE_INTEGER,
    readingTimeMinutes: calculateReadingTime(normalizedContent),
    content: normalizedContent,
  }
}

export function loadGuidesFromFiles(files: Record<string, string>): Guide[] {
  const grouped = new Map<string, { guideFile?: { path: string; raw: string }; chapters: GuideChapter[] }>()

  for (const [path, rawContent] of Object.entries(files)) {
    const parsed = parsePath(path)
    if (!parsed) {
      continue
    }

    const entry = grouped.get(parsed.guideSlug) ?? { chapters: [] }

    if (parsed.fileName === GUIDE_FILE) {
      entry.guideFile = { path, raw: rawContent }
    } else {
      entry.chapters.push(parseChapter(parsed.fileName, rawContent, path))
    }

    grouped.set(parsed.guideSlug, entry)
  }

  const guides: Guide[] = []

  for (const [slug, entry] of grouped) {
    if (!entry.guideFile) {
      throw new Error(`Guide "${slug}" is missing a ${GUIDE_FILE} file`)
    }

    const { data: frontmatter, content } = parseFrontmatter<GuideFrontmatter>(entry.guideFile.raw)
    assertRequiredFields(frontmatter, REQUIRED_FIELDS, entry.guideFile.path)

    const overview = stripLeadingHeading(content)
    const chapters = entry.chapters.sort(
      (left, right) => left.order - right.order || left.title.localeCompare(right.title)
    )

    guides.push({
      slug,
      title: frontmatter.title!,
      description: frontmatter.description!,
      updatedAt: frontmatter.updatedAt!,
      publishedAt: frontmatter.publishedAt,
      audience: frontmatter.audience,
      tags: frontmatter.tags ?? [],
      draft: frontmatter.draft,
      overview,
      readingTimeMinutes:
        calculateReadingTime(overview) +
        chapters.reduce((total, chapter) => total + chapter.readingTimeMinutes, 0),
      chapters,
    })
  }

  return guides.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
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

export function getGuideChapter(
  guide: Guide,
  chapterSlug: string
): { chapter: GuideChapter; index: number } | undefined {
  const index = guide.chapters.findIndex((chapter) => chapter.slug === chapterSlug)
  return index === -1 ? undefined : { chapter: guide.chapters[index], index }
}
