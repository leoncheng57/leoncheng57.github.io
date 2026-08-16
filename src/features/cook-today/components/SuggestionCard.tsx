import type { ReactElement } from 'react'
import type { SuggestionCandidate } from '../types'
import styles from '../cook-today.module.css'

type SuggestionCardProps = {
  candidate: SuggestionCandidate
  expanded: boolean
  onToggle: () => void
}

export default function SuggestionCard({
  candidate,
  expanded,
  onToggle,
}: SuggestionCardProps): ReactElement {
  const curated = candidate.curated

  return (
    <article className={styles.suggestion}>
      <div className={styles.suggestionHeader}>
        {candidate.thumbnailUrl ? (
          <img
            className={styles.suggestionThumb}
            src={candidate.thumbnailUrl}
            alt=""
            width={72}
            height={72}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className={styles.suggestionThumbFallback} aria-hidden="true">
            🍳
          </span>
        )}
        <div className={styles.suggestionHeading}>
          <h3>{candidate.title}</h3>
          <p className={styles.suggestionMeta}>
            {curated
              ? `${curated.category} · ${curated.cuisineLabel} · ~${curated.totalTimeMinutes} min`
              : 'From TheMealDB'}
          </p>
          <p className={styles.chips}>
            {candidate.matchedLabels.map((label) => (
              <span className={styles.chip} key={label}>
                {label}
              </span>
            ))}
            {curated?.dietLabels.map((label) => (
              <span className={styles.dietChip} key={label}>
                {label}
              </span>
            ))}
          </p>
        </div>
      </div>
      <p className={styles.suggestionActions}>
        <button type="button" onClick={onToggle} aria-expanded={expanded}>
          {expanded ? 'Hide ingredients' : 'Check my ingredients'}
        </button>
      </p>
    </article>
  )
}
