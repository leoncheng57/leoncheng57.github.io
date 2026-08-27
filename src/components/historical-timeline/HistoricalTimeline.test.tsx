import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HistoricalTimeline, { timelineGapDays, timelineGapRem } from './HistoricalTimeline'

describe('timeline spacing', () => {
  it('gives a 20-day interval more space than a 2-day interval', () => {
    const twoDays = timelineGapDays('2026-01-01', '2026-01-03')
    const twentyDays = timelineGapDays('2026-01-01', '2026-01-21')

    expect(timelineGapRem(twentyDays)).toBeGreaterThan(timelineGapRem(twoDays))
  })

  it('uses the minimum gap for equal dates', () => {
    expect(timelineGapRem(timelineGapDays('2026-01-08', '2026-01-08'))).toBe(
      timelineGapRem(0)
    )
  })

  it('caps spacing at the compact maximum', () => {
    expect(timelineGapRem(0)).toBe(0.45)
    expect(timelineGapRem(35)).toBe(2.1)
  })

  it.each([
    ['invalid date', 'not-a-date', '2026-01-08'],
    ['invalid calendar date', '2026-02-30', '2026-03-01'],
    ['nonmonotonic dates', '2026-01-08', '2026-01-07'],
  ])('treats %s as a zero-day interval', (_case, previous, current) => {
    expect(timelineGapDays(previous, current)).toBe(0)
    expect(timelineGapRem(timelineGapDays(previous, current))).toBe(timelineGapRem(0))
  })

  it('normalizes month-only dates to the first day of the month', () => {
    expect(timelineGapDays('2026-01', '2026-01-21')).toBe(20)
  })
})

describe('HistoricalTimeline', () => {
  it('renders labelled semantic entries with machine-readable dates', () => {
    const { container } = render(
      <HistoricalTimeline
        ariaLabel="Example project history"
        entries={[
          {
            version: 'v0.0.1',
            date: 'January 8, 2026',
            dateTime: '2026-01-08',
            stage: 'Explored',
            milestone: 'The initial workflow was evaluated.',
            detail: 'The team documented constraints before implementation.',
            highlights: ['A bounded prototype was tested.', 'The ownership boundary was documented.'],
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
    expect(within(timeline).getAllByRole('listitem')).toHaveLength(6)
    expect(container.querySelector('time')).toHaveAttribute('datetime', '2026-01-08')
    expect(screen.getByText('v0.0.1')).toBeInTheDocument()
    expect(screen.getByText('The team documented constraints before implementation.')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Milestone details' })).toHaveTextContent('A bounded prototype was tested.')
    expect(screen.getByText('Research notes').tagName).toBe('CODE')
    expect(screen.queryByText('Evidence', { selector: 'ul' })).not.toBeInTheDocument()
    expect(timeline.querySelectorAll('li')[0]).toHaveStyle({ '--timeline-gap': '0rem' })
  })
})
