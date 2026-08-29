import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ToolGrid from './ToolGrid'
import { TOOLS } from './tools'

describe('ToolGrid', () => {
  it('renders one card per tool inside a labelled list', () => {
    render(<ToolGrid />)

    const list = screen.getByRole('list', {
      name: 'Tools built on top of the agent server',
    })
    expect(within(list).getAllByRole('listitem')).toHaveLength(TOOLS.length)
    for (const tool of TOOLS) {
      expect(within(list).getByRole('heading', { level: 3, name: tool.name })).toBeInTheDocument()
    }
  })

  it('takes its accessible name from the markdown embed alt text', () => {
    render(<ToolGrid label="The tools, one card each" />)
    expect(screen.getByRole('list', { name: 'The tools, one card each' })).toBeInTheDocument()
  })

  it('hides the decorative sketches from assistive technology', () => {
    const { container } = render(<ToolGrid />)
    const diagrams = container.querySelectorAll('pre')
    expect(diagrams).toHaveLength(TOOLS.length)
    for (const diagram of diagrams) {
      expect(diagram).toHaveAttribute('aria-hidden', 'true')
    }
  })

  it('renders the package prerelease link', () => {
    render(<ToolGrid />)
    expect(screen.getByRole('link', { name: /View v0\.0\.1 prerelease/ })).toHaveAttribute(
      'href',
      'https://github.com/leoncheng57/Customizable-DCA-OpenHands/releases/tag/v0.0.1'
    )
  })
})
