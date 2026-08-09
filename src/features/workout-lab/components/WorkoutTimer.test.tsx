import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import WorkoutTimer from './WorkoutTimer'

describe('WorkoutTimer', () => {
  it('supports start, pause, reset, and close controls', () => {
    const onClose = vi.fn()
    render(
      <WorkoutTimer
        selection={{
          id: 'rest-1',
          label: 'Block 01 rest',
          seconds: 45,
          kind: 'rest',
        }}
        onClose={onClose}
      />
    )

    expect(screen.getByText('0:45')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close timer' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
