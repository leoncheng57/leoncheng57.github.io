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
})
