import {
  assertRequiredFields,
  getSlugFromPath,
  parseFrontmatter,
  stripLeadingHeading,
} from '../../utils/frontmatter'
import { calculateReadingTime } from '../../utils/readingTime'
import type { BlogPost, BlogPostFrontmatter } from './types'

const blogPostModules = import.meta.glob('../../content/blog/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const REQUIRED_FIELDS: Array<keyof BlogPostFrontmatter> = [
  'title',
  'description',
  'publishedAt',
]

function parseBlogPost(path: string, rawContent: string): BlogPost {
  const { data: frontmatter, content } = parseFrontmatter<BlogPostFrontmatter>(rawContent)

  assertRequiredFields(frontmatter, REQUIRED_FIELDS, path)

  const normalizedContent = stripLeadingHeading(content)

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
    draft: frontmatter.draft,
    content: normalizedContent,
  }
}

export function loadBlogPostsFromFiles(files: Record<string, string>): BlogPost[] {
  return Object.entries(files)
    .map(([path, rawContent]) => parseBlogPost(path, rawContent))
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
}

function isPublished(post: BlogPost): boolean {
  return !post.draft
}

export function getAllBlogPosts(): BlogPost[] {
  return loadBlogPostsFromFiles(blogPostModules).filter(isPublished)
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return loadBlogPostsFromFiles(blogPostModules).find((post) => post.slug === slug)
}
