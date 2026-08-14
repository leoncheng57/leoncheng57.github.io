import { describe, expect, it } from 'vitest'
import { groupChaptersByPart } from './chapterGroups'
import type { GuideChapter } from './types'

function chapter(slug: string, part?: string): GuideChapter {
  return { slug, title: slug, order: 0, part, readingTimeMinutes: 1, content: '' }
}

describe('groupChaptersByPart', () => {
  it('groups consecutive chapters that share a part label', () => {
    const groups = groupChaptersByPart([
      chapter('one', 'The Procedure'),
      chapter('two', 'The Procedure'),
      chapter('three', 'Reference'),
    ])

    expect(groups).toHaveLength(2)
    expect(groups[0]).toMatchObject({ part: 'The Procedure' })
    expect(groups[0].items.map((item) => item.chapter.slug)).toEqual(['one', 'two'])
    expect(groups[0].items.map((item) => item.index)).toEqual([0, 1])
    expect(groups[1].items.map((item) => item.chapter.slug)).toEqual(['three'])
    expect(groups[1].items[0].index).toBe(2)
  })

  it('starts a new group when the same part label reappears non-consecutively', () => {
    const groups = groupChaptersByPart([
      chapter('one', 'A'),
      chapter('two', 'B'),
      chapter('three', 'A'),
    ])

    expect(groups.map((group) => group.part)).toEqual(['A', 'B', 'A'])
  })

  it('treats chapters without a part as their own ungrouped entries', () => {
    const groups = groupChaptersByPart([chapter('one'), chapter('two')])

    expect(groups).toHaveLength(1)
    expect(groups[0].part).toBe('')
    expect(groups[0].items).toHaveLength(2)
  })
})
