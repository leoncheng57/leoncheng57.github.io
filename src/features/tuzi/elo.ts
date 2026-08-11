export const INITIAL_RATING = 1500
export const K_FACTOR = 32

export type Ratings = Record<string, number>

export function expectedScore(rating: number, opponentRating: number): number {
  return 1 / (1 + 10 ** ((opponentRating - rating) / 400))
}

export function applyComparison(
  ratings: Ratings,
  winnerId: string,
  loserId: string,
): Ratings {
  const winnerRating = ratings[winnerId] ?? INITIAL_RATING
  const loserRating = ratings[loserId] ?? INITIAL_RATING
  const winnerExpected = expectedScore(winnerRating, loserRating)
  const change = K_FACTOR * (1 - winnerExpected)

  return {
    ...ratings,
    [winnerId]: winnerRating + change,
    [loserId]: loserRating - change,
  }
}
