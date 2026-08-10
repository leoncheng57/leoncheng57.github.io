import { useRef, useState, type ReactElement } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EXERCISE_DETAILS } from '../data/exercise-details'
import {
  getExerciseVideo,
  shortsSearchVideo,
  type ExerciseVideo,
} from '../data/exercise-videos'
import { getExerciseById } from '../data/exercises'
import ExerciseModal from './ExerciseModal'

const exercise = getExerciseById('bodyweight-squat')!

function ModalHarness({
  video = getExerciseVideo(exercise.id),
}: {
  video?: ExerciseVideo
}): ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setIsOpen(true)}>
        Open exercise
      </button>
      {isOpen ? (
        <ExerciseModal
          exercise={exercise}
          detail={EXERCISE_DETAILS[exercise.id]}
          video={video}
          returnFocusTo={triggerRef.current}
          onClose={() => setIsOpen(false)}
        />
      ) : null}
    </>
  )
}

describe('ExerciseModal', () => {
  it('shows detailed steps, warnings, an illustration, and a Google link', () => {
    render(<ModalHarness />)
    fireEvent.click(screen.getByRole('button', { name: 'Open exercise' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: exercise.name })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'How to do it' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Warnings' })).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'squat movement illustration' })
    ).toBeInTheDocument()
    const googleLink = screen.getByRole('link', {
      name: 'Search Google for a demonstration',
    })
    expect(googleLink).toHaveAttribute(
      'href',
      'https://www.google.com/search?q=how%20to%20do%20Bodyweight%20Squat'
    )
    expect(googleLink).toHaveAttribute('target', '_blank')
    expect(googleLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('links to the reviewed YouTube Short with channel attribution', () => {
    render(<ModalHarness />)
    fireEvent.click(screen.getByRole('button', { name: 'Open exercise' }))

    const videoLink = screen.getByRole('link', { name: 'Watch YouTube Short' })
    expect(videoLink).toHaveAttribute(
      'href',
      getExerciseVideo(exercise.id).url
    )
    expect(videoLink).toHaveAttribute('target', '_blank')
    expect(videoLink).toHaveAttribute('rel', 'noopener noreferrer')
    expect(
      screen.getByText(`by ${getExerciseVideo(exercise.id).channel}`)
    ).toBeInTheDocument()
  })

  it('labels search fallbacks differently and omits attribution', () => {
    render(<ModalHarness video={shortsSearchVideo(exercise.name)} />)
    fireEvent.click(screen.getByRole('button', { name: 'Open exercise' }))

    const searchLink = screen.getByRole('link', {
      name: 'Find Shorts on YouTube',
    })
    expect(searchLink).toHaveAttribute(
      'href',
      expect.stringContaining('youtube.com/results?search_query=')
    )
    expect(screen.queryByText(/^by /)).not.toBeInTheDocument()
  })

  it('closes with Escape and restores focus to its trigger', () => {
    render(<ModalHarness />)
    const trigger = screen.getByRole('button', { name: 'Open exercise' })
    fireEvent.click(trigger)

    expect(screen.getByRole('button', { name: /close bodyweight squat details/i })).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes when the backdrop is clicked', () => {
    render(<ModalHarness />)
    fireEvent.click(screen.getByRole('button', { name: 'Open exercise' }))

    const backdrop = screen.getByRole('dialog').parentElement!
    fireEvent.mouseDown(backdrop)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
