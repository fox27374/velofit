/**
 * Core sizing calculations for BuyFit.
 * All numbers sourced from doc/frame-sizing-research.md.
 */

export interface SizingOutput {
  saddleHeightMin: number
  saddleHeightMax: number
  handlebarWidth: number
  handlebarWidthMin: number
  handlebarWidthMax: number
  crankLength: string
}

export type ManualFitVerdict = 'fits' | 'too_tall' | 'too_low' | 'too_long' | 'too_short'

export interface ManualFitResult {
  verdict: ManualFitVerdict
  stackDelta: number
  reachDelta: number
}

/**
 * Calculate sizing outputs from body measurements.
 * All inputs and outputs are in mm.
 * Stack/reach window is derived from the database, not from body measurements.
 *
 * @param inseam - barefoot crotch-to-floor in mm
 * @param _height - total height in mm (used by matcher, not by these formulas)
 * @param shoulderWidth - biacromial (shoulder) width in mm, centre-to-centre
 */
export function calculateSizing(
  inseam: number,
  _height: number,
  shoulderWidth: number
): SizingOutput {
  // Saddle height: 0.870–0.895 × inseam (Sourced: LeMond/Hamley/Holliday)
  const saddleHeightMin = Math.round(inseam * 0.870)
  const saddleHeightMax = Math.round(inseam * 0.895)

  // Handlebar width: shoulder width ±20 mm (Weak: Lin et al. 2025)
  const handlebarWidthMin = shoulderWidth - 20
  const handlebarWidthMax = shoulderWidth + 20

  return {
    saddleHeightMin,
    saddleHeightMax,
    handlebarWidth: shoulderWidth,
    handlebarWidthMin,
    handlebarWidthMax,
    crankLength: '165–175 mm',
  }
}

/**
 * Check if a bike's stack and reach fit within a tolerance of a target.
 * Returns a verdict: fits, too_tall/low (stack), or too_long/short (reach).
 *
 * @param bikeStack - bike's stack in mm
 * @param bikeReach - bike's reach in mm
 * @param targetStack - target stack in mm (usually window centre)
 * @param targetReach - target reach in mm (usually window centre)
 * @param tolerance - tolerance in mm (default 30)
 */
export function checkManualFit(
  bikeStack: number,
  bikeReach: number,
  targetStack: number,
  targetReach: number,
  tolerance: number = 30
): ManualFitResult {
  const stackDelta = bikeStack - targetStack
  const reachDelta = bikeReach - targetReach

  if (Math.abs(stackDelta) > tolerance) {
    const verdict: ManualFitVerdict = stackDelta > 0 ? 'too_tall' : 'too_low'
    return { verdict, stackDelta, reachDelta }
  }

  if (Math.abs(reachDelta) > tolerance) {
    const verdict: ManualFitVerdict = reachDelta > 0 ? 'too_long' : 'too_short'
    return { verdict, stackDelta, reachDelta }
  }

  return {
    verdict: 'fits',
    stackDelta,
    reachDelta,
  }
}
