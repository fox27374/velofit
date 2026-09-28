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
