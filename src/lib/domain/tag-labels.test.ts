import { describe, it, expect } from 'vitest'
import { translateTags } from './tag-labels'

describe('translateTags', () => {
  it('translates known tags to Chinese', () => {
    expect(translateTags(['sushi_restaurant', 'japanese_restaurant'])).toEqual(
      expect.arrayContaining(['壽司', '日本菜'])
    )
  })

  it('drops unrecognised tags instead of showing raw snake_case', () => {
    const result = translateTags(['sushi_restaurant', 'point_of_interest', 'establishment'])
    expect(result).toEqual(['壽司'])
  })

  it('de-duplicates when multiple tags map to the same label', () => {
    const result = translateTags(['dessert_shop', 'dessert_restaurant'])
    expect(result).toEqual(['甜品'])
  })

  it('returns an empty array when nothing matches', () => {
    expect(translateTags(['point_of_interest', 'establishment'])).toEqual([])
  })

  it('returns an empty array for an empty input', () => {
    expect(translateTags([])).toEqual([])
  })
})
