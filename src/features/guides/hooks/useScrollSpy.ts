import { useEffect, useState } from 'react'

/**
 * Tracks which of the given element ids is currently "in view": the element
 * whose box crosses the middle band of the viewport. Used by the guide
 * one-pager so the Chapters bar can show the chapter being read.
 *
 * Returns null until an element intersects, and in environments without
 * IntersectionObserver (jsdom).
 */
export default function useScrollSpy(ids: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)
  const joinedIds = ids.join(',')

  useEffect(() => {
    if (!joinedIds || typeof IntersectionObserver === 'undefined') {
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    for (const id of joinedIds.split(',')) {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    }
    return () => observer.disconnect()
  }, [joinedIds])

  return activeId
}
