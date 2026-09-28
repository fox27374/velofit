import { describe, expect, it } from 'vitest'
import { calculateMarkerPosition } from './gaugeMarker'

describe('calculateMarkerPosition', () => {
  it('should place 45% at approximately 36.36% on the bar', () => {
    const result = calculateMarkerPosition(45)
    expect(result.position).toBeCloseTo(36.36, 1)
    expect(result.clamped).toBe(false)
  })

  it('should place 48% at approximately 63.64% on the bar', () => {
    const result = calculateMarkerPosition(48)
    expect(result.position).toBeCloseTo(63.64, 1)
    expect(result.clamped).toBe(false)
  })

  it('should place 46.5% at approximately 50% on the bar', () => {
    const result = calculateMarkerPosition(46.5)
    expect(result.position).toBeCloseTo(50, 1)
    expect(result.clamped).toBe(false)
  })

  it('should place 41% at 0% on the bar', () => {
    const result = calculateMarkerPosition(41)
    expect(result.position).toBe(0)
    expect(result.clamped).toBe(false)
  })

  it('should place 52% at 100% on the bar', () => {
    const result = calculateMarkerPosition(52)
    expect(result.position).toBe(100)
    expect(result.clamped).toBe(false)
  })

  it('should clamp 38% to 0% and mark as clamped', () => {
    const result = calculateMarkerPosition(38)
    expect(result.position).toBe(0)
    expect(result.clamped).toBe(true)
  })

  it('should clamp 55% to 100% and mark as clamped', () => {
    const result = calculateMarkerPosition(55)
    expect(result.position).toBe(100)
    expect(result.clamped).toBe(true)
  })
})
