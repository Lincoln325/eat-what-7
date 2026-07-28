import { describe, it, expect } from 'vitest'
import { findCuisineForRestaurant, getGoogleTypesForCuisineKey } from './cuisine-mapping'

describe('findCuisineForRestaurant', () => {
  it('matches a known primaryType to its cuisine filter', () => {
    expect(findCuisineForRestaurant('sushi_restaurant')?.key).toBe('japanese')
  })

  it('matches generic cuisine primaryTypes', () => {
    expect(findCuisineForRestaurant('chinese_restaurant')?.key).toBe('chinese')
    expect(findCuisineForRestaurant('korean_restaurant')?.key).toBe('korean')
    expect(findCuisineForRestaurant('thai_restaurant')?.key).toBe('thai')
    expect(findCuisineForRestaurant('indian_restaurant')?.key).toBe('indian')
  })

  it('maps burger/steak/bbq primaryTypes to Western', () => {
    expect(findCuisineForRestaurant('hamburger_restaurant')?.key).toBe('western')
    expect(findCuisineForRestaurant('steak_house')?.key).toBe('western')
    expect(findCuisineForRestaurant('barbecue_restaurant')?.key).toBe('western')
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
    expect(result?.key).toBe('western')
  })

  it('falls back to tags when primaryType is null', () => {
    const result = findCuisineForRestaurant(null, ['sushi_restaurant', 'restaurant'])
    expect(result?.key).toBe('japanese')
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
      expect.arrayContaining(['japanese_restaurant', 'sushi_restaurant', 'ramen_restaurant'])
    )
  })

  it('returns an empty array for an unknown key', () => {
    expect(getGoogleTypesForCuisineKey('nonexistent')).toEqual([])
  })
})
