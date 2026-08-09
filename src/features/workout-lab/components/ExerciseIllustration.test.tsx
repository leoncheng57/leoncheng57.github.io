import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { MovementPattern } from '../types'
import ExerciseIllustration from './ExerciseIllustration'

const PATTERNS: MovementPattern[] = [
  'squat',
  'hinge',
  'lunge',
  'push',
  'pull',
  'core',
  'carry',
  'cardio',
  'mobility',
  'stretch',
]

describe('ExerciseIllustration', () => {
  it.each(PATTERNS)('renders the %s pattern illustration', (pattern) => {
    render(<ExerciseIllustration pattern={pattern} />)
    expect(
      screen.getByRole('img', { name: `${pattern} movement illustration` })
    ).toBeInTheDocument()
  })
})
