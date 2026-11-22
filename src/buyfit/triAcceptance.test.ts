import { describe, expect, it } from 'vitest'
import { getStackReachWindow, matchBikes, type Bike, type BikeSizeRow } from './matcher'

// Acceptance check for tri mode (doc/frame-sizing-research.md §9.5): real production
// tri rows, for a 183 cm rider. Stack, reach and rider-height bounds in mm; null means
// the maker gives no value. The data is kept as typed so a change to the matcher is
// checked against what the shop actually sells.
// BMC Timemachine is not in the data and is not asserted here.

const size = (
  label: string,
  stack: number | null,
  reach: number | null,
  riderHeightMin: number | null,
  riderHeightMax: number | null
): BikeSizeRow => ({
  size: label,
  stack,
  reach,
  ett: 0,
  seatTube: 0,
  riderHeightMin,
  riderHeightMax,
})

const bike = (brand: string, model: string, sizes: BikeSizeRow[]): Bike => ({
  brand,
  model,
  bikeId: `${brand}|${model}`.toLowerCase().replace(/\s+/g, '-'),
  family: model,
  frameName: model,
  generation: '',
  year: 2026,
  verified: '2026-11-22',
  sizes,
})

const triDb: Bike[] = [
  bike('Canyon', 'Speedmax', [
    size('S', 470, 419, null, 1780),
    size('M', 481, 440, 1680, 1860),
    size('L', 511, 463, 1800, 1960),
    size('XL', 542, 486, 1890, null),
  ]),
  bike('Canyon', 'Speedmax CF', [
    size('XS', 482, 374, null, 1660),
    size('S', 519, 402, 1660, 1740),
    size('M', 544, 420, 1740, 1860),
    size('L', 578, 443, 1860, 1960),
    size('XL', 608, 468, 1960, null),
  ]),
  bike('Canyon', 'Speedmax CFR TT', [
    size('XS', 466, 405, null, 1650),
    size('S', 472, 417, 1650, 1750),
    size('M', 496, 435, 1750, 1850),
    size('L', 530, 458, 1850, null),
  ]),
  bike('Cervélo', 'P-Series', [
    size('48', 494, 378, null, null),
    size('51', 515, 395, null, null),
    size('54', 531, 409, null, null),
    size('56', 549, 422, null, null),
    size('58', 569, 434, null, null),
    size('61', 587, 443, null, null),
  ]),
  bike('Cervélo', 'P5', [
    size('48', 461, 389, null, null),
    size('51', 482, 406, null, null),
    size('54', 498, 420, null, null),
    size('56', 516, 433, null, null),
    size('58', 535, 446, null, null),
    size('61', 556, 455, null, null),
  ]),
  bike('Trek', 'Speed Concept SLR', [
    size('S', 492, 390, 1540, 1670),
    size('M', 517, 416, 1670, 1750),
    size('L', 541, 426, 1750, 1860),
    size('XL', 565, 445, 1860, 1980),
  ]),
  bike('BMC', 'Speedmachine 01', [
    size('S', 558, 348, null, 1740),
    size('M', 588, 368, 1720, 1850),
    size('L', 628, 395, 1800, null),
  ]),
  bike('Orbea', 'Ordu M10i LTD PWR UCI', [
    size('XS', null, null, null, 1700),
    size('SM', null, null, 1700, 1800),
    size('ML', null, null, 1750, 1850),
    size('XL', null, null, 1850, null),
  ]),
]

const RIDER_MM = 1830

describe('tri data for a 183 cm rider', () => {
  const window = getStackReachWindow(RIDER_MM, triDb)

  it('computes the window from the banded rows only', () => {
    // Banded rows: Speedmax M and L, Speedmax CF M, CFR TT M, Trek SLR L, BMC M and L.
    expect(window).toEqual({
      stackMin: 481,
      stackMax: 628,
      reachMin: 368,
      reachMax: 463,
      count: 7,
    })
  })

  it('lists Cervélo P-Series 56 (549 / 422), which sits inside the window', () => {
    const matches = matchBikes(RIDER_MM, 481, 628, 368, 463, triDb)
    const p56 = matches.find((m) => m.model === 'P-Series' && m.size === '56')
    expect(p56).toBeDefined()
    expect(p56!.noHeightBand).toBe(true)
  })

  it('lists the banded matches, plus one unbanded size per bike with none banded', () => {
    const matches = matchBikes(RIDER_MM, window!.stackMin, window!.stackMax, window!.reachMin, window!.reachMax, triDb)
    const labels = matches.map((m) => `${m.brand} ${m.model} ${m.size}`).sort()
    // Unbanded: from each Cervélo model only the size nearest the window centre
    // (554.5 / 415.5). P-Series 56 (549/422) is at distance 8.5. P5 58 (535/446) is at
    // distance sqrt(19.5² + 30.5²) ≈ 36.2, the nearest P5 size; P5 61 is 39.5, P5 56 42.3.
    expect(labels).toEqual(
      [
        'BMC Speedmachine 01 L',
        'BMC Speedmachine 01 M',
        'Canyon Speedmax CFR TT M',
        'Canyon Speedmax CF M',
        'Canyon Speedmax L',
        'Canyon Speedmax M',
        'Cervélo P-Series 56',
        'Cervélo P5 58',
        'Trek Speed Concept SLR L',
      ].sort()
    )
  })

  it('does not list the Orbea Ordu, which has bands but no stack or reach', () => {
    const matches = matchBikes(RIDER_MM, 481, 628, 368, 463, triDb)
    expect(matches.some((m) => m.brand === 'Orbea')).toBe(false)
    expect(window).not.toBeNull()
  })
})
