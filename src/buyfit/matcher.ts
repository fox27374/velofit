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
    // Ordered by stack, not alphabetically: size labels sort into nonsense
    // ("L, M, ML, S, XL, XS") and mix letters with numbers across makers.
    sizes: [
      ...new Set(
        [...rows].sort((a, b) => a.stack - b.stack).map((r) => r.size)
      ),
    ],
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

/**
 * Bike character from stack-to-reach ratio. The research doc allows this
 * ratio to classify *bikes* (§5.2) while refusing it as a rider target, so it
 * belongs to a preference, never to a prediction.
 *
 * The 1.5 split is retailer convention, not a rider-side study.
 */
export const CHARACTER_SPLIT = 1.5

export type Character = 'racy' | 'relaxed'

export function characterOf(row: { stack: number; reach: number }): Character {
  return row.stack / row.reach < CHARACTER_SPLIT ? 'racy' : 'relaxed'
}

/**
 * The size label that appears most often in the rider's height band, for the
 * "you are roughly a ..." headline. Ties return every tied label, because a
 * tie is the honest answer: the label means different things per brand.
 */
export function headlineSizes(
  riderHeight: number,
  db: Bike[] = database
): string[] {
  const counts = new Map<string, number>()
  for (const row of rowsForHeight(riderHeight, db)) {
    counts.set(row.size, (counts.get(row.size) ?? 0) + 1)
  }
  if (counts.size === 0) return []

  const most = Math.max(...counts.values())
  return [...counts.entries()].filter(([, n]) => n === most).map(([s]) => s)
}
