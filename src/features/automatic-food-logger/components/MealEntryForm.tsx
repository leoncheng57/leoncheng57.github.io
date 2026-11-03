import { useEffect, useId, useState, type FormEvent, type ReactElement } from 'react'
import type { LoggedMeal, MealMacros } from '../types'
import { roundGrams } from '../utils/parseMacroEstimate'
import styles from '../automatic-food-logger.module.css'

const HANDOFF_COOLDOWN_MILLISECONDS = 3000

type MacroFieldValues = { kcal: string; proteinGrams: string; carbsGrams: string; fatGrams: string }

const EMPTY_MACRO_FIELD_VALUES: MacroFieldValues = { kcal: '', proteinGrams: '', carbsGrams: '', fatGrams: '' }

function parseNonNegativeFieldValue(fieldValue: string): number | null {
  if (fieldValue.trim() === '') return 0
  const parsedNumber = Number(fieldValue)
  return Number.isFinite(parsedNumber) && parsedNumber >= 0 ? parsedNumber : null
}

export function buildMacrosFromFieldValues(fieldValues: MacroFieldValues): MealMacros | null | undefined {
  if (fieldValues.kcal.trim() === '') return undefined
  const kcal = parseNonNegativeFieldValue(fieldValues.kcal)
  const proteinGrams = parseNonNegativeFieldValue(fieldValues.proteinGrams)
  const carbsGrams = parseNonNegativeFieldValue(fieldValues.carbsGrams)
  const fatGrams = parseNonNegativeFieldValue(fieldValues.fatGrams)
  if (kcal === null || proteinGrams === null || carbsGrams === null || fatGrams === null) return null
  return {
    kcal: Math.round(kcal),
    proteinGrams: roundGrams(proteinGrams),
    carbsGrams: roundGrams(carbsGrams),
    fatGrams: roundGrams(fatGrams),
  }
}

type MealEntryFormProps = {
  recentMealsWithMacros: LoggedMeal[]
  onLogMeal: (_description: string, _macros?: MealMacros) => void
}

export default function MealEntryForm({ recentMealsWithMacros, onLogMeal }: MealEntryFormProps): ReactElement {
  const formId = useId()
  const [description, setDescription] = useState('')
  const [areMacroFieldsOpen, setAreMacroFieldsOpen] = useState(false)
  const [macroFieldValues, setMacroFieldValues] = useState<MacroFieldValues>(EMPTY_MACRO_FIELD_VALUES)
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const [isHandingOffToShortcut, setIsHandingOffToShortcut] = useState(false)

  useEffect(() => {
    if (!isHandingOffToShortcut) return undefined
    const cooldownTimer = window.setTimeout(() => setIsHandingOffToShortcut(false), HANDOFF_COOLDOWN_MILLISECONDS)
    return () => window.clearTimeout(cooldownTimer)
  }, [isHandingOffToShortcut])

  const logMealAndStartCooldown = (mealDescription: string, macros?: MealMacros): void => {
    setIsHandingOffToShortcut(true)
    onLogMeal(mealDescription, macros)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isHandingOffToShortcut || description.trim() === '') return

    const macros = buildMacrosFromFieldValues(macroFieldValues)
    if (macros === null) {
      setValidationMessage('Macros must be numbers of zero or more.')
      return
    }

    setValidationMessage(null)
    logMealAndStartCooldown(description, macros)
    setDescription('')
    setMacroFieldValues(EMPTY_MACRO_FIELD_VALUES)
  }

  const updateMacroField = (fieldName: keyof MacroFieldValues, fieldValue: string): void => {
    setMacroFieldValues((currentValues) => ({ ...currentValues, [fieldName]: fieldValue }))
  }

  const hasKnownMacros = macroFieldValues.kcal.trim() !== ''

  return (
    <section className={styles.card} aria-labelledby={`${formId}-title`}>
      <h2 id={`${formId}-title`} className={styles.cardTitle}>
        What did you eat?
      </h2>
      <form className={styles.mealForm} onSubmit={handleSubmit}>
        <label className={styles.visuallyHidden} htmlFor={`${formId}-description`}>
          Meal description
        </label>
        <textarea
          id={`${formId}-description`}
          className={styles.descriptionInput}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="e.g. chicken burrito bowl with guac, large iced latte"
          rows={3}
          required
        />

        <button
          type="button"
          className={styles.textButton}
          aria-expanded={areMacroFieldsOpen}
          aria-controls={`${formId}-macros`}
          onClick={() => setAreMacroFieldsOpen((isOpen) => !isOpen)}
        >
          {areMacroFieldsOpen ? 'Hide macros' : 'I know the macros'}
        </button>

        {areMacroFieldsOpen ? (
          <fieldset id={`${formId}-macros`} className={styles.macroFields}>
            <legend className={styles.macroLegend}>Leave calories blank to have Claude estimate</legend>
            <label className={styles.macroField}>
              <span>Calories</span>
              <input inputMode="decimal" value={macroFieldValues.kcal} onChange={(event) => updateMacroField('kcal', event.target.value)} />
            </label>
            <label className={styles.macroField}>
              <span>Protein (g)</span>
              <input inputMode="decimal" value={macroFieldValues.proteinGrams} onChange={(event) => updateMacroField('proteinGrams', event.target.value)} />
            </label>
            <label className={styles.macroField}>
              <span>Carbs (g)</span>
              <input inputMode="decimal" value={macroFieldValues.carbsGrams} onChange={(event) => updateMacroField('carbsGrams', event.target.value)} />
            </label>
            <label className={styles.macroField}>
              <span>Fat (g)</span>
              <input inputMode="decimal" value={macroFieldValues.fatGrams} onChange={(event) => updateMacroField('fatGrams', event.target.value)} />
            </label>
          </fieldset>
        ) : null}

        {validationMessage ? (
          <p className={styles.errorText} role="alert">
            {validationMessage}
          </p>
        ) : null}

        <button type="submit" className={styles.primaryButton} disabled={isHandingOffToShortcut || description.trim() === ''}>
          {isHandingOffToShortcut ? 'Opening Shortcuts…' : 'Log to Apple Health'}
        </button>
        <p className={styles.hintText}>
          {hasKnownMacros
            ? 'Your macros go straight to Apple Health.'
            : 'Claude estimates the macros inside the Log Food Shortcut.'}
        </p>
      </form>

      {recentMealsWithMacros.length > 0 ? (
        <div className={styles.recentMeals}>
          <h3 className={styles.recentMealsTitle}>Log again</h3>
          <ul className={styles.recentMealChips}>
            {recentMealsWithMacros.map((recentMeal) => (
              <li key={recentMeal.id}>
                <button
                  type="button"
                  className={styles.chipButton}
                  disabled={isHandingOffToShortcut}
                  onClick={() => logMealAndStartCooldown(recentMeal.description, recentMeal.macros)}
                >
                  {recentMeal.description}
                  <span className={styles.chipKcal}>{recentMeal.macros?.kcal} kcal</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
