import { describe, it, expect } from 'vitest'
import { mapPlaceToRestaurantRow, mapPriceLevelToInt, type PlaceDetails } from './place-mapping'

const basePlaceDetails: PlaceDetails = {
  id: 'ChIJabc123',
  displayName: { text: 'Test Restaurant' },
  formattedAddress: '1 Test Street, Singapore',
  location: { latitude: 1.3, longitude: 103.8 },
  priceLevel: 'PRICE_LEVEL_EXPENSIVE',
  rating: 4.5,
  userRatingCount: 200,
  internationalPhoneNumber: '+65 1234 5678',
  websiteUri: 'https://test.com',
  businessStatus: 'OPERATIONAL',
  types: ['japanese_restaurant', 'restaurant'],
  primaryType: 'japanese_restaurant',
  googleMapsUri: 'https://maps.google.com/?cid=12345',
}

describe('mapPriceLevelToInt', () => {
  it('maps each enum value to its integer scale', () => {
    expect(mapPriceLevelToInt('PRICE_LEVEL_FREE')).toBe(0)
    expect(mapPriceLevelToInt('PRICE_LEVEL_INEXPENSIVE')).toBe(1)
    expect(mapPriceLevelToInt('PRICE_LEVEL_MODERATE')).toBe(2)
    expect(mapPriceLevelToInt('PRICE_LEVEL_EXPENSIVE')).toBe(3)
    expect(mapPriceLevelToInt('PRICE_LEVEL_VERY_EXPENSIVE')).toBe(4)
  })

  it('returns null when undefined', () => {
    expect(mapPriceLevelToInt(undefined)).toBeNull()
  })
})

describe('mapPlaceToRestaurantRow', () => {
  it('maps all fields correctly', () => {
    const row = mapPlaceToRestaurantRow(basePlaceDetails)
    expect(row.google_place_id).toBe('ChIJabc123')
    expect(row.name).toBe('Test Restaurant')
    expect(row.address).toBe('1 Test Street, Singapore')
    expect(row.lat).toBe(1.3)
    expect(row.lng).toBe(103.8)
    expect(row.price_level).toBe(3)
    expect(row.rating).toBe(4.5)
    expect(row.total_ratings).toBe(200)
    expect(row.phone).toBe('+65 1234 5678')
    expect(row.website).toBe('https://test.com')
    expect(row.business_status).toBe('OPERATIONAL')
    expect(row.tags).toEqual(['japanese_restaurant', 'restaurant'])
    expect(row.primary_type).toBe('japanese_restaurant')
    expect(row.google_maps_uri).toBe('https://maps.google.com/?cid=12345')
    expect(row.raw_place_data).toBe(basePlaceDetails)
  })

  it('sets null for missing optional fields', () => {
    const row = mapPlaceToRestaurantRow({ id: 'ChIJxyz', displayName: { text: 'Minimal' } })
    expect(row.address).toBeNull()
    expect(row.lat).toBeNull()
    expect(row.lng).toBeNull()
    expect(row.price_level).toBeNull()
    expect(row.rating).toBeNull()
    expect(row.total_ratings).toBeNull()
    expect(row.phone).toBeNull()
    expect(row.website).toBeNull()
    expect(row.primary_type).toBeNull()
    expect(row.google_maps_uri).toBeNull()
  })

  it('defaults business_status to OPERATIONAL when missing', () => {
    const row = mapPlaceToRestaurantRow({ id: 'ChIJxyz', displayName: { text: 'Minimal' } })
    expect(row.business_status).toBe('OPERATIONAL')
  })

  it('defaults tags to empty array when types missing', () => {
    const row = mapPlaceToRestaurantRow({ id: 'ChIJxyz', displayName: { text: 'Minimal' } })
    expect(row.tags).toEqual([])
  })

  it('defaults name to empty string when displayName missing', () => {
    const row = mapPlaceToRestaurantRow({ id: 'ChIJxyz' })
    expect(row.name).toBe('')
  })
})
