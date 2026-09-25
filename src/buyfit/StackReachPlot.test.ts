import { describe, expect, it } from 'vitest'
import { labelText, placeLabels } from './StackReachPlot'

const pt = (x: number, y: number, text = `${x},${y}`) => ({ x, y, text })

describe('labelText', () => {
  it('is brand and model, without the size', () => {
    expect(labelText({ brand: 'Trek', model: 'Madone' })).toBe('Trek Madone')
  })

  it('truncates past 24 characters with an ellipsis', () => {
    const text = labelText({ brand: 'Specialized', model: 'S-Works Tarmac SL8' })
    expect(text).toBe('Specialized S-Works Tar…')
    expect(text).toHaveLength(24)
  })
})

describe('placeLabels', () => {
  it('labels a lone point to its right at the default offset', () => {
    expect(placeLabels([pt(100, 100)])).toEqual([{ dy: 3, side: 'right' }])
  })

  it('nudges the second of two close points', () => {
    const [a, b] = placeLabels([pt(100, 100), pt(100, 104)])
    expect(a).not.toBeNull()
    expect(b).not.toBeNull()
    expect(a!.dy).not.toBe(b!.dy)
  })

  it('puts a label left of its point when it would run past the right edge', () => {
    const [a] = placeLabels([pt(500, 100, 'Specialized Chisel')], 520)
    expect(a).toEqual({ dy: 3, side: 'left' })
  })

  // Eleven sizes on one spot used to cycle through the same offsets forever
  // and freeze the page when Calculate was pressed.
  it('leaves the rest of a crowd unlabelled instead of stacking labels', () => {
    const out = placeLabels(Array.from({ length: 11 }, (_, i) => pt(100, 100, `bike ${i}`)))
    const shown = out.filter((l) => l !== null)
    expect(shown.length).toBeGreaterThan(0)
    expect(shown.length).toBeLessThan(11)
  })

  // Long brand + model labels overlapped when collisions assumed 90 px.
  it('never lets two long labels overlap', () => {
    const points = Array.from({ length: 30 }, (_, i) =>
      pt(100 + (i % 6) * 25, 100 + Math.floor(i / 6) * 9, `Brand Model Number ${i}`)
    )
    const boxes = placeLabels(points, 520).flatMap((l, i) => {
      if (!l) return []
      const w = points[i].text.length * 6
      const x0 = l.side === 'right' ? points[i].x + 11 : points[i].x - 11 - w
      return [{ x0, x1: x0 + w, y: points[i].y + l.dy }]
    })
    expect(boxes.length).toBeGreaterThan(1)
    for (const a of boxes)
      for (const b of boxes)
        if (a !== b) expect(a.x0 < b.x1 && b.x0 < a.x1 && Math.abs(a.y - b.y) < 13).toBe(false)
  })

  // The point off on its own is what the plot is for, so it must keep its
  // label even when it comes last and a crowd sits within reach of its slots.
  it('labels the isolated point before the crowd', () => {
    const crowd = Array.from({ length: 8 }, (_, i) => pt(160 + i * 4, 100 + (i % 3) * 6, `crowd ${i}`))
    const out = placeLabels([...crowd, pt(100, 100, 'loner')])
    expect(out[out.length - 1]).not.toBeNull()
  })

  it('shows a repeated name once per neighbourhood', () => {
    const out = placeLabels([pt(100, 100, 'Trek Madone'), pt(104, 130, 'Trek Madone')])
    expect(out.filter((l) => l !== null)).toHaveLength(1)
  })
})
