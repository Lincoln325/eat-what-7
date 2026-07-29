import type { RestaurantDetail } from '@/lib/types'
import type { BilingualPlaceDetails } from './place-mapping'
import { translateTags } from './tag-labels'

// The DB row shape needed to build a full detail view. raw_place_data holds
// the cached bilingual Places response, so opening hours come from there
// rather than a fresh Google call.
export interface RestaurantDetailSource {
  id: string
  name: string
  name_zh: string | null
  primary_type_display_name_zh: string | null
  tags: string[]
  rating: number | null
  total_ratings: number | null
  price_level: number | null
  primary_image_path: string | null
  image_blurhash: string | null
  address: string | null
  phone: string | null
  website: string | null
  google_maps_uri: string | null
  raw_place_data: BilingualPlaceDetails | null
  updated_at: string | null
}

// Pure: pull localised weekday opening-hour lines from the cached payload,
// preferring the zh-HK translation and falling back to English.
export function extractOpeningHours(
  raw: BilingualPlaceDetails | null,
): string[] {
  if (!raw) return []
  const zh = raw.zh_hk?.regularOpeningHours as
    | { weekdayDescriptions?: string[] }
    | undefined
  const en = raw.en?.regularOpeningHours as
    | { weekdayDescriptions?: string[] }
    | undefined
  return zh?.weekdayDescriptions ?? en?.weekdayDescriptions ?? []
}

// Pure: map a DB row to the detail view model. Mirrors restaurant-view.ts's
// name/type/image resolution so the card and the sheet stay consistent.
export function mapToRestaurantDetail(
  row: RestaurantDetailSource,
  imageBaseUrl: string,
): RestaurantDetail {
  return {
    id: row.id,
    name: row.name_zh ?? row.name,
    typeLabel: row.primary_type_display_name_zh ?? '餐廳',
    imageUrl: row.primary_image_path ? `${imageBaseUrl}/${row.primary_image_path}` : null,
    imageBlurhash: row.image_blurhash,
    rating: row.rating,
    ratingCount: row.total_ratings,
    priceLevel: row.price_level,
    tags: translateTags(row.tags),
    address: row.address,
    phone: row.phone,
    website: row.website,
    googleMapsUri: row.google_maps_uri,
    openingHours: extractOpeningHours(row.raw_place_data),
    updatedAt: row.updated_at,
  }
}
