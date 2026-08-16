import { useState, type FormEvent, type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import SiteFooter from '../../../components/site-footer/SiteFooter'
import TopNav from '../../../components/top-nav/TopNav'
import {
  filterByArea,
  filterByCategory,
  filterByIngredient,
  lookupMeal,
  type MealDetail,
} from '../api/mealdb'
import CheckboxGroup from '../components/CheckboxGroup'
import IngredientChecklist from '../components/IngredientChecklist'
import SuggestionCard from '../components/SuggestionCard'
import {
  CUISINE_OPTIONS,
  DIET_OPTIONS,
  INGREDIENT_OPTIONS,
} from '../data/form-options'
import type { Selections, SuggestionCandidate } from '../types'
import {
  buildCuratedCandidates,
  rankSuggestions,
  type LabeledResult,
} from '../utils/rank-suggestions'
import styles from '../cook-today.module.css'

const SUGGESTION_LIMIT = 4

type Status = 'idle' | 'loading' | 'ready' | 'error'

const EMPTY_SELECTIONS: Selections = {
  ingredients: [],
  cuisines: [],
  diets: [],
}

function toggleValue(list: string[], id: string): string[] {
  return list.includes(id)
    ? list.filter((item) => item !== id)
    : [...list, id]
}

/** Credits the recipe's own site, e.g. "geniuskitchen.com". */
function hostLabel(url?: string): string | undefined {
  if (!url) return undefined
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return undefined
  }
}

export default function CookTodayRoute(): ReactElement {
  const [selections, setSelections] = useState<Selections>(EMPTY_SELECTIONS)
  const [status, setStatus] = useState<Status>('idle')
  const [results, setResults] = useState<LabeledResult[]>([])
  const [curated, setCurated] = useState<SuggestionCandidate[]>([])
  const [seed, setSeed] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [details, setDetails] = useState<Record<string, MealDetail | null>>({})
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null)

  const totalChecked =
    selections.ingredients.length +
    selections.cuisines.length +
    selections.diets.length

  const suggestions =
    status === 'ready'
      ? rankSuggestions(results, curated, SUGGESTION_LIMIT, seed)
      : []

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (totalChecked === 0) return

    setStatus('loading')
    setExpandedId(null)
    setSeed(0)

    try {
      const requests: Promise<LabeledResult>[] = []

      for (const id of selections.ingredients) {
        const option = INGREDIENT_OPTIONS.find((item) => item.id === id)
        if (!option) continue
        requests.push(
          filterByIngredient(option.apiValue).then((meals) => ({
            label: option.label,
            meals,
          }))
        )
      }

      for (const id of selections.cuisines) {
        const option = CUISINE_OPTIONS.find((item) => item.id === id)
        if (!option) continue
        requests.push(
          filterByArea(option.apiValue).then((meals) => ({
            label: option.label,
            meals,
          }))
        )
      }

      for (const id of selections.diets) {
        const option = DIET_OPTIONS.find((item) => item.id === id)
        if (!option) continue
        requests.push(
          filterByCategory(option.apiValue).then((meals) => ({
            label: option.label,
            meals,
          }))
        )
      }

      const settled = await Promise.all(requests)
      setResults(settled)
      setCurated(buildCuratedCandidates(selections))
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  async function handleExpand(candidate: SuggestionCandidate): Promise<void> {
    if (expandedId === candidate.id) {
      setExpandedId(null)
      return
    }

    setExpandedId(candidate.id)

    if (candidate.kind === 'curated' || candidate.id in details) return

    setDetailLoadingId(candidate.id)
    try {
      const detail = await lookupMeal(candidate.id)
      setDetails((current) => ({ ...current, [candidate.id]: detail }))
    } catch {
      setDetails((current) => ({ ...current, [candidate.id]: null }))
    } finally {
      setDetailLoadingId(null)
    }
  }

  function renderChecklist(candidate: SuggestionCandidate): ReactElement {
    if (candidate.curated) {
      return (
        <IngredientChecklist
          ingredients={candidate.curated.ingredients}
          videoUrl={candidate.curated.videoUrl}
          sourceUrl={candidate.curated.sourceUrl}
          sourceName={candidate.curated.sourceName}
        />
      )
    }

    if (detailLoadingId === candidate.id) {
      return <p className={styles.status}>Loading ingredients…</p>
    }

    const detail = details[candidate.id]
    if (!detail) {
      return (
        <p className={styles.status}>
          Could not load the ingredients for this recipe.
        </p>
      )
    }

    return (
      <IngredientChecklist
        ingredients={detail.ingredients}
        videoUrl={detail.videoUrl}
        sourceUrl={detail.sourceUrl}
        sourceName={hostLabel(detail.sourceUrl)}
      />
    )
  }

  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.main}>
        <p className={styles.backLink}>
          <Link to="/apps">Back to apps</Link>
        </p>
        <header className={styles.pageHeader}>
          <h1>Cook Today</h1>
        </header>
        <p className={styles.tagline}>
          Tick a few boxes, get recipe ideas with cooking videos, then tick off
          what you already have to see your grocery list.
        </p>
        <p className={styles.demoNotice}>
          Early demo. Suggestions come live from TheMealDB&apos;s free API, plus
          a hand-picked recipe.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <CheckboxGroup
            legend="What's in your kitchen?"
            options={INGREDIENT_OPTIONS}
            selected={selections.ingredients}
            onToggle={(id) =>
              setSelections((current) => ({
                ...current,
                ingredients: toggleValue(current.ingredients, id),
              }))
            }
          />
          <CheckboxGroup
            legend="Mood"
            options={CUISINE_OPTIONS}
            selected={selections.cuisines}
            onToggle={(id) =>
              setSelections((current) => ({
                ...current,
                cuisines: toggleValue(current.cuisines, id),
              }))
            }
          />
          <CheckboxGroup
            legend="Diet"
            options={DIET_OPTIONS}
            selected={selections.diets}
            onToggle={(id) =>
              setSelections((current) => ({
                ...current,
                diets: toggleValue(current.diets, id),
              }))
            }
          />

          <div className={styles.submitRow}>
            <button
              className={styles.submitButton}
              type="submit"
              disabled={totalChecked === 0 || status === 'loading'}
            >
              {status === 'loading' ? 'Finding recipes…' : 'Suggest recipes'}
            </button>
            {totalChecked === 0 && (
              <span className={styles.hint}>Tick at least one box.</span>
            )}
          </div>
        </form>

        <section className={styles.results} aria-live="polite">
          {status === 'error' && (
            <p className={styles.status}>
              Could not reach the recipe service. Try again in a moment.
            </p>
          )}

          {status === 'ready' && suggestions.length === 0 && (
            <p className={styles.status}>
              No recipes matched every box. Try unticking a few.
            </p>
          )}

          {status === 'ready' && suggestions.length > 0 && (
            <>
              <div className={styles.resultsHeader}>
                <h2>Tonight&apos;s picks</h2>
                <button
                  type="button"
                  onClick={() => setSeed((current) => current + 1)}
                >
                  ↻ Shuffle
                </button>
              </div>
              {suggestions.map((candidate) => (
                <div key={candidate.id}>
                  <SuggestionCard
                    candidate={candidate}
                    expanded={expandedId === candidate.id}
                    onToggle={() => void handleExpand(candidate)}
                  />
                  {expandedId === candidate.id && renderChecklist(candidate)}
                </div>
              ))}
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
