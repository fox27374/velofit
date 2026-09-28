/** The gauge's scale, in percent of height. */
export const GAUGE_MIN = 41
export const GAUGE_MAX = 52

/**
 * Where a ratio sits on the 41–52% gauge, as 0–100 across the bar. A value
 * outside the scale pins to the nearest end and `clamped` says so; the caller
 * still prints the real value.
 */
export function calculateMarkerPosition(percent: number): { position: number; clamped: boolean } {
  const position = ((percent - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100
  return {
    position: Math.max(0, Math.min(100, position)),
    clamped: percent < GAUGE_MIN || percent > GAUGE_MAX,
  }
}
