import { calculateReadingTime } from './utils/readingTime'
import type { BlogPost, BlogPostFrontmatter } from './types'

const blogPostModules = import.meta.glob('../../content/blog/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

function getSlugFromPath(path: string): string {
  return path.split('/').pop()?.replace(/\.md$/, '') ?? ''
}

function assertRequiredFields(frontmatter: BlogPostFrontmatter, path: string): void {
  const requiredFields: Array<keyof BlogPostFrontmatter> = ['title', 'description', 'publishedAt']

  for (const field of requiredFields) {
    if (!frontmatter[field]) {
      throw new Error(`Missing required frontmatter field "${field}" in ${path}`)
    }
  }
}

function parseScalarValue(rawValue: string): string | number | boolean {
  const trimmedValue = rawValue.trim()

  if (
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))
  ) {
    return trimmedValue.slice(1, -1)
  }

  if (trimmedValue === 'true') {
    return true
  }

  if (trimmedValue === 'false') {
    return false
  }

  const numericValue = Number(trimmedValue)
  if (!Number.isNaN(numericValue) && trimmedValue !== '') {
    return numericValue
  }

  return trimmedValue
}

function parseFrontmatter(rawContent: string): {
  data: BlogPostFrontmatter
  content: string
} {
  if (!rawContent.startsWith('---\n')) {
    return {
      data: {},
      content: rawContent,
    }
  }

  const frontmatterEnd = rawContent.indexOf('\n---\n')
  if (frontmatterEnd === -1) {
    return {
      data: {},
      content: rawContent,
    }
  }

  const frontmatterBlock = rawContent.slice(4, frontmatterEnd)
  const content = rawContent.slice(frontmatterEnd + 5)
  const data: Record<string, unknown> = {}
  const lines = frontmatterBlock.split('\n')

  let currentArrayKey: string | null = null

  for (const line of lines) {
    if (!line.trim()) {
      continue
    }

    const arrayItemMatch = line.match(/^\s*-\s+(.*)$/)
    if (arrayItemMatch && currentArrayKey) {
      const currentValue = data[currentArrayKey]
      if (Array.isArray(currentValue)) {
        currentValue.push(String(parseScalarValue(arrayItemMatch[1])))
      }
      continue
    }

    const keyValueMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!keyValueMatch) {
      currentArrayKey = null
      continue
    }

    const [, key, rawValue] = keyValueMatch

    if (rawValue === '') {
      data[key] = []
      currentArrayKey = key
      continue
    }

    data[key] = parseScalarValue(rawValue)
    currentArrayKey = null
  }

  return {
    data: data as BlogPostFrontmatter,
    content,
  }
}

function parseBlogPost(path: string, rawContent: string): BlogPost {
  const { data: frontmatter, content } = parseFrontmatter(rawContent)

  assertRequiredFields(frontmatter, path)

  const normalizedContent = content.replace(/^\s*#\s+.+?\n+/, '')

  return {
    slug: getSlugFromPath(path),
    title: frontmatter.title!,
    description: frontmatter.description!,
    publishedAt: frontmatter.publishedAt!,
    updatedAt: frontmatter.updatedAt,
    estimateTimeToRead: frontmatter.estimateTimeToRead,
    readingTimeMinutes: frontmatter.estimateTimeToRead ?? calculateReadingTime(normalizedContent),
    tags: frontmatter.tags ?? [],
    heroImage: frontmatter.heroImage,
    content: normalizedContent,
  }
}

export function loadBlogPostsFromFiles(files: Record<string, string>): BlogPost[] {
  return Object.entries(files)
    .map(([path, rawContent]) => parseBlogPost(path, rawContent))
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
}

export function getAllBlogPosts(): BlogPost[] {
  return loadBlogPostsFromFiles(blogPostModules)
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return getAllBlogPosts().find((post) => post.slug === slug)
}
