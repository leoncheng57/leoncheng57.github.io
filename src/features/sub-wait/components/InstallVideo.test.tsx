import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import InstallVideo from './InstallVideo'

describe('InstallVideo', () => {
  it('renders a user-controlled animation with base-aware media assets and captions', () => {
    const { container } = render(
      <InstallVideo
        platform="iphone"
        kind="animation"
        label="iPhone installation walkthrough"
      />,
    )

    const video = screen.getByLabelText('iPhone installation walkthrough')
    expect(video).toHaveAttribute('controls')
    expect(video).toHaveAttribute('playsinline')
    expect(video).toHaveAttribute('preload', 'metadata')
    expect(video).not.toHaveAttribute('autoplay')
    expect(video).toHaveAttribute(
      'poster',
      '/sub-wait/install/iphone-animation-poster.png',
    )

    const sources = container.querySelectorAll('source')
    expect(sources[0]).toHaveAttribute(
      'src',
      '/sub-wait/install/iphone-animation.webm',
    )
    expect(sources[1]).toHaveAttribute(
      'src',
      '/sub-wait/install/iphone-animation.mp4',
    )
    expect(container.querySelector('track')).toHaveAttribute(
      'src',
      '/sub-wait/install/iphone-animation.vtt',
    )
  })

  it('renders physical-recording assets when kind is recording', () => {
    const { container } = render(
      <InstallVideo
        platform="iphone"
        kind="recording"
        label="iPhone installation recording"
      />,
    )

    const video = screen.getByLabelText('iPhone installation recording')
    expect(video).toHaveAttribute('controls')
    expect(video).not.toHaveAttribute('autoplay')
    expect(video).toHaveAttribute(
      'poster',
      '/sub-wait/install/iphone-recording-poster.png',
    )

    const sources = container.querySelectorAll('source')
    expect(sources[0]).toHaveAttribute(
      'src',
      '/sub-wait/install/iphone-recording.webm',
    )
    expect(sources[1]).toHaveAttribute(
      'src',
      '/sub-wait/install/iphone-recording.mp4',
    )
    expect(container.querySelector('track')).toHaveAttribute(
      'src',
      '/sub-wait/install/iphone-recording.vtt',
    )
  })
})
