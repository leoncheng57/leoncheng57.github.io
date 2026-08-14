export interface MarkdownSection {
  title: string
  body: string
}

export interface SplitMarkdown {
  intro: string
  sections: MarkdownSection[]
}

/**
 * Splits a markdown document on its `##` headings so the guide landing page
 * can render each section as a styled card instead of one prose column.
 * Headings inside fenced code blocks are ignored.
 */
export function splitMarkdownSections(markdown: string): SplitMarkdown {
  const lines = markdown.split('\n')
  const segments: Array<{ title: string | null; lines: string[] }> = [{ title: null, lines: [] }]
  let inFence = false

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
    }

    const headingMatch = inFence ? null : line.match(/^##\s+(.+)$/)
    if (headingMatch) {
      segments.push({ title: headingMatch[1].trim(), lines: [] })
      continue
    }

    segments[segments.length - 1].lines.push(line)
  }

  return {
    intro: segments[0].lines.join('\n').trim(),
    sections: segments.slice(1).map((segment) => ({
      title: segment.title ?? '',
      body: segment.lines.join('\n').trim(),
    })),
  }
}
