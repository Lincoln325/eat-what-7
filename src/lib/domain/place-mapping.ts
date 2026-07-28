export type PriceLevelEnum =
  | 'PRICE_LEVEL_FREE'
  | 'PRICE_LEVEL_INEXPENSIVE'
  | 'PRICE_LEVEL_MODERATE'
  | 'PRICE_LEVEL_EXPENSIVE'
  | 'PRICE_LEVEL_VERY_EXPENSIVE'

export interface PlaceDetails {
  id: string
  displayName?: { text: string; languageCode?: string }
  formattedAddress?: string
  location?: { latitude: number; longitude: number }
  priceLevel?: PriceLevelEnum
  rating?: number
  userRatingCount?: number
  internationalPhoneNumber?: string
  websiteUri?: string
  businessStatus?: string
  types?: string[]
  primaryType?: string
  googleMapsUri?: string
  photos?: Array<{ name: string; widthPx: number; heightPx: number }>
  [key: string]: unknown
}

export interface RestaurantRow {
  google_place_id: string
  name: string
  address: string | null
  lat: number | null
  lng: number | null
  price_level: number | null
  rating: number | null
  total_ratings: number | null
  phone: string | null
  website: string | null
  business_status: string
  tags: string[]
  primary_type: string | null
  google_maps_uri: string | null
  raw_place_data: PlaceDetails
}

const PRICE_LEVEL_TO_INT: Record<PriceLevelEnum, number> = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
}

// Pure: map the New Places API price level enum to the DB's integer scale
export function mapPriceLevelToInt(priceLevel: PriceLevelEnum | undefined): number | null {
  if (!priceLevel) return null
  return PRICE_LEVEL_TO_INT[priceLevel] ?? null
}

// Pure: map a PlaceDetails object to a DB row (no IDs, no image fields)
export function mapPlaceToRestaurantRow(place: PlaceDetails): RestaurantRow {
  return {
    google_place_id: place.id,
    name: place.displayName?.text ?? '',
    address: place.formattedAddress ?? null,
    lat: place.location?.latitude ?? null,
    lng: place.location?.longitude ?? null,
    price_level: mapPriceLevelToInt(place.priceLevel),
    rating: place.rating ?? null,
    total_ratings: place.userRatingCount ?? null,
    phone: place.internationalPhoneNumber ?? null,
    website: place.websiteUri ?? null,
    business_status: place.businessStatus ?? 'OPERATIONAL',
    tags: place.types ?? [],
    primary_type: place.primaryType ?? null,
    google_maps_uri: place.googleMapsUri ?? null,
    raw_place_data: place,
  }
}
