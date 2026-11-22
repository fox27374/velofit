/**
 * Plausibility checking for body measurements.
 *
 * The ranges are deliberately generous so real riders at the extremes are never
 * blocked; they only reject values that cannot be a human body.
 */

/** The three body measurements the page asks for. */
export type MeasurementField = 'inseam' | 'height' | 'shoulderWidth'

/** Inclusive plausible range per field, in centimetres. */
export const LIMITS_CM: Record<MeasurementField, { min: number; max: number }> = {
  inseam: { min: 50, max: 110 },
  height: { min: 120, max: 220 },
  shoulderWidth: { min: 25, max: 55 },
}

/** Inclusive plausible range for inseam as a percentage of height. */
export const RATIO_PERCENT = { min: 35, max: 60 }

export interface MeasurementCheck {
  /** One message per field that is out of range, or null when the field is fine or empty. */
  fields: Record<MeasurementField, string | null>
  /** Message when inseam/height is outside RATIO_PERCENT, otherwise null. */
  ratio: string | null
  /** True only when all three values are present, all in range, and the ratio is in range. */
  ok: boolean
}

/**
 * Check whether body measurements are humanly plausible.
 *
 * Returns a report with one message per field that is out of range (or null if fine),
 * a message for ratio problems (or null if fine), and an ok flag that is true only
 * when all three values are present, all in range, and the ratio is in range.
 *
 * The ranges are deliberately generous so real riders at the extremes are never
 * blocked; they only reject values that cannot be a human body.
 *
 * @param inseamCm - inseam in centimetres; NaN means empty
 * @param heightCm - height in centimetres; NaN means empty
 * @param shoulderWidthCm - shoulder width in centimetres; NaN means empty
 */
export function checkMeasurements(
  inseamCm: number,
  heightCm: number,
  shoulderWidthCm: number
): MeasurementCheck {
  const fields: Record<MeasurementField, string | null> = {
    inseam: null,
    height: null,
    shoulderWidth: null,
  }

  // Check if values are NaN (empty) or out of range
  if (Number.isNaN(inseamCm)) {
    fields.inseam = null
  } else if (inseamCm < LIMITS_CM.inseam.min || inseamCm > LIMITS_CM.inseam.max) {
    fields.inseam = `Inseam must be between ${LIMITS_CM.inseam.min} and ${LIMITS_CM.inseam.max} cm.`
  }

  if (Number.isNaN(heightCm)) {
    fields.height = null
  } else if (heightCm < LIMITS_CM.height.min || heightCm > LIMITS_CM.height.max) {
    fields.height = `Height must be between ${LIMITS_CM.height.min} and ${LIMITS_CM.height.max} cm.`
  }

  if (Number.isNaN(shoulderWidthCm)) {
    fields.shoulderWidth = null
  } else if (
    shoulderWidthCm < LIMITS_CM.shoulderWidth.min ||
    shoulderWidthCm > LIMITS_CM.shoulderWidth.max
  ) {
    fields.shoulderWidth = `Shoulder width must be between ${LIMITS_CM.shoulderWidth.min} and ${LIMITS_CM.shoulderWidth.max} cm.`
  }

  // Check ratio only when both inseam and height are present and in range
  let ratio: string | null = null
  if (
    !Number.isNaN(inseamCm) &&
    !Number.isNaN(heightCm) &&
    inseamCm >= LIMITS_CM.inseam.min &&
    inseamCm <= LIMITS_CM.inseam.max &&
    heightCm >= LIMITS_CM.height.min &&
    heightCm <= LIMITS_CM.height.max
  ) {
    const ratioPercent = Math.round((inseamCm / heightCm) * 1000) / 10
    if (ratioPercent < RATIO_PERCENT.min || ratioPercent > RATIO_PERCENT.max) {
      ratio = `Inseam is ${ratioPercent}% of height; expected ${RATIO_PERCENT.min}–${RATIO_PERCENT.max}%. Check both values.`
    }
  }

  // ok is true only when all values are present, all in range, and ratio is in range
  const ok =
    !Number.isNaN(inseamCm) &&
    !Number.isNaN(heightCm) &&
    !Number.isNaN(shoulderWidthCm) &&
    fields.inseam === null &&
    fields.height === null &&
    fields.shoulderWidth === null &&
    ratio === null

  return { fields, ratio, ok }
}

/** The optional measurements. Their messages are warnings: they never block the page. */
export type OptionalField = 'sternumHeight' | 'armLength' | 'sitBoneWidth'

/** Plausible share of height for sternum height and arm length (§8.3 spread, widened). */
export const OPTIONAL_RATIO = {
  sternumHeight: { min: 78, max: 86 },
  armLength: { min: 30, max: 39 },
}

/** Plausible sit-bone width, centre to centre, in mm. */
export const SIT_BONE_MM = { min: 90, max: 180 }

/**
 * Warnings for the optional measurements, in centimetres. NaN means empty and
 * gets no message. Heights are compared only when height is entered.
 */
export function checkOptionalMeasurements(
  heightCm: number,
  inseamCm: number,
  sternumCm: number,
  armCm: number,
  sitBoneCm: number
): Record<OptionalField, string | null> {
  const fields: Record<OptionalField, string | null> = {
    sternumHeight: null,
    armLength: null,
    sitBoneWidth: null,
  }
  const percentOf = (part: number) => Math.round((part / heightCm) * 1000) / 10

  if (!Number.isNaN(sternumCm)) {
    if (
      (!Number.isNaN(heightCm) && sternumCm >= heightCm) ||
      (!Number.isNaN(inseamCm) && sternumCm <= inseamCm)
    ) {
      fields.sternumHeight = 'Sternum height should be below your height and above your inseam.'
    } else if (!Number.isNaN(heightCm)) {
      const pct = percentOf(sternumCm)
      if (pct < OPTIONAL_RATIO.sternumHeight.min || pct > OPTIONAL_RATIO.sternumHeight.max) {
        fields.sternumHeight =
          `Sternum height is ${pct}% of height; expected ${OPTIONAL_RATIO.sternumHeight.min}–` +
          `${OPTIONAL_RATIO.sternumHeight.max}%. Check the notch you measured to.`
      }
    }
  }

  if (!Number.isNaN(armCm) && !Number.isNaN(heightCm)) {
    const pct = percentOf(armCm)
    if (pct < OPTIONAL_RATIO.armLength.min || pct > OPTIONAL_RATIO.armLength.max) {
      fields.armLength =
        `Arm length is ${pct}% of height; expected ${OPTIONAL_RATIO.armLength.min}–` +
        `${OPTIONAL_RATIO.armLength.max}%. Check the wrist landmark.`
    }
  }

  if (!Number.isNaN(sitBoneCm)) {
    const mm = sitBoneCm * 10
    if (mm < SIT_BONE_MM.min || mm > SIT_BONE_MM.max) {
      fields.sitBoneWidth =
        `Sit-bone width should be ${SIT_BONE_MM.min / 10}–${SIT_BONE_MM.max / 10} cm, ` +
        `centre to centre.`
    }
  }

  return fields
}
