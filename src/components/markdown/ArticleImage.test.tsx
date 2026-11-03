import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ArticleImage from './ArticleImage'

vi.mock('../../utils/publicAssetUrl', () => ({
  publicAssetUrl: (src: string) => `/previews/pr-42${src}`,
}))

describe('ArticleImage', () => {
  it('uses the same resolved public URL for the article and zoom images', () => {
    render(<ArticleImage alt="Diagram" src="/images/diagram.png" styles={{}} />)

    expect(screen.getByRole('img', { name: 'Diagram' })).toHaveAttribute(
      'src',
      '/previews/pr-42/images/diagram.png'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Zoom image: Diagram' }))

    const images = screen.getAllByRole('img', { name: 'Diagram' })
    expect(images).toHaveLength(2)
    expect(images[0]).toHaveAttribute('src', images[1].getAttribute('src'))
  })

  it('shows a #half image at half size inline but strips the hint from the URL', () => {
    render(
      <ArticleImage
        alt="Sketch"
        src="/images/sketch.jpg#half"
        styles={{ articleImage: 'article', halfImage: 'half' }}
      />
    )

    const inline = screen.getByRole('img', { name: 'Sketch' })
    expect(inline).toHaveAttribute('src', '/previews/pr-42/images/sketch.jpg')
    expect(inline).toHaveClass('article', 'half')

    fireEvent.click(screen.getByRole('button', { name: 'Zoom image: Sketch' }))

    const zoomed = screen.getAllByRole('img', { name: 'Sketch' })[1]
    expect(zoomed).not.toHaveClass('half')
  })
})
