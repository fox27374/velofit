import { describe, expect, it } from 'vitest'
import { nextInfoState } from './InfoPanel'

describe('nextInfoState', () => {
  it('("closed", "enter", true) → "hover"', () => {
    expect(nextInfoState('closed', 'enter', true)).toBe('hover')
  })

  it('("closed", "enter", false) → "closed"', () => {
    expect(nextInfoState('closed', 'enter', false)).toBe('closed')
  })

  it('("hover", "leave", true) → "closed"', () => {
    expect(nextInfoState('hover', 'leave', true)).toBe('closed')
  })

  it('("hover", "click", true) → "pinned"', () => {
    expect(nextInfoState('hover', 'click', true)).toBe('pinned')
  })

  it('("closed", "click", false) → "pinned"', () => {
    expect(nextInfoState('closed', 'click', false)).toBe('pinned')
  })

  it('("pinned", "click", true) → "closed"', () => {
    expect(nextInfoState('pinned', 'click', true)).toBe('closed')
  })

  it('("pinned", "leave", true) → "pinned"', () => {
    expect(nextInfoState('pinned', 'leave', true)).toBe('pinned')
  })

  it('("pinned", "enter", true) → "pinned"', () => {
    expect(nextInfoState('pinned', 'enter', true)).toBe('pinned')
  })

  it('("pinned", "outside", true) → "closed"', () => {
    expect(nextInfoState('pinned', 'outside', true)).toBe('closed')
  })

  it('("hover", "escape", true) → "closed"', () => {
    expect(nextInfoState('hover', 'escape', true)).toBe('closed')
  })
})
