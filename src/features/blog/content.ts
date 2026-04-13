import matter from 'gray-matter'
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

function parseBlogPost(path: string, rawContent: string): BlogPost {
  const { data, content } = matter(rawContent)
  const frontmatter = data as BlogPostFrontmatter

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
