import { describe, expect, it } from 'vitest'
import { placeLabels } from './StackReachPlot'

const pt = (x: number, y: number, text = `${x},${y}`) => ({ x, y, text })

describe('placeLabels', () => {
  it('labels a lone point at the default offset', () => {
    expect(placeLabels([pt(100, 100)])).toEqual([3])
  })

  it('nudges the second of two close points', () => {
    const [a, b] = placeLabels([pt(100, 100), pt(100, 104)])
    expect(a).not.toBeNull()
    expect(b).not.toBeNull()
    expect(a).not.toBe(b)
  })

  // Eleven sizes on one spot used to cycle through the same offsets forever
  // and freeze the page when Calculate was pressed.
  it('leaves the rest of a crowd unlabelled instead of stacking labels', () => {
    const dys = placeLabels(Array.from({ length: 11 }, (_, i) => pt(100, 100, `bike ${i}`)))
    const shown = dys.filter((dy) => dy !== null)
    expect(shown.length).toBeGreaterThan(0)
    expect(shown.length).toBeLessThan(11)
    expect(new Set(shown).size).toBe(shown.length)
  })

  // The point off on its own is what the plot is for, so it must keep its
  // label even when it comes last and a crowd sits within reach of its slots.
  it('labels the isolated point before the crowd', () => {
    const crowd = Array.from({ length: 8 }, (_, i) => pt(160 + i * 4, 100 + (i % 3) * 6, `crowd ${i}`))
    const dys = placeLabels([...crowd, pt(100, 100, 'loner')])
    expect(dys[dys.length - 1]).not.toBeNull()
  })

  it('shows a repeated name once per neighbourhood', () => {
    const dys = placeLabels([pt(100, 100, 'S-Works 58'), pt(104, 130, 'S-Works 58')])
    expect(dys.filter((dy) => dy !== null)).toHaveLength(1)
  })
})
