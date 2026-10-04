import type { ReactElement } from 'react'
import type { DailyMealTotals } from '../utils/mealTotals'
import styles from '../automatic-food-logger.module.css'

type TodayTotalsProps = { totals: DailyMealTotals }

export default function TodayTotals({ totals }: TodayTotalsProps): ReactElement {
  const totalMealCount = totals.loggedMealCount + totals.awaitingEstimateCount

  return (
    <section className={styles.card} aria-labelledby="food-logger-today-title">
      <h2 id="food-logger-today-title" className={styles.cardTitle}>
        Today
      </h2>
      <dl className={styles.totalsGrid}>
        <div className={styles.totalTile}>
          <dt>Calories</dt>
          <dd>{totals.kcal}</dd>
        </div>
        <div className={styles.totalTile}>
          <dt>Protein</dt>
          <dd>{totals.proteinGrams}g</dd>
        </div>
        <div className={styles.totalTile}>
          <dt>Carbs</dt>
          <dd>{totals.carbsGrams}g</dd>
        </div>
        <div className={styles.totalTile}>
          <dt>Fat</dt>
          <dd>{totals.fatGrams}g</dd>
        </div>
      </dl>
      <p className={styles.hintText}>
        {totalMealCount === 1 ? '1 meal' : `${totalMealCount} meals`} today
        {totals.awaitingEstimateCount > 0 ? ` · ${totals.awaitingEstimateCount} waiting for an estimate` : ''}
      </p>
    </section>
  )
}
