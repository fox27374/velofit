import { describe, expect, it } from 'vitest'
import { formatCm } from './BodySketch'

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
