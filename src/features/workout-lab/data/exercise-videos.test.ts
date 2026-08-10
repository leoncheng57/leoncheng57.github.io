import { describe, expect, it } from 'vitest'
import {
  EXERCISE_VIDEOS,
  getExerciseVideo,
  shortsSearchVideo,
} from './exercise-videos'
import { EXERCISES } from './exercises'

const SHORT_URL_PATTERN = /^https:\/\/www\.youtube\.com\/shorts\/[A-Za-z0-9_-]{11}$/

describe('exercise videos', () => {
  it('maps every reviewed video to an exercise in the library', () => {
    const exerciseIds = new Set(EXERCISES.map(({ id }) => id))
    for (const videoId of Object.keys(EXERCISE_VIDEOS)) {
      expect(exerciseIds.has(videoId), videoId).toBe(true)
    }
  })

  it('uses well-formed direct Shorts URLs with attribution metadata', () => {
    for (const [id, video] of Object.entries(EXERCISE_VIDEOS)) {
      expect(video.url, id).toMatch(SHORT_URL_PATTERN)
      expect(video.type, id).toBe('short')
      expect(video.title.length, id).toBeGreaterThan(0)
      expect(video.channel.length, id).toBeGreaterThan(0)
      expect(video.verifiedOn, id).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('never reuses one video for two exercises', () => {
    const urls = Object.values(EXERCISE_VIDEOS).map(({ url }) => url)
    expect(new Set(urls).size).toBe(urls.length)
  })

  it('falls back to a Shorts search for unknown exercise ids', () => {
    const fallback = getExerciseVideo('future-exercise-not-in-library')
    expect(fallback.type).toBe('search')
    expect(fallback.url).toContain('https://www.youtube.com/results?search_query=')
  })

  it('encodes exercise names into search fallback URLs', () => {
    const video = shortsSearchVideo("World's Greatest Stretch")
    expect(video.url).toContain(
      encodeURIComponent("how to World's Greatest Stretch #shorts")
    )
    expect(video.type).toBe('search')
  })

  it('resolves a video for every exercise, preferring reviewed Shorts', () => {
    for (const exercise of EXERCISES) {
      const video = getExerciseVideo(exercise.id)
      if (EXERCISE_VIDEOS[exercise.id]) {
        expect(video.type, exercise.id).toBe('short')
      } else {
        expect(video.type, exercise.id).toBe('search')
        expect(video.url, exercise.id).toContain(
          'https://www.youtube.com/results?search_query='
        )
      }
    }
  })
})
