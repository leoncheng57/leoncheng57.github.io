import type { GuideChapter } from './types'

export interface NumberedChapter {
  chapter: GuideChapter
  /** Global position across the whole guide, independent of grouping. */
  index: number
}

export interface ChapterGroup {
  /** Group label, or empty string for chapters with no `part` set. */
  part: string
  items: NumberedChapter[]
}

/**
 * Groups chapters into consecutive runs sharing the same `part` label, while
 * keeping each chapter's global chapter number. Used to render the guide
 * contents and chapter sidebar as "Part" sections instead of one flat list.
 */
export function groupChaptersByPart(chapters: GuideChapter[]): ChapterGroup[] {
  const groups: ChapterGroup[] = []

  chapters.forEach((chapter, index) => {
    const part = chapter.part ?? ''
    const currentGroup = groups[groups.length - 1]

    if (currentGroup && currentGroup.part === part) {
      currentGroup.items.push({ chapter, index })
    } else {
      groups.push({ part, items: [{ chapter, index }] })
    }
  })

  return groups
}
