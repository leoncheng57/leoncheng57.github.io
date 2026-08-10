#!/usr/bin/env node
/**
 * Generates src/features/sub-wait/data/stations.json from the MTA's official
 * subway stations dataset (Stations.csv).
 *
 * The output is checked in so builds stay deterministic and offline. Re-run
 * this script when the MTA adds/renames stations (rare):
 *
 *   node scripts/generate-subway-stations.mjs
 *
 * Source: http://web.mta.info/developers/data/nyct/subway/Stations.csv
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SOURCE_URL = 'http://web.mta.info/developers/data/nyct/subway/Stations.csv'
const OUTPUT_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'features',
  'sub-wait',
  'data',
  'stations.json',
)

/** Minimal CSV parser that handles quoted fields with embedded commas. */
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i += 1
      row.push(field)
      field = ''
      if (row.some((value) => value !== '')) rows.push(row)
      row = []
    } else {
      field += char
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    if (row.some((value) => value !== '')) rows.push(row)
  }
  return rows
}

async function main() {
  const response = await fetch(SOURCE_URL)
  if (!response.ok) {
    throw new Error(`Failed to download Stations.csv: HTTP ${response.status}`)
  }
  const csv = await response.text()
  const [header, ...rows] = parseCsv(csv)
  const columnIndex = (name) => {
    const index = header.indexOf(name)
    if (index === -1) throw new Error(`Missing expected column: ${name}`)
    return index
  }

  const gtfsStopId = columnIndex('GTFS Stop ID')
  const complexId = columnIndex('Complex ID')
  const stopName = columnIndex('Stop Name')
  const borough = columnIndex('Borough')
  const daytimeRoutes = columnIndex('Daytime Routes')
  const latitude = columnIndex('GTFS Latitude')
  const longitude = columnIndex('GTFS Longitude')
  const northLabel = columnIndex('North Direction Label')
  const southLabel = columnIndex('South Direction Label')

  const boroughNames = {
    M: 'Manhattan',
    Bk: 'Brooklyn',
    Q: 'Queens',
    Bx: 'The Bronx',
    SI: 'Staten Island',
  }

  const stations = rows
    .map((row) => ({
      id: row[gtfsStopId],
      complexId: row[complexId],
      name: row[stopName],
      borough: boroughNames[row[borough]] ?? row[borough],
      routes: row[daytimeRoutes].split(/\s+/).filter(Boolean),
      lat: Number(row[latitude]),
      lon: Number(row[longitude]),
      // Empty label means trains in that direction terminate here.
      northLabel: row[northLabel] || null,
      southLabel: row[southLabel] || null,
    }))
    .sort((a, b) => a.id.localeCompare(b.id))

  const duplicates = stations.filter(
    (station, index) => index > 0 && stations[index - 1].id === station.id,
  )
  if (duplicates.length > 0) {
    throw new Error(
      `Duplicate GTFS stop IDs: ${duplicates.map((s) => s.id).join(', ')}`,
    )
  }

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, `${JSON.stringify(stations, null, 2)}\n`)
  console.log(`Wrote ${stations.length} stations to ${OUTPUT_PATH}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
