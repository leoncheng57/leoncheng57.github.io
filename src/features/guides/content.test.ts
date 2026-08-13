import { describe, expect, it } from 'vitest'
import { getAllGuides, loadGuidesFromFiles } from './content'

describe('loadGuidesFromFiles', () => {
  it('parses guides and sorts them by last reviewed date', () => {
    const guides = loadGuidesFromFiles({
      '/src/content/guides/older-guide.md': `---
title: "Older Guide"
description: "An older reference."
updatedAt: "2026-04-10"
---

# Older Guide

This guide has enough words in its body to derive a reading time estimate.
`,
      '/src/content/guides/newer-guide.md': `---
title: "Newer Guide"
description: "A newer reference."
updatedAt: "2026-04-12"
estimateTimeToRead: 8
---

# Newer Guide

Short body.
`,
    })

    expect(guides.map((guide) => guide.slug)).toEqual(['newer-guide', 'older-guide'])
    expect(guides[0]).toMatchObject({ title: 'Newer Guide', readingTimeMinutes: 8 })
    expect(guides[1].readingTimeMinutes).toBeGreaterThan(0)
  })

  it('throws when the last reviewed date is missing', () => {
    expect(() =>
      loadGuidesFromFiles({
        '/src/content/guides/broken-guide.md': `---
title: "Broken Guide"
description: "Missing a review date."
---

# Broken Guide
`,
      })
    ).toThrow(/updatedAt/i)
  })

  it('keeps drafts out of the published list but resolvable by slug', () => {
    const guides = loadGuidesFromFiles({
      '/src/content/guides/draft-guide.md': `---
title: "Draft Guide"
description: "Hidden from the index."
updatedAt: "2026-04-13"
draft: true
---

# Draft Guide
`,
    })

    expect(guides).toHaveLength(1)
    expect(guides[0]).toMatchObject({ slug: 'draft-guide', draft: true })
  })

  it('parses the optional audience field and tag lists', () => {
    const guides = loadGuidesFromFiles({
      '/src/content/guides/audience-guide.md': `---
title: "Audience Guide"
description: "Has an audience note."
updatedAt: "2026-04-14"
audience: "Engineers running several agents at once."
tags:
  - AI
  - workflow
---

# Audience Guide
`,
    })

    expect(guides[0].audience).toBe('Engineers running several agents at once.')
    expect(guides[0].tags).toEqual(['AI', 'workflow'])
  })

  it('publishes every real guide with the required metadata', () => {
    const guides = getAllGuides()

    expect(guides.length).toBeGreaterThan(0)

    for (const guide of guides) {
      expect(guide.title).toBeTruthy()
      expect(guide.description).toBeTruthy()
      expect(guide.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(guide.tags.length).toBeLessThanOrEqual(3)
      expect(guide.content.length).toBeGreaterThan(0)
    }
  })
})
