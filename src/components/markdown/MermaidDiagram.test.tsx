import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MermaidDiagram from './MermaidDiagram'

const mermaidMock = vi.hoisted(() => ({
  initialize: vi.fn(),
  render: vi.fn(),
}))

vi.mock('mermaid', () => ({ default: mermaidMock }))

describe('MermaidDiagram', () => {
  it('renders an accessible, sanitized SVG with deterministic safe configuration', async () => {
    mermaidMock.render.mockResolvedValueOnce({
      svg: '<svg xmlns="http://www.w3.org/2000/svg" onload="bad()"><script>bad()</script><image href="https://example.com/tracker.png" /><rect width="10" height="10" /></svg>',
    })

    render(<MermaidDiagram source={'flowchart TD\nA --> B'} title="System flow" />)

    expect(screen.getByText('Rendering diagram...')).toBeInTheDocument()
    expect(screen.getByText('flowchart TD', { exact: false })).toBeInTheDocument()

    const image = await screen.findByRole('img', { name: 'System flow' })
    expect(image.tagName).toBe('svg')
    expect(image).not.toHaveAttribute('onload')
    expect(image.querySelector('script')).toBeNull()
    expect(image.querySelector('image')).toBeNull()
    expect(image.querySelector('title')).toHaveTextContent('System flow')
    expect(mermaidMock.render.mock.calls[0][0]).toMatch(/^mermaid-[a-zA-Z0-9_-]+$/)
    expect(mermaidMock.initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        securityLevel: 'strict',
        suppressErrorRendering: true,
        theme: 'base',
        reducedMotion: true,
      })
    )

    fireEvent.click(screen.getByRole('button', { name: 'Zoom diagram: System flow' }))

    const dialog = screen.getByRole('dialog', { name: 'Zoomed diagram: System flow' })
    const zoomedImage = within(dialog).getByRole('img', { name: 'System flow' })
    expect(dialog).toContainElement(zoomedImage)
    expect(zoomedImage).toHaveAttribute('src', expect.stringMatching(/^data:image\/svg\+xml/))

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('keeps the source readable when Mermaid rejects invalid input', async () => {
    mermaidMock.render.mockRejectedValueOnce(new Error('Invalid diagram'))

    render(<MermaidDiagram source="not a diagram" title="Broken diagram" />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Diagram could not be rendered.')
    expect(screen.getByText('not a diagram')).toBeInTheDocument()
    expect(screen.getByText('Broken diagram')).toBeInTheDocument()
  })
})
