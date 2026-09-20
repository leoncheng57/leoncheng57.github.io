import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'

function renderTMinusExtension(): void {
  render(
    <MemoryRouter initialEntries={['/apps/t-minus-extension']}>
      <App />
    </MemoryRouter>
  )
}

describe('t-minus extension route', () => {
  it('marks the extension as beta in the page heading', () => {
    renderTMinusExtension()

    expect(
      screen.getByRole('heading', { level: 1, name: 'T-minus - Chromium Extension BETA' })
    ).toBeInTheDocument()
  })
})
