import type { ReactElement } from 'react'
import styles from '../workout-lab.module.css'

interface ChoiceGroupProps<T extends string | number> {
  legend: string
  name: string
  options: Array<{ value: T; label: string }>
  value: T
  onChange: (_value: T) => void
}

export default function ChoiceGroup<T extends string | number>({
  legend,
  name,
  options,
  value,
  onChange,
}: ChoiceGroupProps<T>): ReactElement {
  return (
    <fieldset className={styles.choiceGroup}>
      <legend className={styles.choiceLegend}>{legend}</legend>
      <div className={styles.choiceOptions} role="presentation">
        {options.map((option) => (
          <label
            key={String(option.value)}
            className={
              option.value === value ? styles.choiceSelected : styles.choice
            }
          >
            <input
              className={styles.choiceInput}
              type="radio"
              name={name}
              value={String(option.value)}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
