import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../../App'
import { openExternalUrl } from '../utils/openExternalUrl'

vi.mock('../utils/openExternalUrl', () => ({ openExternalUrl: vi.fn() }))

const openExternalUrlMock = vi.mocked(openExternalUrl)

function renderFoodLogger(pathname = '/automatic-food-logger/') {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <App />
    </MemoryRouter>,
  )
}

function stubClipboard(readTextImplementation: () => Promise<string>): void {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { readText: vi.fn(readTextImplementation), writeText: vi.fn(() => Promise.resolve()) },
  })
}

function decodeShortcutPayload(shortcutUrl: string): Record<string, unknown> {
  return JSON.parse(decodeURIComponent(shortcutUrl.split('&text=')[1])) as Record<string, unknown>
}

describe('Food Logger route', () => {
  beforeEach(() => {
    window.localStorage.clear()
    openExternalUrlMock.mockClear()
  })

  afterEach(() => {
    window.localStorage.clear()
    Reflect.deleteProperty(navigator, 'clipboard')
  })

  it('points first-time visitors at the Shortcut setup', () => {
    renderFoodLogger()

    expect(screen.getByRole('link', { name: 'Set up the Log Food Shortcut' })).toHaveAttribute(
      'href',
      '/automatic-food-logger/setup',
    )
    expect(screen.getByText('No meals yet. Your first log shows up here.')).toBeInTheDocument()
  })

  it('saves a meal without macros, hands it to the Shortcut, then applies a pasted estimate', async () => {
    const user = userEvent.setup()
    renderFoodLogger()

    await user.type(screen.getByLabelText('Meal description'), 'chicken burrito bowl')
    await user.click(screen.getByRole('button', { name: 'Log to Apple Health' }))

    expect(openExternalUrlMock).toHaveBeenCalledTimes(1)
    const shortcutUrl = openExternalUrlMock.mock.calls[0][0]
    expect(shortcutUrl).toMatch(/^shortcuts:\/\/run-shortcut\?name=Log%20Food&input=text&text=/)
    expect(decodeShortcutPayload(shortcutUrl)).toMatchObject({ description: 'chicken burrito bowl', kcal: null })
    expect(screen.getByRole('button', { name: 'Opening Shortcuts…' })).toBeDisabled()

    const history = screen.getByRole('region', { name: 'History' })
    expect(within(history).getByText("Waiting for Claude's estimate")).toBeInTheDocument()

    stubClipboard(() => Promise.resolve('{"kcal":650,"protein_g":40,"carbs_g":70,"fat_g":22}'))
    await user.click(within(history).getByRole('button', { name: 'Paste estimate' }))

    expect(within(history).getByText('650 kcal · 40g protein · 70g carbs · 22g fat')).toBeInTheDocument()
    const today = screen.getByRole('region', { name: 'Today' })
    expect(within(today).getByText('650')).toBeInTheDocument()
    expect(within(today).getByText('1 meal today')).toBeInTheDocument()
  })

  it('shows an error when the clipboard has no estimate yet', async () => {
    const user = userEvent.setup()
    renderFoodLogger()

    await user.type(screen.getByLabelText('Meal description'), 'ramen')
    await user.click(screen.getByRole('button', { name: 'Log to Apple Health' }))
    stubClipboard(() => Promise.resolve('just some copied text'))
    await user.click(screen.getByRole('button', { name: 'Paste estimate' }))

    expect(screen.getByRole('alert')).toHaveTextContent('does not hold a macros estimate yet')
  })

  it('sends known macros straight through and offers the meal to log again', async () => {
    const user = userEvent.setup()
    renderFoodLogger()

    await user.type(screen.getByLabelText('Meal description'), 'greek yogurt')
    await user.click(screen.getByRole('button', { name: 'I know the macros' }))
    await user.type(screen.getByLabelText('Calories'), '150')
    await user.type(screen.getByLabelText('Protein (g)'), '20')
    await user.click(screen.getByRole('button', { name: 'Log to Apple Health' }))

    expect(decodeShortcutPayload(openExternalUrlMock.mock.calls[0][0])).toMatchObject({
      description: 'greek yogurt',
      kcal: 150,
      protein_g: 20,
      carbs_g: 0,
      fat_g: 0,
    })
    expect(screen.getByRole('button', { name: /greek yogurt\s*150 kcal/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Paste estimate' })).not.toBeInTheDocument()
  })

  it('rejects macros that are not numbers', async () => {
    const user = userEvent.setup()
    renderFoodLogger()

    await user.type(screen.getByLabelText('Meal description'), 'toast')
    await user.click(screen.getByRole('button', { name: 'I know the macros' }))
    await user.type(screen.getByLabelText('Calories'), 'lots')
    await user.click(screen.getByRole('button', { name: 'Log to Apple Health' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Macros must be numbers of zero or more.')
    expect(openExternalUrlMock).not.toHaveBeenCalled()
  })

  it('renders this feature\'s DESIGN.md on the design page', async () => {
    renderFoodLogger('/automatic-food-logger/design')

    expect(screen.getByRole('heading', { level: 1, name: /Automatic Food Logger Design/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Why it's shaped this way/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Design' })).toHaveAttribute('aria-current', 'page')
  })

  it('renders the Shortcut setup guide with the Claude prompt', () => {
    renderFoodLogger('/automatic-food-logger/setup')

    expect(screen.getByRole('heading', { level: 1, name: 'Set up Food Logger' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '2. Build the Log Food Shortcut' })).toBeInTheDocument()
    expect(screen.getByText(/Reply with only a JSON object/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy prompt' })).toBeInTheDocument()
  })
})
