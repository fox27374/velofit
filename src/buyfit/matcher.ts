/**
 * Bike matching: the rider's height picks the rows, the window comes from
 * those rows, and every row that fits is returned with its mm deltas.
 *
 * Nothing here is derived from the body beyond height. Frame reach is not
 * predictable from anthropometry (doc/frame-sizing-research.md §2.3), so the
 * window is only ever "what bikes in your height band ship with".
 */

export interface BikeSizeRow {
  size: string
  /** Null when the maker publishes no stack or reach: such a size can never match. */
  stack: number | null
  reach: number | null
  ett: number
  seatTube: number
  /** Published rider-height band in mm. Null means the maker gives no bound on that side. */
  riderHeightMin: number | null
  /** Published rider-height band in mm. Null means the maker gives no bound on that side. */
  riderHeightMax: number | null
  /** What the stock build ships with, where the maker publishes it. */
  barWidth?: number
  crankLength?: number
}

export interface Bike {
  brand: string
  model: string
  /** bikedb bike id; one per frame, shared by all its sizes. */
  bikeId: string
  /** Model family, e.g. "Domane". */
  family: string
  /** Frame name without generation, e.g. "Domane SL 5". */
  frameName: string
  /** Generation, e.g. "4", or "" when unknown. */
  generation: string
  year: number
  verified: string
  sizes: BikeSizeRow[]
}

