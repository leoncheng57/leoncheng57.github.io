import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HistoricalTimeline from './HistoricalTimeline'

describe('HistoricalTimeline', () => {
  it('renders labelled semantic entries with machine-readable dates', () => {
    const { container } = render(
      <HistoricalTimeline
        ariaLabel="Example project history"
        entries={[
          {
            date: 'January 8, 2026',
            dateTime: '2026-01-08',
            stage: 'Explored',
            milestone: 'The initial workflow was evaluated.',
            detail: 'The team documented constraints before implementation.',
            evidence: ['Research notes', 'Decision record'],
          },
          {
            date: 'February 2026',
            dateTime: '2026-02',
            stage: 'Built',
            milestone: 'A reusable foundation shipped.',
          },
        ]}
      />
    )

    const timeline = screen.getByRole('region', { name: 'Example project history' })
    expect(timeline.tagName).toBe('SECTION')
    expect(timeline.querySelector('ol')).toBeInTheDocument()
    expect(within(timeline).getAllByRole('listitem')).toHaveLength(4)
    expect(container.querySelector('time')).toHaveAttribute('datetime', '2026-01-08')
    expect(screen.getByText('The team documented constraints before implementation.')).toBeInTheDocument()
    expect(screen.getByText('Research notes').tagName).toBe('CODE')
    expect(screen.queryByText('Evidence', { selector: 'ul' })).not.toBeInTheDocument()
  })
})
