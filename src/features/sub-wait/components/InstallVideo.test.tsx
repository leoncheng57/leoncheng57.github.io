import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import InstallVideo from './InstallVideo'

describe('InstallVideo', () => {
  it('renders a user-controlled video with base-aware media assets and captions', () => {
    const { container } = render(
      <InstallVideo
        platform="iphone"
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
      '/sub-wait/install/iphone-walkthrough-poster.png',
    )

    const sources = container.querySelectorAll('source')
    expect(sources[0]).toHaveAttribute(
      'src',
      '/sub-wait/install/iphone-walkthrough.webm',
    )
    expect(sources[1]).toHaveAttribute(
      'src',
      '/sub-wait/install/iphone-walkthrough.mp4',
    )
    expect(container.querySelector('track')).toHaveAttribute(
      'src',
      '/sub-wait/install/iphone-walkthrough.vtt',
    )
  })
})
