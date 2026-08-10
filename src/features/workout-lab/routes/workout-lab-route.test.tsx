import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'
import { generateWorkout } from '../generator/generateWorkout'
import type { WorkoutPreferences } from '../types'

function renderWorkoutLab(): void {
  render(
    <MemoryRouter initialEntries={['/workout-lab']}>
      <App />
    </MemoryRouter>
  )
}

function openBuilder(): void {
  renderWorkoutLab()
  fireEvent.click(screen.getByRole('button', { name: 'Build my workout' }))
}

function selectPreferences(): void {
  fireEvent.click(screen.getByRole('radio', { name: 'Build strength' }))
  fireEvent.click(screen.getByRole('radio', { name: 'Intermediate' }))
  fireEvent.click(screen.getByRole('radio', { name: '20 min' }))
  fireEvent.click(screen.getByRole('radio', { name: 'Dumbbells' }))
  fireEvent.click(screen.getByRole('radio', { name: 'Upper body' }))
}

const SELECTED_PREFERENCES: WorkoutPreferences = {
  goal: 'strength',
  level: 'intermediate',
  duration: 20,
  equipment: 'dumbbells',
  focus: 'upper',
}

function renderedExerciseNames(): string[] {
  return screen
    .getAllByRole('listitem')
    .map((item) => item.querySelector('span')?.textContent ?? '')
}

function expectedExerciseNames(variant: number): string[] {
  const workout = generateWorkout(SELECTED_PREFERENCES, variant)
  return [
    ...workout.warmup.exercises,
    ...workout.blocks.flatMap((block) => block.exercises),
    ...workout.cooldown.exercises,
  ].map(({ exercise }) => exercise.name)
}

describe('workout lab route', () => {
  it('renders the landing view at /workout-lab', () => {
    renderWorkoutLab()

    expect(
      screen.getByRole('heading', { level: 1, name: /your next workout/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Build my workout' })
    ).toBeInTheDocument()
    expect(screen.getByText('BETA')).toBeInTheDocument()
  })

  it('updates the live summary as preferences change', () => {
    openBuilder()
    selectPreferences()

    expect(screen.getByTestId('preference-summary')).toHaveTextContent(
      '20 min · Intermediate · Upper body · Dumbbells'
    )
  })

  it('generates a workout matching the deterministic generator output', () => {
    openBuilder()
    selectPreferences()
    fireEvent.click(screen.getByRole('button', { name: 'Generate workout' }))

    expect(
      screen.getByRole('heading', { level: 1, name: 'Upper-Body Strength 20' })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Warm-up' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Block 01' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Block 02' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cooldown' })).toBeInTheDocument()

    expect(renderedExerciseNames()).toEqual(expectedExerciseNames(0))
  })

  it('produces the next variant when asked for another workout', () => {
    openBuilder()
    selectPreferences()
    fireEvent.click(screen.getByRole('button', { name: 'Generate workout' }))
    fireEvent.click(screen.getByRole('button', { name: 'Give me another' }))

    expect(renderedExerciseNames()).toEqual(expectedExerciseNames(1))
  })

  it('returns to the builder with selections preserved', () => {
    openBuilder()
    selectPreferences()
    fireEvent.click(screen.getByRole('button', { name: 'Generate workout' }))
    fireEvent.click(screen.getByRole('button', { name: 'Edit preferences' }))

    expect(screen.getByRole('radio', { name: 'Build strength' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Intermediate' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '20 min' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Dumbbells' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Upper body' })).toBeChecked()
  })
})
