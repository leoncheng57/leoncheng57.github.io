import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../../App'

const eggMeals = {
  meals: [
    { idMeal: '52929', strMeal: 'Timbits', strMealThumb: 'https://img/1.jpg' },
  ],
}

const riceMeals = {
  meals: [
    { idMeal: '52929', strMeal: 'Timbits', strMealThumb: 'https://img/1.jpg' },
    { idMeal: '53026', strMeal: 'Nasi Lemak', strMealThumb: '' },
  ],
}

const timbitsDetail = {
  meals: [
    {
      idMeal: '52929',
      strMeal: 'Timbits',
      strMealThumb: 'https://img/1.jpg',
      strCategory: 'Dessert',
      strArea: 'Canadian',
      strInstructions: 'Mix everything.\nFry the dough.',
      strYoutube: 'https://www.youtube.com/watch?v=abc123',
      strSource: 'https://example.com/timbits',
      strIngredient1: 'Flour',
      strMeasure1: '2 cups',
      strIngredient2: 'Sugar',
      strMeasure2: '1 cup',
      strIngredient3: '',
      strMeasure3: '',
    },
  ],
}

function mockFetch(): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      let body: unknown = { meals: null }

      if (url.includes('filter.php?i=egg')) body = eggMeals
      else if (url.includes('filter.php?i=rice')) body = riceMeals
      else if (url.includes('lookup.php?i=52929')) body = timbitsDetail

      return {
        ok: true,
        status: 200,
        json: async () => body,
      } as Response
    })
  )
}

function renderCookToday(): void {
  render(
    <MemoryRouter initialEntries={['/cook-today']}>
      <App />
    </MemoryRouter>
  )
}

describe('Cook Today route', () => {
  beforeEach(() => {
    mockFetch()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the form and blocks submitting with nothing checked', () => {
    renderCookToday()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Cook Today' })
    ).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Eggs' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Suggest recipes' })).toBeDisabled()
  })

  it('suggests recipes from the checked boxes', async () => {
    const user = userEvent.setup()
    renderCookToday()

    await user.click(screen.getByRole('checkbox', { name: 'Eggs' }))
    await user.click(screen.getByRole('checkbox', { name: 'Rice' }))
    await user.click(screen.getByRole('button', { name: 'Suggest recipes' }))

    expect(
      await screen.findByRole('heading', { name: "Tonight's picks" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Crispy Shanghai Butter Mochi' })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Timbits' })).toBeInTheDocument()
  })

  it('turns the curated recipe into a grocery list as you tick items off', async () => {
    const user = userEvent.setup()
    renderCookToday()

    await user.click(screen.getByRole('checkbox', { name: 'Eggs' }))
    await user.click(screen.getByRole('button', { name: 'Suggest recipes' }))

    const mochiHeading = await screen.findByRole('heading', {
      name: 'Crispy Shanghai Butter Mochi',
    })
    const card = mochiHeading.closest('article') as HTMLElement
    await user.click(
      within(card).getByRole('button', { name: 'Check my ingredients' })
    )

    expect(
      screen.getByRole('heading', { name: 'Tick what you already have' })
    ).toBeInTheDocument()
    expect(screen.getByText(/Need from the store \(10\)/)).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: /Whole milk/ }))

    expect(screen.getByText(/Need from the store \(9\)/)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: '▶ Watch how to make it' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Full recipe → Okonomi Kitchen' })
    ).toBeInTheDocument()
  })

  it('loads ingredients for an API recipe on demand', async () => {
    const user = userEvent.setup()
    renderCookToday()

    await user.click(screen.getByRole('checkbox', { name: 'Eggs' }))
    await user.click(screen.getByRole('button', { name: 'Suggest recipes' }))

    const timbits = await screen.findByRole('heading', { name: 'Timbits' })
    const card = timbits.closest('article') as HTMLElement
    await user.click(
      within(card).getByRole('button', { name: 'Check my ingredients' })
    )

    expect(
      await screen.findByRole('checkbox', { name: /Flour/ })
    ).toBeInTheDocument()
    expect(screen.getByText(/Need from the store \(2\)/)).toBeInTheDocument()
  })

  it('shows an error when the recipe service fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) }) as Response)
    )
    const user = userEvent.setup()
    renderCookToday()

    await user.click(screen.getByRole('checkbox', { name: 'Eggs' }))
    await user.click(screen.getByRole('button', { name: 'Suggest recipes' }))

    expect(
      await screen.findByText(/could not reach the recipe service/i)
    ).toBeInTheDocument()
  })

  it('links back to the apps index', () => {
    renderCookToday()

    expect(screen.getByRole('link', { name: 'Back to apps' })).toHaveAttribute(
      'href',
      '/apps'
    )
  })
})
