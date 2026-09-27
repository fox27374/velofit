/**
 * Migration function for localStorage buyfit_measurements.
 *
 * Converts mm values to cm (divides by 10) based on the stored unit:
 * - unit: 'mm' OR missing (mm default) → convert to cm
 * - unit: 'cm' → use as-is
 *
 * From now on, we store cm values only and omit the unit field.
 *
 * @returns Measurements in cm, or null if parse fails or nothing is stored
 */
export interface MeasurementsCM {
  inseam: string;
  height: string;
  shoulderWidth: string;
  preference?: string;
}

export function migrateMeasurements(): MeasurementsCM | null {
  const stored = localStorage.getItem('buyfit_measurements');
  if (!stored) return null;

  try {
    const data = JSON.parse(stored);

    // Determine the unit: if missing or 'mm', convert from mm to cm
    const unit = data.unit || 'mm';

    if (unit === 'cm') {
      // Already in cm, use as-is
      return {
        inseam: data.inseam || '',
        height: data.height || '',
        shoulderWidth: data.shoulderWidth || '',
        preference: data.preference,
      };
    }

    // unit is 'mm': convert to cm by dividing by 10
    const inseam =
      data.inseam && !isNaN(data.inseam)
        ? (parseFloat(data.inseam) / 10).toString()
        : '';
    const height =
      data.height && !isNaN(data.height)
        ? (parseFloat(data.height) / 10).toString()
        : '';
    const shoulderWidth =
      data.shoulderWidth && !isNaN(data.shoulderWidth)
        ? (parseFloat(data.shoulderWidth) / 10).toString()
        : '';

    return {
      inseam,
      height,
      shoulderWidth,
      preference: data.preference,
    };
  } catch {
    // Malformed JSON: return null and ignore
    return null;
  }
}
