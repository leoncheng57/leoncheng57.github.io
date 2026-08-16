export type FormOption = {
  id: string
  label: string
  /** Value passed to TheMealDB filter endpoints. */
  apiValue: string
}

export const INGREDIENT_OPTIONS: FormOption[] = [
  { id: 'chicken', label: 'Chicken', apiValue: 'chicken' },
  { id: 'beef', label: 'Beef', apiValue: 'beef' },
  { id: 'pork', label: 'Pork', apiValue: 'pork' },
  { id: 'salmon', label: 'Salmon', apiValue: 'salmon' },
  { id: 'egg', label: 'Eggs', apiValue: 'egg' },
  { id: 'rice', label: 'Rice', apiValue: 'rice' },
  { id: 'potatoes', label: 'Potatoes', apiValue: 'potatoes' },
  { id: 'tomatoes', label: 'Tomatoes', apiValue: 'tomatoes' },
  { id: 'garlic', label: 'Garlic', apiValue: 'garlic' },
]

export const CUISINE_OPTIONS: FormOption[] = [
  { id: 'japanese', label: 'Japanese', apiValue: 'Japanese' },
  { id: 'chinese', label: 'Chinese', apiValue: 'Chinese' },
  { id: 'italian', label: 'Italian', apiValue: 'Italian' },
  { id: 'mexican', label: 'Mexican', apiValue: 'Mexican' },
  { id: 'thai', label: 'Thai', apiValue: 'Thai' },
  { id: 'american', label: 'American', apiValue: 'American' },
]

export const DIET_OPTIONS: FormOption[] = [
  { id: 'vegetarian', label: 'Vegetarian', apiValue: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan', apiValue: 'Vegan' },
]
