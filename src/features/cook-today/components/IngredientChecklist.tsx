import { useState, type ReactElement } from 'react'
import type { RecipeIngredient } from '../types'
import styles from '../cook-today.module.css'

type IngredientChecklistProps = {
  ingredients: RecipeIngredient[]
  videoUrl?: string
  sourceUrl?: string
  sourceName?: string
}

export default function IngredientChecklist({
  ingredients,
  videoUrl,
  sourceUrl,
  sourceName,
}: IngredientChecklistProps): ReactElement {
  const [onHand, setOnHand] = useState<string[]>([])

  function toggle(name: string): void {
    setOnHand((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    )
  }

  const missing = ingredients.filter(
    (ingredient) => !onHand.includes(ingredient.name)
  )

  return (
    <div className={styles.checklist}>
      <h4 className={styles.checklistHeading}>Tick what you already have</h4>
      <div className={styles.checklistGrid}>
        {ingredients.map((ingredient) => (
          <label className={styles.option} key={ingredient.name}>
            <input
              type="checkbox"
              checked={onHand.includes(ingredient.name)}
              onChange={() => toggle(ingredient.name)}
            />
            <span>
              {ingredient.name}
              {ingredient.measure && (
                <small className={styles.measure}> {ingredient.measure}</small>
              )}
            </span>
          </label>
        ))}
      </div>

      <div className={styles.groceryList} aria-live="polite">
        <h4 className={styles.checklistHeading}>
          {missing.length === 0
            ? 'You have everything — get cooking'
            : `Need from the store (${missing.length})`}
        </h4>
        {missing.length > 0 && (
          <ul>
            {missing.map((ingredient) => (
              <li key={ingredient.name}>
                {ingredient.name}
                {ingredient.measure && (
                  <small className={styles.measure}> {ingredient.measure}</small>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {(videoUrl || sourceUrl) && (
        <p className={styles.recipeLinks}>
          {videoUrl && (
            <a href={videoUrl} target="_blank" rel="noreferrer">
              ▶ Watch how to make it
            </a>
          )}
          {videoUrl && sourceUrl && ' · '}
          {sourceUrl && (
            <a href={sourceUrl} target="_blank" rel="noreferrer">
              Full recipe{sourceName ? ` → ${sourceName}` : ''}
            </a>
          )}
        </p>
      )}
    </div>
  )
}
