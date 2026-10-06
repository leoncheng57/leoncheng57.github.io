import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import MealEntryForm from '../components/MealEntryForm'
import MealHistoryList from '../components/MealHistoryList'
import TodayTotals from '../components/TodayTotals'
import useMealLog from '../hooks/useMealLog'
import type { MealMacros } from '../types'
import { findRecentMealsWithMacros, sumMealTotalsForDay } from '../utils/mealTotals'
import { openExternalUrl } from '../utils/openExternalUrl'
import { buildLogFoodShortcutUrl } from '../utils/shortcutHandoff'
import styles from '../automatic-food-logger.module.css'

export default function LogMealRoute(): ReactElement {
  const { meals, addMeal, applyEstimate, removeMeal } = useMealLog()

  const logMealThroughShortcut = (description: string, macros?: MealMacros): void => {
    const savedMeal = addMeal(description, macros)
    openExternalUrl(buildLogFoodShortcutUrl(savedMeal))
  }

  return (
    <>
      {meals.length === 0 ? (
        <p className={styles.setupCallout}>
          First time here? <Link to="/automatic-food-logger/setup">Set up the Log Food Shortcut</Link> so
          meals can reach Apple Health.
        </p>
      ) : null}
      <MealEntryForm recentMealsWithMacros={findRecentMealsWithMacros(meals)} onLogMeal={logMealThroughShortcut} />
      <TodayTotals totals={sumMealTotalsForDay(meals, new Date())} />
      <MealHistoryList meals={meals} onApplyEstimate={applyEstimate} onRemoveMeal={removeMeal} />
    </>
  )
}
