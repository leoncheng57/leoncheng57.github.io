const WORDS_PER_MINUTE = 200

export function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return 1
  }

  return Math.max(1, Math.ceil(words.length / WORDS_PER_MINUTE))
}
