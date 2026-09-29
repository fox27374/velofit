import { describe, expect, it } from 'vitest'
import { normalizeDecimalInput } from './decimalInput'

describe('normalizeDecimalInput', () => {
  it("should return '84' for '84'", () => {
    expect(normalizeDecimalInput('84')).toBe('84')
  })

  it("should return '84.5' for '84,5'", () => {
    expect(normalizeDecimalInput('84,5')).toBe('84.5')
  })

  it("should return '84.5' for '84.5'", () => {
    expect(normalizeDecimalInput('84.5')).toBe('84.5')
  })

  it("should return '84.5' for '84,,5'", () => {
    expect(normalizeDecimalInput('84,,5')).toBe('84.5')
  })

  it("should return '84.56' for '84.5.6'", () => {
    expect(normalizeDecimalInput('84.5.6')).toBe('84.56')
  })

  it("should return '84.5' for 'abc84,5cm'", () => {
    expect(normalizeDecimalInput('abc84,5cm')).toBe('84.5')
  })

  it("should return '' for ''", () => {
    expect(normalizeDecimalInput('')).toBe('')
  })
})
