export type Direction = 'N' | 'S'

export type Station = {
  /** GTFS stop ID, e.g. "F16" for East Broadway. */
  id: string
  /** MTA complex ID; stations sharing a complex share transfers. */
  complexId: string
  name: string
  borough: string
  /** Daytime routes serving this station, e.g. ["F"]. */
  routes: string[]
  lat: number
  lon: number
  /** Railroad-north direction label, e.g. "Uptown & Queens". Null at terminals. */
  northLabel: string | null
  /** Railroad-south direction label, e.g. "Downtown & Brooklyn". Null at terminals. */
  southLabel: string | null
}
