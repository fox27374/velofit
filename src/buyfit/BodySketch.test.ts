import { describe, expect, it } from 'vitest'
import { formatCm, sketchLabel, sketchRows } from './BodySketch'

describe('formatCm', () => {
  it('should format 845 as "84.5 cm"', () => {
    expect(formatCm(845)).toBe('84.5 cm')
  })

  it('should format 1780 as "178 cm"', () => {
    expect(formatCm(1780)).toBe('178 cm')
  })

  it('should format 410 as "41 cm"', () => {
    expect(formatCm(410)).toBe('41 cm')
  })

  it('should format 1755 as "175.5 cm"', () => {
    expect(formatCm(1755)).toBe('175.5 cm')
  })

  it('should format 1754.6 as "175.5 cm" (rounded to whole millimetres first)', () => {
    expect(formatCm(1754.6)).toBe('175.5 cm')
  })
})

describe('sketchRows', () => {
  it('numbers the six measures in fitting-report order, whatever is present', () => {
    const rows = sketchRows({ heightMm: 1830, inseamMm: 886, shoulderMm: 410 })
    expect(rows.map((r) => [r.n, r.name])).toEqual([
      [1, 'Height'],
      [2, 'Inseam'],
      [3, 'Shoulder width'],
    ])
  })

  it('shows a measure only when its value is above zero', () => {
    const rows = sketchRows({ heightMm: 1830, sternumMm: 0, armMm: 612, sitBoneMm: 128 })
    expect(rows.map((r) => r.name)).toEqual(['Height', 'Arm length', 'Sit bones'])
    expect(rows.find((r) => r.name === 'Arm length')?.n).toBe(5)
    expect(rows.find((r) => r.name === 'Sit bones')?.n).toBe(6)
  })

  it('formats each present value in cm', () => {
    const rows = sketchRows({ sitBoneMm: 128, sternumMm: 1489 })
    expect(rows.map((r) => r.value)).toEqual(['148.9 cm', '12.8 cm'])
  })

  it('no-values mode lists all six measures with no values', () => {
    const rows = sketchRows({}, true)
    expect(rows).toHaveLength(6)
    expect(rows.every((r) => r.value === undefined)).toBe(true)
  })
})

describe('sketchLabel', () => {
  it('names each present measure with its value', () => {
    const rows = sketchRows({ heightMm: 1830, sitBoneMm: 128 })
    expect(sketchLabel(rows, false)).toBe('Your measurements: height 183 cm, sit bones 12.8 cm')
  })

  it('says nothing was entered when no value is present', () => {
    expect(sketchLabel(sketchRows({}), false)).toBe('Your measurements: none entered')
  })
})

