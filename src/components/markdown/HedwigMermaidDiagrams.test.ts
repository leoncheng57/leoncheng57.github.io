import mermaid from 'mermaid'
import { describe, expect, it } from 'vitest'
import article from '../../content/blog/building-hedwig-ai-tooling-hub.md?raw'

describe('Hedwig Mermaid diagrams', () => {
  it('contains six valid Mermaid blocks and no obsolete SVG references', async () => {
    const diagrams = Array.from(article.matchAll(/```mermaid\n([\s\S]*?)\n```/g), (match) =>
      match[1].replace(/^%%\s*(?:title|size):.*\n/gm, '')
    )

    expect(diagrams).toHaveLength(6)
    expect(article).not.toMatch(/building-hedwig-ai-tooling-hub\/[1-8][^\s)]*\.svg/)

    for (const diagram of diagrams) {
      await expect(mermaid.parse(diagram, { suppressErrors: false })).resolves.toBeTruthy()
    }
  })
})
