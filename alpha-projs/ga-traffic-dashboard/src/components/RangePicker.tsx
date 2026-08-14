import { useEffect, useRef, useState } from 'react'
import { DayPicker, type DateRange as DayPickerRange } from 'react-day-picker'
import 'react-day-picker/style.css'
import {
  EARLIEST_DATA,
  PRESETS,
  fromIso,
  toIso,
  type DateRange,
} from '../dates'
import styles from '../dashboard.module.css'

type Props = {
  range: DateRange
  onChange: (range: DateRange) => void
}

export default function RangePicker({ range, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DayPickerRange | undefined>()
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!popoverRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const activePreset = PRESETS.find((preset) => {
    const presetRange = preset.range()
    return presetRange.start === range.start && presetRange.end === range.end
  })

  return (
    <div className={styles.rangeBar}>
      {PRESETS.map((preset) => (
        <button
          key={preset.label}
          type="button"
          className={
            activePreset?.label === preset.label
              ? `${styles.presetButton} ${styles.presetButtonActive}`
              : styles.presetButton
          }
          onClick={() => {
            setOpen(false)
            onChange(preset.range())
          }}
        >
          {preset.label}
        </button>
      ))}
      <div className={styles.pickerPopover} ref={popoverRef}>
        <button
          type="button"
          className={
            open || !activePreset
              ? `${styles.presetButton} ${styles.presetButtonActive}`
              : styles.presetButton
          }
          onClick={() => {
            setDraft({ from: fromIso(range.start), to: fromIso(range.end) })
            setOpen((value) => !value)
          }}
        >
          Custom
        </button>
        {open && (
          <div className={styles.pickerPanel}>
            <DayPicker
              mode="range"
              numberOfMonths={2}
              selected={draft}
              defaultMonth={draft?.from}
              disabled={{ before: EARLIEST_DATA, after: new Date() }}
              onSelect={setDraft}
            />
            <div className={styles.pickerActions}>
              <button
                type="button"
                className={styles.presetButton}
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${styles.presetButton} ${styles.presetButtonActive}`}
                disabled={!draft?.from}
                onClick={() => {
                  if (!draft?.from) return
                  onChange({
                    start: toIso(draft.from),
                    end: toIso(draft.to ?? draft.from),
                  })
                  setOpen(false)
                }}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
      <span className={styles.rangeLabel}>
        {range.start} to {range.end}
      </span>
    </div>
  )
}
