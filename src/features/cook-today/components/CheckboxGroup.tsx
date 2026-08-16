import type { ReactElement } from 'react'
import type { FormOption } from '../data/form-options'
import styles from '../cook-today.module.css'

type CheckboxGroupProps = {
  legend: string
  hint?: string
  options: FormOption[]
  selected: string[]
  onToggle: (_id: string) => void
}

export default function CheckboxGroup({
  legend,
  hint,
  options,
  selected,
  onToggle,
}: CheckboxGroupProps): ReactElement {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      {hint && <p className={styles.hint}>{hint}</p>}
      <div className={styles.optionGrid}>
        {options.map((option) => (
          <label className={styles.option} key={option.id}>
            <input
              type="checkbox"
              checked={selected.includes(option.id)}
              onChange={() => onToggle(option.id)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
