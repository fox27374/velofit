/**
 * The rider's saved measurements, in centimetres, as the input fields hold
 * them (strings, so an empty field stays empty).
 */
export interface SavedMeasurements {
  inseam: string
  height: string
  shoulderWidth: string
  preference?: string
}

/**
 * Reads what BuyFit saved under `buyfit_measurements`.
 *
 * Until 2026-09-27 the page offered mm or cm and saved a `unit` field, with mm
 * as the default. Values saved with `unit: 'mm'`, or with no unit at all, are
 * millimetres and are converted to centimetres here, once. Values saved with
 * `unit: 'cm'` are returned unchanged. From now on the page saves centimetres
 * and no unit.
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
  const inMm = d.unit !== 'cm'

  const field = (value: unknown): string => {
    const text = value === undefined || value === null ? '' : String(value)
    if (!inMm) return text
    const n = parseFloat(text)
    return Number.isNaN(n) ? '' : String(Math.round(n) / 10)
  }

  return {
    inseam: field(d.inseam),
    height: field(d.height),
    shoulderWidth: field(d.shoulderWidth),
    preference: typeof d.preference === 'string' ? d.preference : undefined,
  }
}
