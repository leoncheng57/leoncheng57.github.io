import { useState, type ReactElement } from 'react'
import type { LoggedMeal, MealMacros } from '../types'
import { formatMacrosSummary } from '../utils/mealTotals'
import { parseMacroEstimate } from '../utils/parseMacroEstimate'
import styles from '../automatic-food-logger.module.css'

const MEAL_TIME_FORMAT = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  hour: 'numeric',
  minute: '2-digit',
})

async function readClipboardText(): Promise<string | null> {
  try {
    return (await navigator.clipboard?.readText()) ?? null
  } catch {
    return null
  }
}

type MealHistoryListProps = {
  meals: LoggedMeal[]
  onApplyEstimate: (_mealId: string, _macros: MealMacros) => void
  onRemoveMeal: (_mealId: string) => void
}

export default function MealHistoryList({ meals, onApplyEstimate, onRemoveMeal }: MealHistoryListProps): ReactElement {
  const [pasteErrorsByMealId, setPasteErrorsByMealId] = useState<Record<string, string>>({})

  const pasteEstimateFromClipboard = async (mealId: string): Promise<void> => {
    const clipboardText = await readClipboardText()
    const macros = clipboardText ? parseMacroEstimate(clipboardText) : null
    if (!macros) {
      setPasteErrorsByMealId((currentErrors) => ({
        ...currentErrors,
        [mealId]: clipboardText
          ? 'The clipboard does not hold a macros estimate yet. Run the Shortcut, then try again.'
          : 'Could not read the clipboard. Allow pasting when iOS asks.',
      }))
      return
    }
    setPasteErrorsByMealId(({ [mealId]: _clearedError, ...remainingErrors }) => remainingErrors)
    onApplyEstimate(mealId, macros)
  }

  return (
    <section className={styles.card} aria-labelledby="food-logger-history-title">
      <h2 id="food-logger-history-title" className={styles.cardTitle}>
        History
      </h2>
      {meals.length === 0 ? (
        <p className={styles.hintText}>No meals yet. Your first log shows up here.</p>
      ) : (
        <ul className={styles.historyList}>
          {meals.map((meal) => (
            <li key={meal.id} className={styles.historyItem}>
              <div className={styles.historyItemHeader}>
                <p className={styles.historyDescription}>{meal.description}</p>
                <time className={styles.historyTime} dateTime={meal.loggedAt}>
                  {MEAL_TIME_FORMAT.format(new Date(meal.loggedAt))}
                </time>
              </div>
              {meal.macros ? (
                <p className={styles.historyMacros}>{formatMacrosSummary(meal.macros)}</p>
              ) : (
                <p className={styles.awaitingText}>Waiting for Claude&apos;s estimate</p>
              )}
              {pasteErrorsByMealId[meal.id] ? (
                <p className={styles.errorText} role="alert">
                  {pasteErrorsByMealId[meal.id]}
                </p>
              ) : null}
              <div className={styles.historyActions}>
                {meal.status === 'awaiting-estimate' ? (
                  <button type="button" className={styles.secondaryButton} onClick={() => void pasteEstimateFromClipboard(meal.id)}>
                    Paste estimate
                  </button>
                ) : null}
                <button
                  type="button"
                  className={styles.textButton}
                  aria-label={`Remove ${meal.description}`}
                  onClick={() => onRemoveMeal(meal.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {meals.length > 0 ? (
        <p className={styles.hintText}>Removing a meal here does not delete it from Apple Health.</p>
      ) : null}
    </section>
  )
}
