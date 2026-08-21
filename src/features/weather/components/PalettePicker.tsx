import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from 'react'
import { getPalette, PALETTES, type Palette } from '../palettes'
import styles from '../weather.module.css'

/**
 * Swatch-only palette picker.
 *
 * A native `<select>` cannot show what a palette looks like: browsers and
 * platforms disagree about what may render inside an `<option>`, and several
 * draw text only. So the trigger and every option are custom elements that
 * paint the palette's colour strip, and the palette name is kept in the
 * accessibility tree with visually hidden text rather than on screen.
 *
 * Pattern: a plain button that owns a `role="listbox"` popup. This is a
 * single-choice input, so an ARIA `menu` would be the wrong role. Focus moves
 * into the listbox while it is open (roving tabindex) rather than staying on
 * the trigger with `aria-activedescendant`; both are permitted, and real DOM
 * focus keeps `:focus-visible` working without extra styling.
 */

type PalettePickerProps = {
  /** Currently applied palette id. */
  readonly value: Palette
  /** Called with the newly chosen palette id. */
  readonly onChange: (_next: Palette) => void
}

const LISTBOX_ID = 'wx-palette-listbox'

function Swatches({ colors }: { colors: readonly string[] }): ReactElement {
  return (
    <span className={styles.paletteStrip} aria-hidden="true">
      {colors.map((color, index) => (
        <span
          // Palettes repeat colours (several share #ffffff), so the index is
          // part of the key. The list is static, so this is stable.
          key={`${color}-${index}`}
          className={styles.paletteSwatch}
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  )
}

export default function PalettePicker({
  value,
  onChange,
}: PalettePickerProps): ReactElement {
  const [open, setOpen] = useState(false)
  const selectedIndex = PALETTES.findIndex((palette) => palette.id === value)
  // Which option owns tabindex=0 / DOM focus while the popup is open.
  const [activeIndex, setActiveIndex] = useState(Math.max(selectedIndex, 0))

  const rootRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const optionRefs = useRef<(HTMLDivElement | null)[]>([])
  // Set while closing so the effect below knows to hand focus back.
  const restoreFocusRef = useRef(false)

  const selected = getPalette(value)

  const closeAndRestore = useCallback(() => {
    restoreFocusRef.current = true
    setOpen(false)
  }, [])

  // Move focus onto the active option each time the popup opens or the
  // highlight moves, and back to the trigger when the user dismisses it.
  useEffect(() => {
    if (open) {
      optionRefs.current[activeIndex]?.focus()
      return
    }
    if (restoreFocusRef.current) {
      restoreFocusRef.current = false
      triggerRef.current?.focus()
    }
  }, [open, activeIndex])

  // Click-away dismissal. Pointer events inside the picker are ignored so a
  // click on an option still selects before the popup unmounts.
  useEffect(() => {
    if (!open) return undefined
    const onDocumentMouseDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocumentMouseDown)
    return () => document.removeEventListener('mousedown', onDocumentMouseDown)
  }, [open])

  const openAt = (index: number) => {
    setActiveIndex(index)
    setOpen(true)
  }

  const select = (index: number) => {
    onChange(PALETTES[index].id)
    setActiveIndex(index)
    closeAndRestore()
  }

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    // Enter and Space already arrive as clicks on a button; only the arrow
    // shortcuts need handling here.
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      openAt(Math.max(selectedIndex, 0))
    }
  }

  const onListboxKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = PALETTES.length - 1
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        setActiveIndex(activeIndex >= last ? 0 : activeIndex + 1)
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault()
        setActiveIndex(activeIndex <= 0 ? last : activeIndex - 1)
        break
      case 'Home':
        event.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        event.preventDefault()
        setActiveIndex(last)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        select(activeIndex)
        break
      case 'Escape':
        event.preventDefault()
        closeAndRestore()
        break
      default:
        // Tab is deliberately unhandled so focus is never trapped; the
        // focusout handler closes the popup on the way past.
        break
    }
  }

  return (
    <div
      className={styles.palettePicker}
      ref={rootRef}
      onBlur={(event) => {
        // Tab (or a click on another control) moves focus to a known element
        // outside the picker, so the popup gets out of the way. A null
        // relatedTarget means the whole window lost focus — switching apps
        // should not discard an open popup, so that case is ignored.
        const next = event.relatedTarget as Node | null
        if (next && !event.currentTarget.contains(next)) {
          setOpen(false)
        }
      }}
    >
      <button
        type="button"
        ref={triggerRef}
        className={styles.paletteTrigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? LISTBOX_ID : undefined}
        onClick={() => {
          if (open) {
            closeAndRestore()
          } else {
            openAt(Math.max(selectedIndex, 0))
          }
        }}
        onKeyDown={onTriggerKeyDown}
      >
        <Swatches colors={selected.swatches} />
        <span className={styles.paletteSrName}>Colorway: {selected.label}</span>
        <svg
          className={styles.paletteCaret}
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <path d="M2.5 4.5 6 8l3.5-3.5" />
        </svg>
      </button>

      {open ? (
        <div
          id={LISTBOX_ID}
          role="listbox"
          aria-label="Colorway"
          className={styles.paletteListbox}
          onKeyDown={onListboxKeyDown}
        >
          {PALETTES.map((palette, index) => {
            const isSelected = palette.id === value
            return (
              <div
                key={palette.id}
                role="option"
                aria-selected={isSelected}
                tabIndex={index === activeIndex ? 0 : -1}
                ref={(node) => {
                  optionRefs.current[index] = node
                }}
                className={
                  isSelected
                    ? `${styles.paletteOption} ${styles.paletteOptionSelected}`
                    : styles.paletteOption
                }
                onClick={() => select(index)}
              >
                <Swatches colors={palette.swatches} />
                <span className={styles.paletteSrName}>{palette.label}</span>
                <span className={styles.paletteCheck} aria-hidden="true">
                  {isSelected ? (
                    <svg viewBox="0 0 12 12">
                      <path d="M2.5 6.3 4.8 8.6 9.5 3.9" />
                    </svg>
                  ) : null}
                </span>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
