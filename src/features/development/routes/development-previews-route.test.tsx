import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

describe('development previews route', () => {
  it('documents the preview lifecycle with diagrams', () => {
    render(
      <MemoryRouter initialEntries={['/development/previews']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Pull request previews' })
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Pull request preview flow')
    ).toHaveTextContent('leoncheng.dev/previews/pr-N/')
    expect(
      screen.getByLabelText('Preview teardown flow')
    ).toHaveTextContent('closed or merged')
    expect(
      screen.getByLabelText('Deploy branch layout')
    ).toHaveTextContent('previews/')
    expect(
      screen.getByLabelText('Serialized write queue')
    ).toHaveTextContent('gh-pages-deploy')
  })

  it('links back to the Development overview', () => {
    render(
      <MemoryRouter initialEntries={['/development/previews']}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('link', { name: 'Back to Development' })
    ).toHaveAttribute('href', '/development')
  })
})
