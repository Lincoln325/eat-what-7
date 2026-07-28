import { describe, it, expect } from 'vitest'
import { mapToRestaurant, type RestaurantSource } from './restaurant-view'

const baseRow: RestaurantSource = {
  id: '1',
  name: 'Tsukiji Japanese Restaurant',
  primary_type: 'sushi_restaurant',
  tags: ['sushi_restaurant', 'japanese_restaurant', 'restaurant'],
  rating: 4.1,
  price_level: 2,
  primary_image_path: 'abc123/primary.webp',
  image_blurhash: 'L9D9FvRO4:%2T}4.Mxo#0L$K%f%g',
  google_maps_uri: 'https://maps.google.com/?cid=123',
}

describe('mapToRestaurant', () => {
  it('maps a full row correctly', () => {
    const result = mapToRestaurant(baseRow, 'https://cdn.test/storage')
    expect(result.id).toBe('1')
    expect(result.name).toBe('Tsukiji Japanese Restaurant')
    expect(result.cuisineLabel).toBe('Japanese')
    expect(result.imageUrl).toBe('https://cdn.test/storage/abc123/primary.webp')
    expect(result.imageBlurhash).toBe(baseRow.image_blurhash)
    expect(result.rating).toBe(4.1)
    expect(result.priceLevel).toBe(2)
    expect(result.tags).toEqual(baseRow.tags)
    expect(result.googleMapsUri).toBe('https://maps.google.com/?cid=123')
  })

  it('resolves cuisine via tags fallback when primaryType is generic', () => {
    const row: RestaurantSource = {
      ...baseRow,
      primary_type: 'restaurant',
      tags: ['restaurant', 'steak_house', 'food'],
    }
    expect(mapToRestaurant(row, 'https://cdn.test').cuisineLabel).toBe('Western')
  })

  it('falls back to "Other" when no cuisine matches', () => {
    const row: RestaurantSource = { ...baseRow, primary_type: 'cafe', tags: ['cafe'] }
    expect(mapToRestaurant(row, 'https://cdn.test').cuisineLabel).toBe('Other')
  })

  it('sets imageUrl to null when primary_image_path is missing', () => {
    const row: RestaurantSource = { ...baseRow, primary_image_path: null }
    expect(mapToRestaurant(row, 'https://cdn.test').imageUrl).toBeNull()
  })
})
