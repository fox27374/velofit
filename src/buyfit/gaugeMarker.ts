/**
 * Calculate the position of the inseam-to-height ratio marker on a 41–52% gauge.
 * Outside the scale, the marker clamps to the edge but the value is shown as-is.
 *
 * @param percent - Inseam as a percentage of height (e.g., 45.0 for 45%)
 * @returns Object with clamped position (0–100) and whether it's outside the scale
 */
export function calculateMarkerPosition(
  percent: number
): {
  position: number; // 0–100, where 0 is 41% and 100 is 52%
  clamped: boolean; // true if the value is outside 41–52
} {
  const min = 41;
  const max = 52;
  const range = max - min;

  // Calculate position as a percentage of the 41–52 scale
  const position = ((percent - min) / range) * 100;
  const clamped = percent < min || percent > max;

  // Clamp to 0–100 for rendering
  return {
    position: Math.max(0, Math.min(100, position)),
    clamped,
  };
}
