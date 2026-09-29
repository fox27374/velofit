import { describe, expect, it } from 'vitest'
import { checkMeasurements } from './plausibility'

describe('checkMeasurements', () => {
  it('case 1: valid measurements all in range', () => {
    const result = checkMeasurements(84, 178, 41)
    expect(result.ok).toBe(true)
    expect(result.fields.inseam).toBeNull()
    expect(result.fields.height).toBeNull()
    expect(result.fields.shoulderWidth).toBeNull()
    expect(result.ratio).toBeNull()
  })

  it('case 2: all three measurements way out of range', () => {
    const result = checkMeasurements(8.9, 18.3, 5.5)
    expect(result.ok).toBe(false)
    expect(result.fields.inseam).toBe('Inseam must be between 50 and 110 cm.')
    expect(result.fields.height).toBe('Height must be between 120 and 220 cm.')
    expect(result.fields.shoulderWidth).toBe('Shoulder width must be between 25 and 55 cm.')
    expect(result.ratio).toBeNull()
  })

  it('case 3a: bounds are allowed (minimum bounds)', () => {
    const result = checkMeasurements(50, 120, 25)
    expect(result.ok).toBe(true)
    expect(result.fields.inseam).toBeNull()
    expect(result.fields.height).toBeNull()
    expect(result.fields.shoulderWidth).toBeNull()
    expect(result.ratio).toBeNull()
  })

  it('case 3b: bounds are allowed (maximum bounds)', () => {
    const result = checkMeasurements(110, 220, 55)
    expect(result.ok).toBe(true)
    expect(result.fields.inseam).toBeNull()
    expect(result.fields.height).toBeNull()
    expect(result.fields.shoulderWidth).toBeNull()
    expect(result.ratio).toBeNull()
  })

  it('case 4a: just outside bounds (height below minimum)', () => {
    const result = checkMeasurements(84, 119.9, 41)
    expect(result.fields.height).toBe('Height must be between 120 and 220 cm.')
  })

  it('case 4b: just outside bounds (height above maximum)', () => {
    const result = checkMeasurements(84, 220.1, 41)
    expect(result.fields.height).toBe('Height must be between 120 and 220 cm.')
  })

  it('case 5: empty inseam (NaN)', () => {
    const result = checkMeasurements(NaN, 178, 41)
    expect(result.ok).toBe(false)
    expect(result.fields.inseam).toBeNull()
    expect(result.ratio).toBeNull()
  })

  it('case 6: ratio too high', () => {
    const result = checkMeasurements(110, 170, 41)
    expect(result.fields.inseam).toBeNull()
    expect(result.fields.height).toBeNull()
    expect(result.fields.shoulderWidth).toBeNull()
    expect(result.ratio).toBe('Inseam is 64.7% of height; expected 35–60%. Check both values.')
    expect(result.ok).toBe(false)
  })

  it('case 7: ratio too low', () => {
    const result = checkMeasurements(60, 180, 41)
    expect(result.fields.inseam).toBeNull()
    expect(result.fields.height).toBeNull()
    expect(result.fields.shoulderWidth).toBeNull()
    expect(result.ratio).toBe('Inseam is 33.3% of height; expected 35–60%. Check both values.')
    expect(result.ok).toBe(false)
  })

  it('case 8: ratio skipped when a field is out of range', () => {
    const result = checkMeasurements(8.9, 178, 41)
    expect(result.fields.inseam).toBe('Inseam must be between 50 and 110 cm.')
    expect(result.ratio).toBeNull()
  })

  it('case 9: zero value', () => {
    const result = checkMeasurements(0, 178, 41)
    expect(result.fields.inseam).toBe('Inseam must be between 50 and 110 cm.')
  })
})
