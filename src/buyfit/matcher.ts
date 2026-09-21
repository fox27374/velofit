/**
 * Bike matching: the rider's height picks the rows, the window comes from
 * those rows, and every row that fits is returned with its mm deltas.
 *
 * Nothing here is derived from the body beyond height. Frame reach is not
 * predictable from anthropometry (doc/frame-sizing-research.md §2.3), so the
 * window is only ever "what bikes in your height band ship with".
 */

import bikes from './bikes.json'

export interface BikeSizeRow {
  size: string
  stack: number
  reach: number
  ett: number
  seatTube: number
  riderHeightMin: number
  riderHeightMax: number
}

export interface Bike {
  brand: string
  model: string
  year: number
  verified: string
  sizes: BikeSizeRow[]
}

export interface BikeSize extends BikeSizeRow {
  brand: string
  model: string
  year: number
  verified: string
  stackDelta: number
  reachDelta: number
  distanceFromCentre: number
}

export interface StackReachWindow {
  stackMin: number
  stackMax: number
  reachMin: number
  reachMax: number
  count: number
}

export interface FrameGeometryRange {
  sizes: string[]
  seatTubeMin: number
  seatTubeMax: number
  ettMin: number
  ettMax: number
}

const database = bikes as Bike[]

/** Every model+size whose published rider-height band contains this height. */
function rowsForHeight(riderHeight: number, db: Bike[]): (BikeSizeRow & Bike)[] {
  return db.flatMap((bike) =>
    bike.sizes
      .filter(
        (size) =>
          riderHeight >= size.riderHeightMin && riderHeight <= size.riderHeightMax
      )
      .map((size) => ({ ...bike, ...size }))
  )
}

/**
 * The stack/reach search window: the spread of what the rider's height band
 * actually ships with. Null when no bike covers this height — there is then no
 * window, and callers must say so rather than substitute one.
 */
export function getStackReachWindow(
  riderHeight: number,
  db: Bike[] = database
): StackReachWindow | null {
  const rows = rowsForHeight(riderHeight, db)
  if (rows.length === 0) return null

  return {
    stackMin: Math.min(...rows.map((r) => r.stack)),
    stackMax: Math.max(...rows.map((r) => r.stack)),
    reachMin: Math.min(...rows.map((r) => r.reach)),
    reachMax: Math.max(...rows.map((r) => r.reach)),
    count: rows.length,
  }
}

/**
 * Size labels, seat tube and effective top tube across the same rows. Setback
 * and stem are absent on purpose: makers do not publish them per size, so
 * there is nothing to report.
 */
export function getFrameGeometryRange(
  riderHeight: number,
  db: Bike[] = database
): FrameGeometryRange | null {
  const rows = rowsForHeight(riderHeight, db)
  if (rows.length === 0) return null

  return {
    sizes: [...new Set(rows.map((r) => r.size))].sort(),
    seatTubeMin: Math.min(...rows.map((r) => r.seatTube)),
    seatTubeMax: Math.max(...rows.map((r) => r.seatTube)),
    ettMin: Math.min(...rows.map((r) => r.ett)),
    ettMax: Math.max(...rows.map((r) => r.ett)),
  }
}

/**
 * Every model+size in the height band, nearest the window centre first. All of
 * them, with their deltas — never a single winner, never a score.
 */
export function matchBikes(
  riderHeight: number,
  windowStackMin: number,
  windowStackMax: number,
  windowReachMin: number,
  windowReachMax: number,
  db: Bike[] = database
): BikeSize[] {
  const stackCentre = (windowStackMin + windowStackMax) / 2
  const reachCentre = (windowReachMin + windowReachMax) / 2

  return rowsForHeight(riderHeight, db)
    .map(({ sizes: _sizes, ...row }) => {
      const stackDelta = row.stack - stackCentre
      const reachDelta = row.reach - reachCentre
      return {
        ...row,
        stackDelta,
        reachDelta,
        distanceFromCentre: Math.hypot(stackDelta, reachDelta),
      }
    })
    .sort((a, b) => a.distanceFromCentre - b.distanceFromCentre)
}
