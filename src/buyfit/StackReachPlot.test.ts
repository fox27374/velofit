import { describe, expect, it } from 'vitest'
import { labelOffset } from './StackReachPlot'

describe('labelOffset', () => {
  it('keeps the default offset when nothing is near', () => {
    expect(labelOffset([], 100, 100)).toBe(3)
  })

  it('nudges a label away from one already placed', () => {
    const placed = [{ x: 100, y: 103 }]
    expect(labelOffset(placed, 100, 100)).not.toBe(3)
  })

  // Eleven sizes on one spot used to cycle through the same offsets forever
  // and freeze the page when Calculate was pressed.
  it('returns even when every slot is taken', () => {
    const placed: { x: number; y: number }[] = []
    for (let i = 0; i < 11; i++) {
      const dy = labelOffset(placed, 100, 100)
      placed.push({ x: 100, y: 100 + dy })
    }
    expect(placed).toHaveLength(11)
  })
})
