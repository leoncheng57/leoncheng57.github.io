import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import SiteFooter from './SiteFooter'

function renderFooter(children?: ReactNode) {
  return render(
    <MemoryRouter>
      <SiteFooter>{children}</SiteFooter>
    </MemoryRouter>
  )
}

describe('SiteFooter', () => {
  it('links back home and offers the shared feedback trigger', () => {
    renderFooter()

    expect(
      screen.getByRole('link', { name: /leoncheng\.dev/ })
    ).toHaveAttribute('href', '/')
    expect(
      screen.getByRole('button', { name: 'Send feedback' })
    ).toBeInTheDocument()
    expect(
      screen.getByText(`© ${new Date().getFullYear()} Leon Cheng`)
    ).toBeInTheDocument()
  })

  it('renders an optional page-specific extra row', () => {
    renderFooter(<span>Real-time data from the MTA</span>)

    expect(
      screen.getByText('Real-time data from the MTA')
    ).toBeInTheDocument()
  })
})
