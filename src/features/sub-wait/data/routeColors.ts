/** Official MTA subway line colors, keyed by route ID. */
type BulletStyle = { background: string; text: string }

const IRT_RED: BulletStyle = { background: '#ee352e', text: '#ffffff' }
const IRT_GREEN: BulletStyle = { background: '#00933c', text: '#ffffff' }
const IRT_PURPLE: BulletStyle = { background: '#b933ad', text: '#ffffff' }
const IND_BLUE: BulletStyle = { background: '#0039a6', text: '#ffffff' }
const IND_ORANGE: BulletStyle = { background: '#ff6319', text: '#ffffff' }
const IND_GREEN: BulletStyle = { background: '#6cbe45', text: '#ffffff' }
const BMT_BROWN: BulletStyle = { background: '#996633', text: '#ffffff' }
const BMT_GRAY: BulletStyle = { background: '#a7a9ac', text: '#ffffff' }
const BMT_YELLOW: BulletStyle = { background: '#fccc0a', text: '#101010' }
const SHUTTLE_GRAY: BulletStyle = { background: '#808183', text: '#ffffff' }
const SIR_BLUE: BulletStyle = { background: '#0039a6', text: '#ffffff' }

const ROUTE_COLORS: Record<string, BulletStyle> = {
  '1': IRT_RED,
  '2': IRT_RED,
  '3': IRT_RED,
  '4': IRT_GREEN,
  '5': IRT_GREEN,
  '6': IRT_GREEN,
  '7': IRT_PURPLE,
  A: IND_BLUE,
  C: IND_BLUE,
  E: IND_BLUE,
  B: IND_ORANGE,
  D: IND_ORANGE,
  F: IND_ORANGE,
  M: IND_ORANGE,
  G: IND_GREEN,
  J: BMT_BROWN,
  Z: BMT_BROWN,
  L: BMT_GRAY,
  N: BMT_YELLOW,
  Q: BMT_YELLOW,
  R: BMT_YELLOW,
  W: BMT_YELLOW,
  S: SHUTTLE_GRAY,
  // GTFS route IDs for the three shuttles all render as "S".
  GS: SHUTTLE_GRAY,
  FS: SHUTTLE_GRAY,
  H: SHUTTLE_GRAY,
  SIR: SIR_BLUE,
  SI: SIR_BLUE,
}

export function routeBulletStyle(route: string): BulletStyle {
  return ROUTE_COLORS[route] ?? SHUTTLE_GRAY
}

/** Display text for a route bullet (shuttle variants all show "S"). */
export function routeBulletLabel(route: string): string {
  if (route === 'GS' || route === 'FS' || route === 'H') return 'S'
  if (route === 'SIR' || route === 'SI') return 'SIR'
  return route
}
