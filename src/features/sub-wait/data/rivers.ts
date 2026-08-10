/**
 * Simplified centerlines for the waterways around the subway system, as
 * [lat, lon] points. Hand-traced approximations — good enough to orient the
 * schematic map, not navigational data. Widths are relative stroke sizes in
 * projected units.
 */
export type River = {
  name: string
  width: number
  points: Array<[number, number]>
}

export const RIVERS: River[] = [
  {
    name: 'Hudson River',
    width: 24,
    points: [
      [40.645, -74.065],
      [40.68, -74.05],
      [40.7, -74.032],
      [40.73, -74.018],
      [40.76, -74.005],
      [40.79, -73.988],
      [40.82, -73.972],
      [40.85, -73.955],
      [40.88, -73.938],
      [40.92, -73.925],
    ],
  },
  {
    name: 'East River',
    width: 14,
    points: [
      [40.666, -74.02],
      [40.69, -74.01],
      [40.7, -73.998],
      [40.704, -73.982],
      [40.71, -73.972],
      [40.72, -73.967],
      [40.735, -73.963],
      [40.755, -73.958],
      [40.772, -73.943],
      [40.781, -73.926],
      [40.785, -73.91],
      [40.79, -73.89],
      [40.8, -73.87],
    ],
  },
  {
    name: 'Harlem River',
    width: 7,
    points: [
      [40.781, -73.926],
      [40.795, -73.93],
      [40.81, -73.933],
      [40.827, -73.933],
      [40.845, -73.928],
      [40.86, -73.915],
      [40.872, -73.913],
      [40.878, -73.923],
    ],
  },
  {
    name: 'Newtown Creek',
    width: 5,
    points: [
      [40.735, -73.963],
      [40.737, -73.95],
      [40.733, -73.935],
    ],
  },
  {
    name: 'Gowanus Bay',
    width: 12,
    points: [
      [40.666, -74.02],
      [40.65, -74.035],
      [40.63, -74.05],
      [40.6, -74.06],
    ],
  },
  {
    name: 'The Narrows',
    width: 14,
    points: [
      [40.6, -74.06],
      [40.58, -74.05],
      [40.555, -74.05],
      [40.53, -74.07],
    ],
  },
]
