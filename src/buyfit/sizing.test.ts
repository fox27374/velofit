import { describe, it, expect } from 'vitest'
import {
  bodyProportions,
  calculateSizing,
  crankLengthBand,
  inseamRatio,
  saddleWidth,
} from './sizing'

// The reference rider from doc/frame-sizing-research.md §8.3: male, 183.0 cm.
const REF = { heightMm: 1830, inseamMm: 886, sternumMm: 1489, armMm: 612 }

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

describe('saddleWidth', () => {
  // Reference rider, sit bones 128 mm centre to centre (§8.1 allowances).
  it('adds the riding-position allowance to centre-to-centre sit-bone width (§8.1)', () => {
    expect(saddleWidth(128, 'racy')?.widthMm).toBe(138)
    expect(saddleWidth(128, 'none')?.widthMm).toBe(148)
    expect(saddleWidth(128, 'relaxed')?.widthMm).toBe(158)
  })

  it('says the allowance is brand guidance, and what the width means', () => {
    const note = saddleWidth(128)?.note ?? ''
    expect(note).toContain('brand guidance')
    expect(note).toContain('effective')
  })

  it('returns null when sit-bone width is missing', () => {
    expect(saddleWidth(0)).toBeNull()
  })
})

describe('bodyProportions', () => {
  it('reports percentages of height without a reference when sex is not set', () => {
    const p = bodyProportions(REF)
    expect(p.sternum?.percentOfHeight).toBe(81.4)
    expect(p.torso?.percentOfHeight).toBe(33)
    expect(p.arm?.percentOfHeight).toBe(33.4)
    expect(p.sternum?.ansurMm).toBeUndefined()
    expect(p.sternum?.label).toBeUndefined()
  })

  // Male, 1830 mm, sternum 1489 mm:
  // ANSUR sternum = -101.4 + 0.8769 × 1830 = 1503.3 mm, SD 11.7 → z = -1.22.
  it('labels the reference rider sternum as short (z ≈ −1.2)', () => {
    const sternum = bodyProportions({ ...REF, sex: 'male' }).sternum!
    expect(sternum.ansurMm).toBeCloseTo(1503.3, 1)
    expect(sternum.z).toBeCloseTo(-1.22, 2)
    expect(sternum.label).toBe('short')
  })

  // Torso = 1489 - 886 = 603 mm. ANSUR torso = 74.9 + 0.2948 × 1830 = 614.4 mm,
  // SD 24.2 → z = -0.47, so typical.
  it('labels the reference rider torso as typical (z ≈ −0.5)', () => {
    const torso = bodyProportions({ ...REF, sex: 'male' }).torso!
    expect(torso.measuredMm).toBe(603)
    expect(torso.z).toBeCloseTo(-0.47, 2)
    expect(torso.label).toBe('typical')
  })

  // ANSUR arm = -35.4 + 0.3636 × 1830 = 630.0 mm, SD 17.6 → z = -1.02. Arm never
  // gets a label, whatever its z.
  it('gives the reference rider arm an ANSUR average and z, but never a label', () => {
    const arm = bodyProportions({ ...REF, sex: 'male' }).arm!
    expect(arm.ansurMm).toBeCloseTo(630.0, 0)
    expect(arm.z).toBeCloseTo(-1.02, 2)
    expect(arm.label).toBeUndefined()
  })

  it('leaves torso out when sternum height or inseam is missing', () => {
    expect(bodyProportions({ ...REF, sternumMm: 0 }).torso).toBeNull()
    expect(bodyProportions({ ...REF, inseamMm: 0 }).torso).toBeNull()
  })

  it('leaves unentered measures out and returns nulls without a height', () => {
    const p = bodyProportions({ heightMm: 1830, inseamMm: 0, sternumMm: 0, armMm: 0 })
    expect(p).toEqual({ sternum: null, torso: null, arm: null })
    expect(bodyProportions({ ...REF, heightMm: 0 }).sternum).toBeNull()
  })
})

