/**
 * Load geometry data from the API at runtime.
 * Filter client-side. Never send the rider's measurements to the API.
 */

import type { Bike, BikeSizeRow } from './matcher'

const DEFAULT_API_URL = ''

export interface ApiRow {
  brand: string
  model: string
  model_year?: number
  size: string
  stack_mm?: number | null
  reach_mm?: number | null
  top_tube_length_mm?: number
  seat_tube_length_mm?: number
  rider_height_min_mm?: number | null
  rider_height_max_mm?: number | null
  handlebar_width_mm?: number
  crank_length_mm?: number
  source_url?: string
  bike_id?: string
  family?: string
  frame_name?: string
  generation?: string
  armrest_stack_min_mm?: number | null
  armrest_stack_max_mm?: number | null
  armrest_reach_min_mm?: number | null
  armrest_reach_max_mm?: number | null
}

export function apiRowToBikeSize(row: ApiRow): BikeSizeRow {
  return {
    size: row.size,
    // Null, not 0: a 0 would drag the window's minimum to 0. Such a size cannot match.
    stack: row.stack_mm ?? null,
    reach: row.reach_mm ?? null,
    ett: row.top_tube_length_mm ?? 0,
    seatTube: row.seat_tube_length_mm ?? 0,
    riderHeightMin: row.rider_height_min_mm ?? null,
    riderHeightMax: row.rider_height_max_mm ?? null,
    barWidth: row.handlebar_width_mm,
    crankLength: row.crank_length_mm,
    // Null, not 0, as for stack and reach: a 0 would read as a pad range edge.
    armrestStackMin: row.armrest_stack_min_mm ?? null,
    armrestStackMax: row.armrest_stack_max_mm ?? null,
    armrestReachMin: row.armrest_reach_min_mm ?? null,
    armrestReachMax: row.armrest_reach_max_mm ?? null,
  }
}

interface LoadResult {
  bikes: Bike[]
  noHeightDataCount: number
}

/** The API's `category` values BuyFit loads: road, or triathlon for tri mode. */
export type GeometryCategory = 'road' | 'triathlon'

export async function loadGeometryData(category: GeometryCategory = 'road'): Promise<LoadResult> {
  const url = import.meta.env.VITE_BIKEDB_URL || DEFAULT_API_URL

  let allRows: ApiRow[] = []
  let offset = 0

  // Fetch with pagination until we get a short page
  while (true) {
    try {
      const response = await fetch(
        `${url}/api/v1/geometries?category=${category}&limit=200&offset=${offset}`
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

  // Group rows by bike id, with brand+model+year as fallback for APIs that don't send it
  const bikeMap = new Map<string, (ApiRow & { year: number })[]>()
  let noHeightDataCount = 0

  for (const row of allRows) {
    // Track rows with no rider height data
    if (row.rider_height_min_mm === null || row.rider_height_max_mm === null) {
      noHeightDataCount++
    }

    const key = row.bike_id || `${row.brand}|${row.model}|${row.model_year || 0}`
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
      bikeId: first.bike_id || `${first.brand}|${first.model}|${first.year}`,
      family: first.family || first.model,
      frameName: first.frame_name || first.model,
      generation: first.generation || '',
      year: first.year,
      verified: new Date().toISOString().split('T')[0],
      sizes: rows.map(apiRowToBikeSize),
    })
  }

  return { bikes, noHeightDataCount }
}
