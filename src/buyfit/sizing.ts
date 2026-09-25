/**
 * Core sizing calculations for BuyFit.
 * All numbers sourced from doc/frame-sizing-research.md.
 */

import type { Character } from './matcher'

export interface SizingOutput {
  saddleHeightMin: number
  saddleHeightMax: number
  handlebarWidth: number
  handlebarWidthMin: number
  handlebarWidthMax: number
  crankLength: string
  /** Why that band, in one sentence, so the number never travels alone. */
  crankNote: string
}

/** What the rider said they want the bike to feel like. */
export type RidingPreference = Character | 'none'

/**
 * Crank length as a band with a reason.
 *
 * No formula is used. Palm's 0.216 x inseam and Zinn's 0.21 x inseam are
 * published but were never fitted to data (§3.2), and the literature cannot
 * detect a difference across the range anyone sells: Martin & Spirduso found a
 * 3.8% power spread across an 83% change in crank length, and Li et al. found
 * no effect on efficiency, sprint power or cadence across 165/170/175.
 *
 * Two findings do survive, and only these two shape the output:
 *
 * 1. Li et al. measured significantly worse perceived fatigue on 175 mm than
 *    on 165 or 170 (p < 0.001) — the single detected effect in the range. So
 *    175 leaves the recommended band, without becoming a mistake to ride.
 * 2. A low, aggressive position closes the hip angle at top dead centre, which
 *    is the reason §3.2 accepts for going shorter. A rider asking for a racier
 *    bike is asking for that position, so they get pointed at the short end.
 */
export function crankLengthBand(preference: RidingPreference = 'none'): {
  range: string
  note: string
} {
  const fatigue =
    'Across 165, 170 and 175 mm the studies found no difference in efficiency, ' +
    'sprint power or cadence — the one thing they did detect was significantly ' +
    'worse perceived fatigue on 175, which is why it is no longer in the band.'

  if (preference === 'racy') {
    return {
      range: '165 mm',
      note:
        `You asked for a racier position, and a low front end closes the hip ` +
        `angle at the top of the stroke — which is the one reason the evidence ` +
        `accepts for going shorter. ${fatigue} If you already ride 170 happily, ` +
        `there is no finding that says to change.`,
    }
  }

  return {
    range: '165–170 mm',
    note:
      `Either end of this band is fine; no study separates them. ${fatigue} ` +
      `Go to the short end if your hip flexion is limited or your position is low.`,
  }
}

/**
 * Where the rider's inseam sits as a share of height. Reported only: it never
 * moves the stack/reach window, because no source supports a mm-per-point
 * adjustment (doc/frame-sizing-research.md §4.5).
 */
export type LegProportion = 'long' | 'typical' | 'short'

export interface InseamRatio {
  /** Inseam as a percentage of height, one decimal. */
  percent: number
  proportion: LegProportion
}

/**
 * Calculate sizing outputs from body measurements.
 * All inputs and outputs are in mm.
 * Stack/reach window is derived from the database, not from body measurements.
 *
 * @param inseam - barefoot crotch-to-floor in mm
 * @param _height - total height in mm (used by matcher, not by these formulas)
 * @param shoulderWidth - biacromial (shoulder) width in mm, centre-to-centre
 * @param preference - riding position the rider asked for; shifts crank length only
 */
export function calculateSizing(
  inseam: number,
  _height: number,
  shoulderWidth: number,
  preference: RidingPreference = 'none'
): SizingOutput {
  // Saddle height: 0.870–0.895 × inseam (Sourced: LeMond/Hamley/Holliday)
  const saddleHeightMin = Math.round(inseam * 0.870)
  const saddleHeightMax = Math.round(inseam * 0.895)

  // Handlebar width: shoulder width ±20 mm (Weak: Lin et al. 2025)
  const handlebarWidthMin = shoulderWidth - 20
  const handlebarWidthMax = shoulderWidth + 20

  const crank = crankLengthBand(preference)

  return {
    saddleHeightMin,
    saddleHeightMax,
    handlebarWidth: shoulderWidth,
    handlebarWidthMin,
    handlebarWidthMax,
    crankLength: crank.range,
    crankNote: crank.note,
  }
}

/**
 * Inseam as a share of height, classified against the 45–48% band the
 * literature describes as usual.
 *
 * The band itself is weak: §4.5 of the research doc records that the
 * cycling-specific 41–51% range comes from self-reported forum aggregates,
 * with no study behind it, and that ANSUR II could settle it but has not been
 * extracted. So this is a flag for the rider to interpret, not an input to any
 * calculation.
 *
 * Returns null when either measurement is missing or non-positive.
 */
export function inseamRatio(inseam: number, height: number): InseamRatio | null {
  if (inseam <= 0 || height <= 0) return null

  const percent = Math.round((inseam / height) * 1000) / 10
  const proportion: LegProportion =
    percent > 48 ? 'long' : percent < 45 ? 'short' : 'typical'

  return { percent, proportion }
}

