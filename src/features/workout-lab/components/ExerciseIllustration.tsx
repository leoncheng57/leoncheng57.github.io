import type { ReactElement, ReactNode } from 'react'
import type { MovementPattern } from '../types'

interface ExerciseIllustrationProps {
  pattern: MovementPattern
  className?: string
}

const FIGURES: Record<MovementPattern, ReactNode> = {
  squat: (
    <>
      <circle cx="61" cy="29" r="10" />
      <path d="M59 40 48 67l22 14 19 27M48 67 31 91M70 81l-8 29M31 91H15M89 108h17" />
      <path d="M55 48 79 58l20-5" />
    </>
  ),
  hinge: (
    <>
      <circle cx="42" cy="33" r="10" />
      <path d="m50 39 31 24 19 3M81 63l-8 42M81 63l24 39M73 105H56M105 102h15M58 46 37 65" />
    </>
  ),
  lunge: (
    <>
      <circle cx="65" cy="27" r="10" />
      <path d="M63 38 61 72l-28 29M61 72l38 22M33 101H16M99 94h21M61 47 42 64M62 47l22 15" />
    </>
  ),
  push: (
    <>
      <circle cx="103" cy="47" r="9" />
      <path d="M94 51 67 62 31 79M67 62l18 23M31 79 15 92M31 79l8 23M85 85h23M39 102h18" />
      <path d="M81 57 92 72l19-4" />
    </>
  ),
  pull: (
    <>
      <path d="M21 23h86M34 23v18M94 23v18" />
      <circle cx="64" cy="54" r="10" />
      <path d="M58 44 36 35M70 44l24-9M64 65v35M64 78 43 101M64 78l22 24M43 101H28M86 102h15" />
    </>
  ),
  core: (
    <>
      <circle cx="31" cy="77" r="9" />
      <path d="m40 75 33-17 29 24M73 58l-7 34M66 92H49M102 82h18M56 66 38 52M73 58l10-24" />
      <path d="M52 71c8 7 15 9 23 7" />
    </>
  ),
  carry: (
    <>
      <circle cx="64" cy="25" r="10" />
      <path d="M64 36v39M64 47 38 63M64 47l27 16M64 75l-19 34M64 75l19 34M45 109H29M83 109h16" />
      <path d="M28 67h20v17H28zM81 67h20v17H81z" />
    </>
  ),
  cardio: (
    <>
      <circle cx="65" cy="27" r="10" />
      <path d="m59 38-9 31 29 12 27 23M50 69 25 96M79 81 59 108M25 96H9M106 104h15M55 46 34 57M56 45l23 12" />
      <path d="M18 45H5M25 32H13M23 60H8" />
    </>
  ),
  mobility: (
    <>
      <circle cx="64" cy="27" r="10" />
      <path d="M64 38v39M64 49 31 37M64 49l33-12M64 77l-22 33M64 77l22 33M42 110H26M86 110h16" />
      <path d="M26 29c11-13 24-18 38-18M102 29C91 16 78 11 64 11" />
      <path d="m27 21-1 8 8 1M101 21l1 8-8 1" />
    </>
  ),
  stretch: (
    <>
      <circle cx="58" cy="28" r="10" />
      <path d="m57 39-9 34-29 24M48 73l37 7 26 24M19 97H5M111 104h13M53 47 27 61M53 47l23 17" />
      <path d="M25 53c-8 7-11 15-10 24" />
      <path d="m10 70 5 7 7-5" />
    </>
  ),
}

export default function ExerciseIllustration({
  pattern,
  className,
}: ExerciseIllustrationProps): ReactElement {
  return (
    <svg
      className={className}
      viewBox="0 0 128 128"
      role="img"
      aria-label={`${pattern} movement illustration`}
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {FIGURES[pattern]}
    </svg>
  )
}
