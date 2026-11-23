import { describe, expect, it } from 'vitest'
import { getStackReachWindow, hasArmrestData, matchBikes, matchByArmrest, type Bike, type BikeSizeRow } from './matcher'

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

// Armrest matching (doc/frame-sizing-research.md §10). Published pad ranges, BB centre to the
// rear of the pad, in mm, with the same height bands as above. Canyon's frame stack/reach
// are kept; BMC and Orbea publish none. Pad: 183 cm rider, stack 640 mm, reach 430 mm.
const withArmrest = (
  base: BikeSizeRow,
  [stackMin, stackMax]: [number, number],
  [reachMin, reachMax]: [number, number]
): BikeSizeRow => ({
  ...base,
  armrestStackMin: stackMin,
  armrestStackMax: stackMax,
  armrestReachMin: reachMin,
  armrestReachMax: reachMax,
})

const armrestDb: Bike[] = [
  bike('Canyon', 'Speedmax CF', [
    withArmrest(size('XS', 482, 374, null, 1660), [596, 626], [351, 462]),
    withArmrest(size('S', 519, 402, 1660, 1740), [633, 663], [377, 488]),
    withArmrest(size('M', 544, 420, 1740, 1860), [657, 688], [398, 509]),
    withArmrest(size('L', 578, 443, 1860, 1960), [691, 722], [411, 522]),
    withArmrest(size('XL', 608, 468, 1960, null), [721, 752], [446, 557]),
  ]),
  bike('BMC', 'Speedmachine 01', [
    withArmrest(size('S', null, null, null, 1740), [525, 650], [348, 502]),
    withArmrest(size('M', null, null, 1720, 1850), [553, 678], [368, 522]),
    withArmrest(size('L', null, null, 1800, null), [595, 720], [395, 549]),
  ]),
  bike('Orbea', 'Ordu M10i LTD PWR UCI', [
    withArmrest(size('XS', null, null, null, 1700), [515, 605], [361, 481]),
    withArmrest(size('SM', null, null, 1700, 1800), [550, 640], [385, 505]),
    withArmrest(size('ML', null, null, 1750, 1850), [550, 690], [385, 505]),
    withArmrest(size('XL', null, null, 1850, null), [600, 740], [409, 529]),
  ]),
]

// Frame-only bikes from the list above: no armrest data, so they must stay in the frame list.
const frameOnlyDb = triDb.filter((b) => b.model === 'Speedmax CFR TT' || b.model === 'P-Series')
const acceptanceDb = [...armrestDb, ...frameOnlyDb]

const PAD_STACK_MM = 640
const PAD_REACH_MM = 430

describe('armrest matching for a 183 cm rider, pad 640 / 430 mm', () => {
  it('lists the sizes whose pad ranges contain the pad, largest margin first', () => {
    const matches = matchByArmrest(PAD_STACK_MM, PAD_REACH_MM, armrestDb)
    // Margin = smallest distance from the pad to any range edge, in mm:
    //   Orbea ML 45 (stack 50/90, reach 75/45), BMC M 38 (38/87, 92/62),
    //   BMC L 35 (80/45, 119/35), Orbea XL 21 (100/40, 99/21), BMC S 10 (10/115, 72/82),
    //   Canyon Speedmax CF S 7 (23/7, 58/53), Orbea SM 0 (0/90, 75/45).
    // Orbea SM sits on the stack max (640), so it fits only because the check is inclusive.
    // Canyon CF XS, M, L, XL are out on stack (626, 657, 691, 721 minimum or maximum).
    expect(matches.map((m) => `${m.brand} ${m.model} ${m.size}`)).toEqual([
      'Orbea Ordu M10i LTD PWR UCI ML',
      'BMC Speedmachine 01 M',
      'BMC Speedmachine 01 L',
      'Orbea Ordu M10i LTD PWR UCI XL',
      'BMC Speedmachine 01 S',
      'Canyon Speedmax CF S',
      'Orbea Ordu M10i LTD PWR UCI SM',
    ])
    expect(matches.map((m) => m.margin)).toEqual([45, 38, 35, 21, 10, 7, 0])
  })

  it('reports the room left on each side of the pad', () => {
    const canyonS = matchByArmrest(PAD_STACK_MM, PAD_REACH_MM, armrestDb).find((m) => m.brand === 'Canyon')
    expect(canyonS).toMatchObject({ stackUp: 23, stackDown: 7, reachForward: 58, reachBack: 53 })
  })

  it('never matches a size without armrest data', () => {
    expect(hasArmrestData(triDb[0].sizes[0])).toBe(false)
    expect(hasArmrestData(armrestDb[0].sizes[0])).toBe(true)
    const frameOnly = matchByArmrest(PAD_STACK_MM, PAD_REACH_MM, frameOnlyDb)
    expect(frameOnly).toEqual([])
  })

  it('keeps bikes without armrest data in the frame list, and drops sizes that have it', () => {
    const window = getStackReachWindow(RIDER_MM, acceptanceDb)
    // What BuyFit does when both pad fields are set: strip the armrest sizes, then match by frame.
    const frameDb = acceptanceDb.map((b) => ({ ...b, sizes: b.sizes.filter((s) => !hasArmrestData(s)) }))
    const labels = matchBikes(RIDER_MM, window!.stackMin, window!.stackMax, window!.reachMin, window!.reachMax, frameDb)
      .map((m) => `${m.brand} ${m.model} ${m.size}`)
    // Window from banded measured rows at 1830 mm: stack 496–544, reach 420–435. Canyon CF M
    // (544/420) is inside it but has armrest data, so it is not listed here.
    expect(labels).toEqual(['Canyon Speedmax CFR TT M'])
  })
})
