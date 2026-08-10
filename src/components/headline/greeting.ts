export interface Greeting {
  label: string
  emoji: string
}

/**
 * Time-of-day greeting for the homepage welcome tab.
 * Morning 05:00-11:59, afternoon 12:00-17:59, evening 18:00-04:59.
 */
export function getGreeting(hour: number): Greeting {
  if (hour >= 5 && hour < 12) {
    return { label: 'Good Morning', emoji: '☀️' }
  }
  if (hour >= 12 && hour < 18) {
    return { label: 'Good Afternoon', emoji: '☁️' }
  }
  return { label: 'Good Evening', emoji: '🌙' }
}
