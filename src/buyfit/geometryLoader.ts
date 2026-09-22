/**
 * Load geometry data from the API at runtime.
 * Filter client-side. Never send the rider's measurements to the API.
 */

import type { Bike, BikeSizeRow } from './matcher'

const DEFAULT_API_URL = ''

interface ApiRow {
  brand: string
  model: string
  model_year?: number
  size: string
  stack_mm?: number
  reach_mm?: number
  top_tube_length_mm?: number
  seat_tube_length_mm?: number
  rider_height_min_mm?: number
  rider_height_max_mm?: number
  handlebar_width_mm?: number
  crank_length_mm?: number
  source_url?: string
}

function apiRowToBikeSize(row: ApiRow): BikeSizeRow {
  return {
    size: row.size,
    stack: row.stack_mm ?? 0,
    reach: row.reach_mm ?? 0,
    ett: row.top_tube_length_mm ?? 0,
    seatTube: row.seat_tube_length_mm ?? 0,
    riderHeightMin: row.rider_height_min_mm ?? 0,
    riderHeightMax: row.rider_height_max_mm ?? 0,
    barWidth: row.handlebar_width_mm,
    crankLength: row.crank_length_mm,
  }
}

interface LoadResult {
  bikes: Bike[]
  noHeightDataCount: number
}

export async function loadGeometryData(): Promise<LoadResult> {
  const url = import.meta.env.VITE_BIKEDB_URL || DEFAULT_API_URL

  let allRows: ApiRow[] = []
  let offset = 0

  // Fetch with pagination until we get a short page
  while (true) {
    try {
      const response = await fetch(
        `${url}/api/v1/geometries?category=road&limit=200&offset=${offset}`
      )
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      const json = await response.json()
      const data = json.data || []

      allRows = allRows.concat(data)

      if (data.length < 200) {
        break
      }
      offset += 200
    } catch (err) {
      throw new Error(`Failed to fetch geometries: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // Group rows by brand+model+year
  const bikeMap = new Map<string, (ApiRow & { year: number })[]>()
  let noHeightDataCount = 0

  for (const row of allRows) {
    // Track rows with no rider height data
    if (row.rider_height_min_mm === null || row.rider_height_max_mm === null) {
      noHeightDataCount++
    }

    const key = `${row.brand}|${row.model}|${row.model_year || 0}`
    if (!bikeMap.has(key)) {
      bikeMap.set(key, [])
    }
    bikeMap.get(key)!.push({ ...row, year: row.model_year || 0 })
  }

  // Convert to Bike array
  const bikes: Bike[] = []
  for (const rows of bikeMap.values()) {
    if (rows.length === 0) continue
    const first = rows[0]
    bikes.push({
      brand: first.brand,
      model: first.model,
      year: first.year,
      verified: new Date().toISOString().split('T')[0],
      sizes: rows.map(apiRowToBikeSize),
    })
  }

  return { bikes, noHeightDataCount }
}
