import { describe, expect, it } from 'vitest'
import { apiRowToBikeSize, type ApiRow } from './geometryLoader'

const row = (extra: Partial<ApiRow> = {}): ApiRow => ({ brand: 'BMC', model: 'Speedmachine 01', size: 'M', ...extra })

describe('apiRowToBikeSize armrest fields', () => {
  it('maps the four armrest bounds', () => {
    const size = apiRowToBikeSize(
      row({ armrest_stack_min_mm: 553, armrest_stack_max_mm: 678, armrest_reach_min_mm: 368, armrest_reach_max_mm: 522 })
    )
    expect(size).toMatchObject({ armrestStackMin: 553, armrestStackMax: 678, armrestReachMin: 368, armrestReachMax: 522 })
  })

  it('leaves absent or null bounds as null, never 0', () => {
    const size = apiRowToBikeSize(row({ armrest_stack_min_mm: null }))
    expect(size).toMatchObject({ armrestStackMin: null, armrestStackMax: null, armrestReachMin: null, armrestReachMax: null })
  })
})
