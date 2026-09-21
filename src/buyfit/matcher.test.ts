import { describe, it, expect } from 'vitest'
import {
  matchBikes,
  getStackReachWindow,
  getFrameGeometryRange,
  type Bike,
} from './matcher'

// Synthetic table, so these tests do not move when real bikes are typed in.
const db: Bike[] = [
  {
    brand: 'Alfa',
    model: 'One',
    year: 2026,
    verified: '2026-09-21',
    sizes: [
      {
        size: 'S',
        stack: 520,
        reach: 375,
        ett: 530,
        seatTube: 450,
        riderHeightMin: 1600,
        riderHeightMax: 1700,
      },
      {
        size: 'M',
        stack: 550,
        reach: 385,
        ett: 545,
        seatTube: 480,
        riderHeightMin: 1700,
        riderHeightMax: 1800,
      },
    ],
  },
  {
    brand: 'Bravo',
    model: 'Two',
    year: 2026,
    verified: '2026-09-21',
    sizes: [
      {
        size: 'M',
        stack: 565,
        reach: 388,
        ett: 550,
        seatTube: 490,
        riderHeightMin: 1700,
        riderHeightMax: 1800,
      },
      {
        size: 'L',
        stack: 590,
        reach: 395,
        ett: 565,
        seatTube: 520,
        riderHeightMin: 1750,
        riderHeightMax: 1850,
      },
    ],
  },
]

describe('matchBikes', () => {
  it('returns every row in the height band, nearest the window centre first', () => {
    // Window centre is 550 / 385, which is Alfa M exactly.
    const results = matchBikes(1750, 540, 560, 380, 390, db)

    expect(results.map((r) => `${r.model} ${r.size}`)).toEqual([
      'One M',
      'Two M',
      'Two L',
    ])
    expect(results[0].distanceFromCentre).toBe(0)
  })

  it('excludes rows whose height band does not contain the rider', () => {
    // Alfa S covers 1600-1700, so a 1750 rider must not get it.
    const results = matchBikes(1750, 500, 600, 350, 450, db)
    expect(results.some((r) => r.size === 'S')).toBe(false)

    // Bravo L starts at 1750, so a 1720 rider must not get it either.
    const shorter = matchBikes(1720, 500, 600, 350, 450, db)
    expect(shorter.map((r) => `${r.model} ${r.size}`)).toEqual(['One M', 'Two M'])
  })

  it('includes a row whose band boundary equals the rider height', () => {
    const results = matchBikes(1700, 500, 600, 350, 450, db)
    expect(results.map((r) => `${r.model} ${r.size}`).sort()).toEqual([
      'One M',
      'One S',
      'Two M',
    ])
  })

  it('reports zero deltas for a bike sitting exactly on the window', () => {
    const results = matchBikes(1750, 550, 550, 385, 385, db)
    const exact = results.find((r) => r.model === 'One' && r.size === 'M')!
    expect(exact.stackDelta).toBe(0)
    expect(exact.reachDelta).toBe(0)
  })

  it('signs the deltas: below the centre is negative, above is positive', () => {
    const results = matchBikes(1750, 560, 560, 390, 390, db)
    const low = results.find((r) => r.model === 'One')!
    const high = results.find((r) => r.size === 'L')!
    expect(low.stackDelta).toBe(-10)
    expect(low.reachDelta).toBe(-5)
    expect(high.stackDelta).toBe(30)
    expect(high.reachDelta).toBe(5)
  })

  it('returns nothing for an empty database instead of throwing', () => {
    expect(matchBikes(1750, 500, 600, 350, 450, [])).toEqual([])
  })
})

describe('getStackReachWindow', () => {
  it('spans what the height band ships with, and counts the rows', () => {
    expect(getStackReachWindow(1750, db)).toEqual({
      stackMin: 550,
      stackMax: 590,
      reachMin: 385,
      reachMax: 395,
      count: 3,
    })
  })

  it('is null when no bike covers the height, rather than a made-up window', () => {
    expect(getStackReachWindow(2100, db)).toBeNull()
    expect(getStackReachWindow(1750, [])).toBeNull()
  })
})

describe('getFrameGeometryRange', () => {
  it('ranges seat tube and top tube over the same rows, with the size labels', () => {
    expect(getFrameGeometryRange(1750, db)).toEqual({
      sizes: ['L', 'M'],
      seatTubeMin: 480,
      seatTubeMax: 520,
      ettMin: 545,
      ettMax: 565,
    })
  })

  it('is null when no bike covers the height', () => {
    expect(getFrameGeometryRange(2100, db)).toBeNull()
  })
})
