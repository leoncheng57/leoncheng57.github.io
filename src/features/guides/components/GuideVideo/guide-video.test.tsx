import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import GuideVideo from './GuideVideo'

describe('GuideVideo', () => {
  it('offers webm before mp4 and a poster, and stays click-to-play', () => {
    render(<GuideVideo recording="desktop-tour" label="A desktop recording" />)

    const video = screen.getByLabelText('A desktop recording')
    expect(video.tagName).toBe('VIDEO')
    expect(video).toHaveAttribute('controls')
    expect(video).toHaveAttribute('playsinline')
    expect(video).toHaveAttribute('preload', 'metadata')
    expect(video).toHaveAttribute(
      'poster',
      '/guides/custom-coding-agent-ide-with-openhands/desktop-tour-poster.png'
    )
    // Nothing autoplays: no autoplay or loop attribute anywhere.
    expect(video).not.toHaveAttribute('autoplay')
    expect(video).not.toHaveAttribute('loop')

    const sources = Array.from(video.querySelectorAll('source'))
    expect(sources.map((source) => source.getAttribute('type'))).toEqual([
      'video/webm',
      'video/mp4',
    ])
    expect(sources.map((source) => source.getAttribute('src'))).toEqual([
      '/guides/custom-coding-agent-ide-with-openhands/desktop-tour.webm',
      '/guides/custom-coding-agent-ide-with-openhands/desktop-tour.mp4',
    ])
  })

  it('renders the caption when given one and omits the figcaption otherwise', () => {
    const { rerender, container } = render(
      <GuideVideo recording="mobile-tour" label="A phone recording" caption="On a phone." />
    )
    expect(screen.getByText('On a phone.')).toBeInTheDocument()

    rerender(<GuideVideo recording="mobile-tour" label="A phone recording" />)
    expect(container.querySelector('figcaption')).toBeNull()
  })

  it('points each recording at its own assets', () => {
    render(<GuideVideo recording="mobile-tour" label="A phone recording" />)

    const sources = Array.from(
      screen.getByLabelText('A phone recording').querySelectorAll('source')
    )
    expect(sources.every((source) => source.getAttribute('src')?.includes('mobile-tour'))).toBe(
      true
    )
  })
})
