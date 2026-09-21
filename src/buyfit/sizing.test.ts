import { describe, it, expect } from 'vitest'
import { calculateSizing, checkManualFit, compareToBand } from './sizing'

describe('calculateSizing', () => {
  it('calculates saddle height as 0.870–0.895 × inseam', () => {
    const result = calculateSizing(800, 1800, 400)
    expect(result.saddleHeightMin).toBe(696) // 800 * 0.870
    expect(result.saddleHeightMax).toBe(716) // 800 * 0.895
  })

  it('calculates handlebar width as shoulder width ± 20 mm', () => {
    const result = calculateSizing(800, 1800, 400)
    expect(result.handlebarWidth).toBe(400)
    expect(result.handlebarWidthMin).toBe(380)
    expect(result.handlebarWidthMax).toBe(420)
  })

  it('sets crank length to a permissive range', () => {
    const result = calculateSizing(800, 1800, 400)
    expect(result.crankLength).toBe('165–175 mm')
  })


  it('produces realistic values for a 1750 mm tall rider with 750 mm inseam', () => {
    const result = calculateSizing(750, 1750, 410)
    expect(result.saddleHeightMin).toBeGreaterThan(600)
    expect(result.saddleHeightMin).toBeLessThan(700)
  })
})

describe('checkManualFit', () => {
  it('returns "fits" for a bike exactly on target', () => {
    const result = checkManualFit(550, 400, 550, 400, 30)
    expect(result.verdict).toBe('fits')
    expect(result.stackDelta).toBe(0)
    expect(result.reachDelta).toBe(0)
  })

  it('returns "fits" for a bike within tolerance', () => {
    const result = checkManualFit(555, 405, 550, 400, 30)
    expect(result.verdict).toBe('fits')
    expect(result.stackDelta).toBe(5)
    expect(result.reachDelta).toBe(5)
  })

  it('returns "too_tall" for a bike with stack too high', () => {
    const result = checkManualFit(590, 400, 550, 400, 30)
    expect(result.verdict).toBe('too_tall')
    expect(result.stackDelta).toBe(40)
  })

  it('returns "too_low" for a bike with stack too low', () => {
    const result = checkManualFit(510, 400, 550, 400, 30)
    expect(result.verdict).toBe('too_low')
    expect(result.stackDelta).toBe(-40)
  })

  it('returns "too_long" for a bike with reach too far', () => {
    const result = checkManualFit(550, 440, 550, 400, 30)
    expect(result.verdict).toBe('too_long')
    expect(result.reachDelta).toBe(40)
  })

  it('returns "too_short" for a bike with reach too close', () => {
    const result = checkManualFit(550, 360, 550, 400, 30)
    expect(result.verdict).toBe('too_short')
    expect(result.reachDelta).toBe(-40)
  })

  it('calculates deltas correctly for positive values', () => {
    const result = checkManualFit(560, 410, 550, 400)
    expect(result.stackDelta).toBe(10)
    expect(result.reachDelta).toBe(10)
  })

  it('calculates deltas correctly for negative values', () => {
    const result = checkManualFit(540, 390, 550, 400)
    expect(result.stackDelta).toBe(-10)
    expect(result.reachDelta).toBe(-10)
  })
})

describe('compareToBand', () => {
  it('places a spec value against the suggested band, boundaries inside', () => {
    expect(compareToBand(410, 390, 430)).toBe('inside')
    expect(compareToBand(390, 390, 430)).toBe('inside')
    expect(compareToBand(430, 390, 430)).toBe('inside')
    expect(compareToBand(380, 390, 430)).toBe('below')
    expect(compareToBand(440, 390, 430)).toBe('above')
  })
})
