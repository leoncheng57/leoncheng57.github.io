export interface BlogPost {
  slug: string
  title: string
  description: string
  publishedAt: string
  updatedAt?: string
  estimateTimeToRead?: number
  readingTimeMinutes: number
  tags: string[]
  heroImage?: string
  draft?: boolean
  content: string
}

export interface BlogPostFrontmatter {
  title?: string
  description?: string
  publishedAt?: string
  updatedAt?: string
  estimateTimeToRead?: number
  tags?: string[]
  heroImage?: string
  draft?: boolean
}
