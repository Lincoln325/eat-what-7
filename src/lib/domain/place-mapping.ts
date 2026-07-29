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
  primaryTypeDisplayName?: { text: string; languageCode?: string }
  googleMapsUri?: string
  photos?: Array<{ name: string; widthPx: number; heightPx: number }>
  [key: string]: unknown
}

export interface BilingualPlaceDetails {
  en: PlaceDetails
  zh_hk: PlaceDetails
}

export interface RestaurantRow {
  google_place_id: string
  name: string
  name_zh: string | null
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
  primary_type_display_name_zh: string | null
  google_maps_uri: string | null
  raw_place_data: BilingualPlaceDetails
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

// Pure: merge English + Traditional Chinese PlaceDetails into one DB row.
// Non-language fields (location, rating, etc.) are sourced from `en`, since
// Google returns identical values for both — only text fields differ.
export function mapPlaceToRestaurantRow(place: BilingualPlaceDetails): RestaurantRow {
  const { en, zh_hk } = place

  return {
    google_place_id: en.id,
    name: en.displayName?.text ?? '',
    name_zh: zh_hk.displayName?.text ?? null,
    address: en.formattedAddress ?? null,
    lat: en.location?.latitude ?? null,
    lng: en.location?.longitude ?? null,
    price_level: mapPriceLevelToInt(en.priceLevel),
    rating: en.rating ?? null,
    total_ratings: en.userRatingCount ?? null,
    phone: en.internationalPhoneNumber ?? null,
    website: en.websiteUri ?? null,
    business_status: en.businessStatus ?? 'OPERATIONAL',
    tags: en.types ?? [],
    primary_type: en.primaryType ?? null,
    primary_type_display_name_zh: zh_hk.primaryTypeDisplayName?.text ?? null,
    google_maps_uri: en.googleMapsUri ?? null,
    raw_place_data: place,
  }
}
