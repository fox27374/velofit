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
 * with no study behind it. §8.3 has since extracted ANSUR II, but this band is
 * kept as it was. So this is a flag for the rider to interpret, not an input to any
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

/** Sex, used only for the ANSUR II population averages. Never for sizing. */
export type Sex = 'male' | 'female'

/**
 * Riding-position allowance on top of sit-bone width, in mm (§8.1, §8.2). These
 * are SQlab's steps: road +10, moderate or MTB +20, trekking +30. Brand
 * guidance, not a validated rule; Lin et al. 2023 (n = 10) weakly supports only
 * the +10 end.
 */
const SADDLE_ALLOWANCE_MM: Record<RidingPreference, number> = {
  racy: 10,
  none: 20,
  relaxed: 30,
}

export interface SaddleWidth {
  /** Sit-bone width plus the allowance, in mm. */
  widthMm: number
  note: string
}

/**
 * Recommended effective saddle width from a centre-to-centre sit-bone
 * measurement (§8.1). Returns null when the measurement is missing or
 * non-positive.
 */
export function saddleWidth(
  sitBoneMm: number,
  preference: RidingPreference = 'none'
): SaddleWidth | null {
  if (sitBoneMm <= 0) return null
  const allowance = SADDLE_ALLOWANCE_MM[preference]
  return {
    widthMm: sitBoneMm + allowance,
    note:
      `Sit bones plus ${allowance} mm. That allowance is brand guidance (SQlab), not a ` +
      `validated rule. Saddle width has no standard definition: this is the effective ` +
      `width, where the saddle drops more than 1 cm. Between two sizes, take the wider. ` +
      `Leaning forward narrows your contact, so a racier position can use the smaller allowance.`,
  }
}

/**
 * ANSUR II linear fits on stature, from doc/frame-sizing-research.md §8.3:
 * predicted mm = a + b × stature (mm), with residual SD in mm. Inseam is not
 * here: it is already an input, and only the proportions need a reference.
 */
interface AnsurFit {
  a: number
  b: number
  sd: number
}

type ProportionKey = 'sternum' | 'torso' | 'arm'

const ANSUR_FITS: Record<Sex, Record<ProportionKey, AnsurFit>> = {
  male: {
    sternum: { a: -101.4, b: 0.8769, sd: 11.7 },
    torso: { a: 74.9, b: 0.2948, sd: 24.2 },
    arm: { a: -35.4, b: 0.3636, sd: 17.6 },
  },
  female: {
    sternum: { a: -93.6, b: 0.874, sd: 11.0 },
    torso: { a: 85.5, b: 0.2836, sd: 21.5 },
    arm: { a: -58.5, b: 0.3752, sd: 17.5 },
  },
}

export interface BodyProportion {
  /** The measurement in mm. */
  measuredMm: number
  /** The measurement as a percentage of height, one decimal. */
  percentOfHeight: number
  /** ANSUR II average at this stature in mm. Only when sex is set. */
  ansurMm?: number
  /** (measured − ANSUR average) / residual SD. Only when sex is set. */
  z?: number
  /** Sternum and torso only, and only when sex is set. Never set for arm. */
  label?: LegProportion
}

export interface BodyProportions {
  sternum: BodyProportion | null
  /** Sternum height minus inseam: derived, since ANSUR II has no torso variable. */
  torso: BodyProportion | null
  arm: BodyProportion | null
}

/**
 * Sternum height, torso and arm as a share of height, with the ANSUR II average
 * for the rider's sex (§8.3). Reference only: it never moves the bike matching,
 * because Holliday & Swart found no fit variable that arm length predicts (§2.3).
 *
 * A value of 0 or less means "not entered" and is left out. Torso needs both
 * sternum height and inseam.
 */
export function bodyProportions(input: {
  heightMm: number
  inseamMm: number
  sternumMm: number
  armMm: number
  sex?: Sex
}): BodyProportions {
  const { heightMm, inseamMm, sternumMm, armMm, sex } = input
  if (heightMm <= 0) return { sternum: null, torso: null, arm: null }

  const measure = (measuredMm: number, key: ProportionKey): BodyProportion => {
    const result: BodyProportion = {
      measuredMm,
      percentOfHeight: Math.round((measuredMm / heightMm) * 1000) / 10,
    }
    const fit = sex ? ANSUR_FITS[sex][key] : undefined
    if (!fit) return result
    const predicted = fit.a + fit.b * heightMm
    const z = (measuredMm - predicted) / fit.sd
    result.ansurMm = predicted
    result.z = z
    if (key !== 'arm') result.label = z > 1 ? 'long' : z < -1 ? 'short' : 'typical'
    return result
  }

  const torsoMm = sternumMm > 0 && inseamMm > 0 ? sternumMm - inseamMm : 0
  return {
    sternum: sternumMm > 0 ? measure(sternumMm, 'sternum') : null,
    torso: torsoMm > 0 ? measure(torsoMm, 'torso') : null,
    arm: armMm > 0 ? measure(armMm, 'arm') : null,
  }
}

