import { describe, expect, it } from 'vitest'
import { displayLabels, type LabelInput } from './displayName'

describe('displayLabels', () => {
  const createBike = (bikeId: string, brand: string, family: string, frameName: string, generation: string = '', year: number = 0): LabelInput => ({
    bikeId,
    brand,
    family,
    frameName,
    generation,
    year,
  })

  it('should return "Trek Domane" for a single bike', () => {
    const bikes = [createBike('bike1', 'Trek', 'Domane', 'Domane SL 5', '4')]
    const result = displayLabels(bikes)
    expect(result.get('bike1')).toBe('Trek Domane')
  })

  it('should deduplicate bikes by bikeId', () => {
    const bikes = [
      createBike('bike1', 'Trek', 'Domane', 'Domane SL 5', '4'),
      createBike('bike1', 'Trek', 'Domane', 'Domane SL 5', '4'),
      createBike('bike1', 'Trek', 'Domane', 'Domane SL 5', '4'),
    ]
    const result = displayLabels(bikes)
    expect(result.size).toBe(1)
    expect(result.get('bike1')).toBe('Trek Domane')
  })

  it('should handle Canyon bikes with different frame names', () => {
    const bikes = [
      createBike('bike1', 'Canyon', 'Endurace', 'Endurace CF'),
      createBike('bike2', 'Canyon', 'Endurace', 'Endurace CF SLX'),
      createBike('bike3', 'Canyon', 'Endurace', 'Endurace CFR'),
      createBike('bike4', 'Canyon', 'Endurace', 'Endurace AllRoad'),
    ]
    const result = displayLabels(bikes)
    expect(result.get('bike1')).toBe('Canyon Endurace CF')
    expect(result.get('bike2')).toBe('Canyon Endurace CF SLX')
    expect(result.get('bike3')).toBe('Canyon Endurace CFR')
    expect(result.get('bike4')).toBe('Canyon Endurace AllRoad')
  })

  it('should handle "Ultimate" and "Ultimate CFR"', () => {
    const bikes = [
      createBike('bike1', 'Canyon', 'Ultimate', 'Ultimate'),
      createBike('bike2', 'Canyon', 'Ultimate', 'Ultimate CFR'),
    ]
    const result = displayLabels(bikes)
    expect(result.get('bike1')).toBe('Canyon Ultimate')
    expect(result.get('bike2')).toBe('Canyon Ultimate CFR')
  })

  it('should add generation when generations differ', () => {
    const bikes = [
      createBike('bike1', 'Trek', 'Domane', 'Domane SL 5', '3'),
      createBike('bike2', 'Trek', 'Domane', 'Domane SL 5', '4'),
    ]
    const result = displayLabels(bikes)
    expect(result.get('bike1')).toBe('Trek Domane Gen 3')
    expect(result.get('bike2')).toBe('Trek Domane Gen 4')
  })

  it('should add generation only for bike with non-empty generation when one is empty', () => {
    const bikes = [
      createBike('bike1', 'Trek', 'Madone', 'Madone SLR 9', '8'),
      createBike('bike2', 'Trek', 'Madone', 'Madone SLR 9', ''),
    ]
    const result = displayLabels(bikes)
    expect(result.get('bike1')).toBe('Trek Madone Gen 8')
    expect(result.get('bike2')).toBe('Trek Madone')
  })

  it('should differentiate Trek and Acme Domane', () => {
    const bikes = [
      createBike('bike1', 'Trek', 'Domane', 'Domane'),
      createBike('bike2', 'Acme', 'Domane', 'Domane'),
    ]
    const result = displayLabels(bikes)
    expect(result.get('bike1')).toBe('Trek Domane')
    expect(result.get('bike2')).toBe('Acme Domane')
  })

  it('should use year for disambiguation when years differ', () => {
    const bikes = [
      createBike('bike1', 'Trek', 'Domane', 'Domane SL 5', '4', 2023),
      createBike('bike2', 'Trek', 'Domane', 'Domane SL 5', '4', 2025),
    ]
    const result = displayLabels(bikes)
    expect(result.get('bike1')).toBe('Trek Domane (2023)')
    expect(result.get('bike2')).toBe('Trek Domane (2025)')
  })

  it('should use numeric disambiguation when years are both 0', () => {
    const bikes = [
      createBike('bike1', 'Trek', 'Domane', 'Domane SL 5', '4', 0),
      createBike('bike2', 'Trek', 'Domane', 'Domane SL 5', '4', 0),
    ]
    const result = displayLabels(bikes)
    expect(result.get('bike1')).toBe('Trek Domane (1)')
    expect(result.get('bike2')).toBe('Trek Domane (2)')
  })

  it('should use numeric disambiguation when years are the same', () => {
    const bikes = [
      createBike('bike1', 'Trek', 'Domane', 'Domane SL 5', '4', 2024),
      createBike('bike2', 'Trek', 'Domane', 'Domane SL 5', '4', 2024),
    ]
    const result = displayLabels(bikes)
    expect(result.get('bike1')).toBe('Trek Domane (1)')
    expect(result.get('bike2')).toBe('Trek Domane (2)')
  })

  it('should handle empty family', () => {
    const bikes = [createBike('bike1', 'Acme', '', 'Something Odd')]
    const result = displayLabels(bikes)
    expect(result.get('bike1')).toBe('Acme Something Odd')
  })

  it('should compare shared words case-insensitively', () => {
    const bikes = [
      createBike('bike1', 'Canyon', 'Endurace', 'Endurace CF'),
      createBike('bike2', 'Canyon', 'Endurace', 'Endurace cf SLX'),
    ]
    const result = displayLabels(bikes)
    expect(result.get('bike1')).toBe('Canyon Endurace')
    expect(result.get('bike2')).toBe('Canyon Endurace SLX')
  })
})
