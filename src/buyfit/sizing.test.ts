import { describe, it, expect } from 'vitest'
import {
  calculateSizing,
  crankLengthBand,
  inseamRatio,
} from './sizing'

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

  it('drops 175 mm from the default crank band', () => {
    const result = calculateSizing(800, 1800, 400)
    expect(result.crankLength).toBe('165–170 mm')
    expect(result.crankNote).toContain('perceived fatigue')
  })

  it('points a racier rider at the short end', () => {
    const result = calculateSizing(800, 1800, 400, 'racy')
    expect(result.crankLength).toBe('165 mm')
    expect(result.crankNote).toContain('hip')
  })

  it('treats a relaxed preference like no preference', () => {
    expect(calculateSizing(800, 1800, 400, 'relaxed').crankLength).toBe(
      calculateSizing(800, 1800, 400).crankLength
    )
  })


  it('produces realistic values for a 1750 mm tall rider with 750 mm inseam', () => {
    const result = calculateSizing(750, 1750, 410)
    expect(result.saddleHeightMin).toBeGreaterThan(600)
    expect(result.saddleHeightMin).toBeLessThan(700)
  })
})

describe('crankLengthBand', () => {
  it('never prints a formula-derived single number', () => {
    // 0.216 x 800 = 172.8 mm (Palm), 0.21 x 800 = 168 mm (Zinn). Neither may
    // appear: no crank output is allowed to depend on inseam at all.
    for (const p of ['none', 'racy', 'relaxed'] as const) {
      expect(crankLengthBand(p).range).not.toContain('172')
      expect(crankLengthBand(p).range).not.toContain('168')
    }
  })

  it('always carries a reason with the band', () => {
    for (const p of ['none', 'racy', 'relaxed'] as const) {
      expect(crankLengthBand(p).note.length).toBeGreaterThan(40)
    }
  })
})

describe('inseamRatio', () => {
  it('reports inseam as a percentage of height to one decimal', () => {
    expect(inseamRatio(800, 1800)?.percent).toBe(44.4)
    expect(inseamRatio(850, 1800)?.percent).toBe(47.2)
  })

  it('classifies the 45-48% band as typical, inclusive at both ends', () => {
    expect(inseamRatio(810, 1800)?.proportion).toBe('typical') // 45.0%
    expect(inseamRatio(864, 1800)?.proportion).toBe('typical') // 48.0%
  })

  it('classifies outside that band as long- or short-legged', () => {
    expect(inseamRatio(880, 1800)?.proportion).toBe('long') // 48.9%
    expect(inseamRatio(790, 1800)?.proportion).toBe('short') // 43.9%
  })

  it('returns null rather than a ratio when a measurement is missing', () => {
    expect(inseamRatio(0, 1800)).toBeNull()
    expect(inseamRatio(800, 0)).toBeNull()
    expect(inseamRatio(-800, 1800)).toBeNull()
  })
})

