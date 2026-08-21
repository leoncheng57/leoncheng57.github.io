import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import GuideRepoReference, { parseGitHubRepoUrl } from './GuideRepoReference'

describe('parseGitHubRepoUrl', () => {
  it('derives a case-insensitive author-owned repository', () => {
    expect(
      parseGitHubRepoUrl('https://github.com/LeonCheng57/example/tree/main/demo')
    ).toEqual({ name: 'LeonCheng57/example', selfOwned: true })
  })

  it('derives a third-party repository without marking it author-owned', () => {
    expect(parseGitHubRepoUrl('https://github.com/anomalyco/opencode')).toEqual({
      name: 'anomalyco/opencode',
      selfOwned: false,
    })
  })

  it.each([
    'not a URL',
    'https://github.com/features/copilot',
    'https://github.com/user-attachments/assets/123',
    'https://github.com/leoncheng57/example/issues',
    'https://github.com/leoncheng57',
    'https://example.com/leoncheng57/example',
  ])('rejects a non-repository URL: %s', (url) => {
    expect(parseGitHubRepoUrl(url)).toBeNull()
  })
})

describe('GuideRepoReference', () => {
  it('renders a public author-owned project repository', () => {
    render(
      <GuideRepoReference
        repoUrl="https://github.com/leoncheng57/example"
        repoAccess="public"
        repoScope="standalone"
      />
    )

    expect(screen.getByText('PROJECT REPO')).toBeInTheDocument()
    expect(screen.getByText('AUTHOR-OWNED')).toBeInTheDocument()
    expect(screen.queryByText('PRIVATE ACCESS')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'GitHub repository leoncheng57/example' }))
      .toHaveAttribute('href', 'https://github.com/leoncheng57/example')
  })

  it('renders private access and preserves a tree URL', () => {
    const repoUrl = 'https://github.com/leoncheng57/example/tree/main/packages/app'
    render(
      <GuideRepoReference
        repoUrl={repoUrl}
        repoAccess="private"
        repoScope="standalone"
      />
    )

    expect(screen.getByText('PRIVATE ACCESS')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'GitHub repository leoncheng57/example' }))
      .toHaveAttribute('href', repoUrl)
  })

  it('labels source stored in this site repository', () => {
    render(
      <GuideRepoReference
        repoUrl="https://github.com/leoncheng57/leoncheng57.github.io/tree/main/demo"
        repoScope="this-site"
      />
    )

    expect(screen.getByText('SOURCE IN THIS REPO')).toBeInTheDocument()
  })

  it('omits the author-owned marker for a third-party repository', () => {
    render(
      <GuideRepoReference
        repoUrl="https://github.com/anomalyco/opencode"
        repoScope="standalone"
      />
    )

    expect(screen.getByRole('link', { name: 'GitHub repository anomalyco/opencode' }))
      .toBeInTheDocument()
    expect(screen.queryByText('AUTHOR-OWNED')).not.toBeInTheDocument()
  })

  it('renders nothing for malformed and non-GitHub URLs', () => {
    const { container, rerender } = render(
      <GuideRepoReference repoUrl="https://github.com/features/copilot" />
    )
    expect(container).toBeEmptyDOMElement()

    rerender(<GuideRepoReference repoUrl="https://example.com/owner/repo" />)
    expect(container).toBeEmptyDOMElement()
  })
})
