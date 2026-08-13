export interface GuideChapter {
  slug: string
  title: string
  description?: string
  /** Sort position, taken from the `NN-` filename prefix. */
  order: number
  readingTimeMinutes: number
  content: string
}

export interface Guide {
  slug: string
  title: string
  description: string
  /** Guides are living documents, so the last review date is the primary date. */
  updatedAt: string
  publishedAt?: string
  /** Short answer to "should I read this?", shown on the guides index. */
  audience?: string
  tags: string[]
  draft?: boolean
  /** Landing-page body, from the guide's `guide.md` file. */
  overview: string
  /** Reading time for the overview plus every chapter. */
  readingTimeMinutes: number
  chapters: GuideChapter[]
}

export interface GuideFrontmatter {
  title?: string
  description?: string
  updatedAt?: string
  publishedAt?: string
  audience?: string
  tags?: string[]
  draft?: boolean
}

export interface GuideChapterFrontmatter {
  title?: string
  description?: string
}
