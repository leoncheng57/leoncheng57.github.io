import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'
import { EXERCISES } from '../data/exercises'
import { bodyPartMeta } from '../utils/exerciseMeta'

function renderLibrary(initialPath = '/workout-lab/exercises'): void {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>
  )
}

function renderedExerciseNames(): string[] {
  return screen
    .getAllByRole('listitem')
    .map(
      (item) =>
        item.querySelector<HTMLElement>('[data-exercise-name]')?.dataset
          .exerciseName ?? ''
    )
}

describe('exercise library route', () => {
  it('lists every exercise grouped into movement pattern sections', () => {
    renderLibrary()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Every exercise' })
    ).toBeInTheDocument()
    expect(
      screen.getByText(`Showing ${EXERCISES.length} of ${EXERCISES.length} exercises`)
    ).toBeInTheDocument()

    const names = renderedExerciseNames()
    expect(names.sort()).toEqual(EXERCISES.map(({ name }) => name).sort())

    const sectionTitles = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent)
    expect(sectionTitles).toEqual([
      'Squat',
      'Hinge',
      'Lunge & single-leg',
      'Push',
      'Pull',
      'Core',
      'Carry',
      'Conditioning',
      'Warm-up & mobility',
      'Cooldown & stretch',
    ])
  })

  it('marks every exercise name with a visible info glyph', () => {
    renderLibrary()

    const glyphs = screen.getAllByTestId('exercise-info-glyph')
    expect(glyphs).toHaveLength(EXERCISES.length)
    glyphs.forEach((glyph) => expect(glyph).toHaveAttribute('aria-hidden', 'true'))
  })

  it('filters by equipment', () => {
    renderLibrary()
    fireEvent.click(screen.getByRole('radio', { name: 'Kettlebell' }))

    const expected = EXERCISES.filter(
      ({ equipment }) => equipment === 'kettlebell'
    )
    expect(
      screen.getByText(
        `Showing ${expected.length} of ${EXERCISES.length} exercises`
      )
    ).toBeInTheDocument()
    expect(renderedExerciseNames().sort()).toEqual(
      expected.map(({ name }) => name).sort()
    )
    // No kettlebell exercise is a warm-up, so the mobility section disappears.
    expect(
      screen.queryByRole('heading', { name: 'Warm-up & mobility' })
    ).not.toBeInTheDocument()
  })

  it('filters by body part and combines with equipment', () => {
    renderLibrary()
    fireEvent.click(screen.getByRole('radio', { name: 'Chest' }))

    const chestOnly = EXERCISES.filter(
      (exercise) => bodyPartMeta(exercise).label === 'Chest'
    )
    expect(renderedExerciseNames().sort()).toEqual(
      chestOnly.map(({ name }) => name).sort()
    )

    fireEvent.click(screen.getByRole('radio', { name: 'Kettlebell' }))
    expect(renderedExerciseNames()).toEqual(['Kettlebell Floor Press'])
  })

  it('opens the shared detail modal from a library entry', async () => {
    renderLibrary()
    fireEvent.click(
      screen.getByRole('button', { name: 'Wall Sit — view details' })
    )

    const dialog = await screen.findByRole('dialog')
    expect(
      await within(dialog).findByRole('heading', { name: 'How to do it' })
    ).toBeInTheDocument()
    expect(
      await within(dialog).findByRole('link', { name: 'Watch YouTube Short' })
    ).toBeInTheDocument()
  })

  it('navigates between the builder and the library via the masthead', () => {
    renderLibrary('/workout-lab')

    fireEvent.click(screen.getByRole('link', { name: 'Exercises' }))
    expect(
      screen.getByRole('heading', { level: 1, name: 'Every exercise' })
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: 'Builder' }))
    expect(
      screen.getByRole('heading', { level: 1, name: /your next workout/i })
    ).toBeInTheDocument()
  })

  it('links the landing exercise stat to the library', () => {
    renderLibrary('/workout-lab')

    fireEvent.click(screen.getByRole('link', { name: 'Browse all exercises' }))
    expect(
      screen.getByRole('heading', { level: 1, name: 'Every exercise' })
    ).toBeInTheDocument()
  })
})
