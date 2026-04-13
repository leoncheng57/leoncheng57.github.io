import { describe, expect, it } from 'vitest'
import { loadBlogPostsFromFiles } from './content'

describe('loadBlogPostsFromFiles', () => {
  it('parses markdown files into sorted posts and respects estimateTimeToRead', () => {
    const posts = loadBlogPostsFromFiles({
      '/src/content/blog/older-post.md': `---
title: "Older Post"
description: "An older entry."
publishedAt: "2026-04-10"
---

# Older Post

This post has enough words to produce a derived reading time from its body content.
`,
      '/src/content/blog/newer-post.md': `---
title: "Newer Post"
description: "A newer entry."
publishedAt: "2026-04-12"
estimateTimeToRead: 6
---

# Newer Post

Short body.
`,
    })

    expect(posts).toHaveLength(2)
    expect(posts.map((post) => post.slug)).toEqual(['newer-post', 'older-post'])
    expect(posts[0]).toMatchObject({
      title: 'Newer Post',
      slug: 'newer-post',
      readingTimeMinutes: 6,
    })
    expect(posts[1].readingTimeMinutes).toBeGreaterThan(0)
  })

  it('throws when required frontmatter fields are missing', () => {
    expect(() =>
      loadBlogPostsFromFiles({
        '/src/content/blog/broken-post.md': `---
title: "Broken Post"
publishedAt: "2026-04-10"
---

# Broken Post
`,
      })
    ).toThrow(/description/i)
  })
})
