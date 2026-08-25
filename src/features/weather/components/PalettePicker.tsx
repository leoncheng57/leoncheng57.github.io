import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from 'react'
import { getPalette, PALETTES, type Palette } from '../palettes'
import type { Theme } from '../hooks/useTheme'
import styles from '../weather.module.css'

type PalettePickerProps = {
  readonly value: Palette
  readonly theme: Theme
  readonly onChange: (_palette: Palette, _theme: Theme) => void
}

const TITLE_ID = 'wx-appearance-dialog-title'
const THEMES: readonly Theme[] = ['light', 'dark']

function appearanceKey(palette: Palette, theme: Theme): string {
  return `${palette}-${theme}`
}

function modeLabel(theme: Theme): string {
  return theme === 'light' ? 'Light' : 'Dark'
}

function MiniWeatherCard({ theme }: { theme: Theme }): ReactElement {
  return (
    <span className={styles.paletteCard} aria-hidden="true">
      <span className={styles.appearanceMode}>{modeLabel(theme)}</span>
      <span className={styles.paletteCardPanel}>
        <span className={styles.paletteCardForecast}>
          <strong>72°</strong>
          <span>Overcast</span>
        </span>
        <span className={styles.paletteCardDetails}>Details</span>
        <span className={styles.paletteCardTemperatures}>
          <span className={styles.paletteCardHigh}>H 81°</span>
          <span className={styles.paletteCardLow}>L 64°</span>
        </span>
      </span>
    </span>
  )
}

function AppearanceIcon({ theme }: { theme: Theme }): ReactElement {
  return theme === 'light' ? (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="2.2" />
      <path d="M8 1.5v1.3M8 13.2v1.3M1.5 8h1.3M13.2 8h1.3M3.4 3.4l.9.9M11.7 11.7l.9.9M12.6 3.4l-.9.9M4.3 11.7l-.9.9" />
    </svg>
  ) : (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M13.3 10.5A5.8 5.8 0 0 1 5.5 2.7a5.8 5.8 0 1 0 7.8 7.8Z" />
    </svg>
  )
}

export default function PalettePicker({
  value,
  theme,
  onChange,
}: PalettePickerProps): ReactElement {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const radioRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const selectedKeyRef = useRef(appearanceKey(value, theme))
  selectedKeyRef.current = appearanceKey(value, theme)
  const selected = getPalette(value)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    radioRefs.current[selectedKeyRef.current]?.focus()

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled])',
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      triggerRef.current?.focus()
    }
  }, [close, open])

  const keepRadioFocus = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!event.key.startsWith('Arrow')) return
    requestAnimationFrame(() => {
      dialogRef.current
        ?.querySelector<HTMLInputElement>('input[type="radio"]:checked')
        ?.focus()
    })
  }

  return (
    <div className={styles.palettePicker}>
      <button
        type="button"
        ref={triggerRef}
        className={`${styles.appearanceTrigger} ${styles.palettePreview} ${styles.page}`}
        data-palette={value}
        data-theme={theme}
        aria-label={`Choose appearance: ${selected.label}, ${modeLabel(theme)} mode`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span className={styles.appearanceSwatches} aria-hidden="true">
          <span className={styles.appearanceSwatchPage} />
          <span className={styles.appearanceSwatchCard} />
          <span className={styles.appearanceSwatchHigh} />
          <span className={styles.appearanceSwatchLow} />
        </span>
        <span className={styles.appearanceIcon} aria-hidden="true">
          <AppearanceIcon theme={theme} />
        </span>
      </button>

      {open ? (
        <div
          className={styles.paletteBackdrop}
          data-testid="appearance-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) close()
          }}
        >
          <div
            ref={dialogRef}
            className={styles.paletteDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby={TITLE_ID}
          >
            <header className={styles.paletteDialogHeader}>
              <h2 id={TITLE_ID}>Choose an appearance</h2>
              <button
                type="button"
                className={styles.paletteClose}
                aria-label="Close appearance chooser"
                onClick={close}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="m3 3 10 10M13 3 3 13" />
                </svg>
              </button>
            </header>

            <div
              className={styles.paletteGrid}
              role="radiogroup"
              aria-labelledby={TITLE_ID}
            >
              {PALETTES.map((palette) => (
                <div key={palette.id} className={styles.appearancePair}>
                  {THEMES.map((optionTheme) => {
                    const key = appearanceKey(palette.id, optionTheme)
                    const nameId = `wx-appearance-${key}-name`
                    return (
                      <label
                        key={optionTheme}
                        className={`${styles.paletteOption} ${styles.palettePreview} ${styles.page}`}
                        data-palette={palette.id}
                        data-theme={optionTheme}
                      >
                        <input
                          ref={(node) => {
                            radioRefs.current[key] = node
                          }}
                          className={styles.paletteRadio}
                          type="radio"
                          name="weather-appearance"
                          value={key}
                          checked={palette.id === value && optionTheme === theme}
                          aria-labelledby={nameId}
                          onChange={() => onChange(palette.id, optionTheme)}
                          onKeyDown={keepRadioFocus}
                        />
                        <span id={nameId} className={styles.paletteSrName}>
                          {palette.label}, {modeLabel(optionTheme)} mode
                        </span>
                        <MiniWeatherCard theme={optionTheme} />
                        <span className={styles.paletteCheck} aria-hidden="true">
                          <svg viewBox="0 0 16 16">
                            <path d="m3 8.4 3.1 3.1L13 4.7" />
                          </svg>
                        </span>
                      </label>
                    )
                  })}
                </div>
              ))}
            </div>

            <footer className={styles.paletteDialogFooter}>
              <button type="button" className={styles.paletteDone} onClick={close}>
                Done
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  )
}
