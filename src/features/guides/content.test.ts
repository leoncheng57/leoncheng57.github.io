import { describe, expect, it } from 'vitest'
import { getAllGuides, getGuideChapter, loadGuidesFromFiles } from './content'

const GUIDE_FILE = `---
title: "Sample Guide"
description: "A sample reference."
updatedAt: "2026-04-12"
audience: "Engineers trying the pattern."
tags:
  - AI
  - workflow
---

# Sample Guide

Overview body for the sample guide.
`

describe('loadGuidesFromFiles', () => {
  it('builds a guide from its directory and orders chapters by filename prefix', () => {
    const guides = loadGuidesFromFiles({
      '/src/content/guides/sample/guide.md': GUIDE_FILE,
      '/src/content/guides/sample/02-second.md': `---
title: "Second Chapter"
---

# Second Chapter

Second body.
`,
      '/src/content/guides/sample/01-first.md': `---
title: "First Chapter"
description: "Where to start."
---

# First Chapter

First body.
`,
    })

    expect(guides).toHaveLength(1)

    const guide = guides[0]
    expect(guide.slug).toBe('sample')
    expect(guide.title).toBe('Sample Guide')
    expect(guide.audience).toBe('Engineers trying the pattern.')
    expect(guide.tags).toEqual(['AI', 'workflow'])
    expect(guide.overview).toContain('Overview body')
    expect(guide.chapters.map((chapter) => chapter.slug)).toEqual(['first', 'second'])
    expect(guide.chapters[0].description).toBe('Where to start.')
    expect(guide.readingTimeMinutes).toBeGreaterThan(0)
  })

  it('sorts guides by last reviewed date', () => {
    const guides = loadGuidesFromFiles({
      '/src/content/guides/older/guide.md': GUIDE_FILE.replace('2026-04-12', '2026-04-10'),
      '/src/content/guides/newer/guide.md': GUIDE_FILE.replace('2026-04-12', '2026-04-14'),
    })

    expect(guides.map((guide) => guide.slug)).toEqual(['newer', 'older'])
  })

  it('throws when a guide directory has no guide.md', () => {
    expect(() =>
      loadGuidesFromFiles({
        '/src/content/guides/broken/01-first.md': `---
title: "Orphan Chapter"
---

# Orphan Chapter
`,
      })
    ).toThrow(/guide\.md/i)
  })

  it('throws when the last reviewed date is missing', () => {
    expect(() =>
      loadGuidesFromFiles({
        '/src/content/guides/broken/guide.md': `---
title: "Broken Guide"
description: "Missing a review date."
---

# Broken Guide
`,
      })
    ).toThrow(/updatedAt/i)
  })

  it('keeps drafts out of the published list', () => {
    const guides = loadGuidesFromFiles({
      '/src/content/guides/draft/guide.md': `---
title: "Draft Guide"
description: "Hidden from the index."
updatedAt: "2026-04-13"
draft: true
---

# Draft Guide
`,
    })

    expect(guides[0]).toMatchObject({ slug: 'draft', draft: true })
  })

  it('passes the beta frontmatter flag through to guides', () => {
    const [guide] = loadGuidesFromFiles({
      '/src/content/guides/beta/guide.md': GUIDE_FILE.replace(
        'tags:',
        'beta: true\ntags:'
      ),
    })

    expect(guide.beta).toBe(true)
  })

  it('passes the beta frontmatter flag through to chapters', () => {
    const [guide] = loadGuidesFromFiles({
      '/src/content/guides/sample/guide.md': GUIDE_FILE,
      '/src/content/guides/sample/01-stable.md': `---
title: "Stable Chapter"
---

# Stable Chapter

Stable body.
`,
      '/src/content/guides/sample/02-experimental.md': `---
title: "Experimental Chapter"
beta: true
---

# Experimental Chapter

Experimental body.
`,
    })

    expect(guide.chapters[0].beta).toBeUndefined()
    expect(guide.chapters[1].beta).toBe(true)
  })

  it('flags the watch-the-run chapter of the real guide as beta', () => {
    const guide = getAllGuides().find(
      (candidate) => candidate.slug === 'manager-worker-parallel-agents'
    )

    expect(guide).toBeDefined()
    expect(getGuideChapter(guide!, 'watch-the-run')?.chapter.beta).toBe(true)
  })

  it('resolves a chapter and its position within a guide', () => {
    const [guide] = loadGuidesFromFiles({
      '/src/content/guides/sample/guide.md': GUIDE_FILE,
      '/src/content/guides/sample/01-first.md': `---
title: "First Chapter"
---

# First Chapter
`,
      '/src/content/guides/sample/02-second.md': `---
title: "Second Chapter"
---

# Second Chapter
`,
    })

    expect(getGuideChapter(guide, 'second')).toMatchObject({ index: 1 })
    expect(getGuideChapter(guide, 'missing')).toBeUndefined()
  })

  it('publishes every real guide with the required metadata and chapters', () => {
    const guides = getAllGuides()

    expect(guides.length).toBeGreaterThan(0)

    for (const guide of guides) {
      expect(guide.title).toBeTruthy()
      expect(guide.description).toBeTruthy()
      expect(guide.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(guide.tags.length).toBeLessThanOrEqual(3)
      // A guide is either multi-chapter (overview may be empty; chapters carry
      // the content) or a single substantial overview page.
      if (guide.chapters.length === 0) {
        expect(guide.overview.length).toBeGreaterThan(0)
        expect(guide.readingTimeMinutes).toBeGreaterThan(3)
      }

      for (const chapter of guide.chapters) {
        expect(chapter.title).toBeTruthy()
        expect(chapter.slug).toMatch(/^[a-z0-9-]+$/)
        expect(chapter.content.length).toBeGreaterThan(0)
      }
    }
  })
})