export interface BikeSize extends Omit<BikeSizeRow, 'stack' | 'reach'> {
  stack: number
  reach: number
  brand: string
  model: string
  /** bikedb bike id; one per frame, shared by all its sizes. */
  bikeId: string
  /** Model family, e.g. "Domane". */
  family: string
  /** Frame name without generation, e.g. "Domane SL 5". */
  frameName: string
  /** Generation, e.g. "4", or "" when unknown. */
  generation: string
  year: number
  verified: string
  stackDelta: number
  reachDelta: number
  distanceFromCentre: number
  /**
   * The maker gives no rider-height band, so the size is listed only because its
   * stack and reach fall inside the window. It never contributed to the window.
   */
  noHeightBand: boolean
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

type Measured<T extends BikeSizeRow> = T & { stack: number; reach: number }

/** A size whose maker publishes both stack and reach. */
function measured<T extends BikeSizeRow>(size: T): size is Measured<T> {
  return size.stack !== null && size.reach !== null
}

/** Every model+size whose published rider-height band contains this height.
 * A missing bound is open on that side; a size with both bounds null is never here. */
function rowsForHeight(riderHeight: number, db: Bike[]): (BikeSizeRow & Bike)[] {
  return db.flatMap((bike) =>
    bike.sizes
      .filter((size) => {
        const { riderHeightMin: min, riderHeightMax: max } = size
        if (min === null && max === null) return false
        return (min === null || riderHeight >= min) && (max === null || riderHeight <= max)
      })
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
  db: Bike[]
): StackReachWindow | null {
  const rows = rowsForHeight(riderHeight, db).filter(measured)
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
/** The loader stores an unpublished length as 0; leave those out of a range (all missing → [0]). */
function published(values: number[]): number[] {
  const known = values.filter((v) => v > 0)
  return known.length > 0 ? known : [0]
}

export function getFrameGeometryRange(
  riderHeight: number,
  db: Bike[]
): FrameGeometryRange | null {
  const rows = rowsForHeight(riderHeight, db)
  if (rows.length === 0) return null

  return {
    // Ordered by stack, not alphabetically: size labels sort into nonsense
    // ("L, M, ML, S, XL, XS") and mix letters with numbers across makers.
    // A size with no stack published sorts last rather than producing NaN.
    sizes: [
      ...new Set(
        [...rows]
          .sort((a, b) => (a.stack ?? Number.MAX_SAFE_INTEGER) - (b.stack ?? Number.MAX_SAFE_INTEGER))
          .map((r) => r.size)
      ),
    ],
    seatTubeMin: Math.min(...published(rows.map((r) => r.seatTube))),
    seatTubeMax: Math.max(...published(rows.map((r) => r.seatTube))),
    ettMin: Math.min(...published(rows.map((r) => r.ett))),
    ettMax: Math.max(...published(rows.map((r) => r.ett))),
  }
}

/**
 * Every model+size in the height band, plus, for each bike with no height band,
 * its one unbanded size nearest the window centre when that size's stack and
 * reach fall inside the window (inclusive). Nearest the window centre first,
 * with deltas — never a single winner across bikes, never a score.
 */
export function matchBikes(
  riderHeight: number,
  windowStackMin: number,
  windowStackMax: number,
  windowReachMin: number,
  windowReachMax: number,
  db: Bike[]
): BikeSize[] {
  const stackCentre = (windowStackMin + windowStackMax) / 2
  const reachCentre = (windowReachMin + windowReachMax) / 2

  const banded = rowsForHeight(riderHeight, db)
    .filter(measured)
    .map((row) => ({ ...row, noHeightBand: false }))

  // Per bike, only the unbanded size nearest the window centre: a maker's several
  // unbanded sizes inside the window would otherwise flood the list.
  const unbanded = db.flatMap((bike) => {
    const candidates = bike.sizes
      .filter(measured)
      .filter(
        (size) =>
          size.riderHeightMin === null &&
          size.riderHeightMax === null &&
          size.stack >= windowStackMin &&
          size.stack <= windowStackMax &&
          size.reach >= windowReachMin &&
          size.reach <= windowReachMax
      )
      .map((size) => ({
        row: { ...bike, ...size, noHeightBand: true },
        distance: Math.hypot(size.stack - stackCentre, size.reach - reachCentre),
      }))
    if (candidates.length === 0) return []
    return [candidates.reduce((best, c) => (c.distance < best.distance ? c : best)).row]
  })

  return [...banded, ...unbanded]
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
 * Bike character from stack-to-reach ratio. The research doc allows this ratio
 * to classify *bikes* (§5.2) while refusing it as a rider target, so it may
 * sort a shortlist and may never predict a body.
 *
 * The split is the median of the rider's own matches, not a fixed threshold.
 * A constant 1.50 — the retailer convention — called every small frame racy,
 * because the ratio rises with frame size: at 1600 mm every match including
 * both endurance Domanes came out "racy" and the upright group was empty.
 * Relative means "racier than half of what fits you", which is all the ratio
 * was ever licensed to say.
 */
export type Character = 'racy' | 'relaxed'

export function ratioOf(row: { stack: number; reach: number }): number {
  return row.stack / row.reach
}

export interface CharacterSplit<T> {
  racy: T[]
  relaxed: T[]
  /** Null when the rows cannot be meaningfully split; show one list. */
  median: number | null
}

export function splitByCharacter<T extends { stack: number; reach: number }>(
  rows: T[]
): CharacterSplit<T> {
  const ratios = rows.map(ratioOf).sort((a, b) => a - b)
  const spread = ratios.length > 1 && ratios[0] !== ratios[ratios.length - 1]
  if (!spread) return { racy: [], relaxed: [], median: null }

  const mid = ratios.length / 2
  const median =
    ratios.length % 2 === 0
      ? (ratios[mid - 1] + ratios[mid]) / 2
      : ratios[Math.floor(mid)]

  return {
    racy: rows.filter((r) => ratioOf(r) < median),
    relaxed: rows.filter((r) => ratioOf(r) >= median),
    median,
  }
}

/**
 * The size label that appears most often in the rider's height band, for the
 * "you are roughly a ..." headline. Ties return every tied label, because a
 * tie is the honest answer: the label means different things per brand.
 */
export function headlineSizes(
  riderHeight: number,
  db: Bike[]
): string[] {
  const counts = new Map<string, number>()
  for (const row of rowsForHeight(riderHeight, db)) {
    counts.set(row.size, (counts.get(row.size) ?? 0) + 1)
  }
  if (counts.size === 0) return []

  const most = Math.max(...counts.values())
  return [...counts.entries()].filter(([, n]) => n === most).map(([s]) => s)
}
