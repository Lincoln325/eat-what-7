import { describe, it, expect } from 'vitest'
import { mapToRestaurant, type RestaurantSource } from './restaurant-view'

const baseRow: RestaurantSource = {
  id: '1',
  name: 'Tsukiji Japanese Restaurant',
  name_zh: '築地日本餐廳',
  primary_type_display_name_zh: '壽司餐廳',
  tags: ['sushi_restaurant', 'japanese_restaurant', 'restaurant'],
  rating: 4.1,
  price_level: 2,
  primary_image_path: 'abc123/primary.webp',
  image_blurhash: 'L9D9FvRO4:%2T}4.Mxo#0L$K%f%g',
  google_maps_uri: 'https://maps.google.com/?cid=123',
  region: '銅鑼灣',
}

describe('mapToRestaurant', () => {
  it('maps a full row correctly', () => {
    const result = mapToRestaurant(baseRow, 'https://cdn.test/storage')
    expect(result.id).toBe('1')
    expect(result.name).toBe('築地日本餐廳')
    expect(result.typeLabel).toBe('壽司餐廳')
    expect(result.imageUrl).toBe('https://cdn.test/storage/abc123/primary.webp')
    expect(result.imageBlurhash).toBe(baseRow.image_blurhash)
    expect(result.rating).toBe(4.1)
    expect(result.priceLevel).toBe(2)
    expect(result.tags).toEqual(expect.arrayContaining(['壽司', '日本菜']))
    expect(result.googleMapsUri).toBe('https://maps.google.com/?cid=123')
    expect(result.region).toBe('銅鑼灣')
  })

  it('falls back to English name when name_zh is missing', () => {
    const row: RestaurantSource = { ...baseRow, name_zh: null }
    expect(mapToRestaurant(row, 'https://cdn.test').name).toBe('Tsukiji Japanese Restaurant')
  })

  it('falls back to a generic label when primary_type_display_name_zh is missing', () => {
    const row: RestaurantSource = { ...baseRow, primary_type_display_name_zh: null }
    expect(mapToRestaurant(row, 'https://cdn.test').typeLabel).toBe('餐廳')
  })

  it('sets imageUrl to null when primary_image_path is missing', () => {
    const row: RestaurantSource = { ...baseRow, primary_image_path: null }
    expect(mapToRestaurant(row, 'https://cdn.test').imageUrl).toBeNull()
  })
})
