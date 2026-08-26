import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TableOfContents from './TableOfContents'
import type { TableOfContentsItem } from './TableOfContents'

const items: TableOfContentsItem[] = [
  { id: 'overview', text: 'Overview', level: 2 },
  { id: 'details', text: 'Important details', level: 3 },
  { id: 'next', text: 'Next steps', level: 2 },
]

describe('TableOfContents', () => {
  it('shows the active heading in the collapsed toggle and marks its link', () => {
    render(<TableOfContents items={items} activeId="details" />)

    expect(screen.getByRole('button', { name: /Table of contents Important details/ })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
    expect(screen.getByRole('link', { name: 'Important details', hidden: true })).toHaveAttribute(
      'aria-current',
      'location'
    )
  })

  it('toggles the mobile list', () => {
    render(<TableOfContents items={items} activeId="overview" label="On this page" />)
    const toggle = screen.getByRole('button', { name: /On this page Overview/ })

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveAttribute('aria-controls')
  })

  it('nests H3 items under the preceding H2', () => {
    render(<TableOfContents items={items} activeId="overview" />)
    const nav = screen.getByRole('navigation', { name: 'Table of contents' })
    const detail = screen.getByRole('link', { name: 'Important details', hidden: true })

    expect(detail.closest('ol')).not.toBe(nav.querySelector('ol'))
    expect(within(detail.closest('ol') as HTMLOListElement).getAllByRole('link', { hidden: true })).toHaveLength(1)
  })

  it('closes the mobile list after a link is selected', () => {
    render(<TableOfContents items={items} activeId="overview" />)
    const toggle = screen.getByRole('button', { name: /Table of contents Overview/ })

    fireEvent.click(toggle)
    fireEvent.click(screen.getByRole('link', { name: 'Next steps' }))
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})
