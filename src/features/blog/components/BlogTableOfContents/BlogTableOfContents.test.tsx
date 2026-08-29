import { act, fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BlogTableOfContents from './BlogTableOfContents'

let observerCallback: IntersectionObserverCallback
const observe = vi.fn()
const disconnect = vi.fn()

class MockIntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: readonly number[] = []

  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback
  }

  observe = observe
  disconnect = disconnect
  unobserve = vi.fn()
  takeRecords = vi.fn(() => [])
}

beforeEach(() => {
  observe.mockClear()
  disconnect.mockClear()
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

function renderTableOfContents() {
  const rootRef = createRef<HTMLElement>()

  render(
    <>
      <article ref={rootRef}>
        <h2 id="first-section">First section</h2>
        <h3 id="first-detail">First detail</h3>
        <h2 id="second-section">Second section</h2>
      </article>
      <BlogTableOfContents rootRef={rootRef} contentKey="article-one" label="On this page" />
    </>
  )
}

describe('BlogTableOfContents', () => {
  it('extracts actual h2 and h3 IDs and observes their elements', () => {
    renderTableOfContents()

    const nav = screen.getByRole('navigation', { name: 'On this page' })
    const firstSection = screen.getByRole('link', { name: 'First section', hidden: true })
    const firstDetail = screen.getByRole('link', { name: 'First detail', hidden: true })

    expect(firstSection).toHaveAttribute('href', '#first-section')
    expect(firstDetail).toHaveAttribute('href', '#first-detail')
    expect(nav).toBeInTheDocument()
    expect(observe).toHaveBeenCalledTimes(3)
  })

  it('marks the intersecting heading as active', () => {
    renderTableOfContents()
    const secondHeading = document.querySelector('#second-section') as Element

    act(() => {
      observerCallback(
        [{ target: secondHeading, isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })

    expect(screen.getByRole('link', { name: 'Second section', hidden: true })).toHaveAttribute(
      'aria-current',
      'location'
    )
  })

  it('exposes an accessible mobile toggle and closes after choosing a heading', () => {
    renderTableOfContents()
    const toggle = screen.getByRole('button', { name: /On this page First section/ })

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveAttribute('aria-controls')

    fireEvent.click(screen.getByRole('link', { name: 'First detail' }))
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})
