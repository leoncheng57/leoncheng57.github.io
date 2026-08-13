import { useEffect, useRef, type ReactElement } from 'react'
import { useLocation } from 'react-router-dom'
import { getBlogPostBySlug } from '../../features/blog/content'
import { directionLabel, getStation } from '../../features/sub-wait/data/stations'
import type { Direction } from '../../features/sub-wait/types'

const SITE_TITLE = "Leon's Website"

const STATIC_TITLES: Record<string, string> = {
  '/': SITE_TITLE,
  '/apps': `Apps | ${SITE_TITLE}`,
  '/apps/whoops-hoops/privacy': 'Privacy Policy | Whoops Hoops',
  '/apps/whoops-hoops/support': 'Support | Whoops Hoops',
  '/blog': `Blog | ${SITE_TITLE}`,
  '/development': `Repo | ${SITE_TITLE}`,
  '/development/previews': `Pull Request Previews | Repo | ${SITE_TITLE}`,
  '/game-nights': "Georgie's Game Nights",
  '/georgies-board-game-nights': "Georgie's Game Nights",
  '/guides': `Guides | ${SITE_TITLE}`,
  '/repo': `Repo | ${SITE_TITLE}`,
  '/repo/alpha-projs': `Alpha Projects | Repo | ${SITE_TITLE}`,
  '/repo/ci': `CI Checks | Repo | ${SITE_TITLE}`,
  '/repo/google-analytics': `Google Analytics | Repo | ${SITE_TITLE}`,
  '/repo/planning': `Project Planning | Repo | ${SITE_TITLE}`,
  '/repo/previews': `Pull Request Previews | Repo | ${SITE_TITLE}`,
  '/repo/production': `Production Deploys | Repo | ${SITE_TITLE}`,
  '/sub-wait': 'Sub-Wait',
  '/sub-wait/': 'Sub-Wait',
  '/sub-wait/architecture': 'Architecture | Sub-Wait',
  '/sub-wait/install': 'Install | Sub-Wait',
  '/sub-wait/map': 'Map | Sub-Wait',
  '/sub-wait/stations': 'Stations | Sub-Wait',
  '/tuzi': 'Tuzi',
  '/tuzi/': 'Tuzi',
  '/tuzi/how-ranking-works': 'How Ranking Works | Tuzi',
  '/workout-lab': 'Workout Lab',
  '/workout-lab/': 'Workout Lab',
  '/workout-lab/exercises': 'Exercises | Workout Lab',
  '/workout-lab/guide': 'Guide | Workout Lab',
}

const REDIRECT_PATHS = new Set([
  '/development',
  '/development/previews',
  '/game-nights',
])

function decodePathSegment(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function getRouteTitle(pathname: string): string {
  const staticTitle = STATIC_TITLES[pathname]
  if (staticTitle) return staticTitle

  const blogMatch = pathname.match(/^\/blog\/([^/]+)\/?$/)
  if (blogMatch) {
    const post = getBlogPostBySlug(decodePathSegment(blogMatch[1]))
    return post
      ? `${post.title} | ${SITE_TITLE}`
      : `Post Not Found | ${SITE_TITLE}`
  }

  const stationMatch = pathname.match(
    /^\/sub-wait\/station\/([^/]+)(?:\/([^/]+))?\/?$/,
  )
  if (stationMatch) {
    const station = getStation(decodePathSegment(stationMatch[1]))
    const direction = stationMatch[2]
    if (!station || (direction && direction !== 'N' && direction !== 'S')) {
      return 'Station Not Found | Sub-Wait'
    }
    if (!direction) return `${station.name} | Sub-Wait`

    const typedDirection = direction as Direction
    const label =
      directionLabel(station, typedDirection) ??
      (typedDirection === 'N' ? 'Northbound' : 'Southbound')
    return `${station.name} - ${label} | Sub-Wait`
  }

  if (pathname.startsWith('/sub-wait/')) return 'Page Not Found | Sub-Wait'
  if (pathname.startsWith('/tuzi/')) return 'Page Not Found | Tuzi'
  if (pathname.startsWith('/workout-lab/')) return 'Page Not Found | Workout Lab'
  return `Page Not Found | ${SITE_TITLE}`
}

type GtagWindow = Window & {
  gtag?: (
    _command: 'event',
    _eventName: 'page_view',
    _parameters: {
      page_location: string
      page_path: string
      page_title: string
    },
  ) => void
}

export default function RouteMetadata(): ReactElement | null {
  const location = useLocation()
  const initialTitle = useRef(document.title)
  const title = getRouteTitle(location.pathname)

  useEffect(() => {
    return () => {
      document.title = initialTitle.current
    }
  }, [])

  useEffect(() => {
    document.title = title

    if (REDIRECT_PATHS.has(location.pathname)) return

    const gtag = (window as GtagWindow).gtag
    if (!gtag) return

    gtag('event', 'page_view', {
      page_location: window.location.href,
      page_path: `${window.location.pathname}${window.location.search}`,
      page_title: title,
    })
  }, [location.pathname, location.search, title])

  return null
}
