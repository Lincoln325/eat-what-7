import { describe, it, expect } from 'vitest'
import { findCuisineForRestaurant, getGoogleTypesForCuisineKey } from './cuisine-mapping'

describe('findCuisineForRestaurant', () => {
  it('matches sushi as its own subtype filter, not grouped under japanese', () => {
    expect(findCuisineForRestaurant('sushi_restaurant')?.key).toBe('sushi')
  })

  it('matches generic cuisine primaryTypes', () => {
    expect(findCuisineForRestaurant('chinese_restaurant')?.key).toBe('chinese')
    expect(findCuisineForRestaurant('korean_restaurant')?.key).toBe('korean')
    expect(findCuisineForRestaurant('thai_restaurant')?.key).toBe('thai')
    expect(findCuisineForRestaurant('indian_restaurant')?.key).toBe('indian')
  })

  it('maps steak/burger/bbq primaryTypes to their own subtype filters', () => {
    expect(findCuisineForRestaurant('hamburger_restaurant')?.key).toBe('burgers')
    expect(findCuisineForRestaurant('steak_house')?.key).toBe('steakhouse')
    expect(findCuisineForRestaurant('barbecue_restaurant')?.key).toBe('bbq')
  })

  it('returns null for unrecognised primaryType with no matching tags', () => {
    expect(findCuisineForRestaurant('cafe')).toBeNull()
    expect(findCuisineForRestaurant('point_of_interest')).toBeNull()
  })

  it('returns null when primaryType is null and no tags given', () => {
    expect(findCuisineForRestaurant(null)).toBeNull()
  })

  it('falls back to tags when primaryType is generic and unmatched', () => {
    const result = findCuisineForRestaurant('restaurant', ['restaurant', 'steak_house', 'food'])
    expect(result?.key).toBe('steakhouse')
  })

  it('falls back to tags when primaryType is null', () => {
    const result = findCuisineForRestaurant(null, ['sushi_restaurant', 'restaurant'])
    expect(result?.key).toBe('sushi')
  })

  it('prefers primaryType match over tags when both would match different cuisines', () => {
    const result = findCuisineForRestaurant('chinese_restaurant', ['sushi_restaurant'])
    expect(result?.key).toBe('chinese')
  })

  it('returns null when neither primaryType nor tags match', () => {
    expect(findCuisineForRestaurant('cafe', ['point_of_interest', 'establishment'])).toBeNull()
  })
})

describe('getGoogleTypesForCuisineKey', () => {
  it('returns the googleTypes array for a known key', () => {
    expect(getGoogleTypesForCuisineKey('japanese')).toEqual(
      expect.arrayContaining(['japanese_restaurant', 'izakaya_restaurant'])
    )
  })

  it('returns an empty array for an unknown key', () => {
    expect(getGoogleTypesForCuisineKey('nonexistent')).toEqual([])
  })
})
