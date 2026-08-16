import type { CuratedPick } from '../types'

/**
 * Hand-picked recipes that enter the suggestion ranking alongside TheMealDB
 * results. They demonstrate the richer card format (time, diets, source
 * attribution) that the free API cannot provide.
 */
export const CURATED_PICKS: CuratedPick[] = [
  {
    id: 'curated-shanghai-butter-mochi',
    title: 'Crispy Shanghai Butter Mochi',
    ingredientOptionIds: ['egg', 'rice'],
    cuisineOptionIds: ['chinese'],
    dietOptionIds: ['vegetarian'],
    category: 'Dessert',
    cuisineLabel: 'Chinese · Hawaiian · Korean',
    dietLabels: ['Vegetarian', 'Gluten-Free'],
    totalTimeMinutes: 50,
    ingredients: [
      { name: 'Egg', measure: '1 large (52 g)' },
      { name: 'White sugar', measure: '45 g' },
      { name: 'Honey', measure: '10 g' },
      { name: 'Vanilla extract', measure: '1 tsp' },
      { name: 'Whole milk', measure: '115 ml' },
      { name: 'Salted butter', measure: '42 g, melted' },
      { name: 'Kosher salt', measure: '1/8 tsp' },
      { name: 'Milk powder', measure: '2 tsp, optional' },
      { name: 'Mochiko (glutinous rice flour)', measure: '75 g' },
      { name: 'Tapioca starch', measure: '28 g' },
    ],
    videoUrl:
      'https://www.okonomikitchen.com/crispy-shanghai-butter-mochi/#video-video-watch-how-to-make-it',
    sourceUrl: 'https://www.okonomikitchen.com/crispy-shanghai-butter-mochi/',
    sourceName: 'Okonomi Kitchen',
  },
]
