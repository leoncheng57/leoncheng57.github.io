export interface Guide {
  slug: string
  title: string
  description: string
  /** Guides are living documents, so the last review date is the primary date. */
  updatedAt: string
  publishedAt?: string
  /** Short answer to "should I read this?", shown on the guides index. */
  audience?: string
  estimateTimeToRead?: number
  readingTimeMinutes: number
  tags: string[]
  draft?: boolean
  content: string
}

export interface GuideFrontmatter {
  title?: string
  description?: string
  updatedAt?: string
  publishedAt?: string
  audience?: string
  estimateTimeToRead?: number
  tags?: string[]
  draft?: boolean
}
