import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MarkdownArticle from './MarkdownArticle'

const mermaidRender = vi.hoisted(() => vi.fn())

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: mermaidRender,
  },
}))

describe('MarkdownArticle Mermaid blocks', () => {
  it('removes the title directive and uses it as the caption and accessible label', async () => {
    mermaidRender.mockResolvedValueOnce({
      svg: '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0" /></svg>',
    })

    render(
      <MarkdownArticle
        content={'```mermaid\n%% title: Request lifecycle\nflowchart TD\nA --> B\n```'}
        styles={{ articleBody: 'article' }}
      />
    )

    expect(await screen.findByRole('img', { name: 'Request lifecycle' })).toBeInTheDocument()
    expect(document.querySelector('figcaption')).toHaveTextContent('Request lifecycle')
    expect(mermaidRender).toHaveBeenCalledWith(expect.any(String), 'flowchart TD\nA --> B')
    expect(document.querySelector('pre > figure')).toBeNull()
  })

  it('preserves file-language and ordinary code blocks', () => {
    render(
      <MarkdownArticle
        content={'```file:config.ts\nexport const enabled = true\n```\n\n```ts\nconst value = 1\n```'}
        styles={{ articleBody: 'article' }}
      />
    )

    expect(document.querySelector('code[data-filename="config.ts"]')).toBeInTheDocument()
    expect(document.querySelector('code.language-ts')).toHaveTextContent('const value = 1')
  })

  it('uses a default accessible title when no directive is present', async () => {
    mermaidRender.mockResolvedValueOnce({
      svg: '<svg xmlns="http://www.w3.org/2000/svg"><circle r="4" /></svg>',
    })

    render(
      <MarkdownArticle
        content={'```mermaid\nflowchart TD\nA --> B\n```'}
        styles={{ articleBody: 'article' }}
      />
    )

    expect(await screen.findByRole('img', { name: 'Architecture diagram' })).toBeInTheDocument()
  })
})
