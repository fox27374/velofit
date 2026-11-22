import { describe, expect, it } from 'vitest'
import { readSavedMeasurements } from './storage'

describe('readSavedMeasurements', () => {
  it('readSavedMeasurements(null) returns null', () => {
    expect(readSavedMeasurements(null)).toBeNull()
  })

  it('readSavedMeasurements(\'{not json\') returns null', () => {
    expect(readSavedMeasurements('{not json')).toBeNull()
  })

  it('readSavedMeasurements(\'42\') returns null', () => {
    expect(readSavedMeasurements('42')).toBeNull()
  })

  it('converts mm values to cm when unit is "mm"', () => {
    const result = readSavedMeasurements(
      JSON.stringify({
        inseam: '840',
        height: '1780',
        shoulderWidth: '410',
        unit: 'mm',
        preference: 'racy',
      })
    )
    expect(result).toEqual({
      inseam: '84',
      height: '178',
      shoulderWidth: '41',
      preference: 'racy',
    })
  })

  it('converts mm values to cm when unit is not specified', () => {
    const result = readSavedMeasurements(
      JSON.stringify({
        inseam: '840',
        height: '1780',
        shoulderWidth: '410',
      })
    )
    expect(result).toEqual({
      inseam: '84',
      height: '178',
      shoulderWidth: '41',
      preference: undefined,
    })
  })

  it('handles decimal values from mm to cm conversion', () => {
    const result = readSavedMeasurements(
      JSON.stringify({
        inseam: '1755',
        height: '1780',
        shoulderWidth: '410',
      })
    )
    expect(result).toEqual({
      inseam: '175.5',
      height: '178',
      shoulderWidth: '41',
      preference: undefined,
    })
  })

  it('returns cm values unchanged when unit is "cm"', () => {
    const result = readSavedMeasurements(
      JSON.stringify({
        inseam: '84.5',
        height: '178',
        shoulderWidth: '41',
        unit: 'cm',
      })
    )
    expect(result).toEqual({
      inseam: '84.5',
      height: '178',
      shoulderWidth: '41',
      preference: undefined,
    })
  })

  it('handles empty string values', () => {
    const result = readSavedMeasurements(
      JSON.stringify({
        inseam: '',
        height: '1780',
        shoulderWidth: '410',
        unit: 'mm',
      })
    )
    expect(result).toEqual({
      inseam: '',
      height: '178',
      shoulderWidth: '41',
      preference: undefined,
    })
  })
})

describe('readSavedMeasurements, optional fields', () => {
  it('returns the optional fields undefined when an older save has none', () => {
    const result = readSavedMeasurements(
      JSON.stringify({ inseam: '84.5', height: '178', shoulderWidth: '41', unit: 'cm' })
    )
    expect(result?.sternumHeight).toBeUndefined()
    expect(result?.armLength).toBeUndefined()
    expect(result?.sitBoneWidth).toBeUndefined()
    expect(result?.sex).toBeUndefined()
  })

  it('reads optional centimetre values unchanged in a cm save', () => {
    const result = readSavedMeasurements(
      JSON.stringify({
        inseam: '88.6',
        height: '183',
        shoulderWidth: '41',
        sternumHeight: '148.9',
        armLength: '61.2',
        sitBoneWidth: '12.8',
        sex: 'male',
        unit: 'cm',
      })
    )
    expect(result).toMatchObject({
      inseam: '88.6',
      sternumHeight: '148.9',
      armLength: '61.2',
      sitBoneWidth: '12.8',
      sex: 'male',
    })
  })

  it('keeps an optional field the rider left empty as an empty string', () => {
    const result = readSavedMeasurements(
      JSON.stringify({ inseam: '84', height: '178', shoulderWidth: '41', armLength: '' })
    )
    expect(result?.armLength).toBe('')
  })

  it('ignores a sex value that is neither male nor female', () => {
    const result = readSavedMeasurements(
      JSON.stringify({ inseam: '84', height: '178', shoulderWidth: '41', sex: 'other' })
    )
    expect(result?.sex).toBeUndefined()
  })
})

describe('unit-less centimetre saves', () => {
  it('reads a unit-less save with a height under 300 as centimetres', () => {
    const saved = readSavedMeasurements(JSON.stringify({ inseam: '88.6', height: '183', shoulderWidth: '40' }))
    expect(saved?.height).toBe('183')
    expect(saved?.inseam).toBe('88.6')
  })
})
