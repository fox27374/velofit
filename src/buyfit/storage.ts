import type { Discipline, Sex } from './sizing'

/**
 * The rider's saved measurements, in centimetres, as the input fields hold
 * them (strings, so an empty field stays empty). The optional fields were added
 * later: absent in older saves, so they come back undefined.
 */
export interface SavedMeasurements {
  inseam: string
  height: string
  shoulderWidth: string
  preference?: string
  sternumHeight?: string
  armLength?: string
  sitBoneWidth?: string
  /** Tri only: pad stack and reach in cm, BB centre to the rear of the armrest pad. */
  armrestStack?: string
  armrestReach?: string
  sex?: Sex
  /** Absent in saves from before tri mode; BuyFit reads absent as road. */
  discipline?: Discipline
}

/**
 * Reads what BuyFit saved under `buyfit_measurements`.
 *
 * Until 2026-09-27 the page offered mm or cm and saved a `unit` field, with mm
 * as the default. Values saved with `unit: 'mm'`, or with no unit at all, are
 * millimetres and are converted to centimetres here, once. Values saved with
 * `unit: 'cm'` are returned unchanged. From 2026-11-22 the page saves
 * `unit: 'cm'`: saving no unit made a reload divide every value by ten.
 *
 * Returns null when nothing is saved or the saved text is not a JSON object.
 */
export function readSavedMeasurements(raw: string | null): SavedMeasurements | null {
  if (raw === null) return null
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof data !== 'object' || data === null) return null
  const d = data as Record<string, unknown>
  // Unit-less saves from 2026-09-27 to 2026-11-22 are centimetres; a height under 300 gives them away.
  const inMm = d.unit === 'mm' || (d.unit === undefined && !(parseFloat(String(d.height)) < 300))

  const field = (value: unknown): string => {
    const text = value === undefined || value === null ? '' : String(value)
    if (!inMm) return text
    const n = parseFloat(text)
    return Number.isNaN(n) ? '' : String(Math.round(n) / 10)
  }

  // The optional fields only ever existed in centimetres, so they are never converted.
  const optional = (value: unknown): string | undefined =>
    value === undefined || value === null ? undefined : String(value)

  return {
    inseam: field(d.inseam),
    height: field(d.height),
    shoulderWidth: field(d.shoulderWidth),
    preference: typeof d.preference === 'string' ? d.preference : undefined,
    sternumHeight: optional(d.sternumHeight),
    armLength: optional(d.armLength),
    sitBoneWidth: optional(d.sitBoneWidth),
    armrestStack: optional(d.armrestStack),
    armrestReach: optional(d.armrestReach),
    sex: d.sex === 'male' || d.sex === 'female' ? d.sex : undefined,
    discipline: d.discipline === 'road' || d.discipline === 'triathlon' ? d.discipline : undefined,
  }
}
