import { useEffect, useLayoutEffect, useState } from 'react'
import type { ReactElement, RefObject } from 'react'
import TableOfContents from '../../../../components/table-of-contents'
import type { TableOfContentsItem } from '../../../../components/table-of-contents'

interface BlogTableOfContentsProps {
  rootRef: RefObject<HTMLElement | null>
  contentKey: string | number
  label?: string
}

interface ObservedHeading extends TableOfContentsItem {
  element: HTMLHeadingElement
}

export default function BlogTableOfContents({
  rootRef,
  contentKey,
  label = 'Table of contents',
}: BlogTableOfContentsProps): ReactElement | null {
  const [headings, setHeadings] = useState<ObservedHeading[]>([])
  const [activeId, setActiveId] = useState('')

  useLayoutEffect(() => {
    const nextHeadings = Array.from(
      rootRef.current?.querySelectorAll<HTMLHeadingElement>('h2[id], h3[id]') ?? []
    ).map((element) => ({
      id: element.id,
      level: element.tagName === 'H2' ? 2 : 3,
      text: element.textContent?.trim() ?? '',
      element,
    }) satisfies ObservedHeading)

    setHeadings(nextHeadings)
    setActiveId(nextHeadings[0]?.id ?? '')
  }, [contentKey, rootRef])

  useEffect(() => {
    if (headings.length === 0) {
      return undefined
    }

    const visibleIds = new Set<string>()
    const headingOrder = headings.map(({ id }) => id)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id
          if (entry.isIntersecting) {
            visibleIds.add(id)
          } else {
            visibleIds.delete(id)
          }
        }

        const nextActiveId = headingOrder.find((id) => visibleIds.has(id))
        if (nextActiveId) {
          setActiveId(nextActiveId)
        }
      },
      { rootMargin: '0px 0px -70% 0px' }
    )

    headings.forEach(({ element }) => observer.observe(element))
    return () => observer.disconnect()
  }, [headings])

  return (
    <TableOfContents key={contentKey} items={headings} activeId={activeId} label={label} />
  )
}
