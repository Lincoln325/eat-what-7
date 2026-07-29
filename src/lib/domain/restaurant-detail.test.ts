import { describe, it, expect } from 'vitest'
import { mapToRestaurantDetail, extractOpeningHours } from './restaurant-detail'
import type { RestaurantDetailSource } from './restaurant-detail'
import type { BilingualPlaceDetails } from './place-mapping'

const IMAGE_BASE = 'https://cdn.example.com/restaurants'

function makeRaw(overrides: Partial<BilingualPlaceDetails> = {}): BilingualPlaceDetails {
  return {
    en: {
      id: 'place-1',
      regularOpeningHours: { weekdayDescriptions: ['Monday: 11–22'] },
    },
    zh_hk: {
      id: 'place-1',
      regularOpeningHours: { weekdayDescriptions: ['星期一: 11–22'] },
    },
    ...overrides,
  } as BilingualPlaceDetails
}

function makeRow(overrides: Partial<RestaurantDetailSource> = {}): RestaurantDetailSource {
  return {
    id: 'r1',
    name: 'Sushi Place',
    name_zh: '壽司店',
    primary_type_display_name_zh: '壽司餐廳',
    tags: ['sushi_restaurant', 'unknown_type'],
    rating: 4.5,
    total_ratings: 1204,
    price_level: 3,
    primary_image_path: 'place-1/primary.webp',
    image_blurhash: 'LKO2',
    address: '香港中環',
    phone: '+852 1234 5678',
    website: 'https://example.com',
    google_maps_uri: 'https://maps.google.com/?cid=1',
    raw_place_data: makeRaw(),
    updated_at: '2026-07-01T00:00:00Z',
    ...overrides,
  }
}

describe('extractOpeningHours', () => {
  it('prefers the zh-HK weekday descriptions', () => {
    expect(extractOpeningHours(makeRaw())).toEqual(['星期一: 11–22'])
  })

  it('falls back to English when zh-HK hours are missing', () => {
    const raw = makeRaw({ zh_hk: { id: 'place-1' } as BilingualPlaceDetails['zh_hk'] })
    expect(extractOpeningHours(raw)).toEqual(['Monday: 11–22'])
  })

  it('returns an empty array when raw data is null', () => {
    expect(extractOpeningHours(null)).toEqual([])
  })

  it('returns an empty array when no hours are present', () => {
    const raw = { en: { id: 'x' }, zh_hk: { id: 'x' } } as BilingualPlaceDetails
    expect(extractOpeningHours(raw)).toEqual([])
  })
})

describe('mapToRestaurantDetail', () => {
  it('maps a row to the detail view model', () => {
    const detail = mapToRestaurantDetail(makeRow(), IMAGE_BASE)
    expect(detail).toEqual({
      id: 'r1',
      name: '壽司店',
      typeLabel: '壽司餐廳',
      imageUrl: 'https://cdn.example.com/restaurants/place-1/primary.webp',
      imageBlurhash: 'LKO2',
      rating: 4.5,
      ratingCount: 1204,
      priceLevel: 3,
      tags: ['壽司'],
      address: '香港中環',
      phone: '+852 1234 5678',
      website: 'https://example.com',
      googleMapsUri: 'https://maps.google.com/?cid=1',
      openingHours: ['星期一: 11–22'],
      updatedAt: '2026-07-01T00:00:00Z',
    })
  })

  it('falls back to English name and default type when translations missing', () => {
    const detail = mapToRestaurantDetail(
      makeRow({ name_zh: null, primary_type_display_name_zh: null }),
      IMAGE_BASE,
    )
    expect(detail.name).toBe('Sushi Place')
    expect(detail.typeLabel).toBe('餐廳')
  })

  it('yields a null image URL when there is no image path', () => {
    const detail = mapToRestaurantDetail(makeRow({ primary_image_path: null }), IMAGE_BASE)
    expect(detail.imageUrl).toBeNull()
  })
})
